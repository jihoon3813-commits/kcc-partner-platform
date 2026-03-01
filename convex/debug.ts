
import { query } from "./_generated/server";

export const getGarbageCustomers = query({
    handler: async (ctx) => {
        const customers = await ctx.db.query("customers").collect();
        // 1389 is the expected count. Total is 1409.
        // We look for customers that don't look like the 1389 recently uploaded.
        // Usually, garbage data has missing names, or old created_at, or invalid dates.

        const garbage = customers.filter(c => {
            const hasInvalidDate = !c.created_at || isNaN(new Date(c.created_at).getTime());
            const isMissingInfo = !c.name || !c.contact;
            // Let's also check updatedAt. Recently uploaded via batchCreate had updatedAt: 1.
            const isOld = !c.updatedAt || (c.updatedAt !== 1 && c.updatedAt < 1700000000000);

            return hasInvalidDate || isMissingInfo;
        });

        return {
            total: customers.length,
            garbageCount: garbage.length,
            sample: garbage.slice(0, 5).map(g => ({
                id: g._id,
                name: g.name,
                contact: g.contact,
                created_at: g.created_at,
                no: g.no
            }))
        };
    }
});
