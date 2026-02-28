/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
import * as XLSX from 'xlsx';

/**
 * 어떤 문자열이나 숫자에서도 순수 금액 숫자만 추출하는 강력한 함수
 */
const extractPrice = (v: any): number => {
    if (typeof v === 'number') return Math.floor(v);
    if (!v) return 0;
    const s = String(v).replace(/,/g, "").replace(/\s/g, "");
    // 날짜가 포함된 경우(예: 2026.02.26) 가격으로 오인하지 않도록 방지
    if (s.includes(".") && s.length > 8 && s.split(".").length > 2) return 0;

    const matches = s.match(/\d+/g);
    if (!matches) return 0;

    // 발견된 숫자 뭉치 중 10,000 이상인 가장 큰 값을 반환 (대부분의 견적가는 1만 원 이상)
    const nums = matches.map(m => parseInt(m, 10)).filter(n => n > 1000);
    return nums.length > 0 ? Math.max(...nums) : 0;
};

export const parseExcelEstimate = async (file: File) => {
    const fileName = file.name || "";
    const namePart = fileName.split(".")[0];
    const parts = namePart.split("_");
    const extractedName = parts.length > 0 ? parts[0].trim() : "";
    const extractedPhone = parts.length > 1 ? parts[1].replace(/[^0-9]/g, "") : "";

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                if (!e.target || !e.target.result) return reject("Result Empty");
                const data = new Uint8Array(e.target.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const rows: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

                let address = "";
                let sheetPhone = "";
                let startRow = 0;
                let excelTotalSum = 0;

                // 검색 키워드 모음
                const totalKeys = ['금액총계', '금액 총계', '계', '부가세', '공급가', '합계', '영업합계', '최종'];
                const phoneKeys = ['연락처', '전화번호', 'H.P', 'HP'];
                const addrKeys = ['현장주소', '현장 주소'];

                // [전체 스캔] 문서 전체에서 주소, 연락처, 그리고 '가장 신뢰할 수 있는 합계 금액'을 찾음
                for (let r = 0; r < rows.length; r++) {
                    const row = rows[r] || [];
                    for (let c = 0; c < row.length; c++) {
                        const cellVal = String(row[c] || "").trim();

                        // 1. 합계 금액 탐색
                        if (totalKeys.some(k => cellVal.includes(k))) {
                            // 주변 10칸(옆으로) 탐색하여 금액 추출
                            for (let offset = 0; offset <= 10; offset++) {
                                const p = extractPrice(row[c + offset]);
                                if (p > 10000) { // 1만원 이상인 경우만 취급
                                    // 여러 개 발견 시 가장 큰 값 또는 부가세 포함 느낌이 강한 값을 취함
                                    if (p > excelTotalSum) excelTotalSum = p;
                                }
                            }
                        }

                        // 2. 주소 탐색
                        if (addrKeys.some(k => cellVal.includes(k)) && !address) {
                            address = String(row[c + 2] || row[c + 1] || "").trim();
                        }

                        // 3. 연락처 탐색
                        if (phoneKeys.some(k => cellVal.includes(k)) && !sheetPhone) {
                            let pVal = String(row[c + 4] || row[c + 3] || row[c + 2] || row[c + 1] || "").trim();
                            pVal = pVal.replace(/[^0-9]/g, "");
                            if (pVal.length >= 9) sheetPhone = pVal;
                        }

                        // 4. 품목 시작 위치 감지
                        if (startRow === 0 && cellVal.includes("순번")) {
                            startRow = r + 1;
                        }
                    }
                }

                // [품목 추출]
                const items = [];
                let calcItemsSum = 0;
                let colIdx = { loc: 1, prod: 2, model: 3, price: 18 }; // 기본 인덱스

                if (startRow > 0) {
                    for (let i = startRow; i < rows.length; i++) {
                        const row = rows[i] || [];
                        const loc = String(row[colIdx.loc] || "").trim();

                        if (!loc || loc === "설치위치" || loc === "비고") continue;
                        if (totalKeys.some(k => loc.includes(k))) break;

                        const price = extractPrice(row[colIdx.price] || row[colIdx.price + 1] || row[colIdx.price - 1]);
                        const isEtc = loc.includes("기타") || loc.includes("잡비");

                        calcItemsSum += price;
                        items.push({
                            no: items.length + 1,
                            loc,
                            prod: String(row[colIdx.prod] || "").trim(),
                            model: String(row[colIdx.model] || "").trim(),
                            price: price || 0,
                            isEtc
                        });

                        // 비고 행이나 유리 정보 행 건너뛰기 로직
                        if (rows[i + 1] && String(rows[i + 1][0] || "").trim() === String(row[0] || "").trim()) i++;
                        if (rows[i + 1] && String(rows[i + 1][1] || "").trim() === "비고") i++;
                    }
                }

                // 최종 합계: 엑셀에서 찾은 직접적인 합계가 있으면 그것을 쓰고, 없으면 품목 합계를 씀
                const finalTotal = excelTotalSum > 10000 ? excelTotalSum : calcItemsSum;

                resolve({
                    customerName: extractedName,
                    customerPhone: sheetPhone || extractedPhone,
                    address,
                    items,
                    totalMaterial: finalTotal, // 초기에는 전체를 자재비로 잡음
                    totalEtc: 0,
                    totalSum: finalTotal
                });

            } catch (err) {
                console.error(err);
                reject(err);
            }
        };
        reader.readAsArrayBuffer(file);
    });
};
