var SPREADSHEET_ID = '1LJ2QxAnfbZreamaPZxX_QIJVeQtb5I3kpJymPYOn0Gk';
var SHEET_CUSTOMERS = '고객현황';
var SHEET_PARTNERS = '파트너정보';
var SHEET_LOGS = '시스템로그';
var SHEET_SETTINGS = '설정';
var SHEET_PRODUCTS = '상품정보';
var SHEET_BENEFITS = '상품별혜택설정';
var SHEET_ADMINS = '관리자계정';
var SHEET_RESOURCES = '자료실';

function doGet(e) { return handleRequest(e); }
function doPost(e) { return handleRequest(e); }

function handleRequest(e) {
  var action = e.parameter.action;
  var isWriteAction = ['create', 'update_customer', 'delete_customer', 'create_partner', 'approve_partner', 'update_partner', 'delete_partner', 'create_product', 'update_product', 'delete_product', 'create_resource', 'delete_resource', 'upload_file'].indexOf(action) > -1;
  
  var lock = LockService.getScriptLock();
  if (isWriteAction) {
    lock.tryLock(10000);
  }
  
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    if (action == 'read') {
      return readSheet(ss, SHEET_CUSTOMERS);
    }
    else if (action == 'read_partners') {
      return readSheet(ss, SHEET_PARTNERS);
    }
    else if (action == 'read_logs') {
        return readLogs(ss);
    }
    else if (action == 'read_settings') {
        return readSettings(ss);
    }
    else if (action == 'read_dashboard') {
        return readDashboard(ss);
    }
    else if (action == 'read_products') {
        return readSheet(ss, SHEET_PRODUCTS);
    }
    else if (action == 'read_admins') {
        return readSheet(ss, SHEET_ADMINS);
    }
    else if (action == 'read_resources') {
        return readSheet(ss, SHEET_RESOURCES);
    }
    else if (action == 'init_database') {
        return initDatabase(ss);
    }
    else if (action == 'read_partner_config') {
        return readPartnerConfig(ss, e.parameter.partnerId);
    }
    else if (action == 'create') {
      return writeCustomer(ss, e.postData.contents);
    }
    else if (action == 'update_customer') {
      return updateCustomer(ss, e.postData.contents);
    }
    else if (action == 'delete_customer') {
      return deleteCustomer(ss, e.postData.contents);
    }
    else if (action == 'create_partner') {
      return writePartner(ss, e.postData.contents);
    }
    else if (action == 'approve_partner') {
      return approvePartner(ss, e.postData.contents);
    }
    else if (action == 'update_partner') {
        return updatePartner(ss, e.postData.contents);
    }
    else if (action == 'delete_partner') {
        return deletePartner(ss, e.postData.contents);
    }
    else if (action == 'create_product') {
        return writeProduct(ss, e.postData.contents);
    }
    else if (action == 'update_product') {
        return updateProduct(ss, e.postData.contents);
    }
    else if (action == 'delete_product') {
        return deleteProduct(ss, e.postData.contents);
    }
    else if (action == 'create_resource') {
        return createResource(ss, e.postData.contents);
    }
    else if (action == 'delete_resource') {
        return deleteResource(ss, e.postData.contents);
    }
    else if (action == 'upload_file') {
        return uploadFile(e.postData.contents);
    }
    else {
      return responseJSON({ success: false, message: '알 수 없는 요청: ' + action });
    }
    
  } catch (error) {
    return responseJSON({ success: false, message: error.toString() });
  } finally {
    if (isWriteAction) {
      lock.releaseLock();
    }
  }
}

function initDatabase(ss) {
  try {
    ensureSheet(ss, SHEET_CUSTOMERS, ['No.', '라벨', '진행구분', '신청일시', '유입채널', '고객명', '연락처', '주소', 'KCC 피드백', '진행현황(상세)_최근', '실측일자', '시공일자', '가견적 링크', '최종 견적 링크', '고객견적서(가)', '고객견적서(최종)', '가견적 금액', '최종견적 금액']);
    ensureSheet(ss, SHEET_PARTNERS, ['신청일', '업체명', '대표자명', '연락처', '주소', '아이디', '비밀번호', '상태', '상위파트너ID', '사업자번호', '계좌번호', '이메일', '상품별혜택']);
    ensureSheet(ss, SHEET_LOGS, ['Timestamp', 'Category', 'Action', 'Actor', 'Details']);
    ensureSheet(ss, SHEET_PRODUCTS, ['id', 'category', 'name', 'description', 'specs', 'price', 'status', 'image', 'link', 'createdAt']);
    ensureSheet(ss, SHEET_BENEFITS, ['업체명', '상품명', '특별혜택', '홍보용URL', '파트너ID', '상품ID']);
    ensureSheet(ss, SHEET_SETTINGS, ['라벨_목록', '진행구분_목록', '진행상황 작성자', '피드백 작성자']);
    ensureSheet(ss, SHEET_RESOURCES, ['id', 'type', 'title', 'description', 'date', 'downloadUrl', 'thumbnail']);
    
    var adminSheet = ensureSheet(ss, SHEET_ADMINS, ['아이디', '비밀번호', '이름', '등록일']);
    if (adminSheet.getLastRow() === 1) {
        adminSheet.appendRow(['admin', 'admin1234', '최고관리자', new Date()]);
    }
    
    return responseJSON({ success: true, message: '데이터베이스 초기화 완료' });
  } catch (e) {
    return responseJSON({ success: false, message: '초기화 실패: ' + e.toString() });
  }
}

function ensureSheet(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#f3f3f3");
  }
  return sheet;
}

// --- Helper Functions ---

function logActivity(ss, category, action, actor, details) {
    try {
        var sheet = ss.getSheetByName(SHEET_LOGS);
        if (!sheet) {
            sheet = ss.insertSheet(SHEET_LOGS);
            sheet.appendRow(['Timestamp', 'Category', 'Action', 'Actor', 'Details']);
        }
        sheet.appendRow([new Date(), category, action, actor, details]);
    } catch(e) {
        Logger.log("Logging failed: " + e);
    }
}

function readLogs(ss) {
    var sheet = ss.getSheetByName(SHEET_LOGS);
    if (!sheet) {
        sheet = ss.insertSheet(SHEET_LOGS);
        sheet.appendRow(['Timestamp', 'Category', 'Action', 'Actor', 'Details']);
        return responseJSON({ success: true, data: [] });
    }
    
    var data = sheet.getDataRange().getValues();
    if (data.length < 2) return responseJSON({ success: true, data: [] });

    var headers = data[0];
    var rows = data.slice(1);
    rows.reverse();
    if (rows.length > 500) rows = rows.slice(0, 500);

    var result = rows.map(function(row) {
        var obj = {};
        for (var i = 0; i < headers.length; i++) {
            var val = row[i];
            if (Object.prototype.toString.call(val) === '[object Date]') {
                obj[headers[i]] = Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
            } else {
                obj[headers[i]] = val;
            }
        }
        return obj;
    });
    return responseJSON({ success: true, data: result });
}

function readSheet(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return responseJSON({ success: false, message: '시트[' + sheetName + ']가 없습니다. DB 초기화가 필요합니다.' });
  
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return responseJSON({ success: true, data: [] });

  var headers = data[0];
  var rows = data.slice(1);
  var timezone = ss.getSpreadsheetTimeZone();
  
  var result = rows.map(function(row) {
    var obj = {};
    for (var i = 0; i < headers.length; i++) {
        var val = row[i];
        if (val instanceof Date) {
             obj[headers[i]] = Utilities.formatDate(val, timezone, "yyyy-MM-dd");
        } else {
             obj[headers[i]] = val;
        }
    }
    return obj;
  });
  return responseJSON({ success: true, data: result });
}

function readPartnerConfig(ss, partnerId) {
    var products = getSheetDataInternal(ss, SHEET_PRODUCTS);
    var partners = getSheetDataInternal(ss, SHEET_PARTNERS);
    
    var me = partners.find(function(p) { return String(p['아이디']) === String(partnerId); });
    
    return responseJSON({
        success: true,
        products: products,
        partner: me || null
    });
}

function getSheetDataInternal(ss, sheetName) {
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) return [];
    var data = sheet.getDataRange().getValues();
    if (data.length < 2) return [];
    var headers = data[0];
    var timezone = ss.getSpreadsheetTimeZone();
    return data.slice(1).map(function(row) {
        var obj = {};
        for (var i = 0; i < headers.length; i++) {
            var val = row[i];
            if (val instanceof Date) obj[headers[i]] = Utilities.formatDate(val, timezone, "yyyy-MM-dd");
            else obj[headers[i]] = val;
        }
        return obj;
    });
}

function readSettings(ss) {
    var sheet = ss.getSheetByName(SHEET_SETTINGS);
    if (!sheet) {
        sheet = ss.insertSheet(SHEET_SETTINGS);
        // 기본 헤더 및 데이터 설정
        sheet.appendRow(['라벨_목록', '진행구분_목록', '진행상황 작성자', '피드백 작성자']);
        sheet.appendRow(['체크', '접수', '오영진', '문창현']);
        sheet.appendRow(['완료', '부재', '김지훈', '']);
        sheet.appendRow(['보류', '예약콜', '', '']);
        sheet.appendRow(['', '거부', '', '']);
        sheet.appendRow(['', '사이즈요청', '', '']);
        sheet.appendRow(['', '가견적요청', '', '']);
    }

    var data = sheet.getDataRange().getValues();
    var settings = {
        labels: [],
        statuses: [],
        progressAuthors: [],
        feedbackAuthors: []
    };

    if (data.length > 1) {
        for (var i = 1; i < data.length; i++) {
            if (data[i][0]) settings.labels.push(data[i][0]);
            if (data[i][1]) settings.statuses.push(data[i][1]);
            if (data[i][2]) settings.progressAuthors.push(data[i][2]);
            if (data[i][3]) settings.feedbackAuthors.push(data[i][3]);
        }
    }
    
    return responseJSON({ success: true, data: settings });
}

function writeCustomer(ss, jsonString) {
  var sheet = ss.getSheetByName(SHEET_CUSTOMERS);
  if (!sheet) return responseJSON({ success: false, message: '고객현황 시트가 없습니다.' });
  
  var body = JSON.parse(jsonString);
  var lastRow = sheet.getLastRow(); 
  
  var newRow = new Array(20).fill(''); 
  newRow[0] = lastRow; // No.
  newRow[1] = body.label || '일반';
  newRow[2] = body.status || '접수';
  newRow[3] = new Date();
  newRow[4] = body.channel || '';
  newRow[5] = body.name || '';
  newRow[6] = body.contact || '';
  newRow[7] = body.address || '';
  
  newRow[16] = body.pricePre || '';
  newRow[17] = body.priceFinal || '';
  
  sheet.appendRow(newRow);
  logActivity(ss, '고객', '등록', body.channel || 'System', '고객명: ' + body.name);
  return responseJSON({ success: true, message: '고객 등록 성공' });
}

function updateCustomer(ss, jsonString) {
    var sheet = ss.getSheetByName(SHEET_CUSTOMERS);
    if (!sheet) return responseJSON({ success: false, message: '고객현황 시트가 없습니다.' });

    var body = JSON.parse(jsonString);
    var targetNo = body.no; 

    // 헤더 읽어서 컬럼 매핑
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var colMap = {};
    headers.forEach(function(h, i) { colMap[h] = i; });

    var data = sheet.getDataRange().getValues();
    var foundIndex = -1;
    
    // No.로 행 찾기 (1열 가정)
    for (var i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(targetNo)) {
            foundIndex = i;
            break;
        }
    }

    if (foundIndex === -1) {
        return responseJSON({ success: false, message: '고객을 찾을 수 없습니다 (No 불일치).' });
    }

    var rowIdx = foundIndex + 1;
    
    // 기본 정보 업데이트
    if (body.label !== undefined && colMap['라벨'] !== undefined) sheet.getRange(rowIdx, colMap['라벨'] + 1).setValue(body.label);
    if (body.status !== undefined && colMap['진행구분'] !== undefined) sheet.getRange(rowIdx, colMap['진행구분'] + 1).setValue(body.status);
    if (body.name !== undefined && colMap['고객명'] !== undefined) sheet.getRange(rowIdx, colMap['고객명'] + 1).setValue(body.name);
    if (body.contact !== undefined && colMap['연락처'] !== undefined) sheet.getRange(rowIdx, colMap['연락처'] + 1).setValue(body.contact);
    if (body.address !== undefined && colMap['주소'] !== undefined) sheet.getRange(rowIdx, colMap['주소'] + 1).setValue(body.address);
    if (body.feedback !== undefined && colMap['KCC 피드백'] !== undefined) sheet.getRange(rowIdx, colMap['KCC 피드백'] + 1).setValue(body.feedback);
    if (body.progress !== undefined && colMap['진행현황(상세)_최근'] !== undefined) sheet.getRange(rowIdx, colMap['진행현황(상세)_최근'] + 1).setValue(body.progress);
    
    // 추가 정보 업데이트 (일정, 링크)
    if (body.measureDate !== undefined && colMap['실측일자'] !== undefined) sheet.getRange(rowIdx, colMap['실측일자'] + 1).setValue(body.measureDate);
    if (body.constructDate !== undefined && colMap['시공일자'] !== undefined) sheet.getRange(rowIdx, colMap['시공일자'] + 1).setValue(body.constructDate);
    
    if (body.linkPreKcc !== undefined && colMap['가견적 링크'] !== undefined) sheet.getRange(rowIdx, colMap['가견적 링크'] + 1).setValue(body.linkPreKcc);
    if (body.linkFinalKcc !== undefined && colMap['최종 견적 링크'] !== undefined) sheet.getRange(rowIdx, colMap['최종 견적 링크'] + 1).setValue(body.linkFinalKcc);
    if (body.linkPreCust !== undefined && colMap['고객견적서(가)'] !== undefined) sheet.getRange(rowIdx, colMap['고객견적서(가)'] + 1).setValue(body.linkPreCust);
    if (body.linkFinalCust !== undefined && colMap['고객견적서(최종)'] !== undefined) sheet.getRange(rowIdx, colMap['고객견적서(최종)'] + 1).setValue(body.linkFinalCust);

    if (body.pricePre !== undefined && colMap['가견적 금액'] !== undefined) sheet.getRange(rowIdx, colMap['가견적 금액'] + 1).setValue(body.pricePre);
    if (body.priceFinal !== undefined && colMap['최종견적 금액'] !== undefined) sheet.getRange(rowIdx, colMap['최종견적 금액'] + 1).setValue(body.priceFinal);

    // 로그 남기기
    logActivity(ss, '고객', '수정', body.actor || 'System', '고객 No.' + targetNo + ' 정보 수정됨');

    return responseJSON({ success: true, message: '고객 정보가 수정되었습니다.' });
}

function deleteCustomer(ss, jsonString) {
    try {
        var sheet = ss.getSheetByName(SHEET_CUSTOMERS);
        var body = JSON.parse(jsonString);
        var targetNo = body.no;
        
        var data = sheet.getDataRange().getValues();
        var foundIndex = -1;
        
        for (var i = 1; i < data.length; i++) {
            if (String(data[i][0]) === String(targetNo)) {
                foundIndex = i;
                break;
            }
        }
        
        if (foundIndex > -1) {
            sheet.deleteRow(foundIndex + 1);
            logActivity(ss, '고객', '삭제', body.actor || 'System', '고객 No.' + targetNo);
            return responseJSON({ success: true, message: '삭제되었습니다.' });
        } else {
             return responseJSON({ success: false, message: '삭제 대상을 찾을 수 없습니다.' });
        }
    } catch(e) {
        return responseJSON({ success: false, message: e.toString() });
    }
}

function writePartner(ss, jsonString) {
  var sheet = ss.getSheetByName(SHEET_PARTNERS);
  if (!sheet) return responseJSON({ success: false, message: '파트너정보 시트가 없습니다.' });
  
  var body = JSON.parse(jsonString);
  
  var newRow = [
    new Date(),               
    body.name || '',          
    body.ceoName || '',       
    body.contact || '', 
    body.address || '',       
    body.id || body.contact,  
    body.password || '1234',  
    '승인대기',                
    body.parentPartnerId || '', 
    body.businessNumber || '', 
    body.accountNumber || '',  
    body.email || '',
    body.specialBenefits || ''
  ];
  
  sheet.appendRow(newRow);
  logActivity(ss, '파트너', '신청', body.name, '연락처: ' + body.contact);
  return responseJSON({ success: true, message: '파트너 신청 성공' });
}

function writeProduct(ss, jsonString) {
  var sheet = ss.getSheetByName(SHEET_PRODUCTS);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_PRODUCTS);
    sheet.appendRow(['id', 'category', 'name', 'description', 'specs', 'price', 'status', 'image', 'link', 'createdAt']);
  }
  
  var body = JSON.parse(jsonString);
  var newRow = [
    body.id || 'P' + Utilities.formatDate(new Date(), "GMT+9", "ssSSS"),
    body.category || '기타',
    body.name || '',
    body.description || '',
    body.specs || '[]',
    body.price || '별도문의',
    body.status || '판매중',
    body.image || '',
    body.link || '',
    new Date()
  ];
  
  sheet.appendRow(newRow);
  logActivity(ss, '상품', '등록', 'Admin', '상품명: ' + body.name);
  return responseJSON({ success: true, message: '상품 등록 성공' });
}

function updateProduct(ss, jsonString) {
  var sheet = ss.getSheetByName(SHEET_PRODUCTS);
  if (!sheet) return responseJSON({ success: false, message: '시트 없음' });
  
  var body = JSON.parse(jsonString);
  var targetId = body.id;
  var data = sheet.getDataRange().getValues();
  var found = false;
  
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(targetId)) {
      var rowIdx = i + 1;
      if (body.category) sheet.getRange(rowIdx, 2).setValue(body.category);
      if (body.name) sheet.getRange(rowIdx, 3).setValue(body.name);
      if (body.description) sheet.getRange(rowIdx, 4).setValue(body.description);
      if (body.specs) sheet.getRange(rowIdx, 5).setValue(body.specs);
      if (body.price) sheet.getRange(rowIdx, 6).setValue(body.price);
      if (body.status) sheet.getRange(rowIdx, 7).setValue(body.status);
      if (body.image) sheet.getRange(rowIdx, 8).setValue(body.image);
      if (body.link) sheet.getRange(rowIdx, 9).setValue(body.link);
      
      found = true;
      break;
    }
  }
  
  if (found) {
    logActivity(ss, '상품', '수정', 'Admin', '상품명: ' + body.name);
    return responseJSON({ success: true, message: '상품 수정 성공' });
  } else {
    return responseJSON({ success: false, message: '상품을 찾을 수 없습니다.' });
  }
}

function deleteProduct(ss, jsonString) {
  var sheet = ss.getSheetByName(SHEET_PRODUCTS);
  if (!sheet) return responseJSON({ success: false, message: '시트 없음' });
  
  var body = JSON.parse(jsonString);
  var targetId = body.id;
  var data = sheet.getDataRange().getValues();
  var found = false;
  
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(targetId)) {
      sheet.deleteRow(i + 1);
      found = true;
      break;
    }
  }
  
  if (found) {
    logActivity(ss, '상품', '삭제', 'Admin', 'ID: ' + targetId);
    return responseJSON({ success: true, message: '상품 삭제 성공' });
  } else {
    return responseJSON({ success: false, message: '상품을 찾을 수 없습니다.' });
  }
}

function approvePartner(ss, jsonString) {
    var sheet = ss.getSheetByName(SHEET_PARTNERS);
    if (!sheet) return responseJSON({ success: false, message: '시트 없음' });
    var body = JSON.parse(jsonString);
    var targetId = body.id; 
    var data = sheet.getDataRange().getValues();
    var found = false;
    var partnerName = '';
    for (var i = 1; i < data.length; i++) {
        if (String(data[i][5]) === String(targetId)) { 
            partnerName = data[i][1];
            sheet.getRange(i + 1, 8).setValue('승인'); 
            found = true;
            break;
        }
    }
    if (found) {
        logActivity(ss, '파트너', '승인', 'Admin', '파트너명: ' + partnerName);
        return responseJSON({ success: true, message: '승인 처리되었습니다.' });
    } else {
        return responseJSON({ success: false, message: '파트너를 찾을 수 없습니다.' });
    }
}

function updatePartner(ss, jsonString) {
    var sheet = ss.getSheetByName(SHEET_PARTNERS);
    if (!sheet) return responseJSON({ success: false, message: '시트 없음' });
    var body = JSON.parse(jsonString);
    var targetId = body.id; 
    var data = sheet.getDataRange().getValues();
    var found = false;
    var partnerName = '';
    
    for (var i = 1; i < data.length; i++) {
        if (String(data[i][5]) === String(targetId)) {
            partnerName = data[i][1];
            var rowIdx = i + 1;
            
            if (body.name) sheet.getRange(rowIdx, 2).setValue(body.name);
            if (body.ceoName) sheet.getRange(rowIdx, 3).setValue(body.ceoName);
            if (body.contact) sheet.getRange(rowIdx, 4).setValue(body.contact);
            if (body.address) sheet.getRange(rowIdx, 5).setValue(body.address);
            if (body.password) sheet.getRange(rowIdx, 7).setValue(body.password);
            
            if (body.status) {
                 sheet.getRange(rowIdx, 8).setValue(body.status);
                 logActivity(ss, '파트너', '상태변경', 'Admin', partnerName + ' -> ' + body.status);
            } else {
                 logActivity(ss, '파트너', '수정', 'Admin', '파트너명: ' + partnerName);
            }
            
            if (body.parentPartnerId) sheet.getRange(rowIdx, 9).setValue(body.parentPartnerId);
            if (body.businessNumber) sheet.getRange(rowIdx, 10).setValue(body.businessNumber);
            if (body.accountNumber) sheet.getRange(rowIdx, 11).setValue(body.accountNumber);
            if (body.email) sheet.getRange(rowIdx, 12).setValue(body.email);
            if (body.specialBenefits !== undefined) {
                sheet.getRange(rowIdx, 13).setValue(body.specialBenefits);
                // 상품별 가독성을 위한 별도 시트 동기화
                if (body.productsInfo) {
                    syncBenefitsToSheet(ss, body.id, body.name || partnerName, body.specialBenefits, body.productsInfo);
                }
            }

            found = true;
            break;
        }
    }
    if (found) {
        return responseJSON({ success: true, message: '수정되었습니다.' });
    } else {
        return responseJSON({ success: false, message: '파트너를 찾을 수 없습니다.' });
    }
}

function syncBenefitsToSheet(ss, partnerId, partnerName, specialBenefitsJson, productsInfo) {
    var sheet = ss.getSheetByName(SHEET_BENEFITS);
    if (!sheet) {
        sheet = ss.insertSheet(SHEET_BENEFITS);
        sheet.appendRow(['업체명', '상품명', '특별혜택', '홍보용URL', '파트너ID', '상품ID']);
        sheet.getRange("1:1").setFontWeight("bold").setBackground("#f3f3f3");
    }
    
    var benefits = {};
    try {
        benefits = JSON.parse(specialBenefitsJson);
    } catch(e) { return; }
    
    var data = sheet.getDataRange().getValues();
    
    productsInfo.forEach(function(prod) {
        var benefitText = benefits[prod.id] || "";
        var found = false;
        // 기존 행 찾기 (파트너ID + 상품ID 조합)
        for (var i = 1; i < data.length; i++) {
            if (String(data[i][4]) === String(partnerId) && String(data[i][5]) === String(prod.id)) {
                var rowIdx = i + 1;
                sheet.getRange(rowIdx, 1).setValue(partnerName);
                sheet.getRange(rowIdx, 2).setValue(prod.name);
                sheet.getRange(rowIdx, 3).setValue(benefitText);
                sheet.getRange(rowIdx, 4).setValue(prod.link);
                found = true;
                break;
            }
        }
        // 없으면 새로 추가
        if (!found) {
            sheet.appendRow([partnerName, prod.name, benefitText, prod.link, partnerId, prod.id]);
        }
    });
}

function deletePartner(ss, jsonString) {
    var sheet = ss.getSheetByName(SHEET_PARTNERS);
    if (!sheet) return responseJSON({ success: false, message: '시트 없음' });
    var body = JSON.parse(jsonString);
    var targetId = body.id;
    var data = sheet.getDataRange().getValues();
    var found = false;
    var partnerName = '';
    for (var i = 1; i < data.length; i++) {
        if (String(data[i][5]) === String(targetId)) {
            partnerName = data[i][1];
            sheet.deleteRow(i + 1);
            found = true;
            break;
        }
    }
    if (found) {
        logActivity(ss, '파트너', '삭제', 'Admin', '삭제된 파트너: ' + partnerName);
        return responseJSON({ success: true, message: '삭제되었습니다.' });
    } else {
        return responseJSON({ success: false, message: '파트너를 찾을 수 없습니다.' });
    }
}

function responseJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function readDashboard(ss) {
  var customers = getDataFromSheet(ss, SHEET_CUSTOMERS);
  var partners = getDataFromSheet(ss, SHEET_PARTNERS);
  var logs = getDataFromSheet(ss, SHEET_LOGS);
  
  // 최근 로그 50개만
  if (logs.length > 50) logs = logs.slice(0, 50);

  return responseJSON({
    success: true,
    data: {
      customers: customers,
      partners: partners,
      logs: logs
    }
  });
}

function getDataFromSheet(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  var headers = data[0];
  var rows = data.slice(1);
  var timeZone = Session.getScriptTimeZone();

  return rows.map(function(row) {
    var obj = {};
    for (var i = 0; i < headers.length; i++) {
        var val = row[i];
        if (Object.prototype.toString.call(val) === '[object Date]') {
             obj[headers[i]] = Utilities.formatDate(val, timeZone, headers[i].includes('일시') || headers[i] === 'Timestamp' ? "yyyy-MM-dd HH:mm:ss" : "yyyy-MM-dd");
        } else {
             obj[headers[i]] = val;
        }
    }
    return obj;
  });
}

function createResource(ss, jsonString) {
    var sheet = ss.getSheetByName(SHEET_RESOURCES);
    if (!sheet) {
        sheet = ss.insertSheet(SHEET_RESOURCES);
        sheet.appendRow(['id', 'type', 'title', 'description', 'date', 'downloadUrl', 'thumbnail']);
    }
    
    var body = JSON.parse(jsonString);
    var newRow = [
        body.id || 'R' + Utilities.formatDate(new Date(), "GMT+9", "ssSSS"),
        body.type || 'image',
        body.title || '',
        body.description || '',
        Utilities.formatDate(new Date(), "GMT+9", "yyyy-MM-dd"),
        body.downloadUrl || '',
        body.thumbnail || ''
    ];
    
    sheet.appendRow(newRow);
    logActivity(ss, '자료실', '등록', 'Admin', '제목: ' + body.title);
    return responseJSON({ success: true, message: '자료가 등록되었습니다.' });
}

function deleteResource(ss, jsonString) {
    var sheet = ss.getSheetByName(SHEET_RESOURCES);
    if (!sheet) return responseJSON({ success: false, message: '시트 없음' });
    
    var body = JSON.parse(jsonString);
    var targetId = body.id;
    var data = sheet.getDataRange().getValues();
    var found = false;
    
    for (var i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(targetId)) {
            sheet.deleteRow(i + 1);
            found = true;
            break;
        }
    }
    
    if (found) {
        logActivity(ss, '자료실', '삭제', 'Admin', 'ID: ' + targetId);
        return responseJSON({ success: true, message: '삭제되었습니다.' });
    } else {
        return responseJSON({ success: false, message: '자료를 찾을 수 없습니다.' });
    }
}

function uploadFile(jsonString) {
    try {
        var body = JSON.parse(jsonString);
        var filename = body.filename;
        var mimeType = body.mimeType;
        var base64Data = body.base64Data;
        
        var folderName = "KCC_Resources";
        var folders = DriveApp.getFoldersByName(folderName);
        var folder;
        
        if (folders.hasNext()) {
            folder = folders.next();
        } else {
            folder = DriveApp.createFolder(folderName);
            folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        }
        
        var decoded = Utilities.base64Decode(base64Data);
        var blob = Utilities.newBlob(decoded, mimeType, filename);
        var file = folder.createFile(blob);
        
        // 파일에 대한 권한 설정 (폴더 상속받지만 명시적으로 설정)
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        
        // 구글 드라이브 이미지 직접 링크 형식 (썸네일 등으로 사용 가능)
        var viewUrl = "https://drive.google.com/uc?export=view&id=" + file.getId();
        
        return responseJSON({
            success: true,
            url: viewUrl,
            downloadUrl: file.getDownloadUrl(),
            id: file.getId(),
            filename: filename
        });
        
    } catch(e) {
        return responseJSON({ success: false, message: '업로드 실패: ' + e.toString() });
    }
}
