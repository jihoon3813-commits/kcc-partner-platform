import { mutation } from "./_generated/server";

export const updateStatusData = mutation({
    args: {},
    handler: async (ctx) => {
        let customerCount = 0;

        // 1. Update customers table
        const customers = await ctx.db.query("customers").collect();
        for (const customer of customers) {
            if (customer.status === "가견적전달") {
                await ctx.db.patch(customer._id, { status: "가견적생성" });
                customerCount++;
            }
        }

        // 2. Update customerStatuses table mapping
        let settingsCount = 0;
        const existingStatuses = await ctx.db.query("customerStatuses").collect();
        for (const s of existingStatuses) {
            if (s.name === "가견적전달") {
                await ctx.db.patch(s._id, { name: "가견적생성" });
                settingsCount++;
            }
        }

        return { customerCount, settingsCount };
    }
});
