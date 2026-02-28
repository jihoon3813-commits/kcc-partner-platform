import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getRentalApplications = query({
    handler: async (ctx) => {
        return await ctx.db.query("rentalApplications").order("desc").collect();
    },
});

export const updateRentalApplicationStatus = mutation({
    args: {
        id: v.id("rentalApplications"),
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
