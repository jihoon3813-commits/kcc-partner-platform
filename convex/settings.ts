import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const syncFromCustomers = mutation({
    handler: async (ctx) => {
        const customers = await ctx.db.query("customers").collect();
        const existingLabels = await ctx.db.query("customerLabels").collect();
        const existingStatuses = await ctx.db.query("customerStatuses").collect();

        const labelNames = new Set(existingLabels.map(l => l.name));
        const statusNames = new Set(existingStatuses.map(s => s.name));

        const newLabels = new Set<string>();
        const newStatuses = new Set<string>();

        // Hardcoded defaults from old API as starting seed
        const defaultLabels = ['일반', '체크', '접수', '완료', '보류'];
        const defaultStatuses = [
            '접수', '부재', '예약콜', '거부',
            '가견적요청', '가견적전달', '가견적불가', '사이즈요청',
            '실측요청', '실측진행', '실측취소',
            '최종견적요청', '최종견적전달', '수정견적전달', '재견적작업', '견적후취소',
            '최종고민중', '계약진행', '결제완료', '공사완료'
        ];

        for (const label of defaultLabels) if (!labelNames.has(label)) newLabels.add(label);
        for (const status of defaultStatuses) if (!statusNames.has(status)) newStatuses.add(status);

        // Scan from customers for anything else
        for (const c of customers) {
            if (c.label && !labelNames.has(c.label)) newLabels.add(c.label);
            if (c.status && !statusNames.has(c.status)) newStatuses.add(c.status);
        }

        let labelOrder = existingLabels.length > 0 ? Math.max(...existingLabels.map(l => l.order || 0)) + 1 : 0;
        for (const label of newLabels) {
            let color = "#3b82f6"; // default blue
            if (label === "체크") color = "#eab308";
            else if (label === "완료" || label.includes("완료")) color = "#16a34a";
            else if (label === "보류") color = "#94a3b8";

            await ctx.db.insert("customerLabels", { name: label, color, order: labelOrder++ });
            labelNames.add(label);
        }

        let statusOrder = existingStatuses.length > 0 ? Math.max(...existingStatuses.map(s => s.order || 0)) + 1 : 0;
        for (const status of newStatuses) {
            let color = "#3b82f6"; // default blue
            if (status.includes("완료")) color = "#10b981";
            else if (status.includes("부재") || status.includes("부재중")) color = "#94a3b8";
            else if (status.includes("예약콜")) color = "#4f46e5";
            else if (status.includes("실측요청")) color = "#f97316";
            else if (status.includes("가견적전달")) color = "#06b6d4";
            else if (status.includes("실측완료")) color = "#14b8a6";
            else if (status.includes("거부") || status.includes("취소")) color = "#6b7280";

            await ctx.db.insert("customerStatuses", { name: status, color, order: statusOrder++ });
            statusNames.add(status);
        }
    }
});

// Labels
export const listLabels = query({
    handler: async (ctx) => {
        return await ctx.db.query("customerLabels").order("asc").collect(); // wait, does it have an index? By schema: .index("by_order", ["order"]). I'll fetch and sort.
    },
});

export const getLabels = query({
    handler: async (ctx) => {
        const labels = await ctx.db.query("customerLabels").collect();
        return labels.sort((a, b) => (a.order || 0) - (b.order || 0));
    },
});

export const addLabel = mutation({
    args: { name: v.string(), color: v.string() },
    handler: async (ctx, args) => {
        const exisiting = await ctx.db.query("customerLabels").collect();
        const order = exisiting.length;
        return await ctx.db.insert("customerLabels", { ...args, order });
    },
});

export const updateLabel = mutation({
    args: { id: v.id("customerLabels"), name: v.string(), color: v.string() },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { name: args.name, color: args.color });
    },
});

export const deleteLabel = mutation({
    args: { id: v.id("customerLabels") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});

export const updateLabelOrders = mutation({
    args: { orders: v.array(v.object({ id: v.id("customerLabels"), order: v.number() })) },
    handler: async (ctx, args) => {
        for (const item of args.orders) {
            await ctx.db.patch(item.id, { order: item.order });
        }
    },
});

// Statuses
export const getStatuses = query({
    handler: async (ctx) => {
        const statuses = await ctx.db.query("customerStatuses").collect();
        return statuses.sort((a, b) => (a.order || 0) - (b.order || 0));
    },
});

export const addStatus = mutation({
    args: { name: v.string(), color: v.string() },
    handler: async (ctx, args) => {
        const exisiting = await ctx.db.query("customerStatuses").collect();
        const order = exisiting.length;
        return await ctx.db.insert("customerStatuses", { ...args, order });
    },
});

export const updateStatus = mutation({
    args: { id: v.id("customerStatuses"), name: v.string(), color: v.string() },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { name: args.name, color: args.color });
    },
});

export const deleteStatus = mutation({
    args: { id: v.id("customerStatuses") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});

export const updateStatusOrders = mutation({
    args: { orders: v.array(v.object({ id: v.id("customerStatuses"), order: v.number() })) },
    handler: async (ctx, args) => {
        for (const item of args.orders) {
            await ctx.db.patch(item.id, { order: item.order });
        }
    },
});

// Authors (Managers)
export const getAuthors = query({
    handler: async (ctx) => {
        const authors = await ctx.db.query("authors").collect();
        return authors.sort((a, b) => (a.order || 0) - (b.order || 0));
    },
});

export const addAuthor = mutation({
    args: { name: v.string(), type: v.string() }, // type: 'progress' | 'feedback'
    handler: async (ctx, args) => {
        const existing = await ctx.db.query("authors").collect();
        const order = existing.length;
        return await ctx.db.insert("authors", { ...args, order });
    },
});

export const updateAuthor = mutation({
    args: { id: v.id("authors"), name: v.string(), type: v.string() },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { name: args.name, type: args.type });
    },
});

export const deleteAuthor = mutation({
    args: { id: v.id("authors") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});

export const updateAuthorOrders = mutation({
    args: { orders: v.array(v.object({ id: v.id("authors"), order: v.number() })) },
    handler: async (ctx, args) => {
        for (const item of args.orders) {
            await ctx.db.patch(item.id, { order: item.order });
        }
    },
});
