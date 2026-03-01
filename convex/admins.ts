import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getAdminByUidCaseInsensitive = query({
    args: { uid: v.string() },
    handler: async (ctx, args) => {
        // First try exact match for performance
        const exactMatch = await ctx.db
            .query("admins")
            .withIndex("by_uid", (q) => q.eq("uid", args.uid))
            .unique();
        if (exactMatch) return exactMatch;

        // If not found, try case-insensitive search (suitable for small number of admins)
        const allAdmins = await ctx.db.query("admins").collect();
        return allAdmins.find(admin => admin.uid.toLowerCase() === args.uid.toLowerCase()) || null;
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
                role: "admin",
            });
        }

        const tmExisting = await ctx.db
            .query("admins")
            .withIndex("by_uid", (q) => q.eq("uid", "TM"))
            .unique();
        if (!tmExisting) {
            await ctx.db.insert("admins", {
                uid: "TM",
                password: "1234",
                name: "TM센터",
                role: "tm",
            });
        }
    },
});
