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
});
