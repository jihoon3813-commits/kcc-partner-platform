import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getPartnerByUid = query({
    args: { uid: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("partners")
            .withIndex("by_uid", (q) => q.eq("uid", args.uid))
            .unique();
    },
});

export const listPartners = query({
    handler: async (ctx) => {
        return await ctx.db.query("partners").order("desc").collect();
    },
});

export const createPartner = mutation({
    args: {
        uid: v.string(),
        name: v.string(),
        password: v.string(),
        ceo_name: v.optional(v.string()),
        contact: v.optional(v.string()),
        address: v.optional(v.string()),
        email: v.optional(v.string()),
        status: v.optional(v.string()),
        parent_id: v.optional(v.string()),
        business_number: v.optional(v.string()),
        account_number: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("partners")
            .withIndex("by_uid", (q) => q.eq("uid", args.uid))
            .unique();
        if (existing) throw new Error("이미 존재하는 아이디입니다.");

        return await ctx.db.insert("partners", {
            ...args,
            status: args.status ?? "승인대기",
        });
    },
});

export const updatePartnerByUid = mutation({
    args: {
        uid: v.string(),
        updates: v.object({
            name: v.optional(v.string()),
            ceo_name: v.optional(v.string()),
            contact: v.optional(v.string()),
            address: v.optional(v.string()),
            status: v.optional(v.string()),
            business_number: v.optional(v.string()),
            account_number: v.optional(v.string()),
            email: v.optional(v.string()),
            password: v.optional(v.string()),
            special_benefits: v.optional(v.string()),
        }),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("partners")
            .withIndex("by_uid", (q) => q.eq("uid", args.uid))
            .unique();
        if (existing) {
            await ctx.db.patch(existing._id, args.updates);
        }
    },
});

export const updatePartner = mutation({
    args: {
        id: v.id("partners"),
        updates: v.object({
            name: v.optional(v.string()),
            ceo_name: v.optional(v.string()),
            contact: v.optional(v.string()),
            address: v.optional(v.string()),
            status: v.optional(v.string()),
            business_number: v.optional(v.string()),
            account_number: v.optional(v.string()),
            email: v.optional(v.string()),
            password: v.optional(v.string()),
            special_benefits: v.optional(v.string()),
        }),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, args.updates);
    },
});

export const deletePartnerByUid = mutation({
    args: { uid: v.string() },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("partners")
            .withIndex("by_uid", (q) => q.eq("uid", args.uid))
            .unique();
        if (existing) {
            await ctx.db.delete(existing._id);
        }
    },
});
