import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listProducts = query({
    handler: async (ctx) => {
        return await ctx.db.query("products").collect();
    },
});

export const getProductByCode = query({
    args: { code: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("products")
            .withIndex("by_code", (q) => q.eq("code", args.code))
            .unique();
    },
});

export const upsertProduct = mutation({
    args: {
        code: v.string(),
        name: v.string(),
        category: v.optional(v.string()),
        price: v.optional(v.string()),
        status: v.optional(v.string()),
        description: v.optional(v.string()),
        image: v.optional(v.string()),
        link: v.optional(v.string()),
        specs: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("products")
            .withIndex("by_code", (q) => q.eq("code", args.code))
            .unique();
        if (existing) {
            const { code, ...updates } = args;
            await ctx.db.patch(existing._id, updates);
            return existing._id;
        } else {
            return await ctx.db.insert("products", args);
        }
    },
});
