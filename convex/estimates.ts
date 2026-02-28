import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create or update estimate
export const saveEstimate = mutation({
    args: {
        date: v.string(),
        branch: v.optional(v.string()),
        statusType: v.string(),
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
            sub60: v.number(),
        }),
        items: v.string(),
        pdfUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const id = await ctx.db.insert("estimates", {
            ...args,
            createdAt: Date.now(),
        });
        return { success: true, id };
    },
});

export const getEstimates = query({
    handler: async (ctx) => {
        return await ctx.db.query("estimates").order("desc").collect();
    },
});

export const getPublicEstimate = query({
    args: {
        n: v.string(), // customerName
        p: v.string(), // customerPhone
        t: v.string(), // statusType
    },
    handler: async (ctx, args) => {
        const estimates = await ctx.db
            .query("estimates")
            .filter((q) =>
                q.and(
                    q.eq(q.field("customerName"), args.n),
                    q.eq(q.field("customerPhone"), args.p),
                    q.eq(q.field("statusType"), args.t)
                )
            )
            .order("desc")
            .collect();

        return estimates.length > 0 ? estimates[0] : null;
    },
});

export const updateEstimateRemark = mutation({
    args: {
        id: v.id("estimates"),
        remark: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { remark: args.remark });
        return { success: true };
    },
});
