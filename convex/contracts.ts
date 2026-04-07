import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getContracts = query({
    handler: async (ctx) => {
        return await ctx.db.query("contracts").order("desc").collect();
    },
});

export const getContractByCustomerId = query({
    args: { customerId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("contracts")
            .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
            .first();
    },
});

export const saveContract = mutation({
    args: {
        id: v.optional(v.id("contracts")),
        customerId: v.string(),
        contractDate: v.optional(v.string()),
        applicationDate: v.optional(v.string()),
        contractStatus: v.optional(v.string()),

        constructionDate: v.optional(v.string()),
        finalQuotePrice: v.optional(v.float64()),
        kccSupplyPrice: v.optional(v.float64()),
        kccDepositStatus: v.optional(v.string()),
        constructionContractStatus: v.optional(v.string()),
        paymentMethod: v.optional(v.string()),

        paymentAmount1: v.optional(v.float64()),
        paymentDate1: v.optional(v.string()),
        remainingBalance: v.optional(v.float64()),
        remainingBalanceDate: v.optional(v.string()),

        advancePayment: v.optional(v.float64()),
        hasInterest: v.optional(v.string()),
        totalSubscriptionFee: v.optional(v.float64()),
        subscriptionMonths: v.optional(v.number()),
        monthlySubscriptionFee: v.optional(v.float64()),
        installmentAgreementDate: v.optional(v.string()),
        recordingAgreementDate: v.optional(v.string()),
        originalQuotePrice: v.optional(v.float64()),
        appliances: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        try {
            const { id, ...data } = args;
            
            // Clean up data: ensure no NaN values and remove undefined
            const cleanData: any = {};
            for (const [key, value] of Object.entries(data)) {
                if (value !== undefined) {
                    if (typeof value === 'number' && isNaN(value)) {
                        continue;
                    }
                    cleanData[key] = value;
                }
            }

            // If id is provided, use it directly for patching
            if (id) {
                await ctx.db.patch(id, {
                    ...cleanData,
                    updatedAt: Date.now(),
                });
                return id;
            }

            // Otherwise, look up by customerId
            const existing = await ctx.db
                .query("contracts")
                .withIndex("by_customer", (q) => q.eq("customerId", data.customerId))
                .first();

            if (existing) {
                await ctx.db.patch(existing._id, {
                    ...cleanData,
                    updatedAt: Date.now(),
                });
                return existing._id;
            } else {
                return await ctx.db.insert("contracts", {
                    ...cleanData,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                });
            }
        } catch (error: any) {
            console.error("Error in saveContract:", error);
            throw new Error(`[Server Error] ${error.message || 'Unknown error'}`);
        }
    },
});

export const updateContractStatus = mutation({
    args: { customerId: v.string(), contractStatus: v.string() },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("contracts")
            .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                contractStatus: args.contractStatus,
                updatedAt: Date.now(),
            });
            return existing._id;
        } else {
            return await ctx.db.insert("contracts", {
                customerId: args.customerId,
                contractStatus: args.contractStatus,
                createdAt: Date.now(),
            });
        }
    },
});

export const deleteContract = mutation({
    args: { customerId: v.string() },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("contracts")
            .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
            .first();

        if (existing) {
            await ctx.db.delete(existing._id);
            return { success: true };
        }
        return { success: false, reason: "Not found" };
    },
});
