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

export const getLatestNo = query({
    handler: async (ctx) => {
        const customers = await ctx.db.query("customers").collect();
        let maxNo = 0;

        for (const customer of customers) {
            if (customer.no) {
                // Extract base number (part before '-')
                const baseNo = parseInt(customer.no.split('-')[0]);
                if (!isNaN(baseNo) && baseNo > maxNo) {
                    maxNo = baseNo;
                }
            }
        }
        return maxNo;
    }
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
        let finalNo = args.no;
        if (!finalNo) {
            // Auto generate No
            const customers = await ctx.db.query("customers").collect();
            let maxNo = 0;
            for (const customer of customers) {
                if (customer.no) {
                    const baseNo = parseInt(customer.no.split('-')[0]);
                    if (!isNaN(baseNo) && baseNo > maxNo) {
                        maxNo = baseNo;
                    }
                }
            }
            finalNo = (maxNo + 1).toString();
        }

        return await ctx.db.insert("customers", {
            ...args,
            no: finalNo,
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
        let currentMaxNo = -1;

        for (const customer of args.customers) {
            let finalNo = customer.no;
            if (!finalNo) {
                if (currentMaxNo === -1) {
                    const allCustomers = await ctx.db.query("customers").collect();
                    currentMaxNo = 0;
                    for (const c of allCustomers) {
                        if (c.no) {
                            const baseNo = parseInt(c.no.split('-')[0]);
                            if (!isNaN(baseNo) && baseNo > currentMaxNo) {
                                currentMaxNo = baseNo;
                            }
                        }
                    }
                }
                currentMaxNo++;
                finalNo = currentMaxNo.toString();
            }

            await ctx.db.insert("customers", {
                ...customer,
                no: finalNo,
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

export const assignMissingNumbers = mutation({
    handler: async (ctx) => {
        const customers = await ctx.db.query("customers").order("asc").collect();
        let currentMaxNo = 0;

        // Find max
        for (const c of customers) {
            if (c.no) {
                const baseNo = parseInt(c.no.split('-')[0]);
                if (!isNaN(baseNo) && baseNo > currentMaxNo) {
                    currentMaxNo = baseNo;
                }
            }
        }

        // Assign to missing
        for (const c of customers) {
            if (!c.no) {
                currentMaxNo++;
                await ctx.db.patch(c._id, { no: currentMaxNo.toString() });
            }
        }
        return { success: true };
    }
});

export const duplicateCustomer = mutation({
    args: { id: v.id("customers") },
    handler: async (ctx, args) => {
        const original = await ctx.db.get(args.id);
        if (!original) throw new Error("Customer not found");

        let newNo = "";
        if (original.no) {
            const baseNo = original.no.split('-')[0];
            const allCustomers = await ctx.db.query("customers").collect();
            let maxSuffix = 0;

            for (const c of allCustomers) {
                if (c.no && c.no.startsWith(baseNo + "-")) {
                    const suffixStr = c.no.split('-')[1];
                    const suffix = parseInt(suffixStr);
                    if (!isNaN(suffix) && suffix > maxSuffix) {
                        maxSuffix = suffix;
                    }
                }
            }
            newNo = `${baseNo}-${maxSuffix + 1}`;
        } else {
            const allCustomers = await ctx.db.query("customers").collect();
            let maxNo = 0;
            for (const c of allCustomers) {
                if (c.no) {
                    const bNo = parseInt(c.no.split('-')[0]);
                    if (!isNaN(bNo) && bNo > maxNo) {
                        maxNo = bNo;
                    }
                }
            }
            newNo = (maxNo + 1).toString();
        }

        const newName = original.name ? `${original.name}(복사)` : "(복사)";
        // Extract internal fields to exclude for insertion
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _id, _creationTime, ...rest } = original;

        const newId = await ctx.db.insert("customers", {
            ...rest,
            no: newNo,
            name: newName,
            status: "접수",
        });

        return newId;
    }
});
