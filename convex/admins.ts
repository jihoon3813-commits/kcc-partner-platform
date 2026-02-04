import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getAdminByUid = query({
    args: { uid: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("admins")
            .withIndex("by_uid", (q) => q.eq("uid", args.uid))
            .unique();
    },
});

export const createInitialAdmin = mutation({
    handler: async (ctx) => {
        const existing = await ctx.db
            .query("admins")
            .withIndex("by_uid", (q) => q.eq("uid", "admin"))
            .unique();
        if (!existing) {
            await ctx.db.insert("admins", {
                uid: "admin",
                password: "admin1234",
                name: "최고관리자",
            });
        }
    },
});
