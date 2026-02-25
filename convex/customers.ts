import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listCustomers = query({
    handler: async (ctx) => {
        return await ctx.db.query("customers").order("desc").collect();
    },
});

export const getCustomersByChannel = query({
    args: { channel: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("customers")
            .filter((q) => q.eq(q.field("channel"), args.channel))
            .order("desc")
            .collect();
    },
});

export const createCustomer = mutation({
    args: {
        no: v.optional(v.string()),
        label: v.optional(v.string()),
        status: v.optional(v.string()),
        channel: v.optional(v.string()),
        name: v.optional(v.string()),
        contact: v.optional(v.string()),
        address: v.optional(v.string()),
        feedback: v.optional(v.string()),
        progress_detail: v.optional(v.string()),
        measure_date: v.optional(v.string()),
        construct_date: v.optional(v.string()),
        price_pre: v.optional(v.float64()),
        price_final: v.optional(v.float64()),
        link_pre_kcc: v.optional(v.string()),
        link_final_kcc: v.optional(v.string()),
        link_pre_cust: v.optional(v.string()),
        link_final_cust: v.optional(v.string()),
        partner_benefit: v.optional(v.string()),
        created_at: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("customers", {
            ...args,
            status: args.status ?? "접수",
            label: args.label ?? "일반",
        });
    },
});

export const updateCustomer = mutation({
    args: {
        id: v.id("customers"),
        updates: v.object({
            label: v.optional(v.string()),
            status: v.optional(v.string()),
            name: v.optional(v.string()),
            contact: v.optional(v.string()),
            address: v.optional(v.string()),
            feedback: v.optional(v.string()),
            progress_detail: v.optional(v.string()),
            measure_date: v.optional(v.string()),
            construct_date: v.optional(v.string()),
            price_pre: v.optional(v.float64()),
            price_final: v.optional(v.float64()),
            link_pre_kcc: v.optional(v.string()),
            link_final_kcc: v.optional(v.string()),
            link_pre_cust: v.optional(v.string()),
            link_final_cust: v.optional(v.string()),
            partner_benefit: v.optional(v.string()),
            created_at: v.optional(v.string()),
        }),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, args.updates);
    },
});

export const batchCreate = mutation({
    args: {
        customers: v.array(v.object({
            no: v.optional(v.string()),
            label: v.optional(v.string()),
            status: v.optional(v.string()),
            channel: v.optional(v.string()),
            name: v.optional(v.string()),
            contact: v.optional(v.string()),
            address: v.optional(v.string()),
            feedback: v.optional(v.string()),
            progress_detail: v.optional(v.string()),
            measure_date: v.optional(v.string()),
            construct_date: v.optional(v.string()),
            price_pre: v.optional(v.float64()),
            price_final: v.optional(v.float64()),
            link_pre_kcc: v.optional(v.string()),
            link_final_kcc: v.optional(v.string()),
            link_pre_cust: v.optional(v.string()),
            link_final_cust: v.optional(v.string()),
            partner_benefit: v.optional(v.string()),
            created_at: v.optional(v.string()),
        }))
    },
    handler: async (ctx, args) => {
        for (const customer of args.customers) {
            await ctx.db.insert("customers", {
                ...customer,
                status: customer.status || "접수",
                label: customer.label || "일반",
            });
        }
        return { success: true, count: args.customers.length };
    },
});

export const deleteCustomer = mutation({
    args: { id: v.id("customers") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});

export const batchDelete = mutation({
    args: { ids: v.array(v.id("customers")) },
    handler: async (ctx, args) => {
        for (const id of args.ids) {
            await ctx.db.delete(id);
        }
        return { success: true, count: args.ids.length };
    },
});
