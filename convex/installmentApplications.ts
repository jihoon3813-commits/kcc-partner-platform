import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getInstallmentApplications = query({
    handler: async (ctx) => {
        return await ctx.db.query("installmentApplications").order("desc").collect();
    },
});

export const updateInstallmentApplicationStatus = mutation({
    args: {
        id: v.id("installmentApplications"),
        status: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, {
            status: args.status,
            updatedAt: Date.now(),
        });
        return { success: true };
    },
});
