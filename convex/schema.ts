import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    customers: defineTable({
        no: v.optional(v.string()), // TEXT
        label: v.optional(v.string()), // TEXT
        status: v.optional(v.string()), // TEXT
        channel: v.optional(v.string()), // TEXT
        name: v.optional(v.string()), // TEXT
        contact: v.optional(v.string()), // TEXT
        address: v.optional(v.string()), // TEXT
        feedback: v.optional(v.string()), // TEXT
        progress_detail: v.optional(v.string()), // TEXT
        partner_benefit: v.optional(v.string()), // NEW: Benefit offered to customer
        measure_date: v.optional(v.string()), // DATE as string
        construct_date: v.optional(v.string()), // DATE as string
        price_pre: v.optional(v.float64()), // NUMERIC
        price_final: v.optional(v.float64()), // NUMERIC
        link_pre_kcc: v.optional(v.string()), // TEXT
        link_final_kcc: v.optional(v.string()), // TEXT
        link_pre_cust: v.optional(v.string()), // TEXT
        link_final_cust: v.optional(v.string()), // TEXT
        created_at: v.optional(v.string()), // Original application date
        updatedAt: v.optional(v.number()), // For sorting modified customers to the top
    }).index("by_no", ["no"]).index("by_channel", ["channel"]),

    customerLabels: defineTable({
        name: v.string(),
        color: v.string(), // Hex code or tailwind class
        order: v.optional(v.number()),
    }).index("by_order", ["order"]),

    customerStatuses: defineTable({
        name: v.string(),
        color: v.string(), // Hex code or tailwind class
        order: v.optional(v.number()),
    }).index("by_order", ["order"]),

    partners: defineTable({
        uid: v.string(), // PRIMARY KEY
        name: v.string(),
        ceo_name: v.optional(v.string()),
        contact: v.optional(v.string()),
        address: v.optional(v.string()),
        status: v.optional(v.string()), // DEFAULT '승인대기'
        business_number: v.optional(v.string()),
        account_number: v.optional(v.string()),
        email: v.optional(v.string()),
        password: v.string(),
        parent_id: v.optional(v.string()),
        special_benefits: v.optional(v.string()), // JSON string
    }).index("by_uid", ["uid"]),

    admins: defineTable({
        uid: v.string(), // PRIMARY KEY
        password: v.string(),
        name: v.optional(v.string()),
        role: v.optional(v.string()), // 'admin' | 'tm'
    }).index("by_uid", ["uid"]),

    products: defineTable({
        code: v.string(), // PRIMARY KEY
        name: v.string(),
        category: v.optional(v.string()),
        price: v.optional(v.string()),
        status: v.optional(v.string()), // DEFAULT '판매중'
        description: v.optional(v.string()),
        image: v.optional(v.string()),
        link: v.optional(v.string()),
        specs: v.optional(v.string()), // JSON string or array
    }).index("by_code", ["code"]),

    resources: defineTable({
        type: v.optional(v.string()), // 'image' | 'video' | 'file'
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        downloadUrl: v.optional(v.string()),
        thumbnail: v.optional(v.string()),
        storageId: v.optional(v.string()), // For Convex Storage
        thumbnailStorageId: v.optional(v.string()),
    }),

    authors: defineTable({
        name: v.string(),
        type: v.string(), // 'progress' | 'feedback'
        order: v.optional(v.number()),
    }).index("by_type", ["type"]).index("by_order", ["order"]),

    notices: defineTable({
        dongUnit: v.string(),
        constructDate: v.string(),
        duration: v.string(),
        contact: v.string(),
        createdAt: v.number(),
    }).index("by_created_at", ["createdAt"]),

    contracts: defineTable({
        customerId: v.string(), // Reference to customer id
        contractDate: v.optional(v.string()), // 계약등록일
        applicationDate: v.optional(v.string()), // 신청일
        contractStatus: v.optional(v.string()), // 계약상태 (계약등록/결제진행중/결제완료/공사완료/결제취소)

        constructionDate: v.optional(v.string()), // 시공일
        finalQuotePrice: v.optional(v.float64()), // 최종견적가
        kccSupplyPrice: v.optional(v.float64()), // KCC공급가
        kccDepositStatus: v.optional(v.string()), // KCC입금여부 (입금대기/입금완료/계약취소)
        constructionContractStatus: v.optional(v.string()), // 시공계약서 (진행대기/발송완료/서명완료/계약취소)
        paymentMethod: v.optional(v.string()), // 결제방법

        // 현금/카드 결제 탭
        paymentAmount1: v.optional(v.float64()), // 입금/결제금액(1차)
        paymentDate1: v.optional(v.string()), // 입금/결제일(1차)
        remainingBalance: v.optional(v.float64()), // 잔금
        remainingBalanceDate: v.optional(v.string()), // 잔금 결제일

        // 구독(할부) 결제 / 렌탈 패키지 결제
        advancePayment: v.optional(v.float64()), // 선납금
        hasInterest: v.optional(v.string()), // 이자유무
        totalSubscriptionFee: v.optional(v.float64()), // 총구독료
        subscriptionMonths: v.optional(v.number()), // 구독개월
        monthlySubscriptionFee: v.optional(v.float64()), // 월구독료
        installmentAgreementDate: v.optional(v.string()), // 할부약정일(모바일)
        recordingAgreementDate: v.optional(v.string()), // 녹취약정일

        appliances: v.optional(v.string()), // JSON string of PLUS 가전

        createdAt: v.optional(v.number()),
        updatedAt: v.optional(v.number()),
    }).index("by_customer", ["customerId"]),

    estimates: defineTable({
        date: v.string(), // yyyy-MM-dd
        branch: v.optional(v.string()), // 인천지점, 수원지점
        statusType: v.string(), // 가견적, 책임견적, 최종견적
        customerName: v.string(),
        customerPhone: v.string(),
        address: v.optional(v.string()),
        totalSum: v.number(),
        finalQuote: v.number(),
        finalBenefit: v.number(),
        discountRate: v.number(),
        extraDiscount: v.number(),
        marginAmount: v.number(),
        marginRate: v.number(),
        subs: v.object({
            sub24: v.number(),
            sub36: v.number(),
            sub48: v.number(),
            sub60: v.number()
        }),
        items: v.string(), // JSON array
        pdfUrl: v.optional(v.string()),
        remark: v.optional(v.string()),
        createdAt: v.number(),
    }).index("by_date", ["date"]),

    rentalApplications: defineTable({
        status: v.string(), // "접수", "심사중", "승인완료", "승인불가", "취소"
        remarks: v.optional(v.string()), // 비고
        documents: v.optional(v.string()), // JSON string of document url
        customerName: v.string(), // 신청자명
        phone: v.string(), // 연락처
        birthDate: v.optional(v.string()), // 생년월일
        address: v.optional(v.string()), // 주소
        amount: v.number(), // 견적금액
        months: v.number(), // 구독기간
        transferDate: v.optional(v.string()), // 이체희망일
        partnerName: v.optional(v.string()),
        partnerId: v.optional(v.string()),
        createdAt: v.number(),
        updatedAt: v.optional(v.number()),
    }).index("by_partner", ["partnerId"]),

    installmentApplications: defineTable({
        status: v.string(), // "접수", "심사중", "승인완료", "승인불가", "취소"
        remarks: v.optional(v.string()), // 비고
        documents: v.optional(v.string()), // JSON string of document url
        customerName: v.string(), // 신청자명
        phone: v.string(), // 연락처
        birthDate: v.optional(v.string()), // 생년월일
        address: v.optional(v.string()), // 주소
        amount: v.number(), // 견적금액
        months: v.number(), // 구독기간
        transferDate: v.optional(v.string()), // 이체희망일
        partnerName: v.optional(v.string()),
        partnerId: v.optional(v.string()),
        createdAt: v.number(),
        updatedAt: v.optional(v.number()),
    }).index("by_partner", ["partnerId"]),
});
