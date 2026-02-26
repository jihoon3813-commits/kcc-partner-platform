import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getNotices = query({
    handler: async (ctx) => {
        return await ctx.db
            .query("notices")
            .withIndex("by_created_at")
            .order("desc")
            .collect();
    },
});

export const addNotice = mutation({
    args: {
        dongUnit: v.string(),
        constructDate: v.string(),
        duration: v.string(),
        contact: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("notices", {
            ...args,
            createdAt: Date.now(),
        });
    },
});

export const deleteNotice = mutation({
    args: { id: v.id("notices") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
