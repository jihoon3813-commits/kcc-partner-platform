import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const generateUploadUrl = mutation(async (ctx) => {
    return await ctx.storage.generateUploadUrl();
});

export const saveResource = mutation({
    args: {
        storageId: v.string(),
        type: v.string(),
        title: v.string(),
        description: v.optional(v.string()),
        thumbnailStorageId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const downloadUrl = (await ctx.storage.getUrl(args.storageId))!;
        let thumbnail = "";
        if (args.thumbnailStorageId) {
            thumbnail = (await ctx.storage.getUrl(args.thumbnailStorageId)) || "";
        }

        return await ctx.db.insert("resources", {
            storageId: args.storageId,
            type: args.type,
            title: args.title,
            description: args.description,
            downloadUrl: downloadUrl,
            thumbnail: thumbnail || downloadUrl, // fallback
        });
    },
});

export const listResources = query({
    handler: async (ctx) => {
        return await ctx.db.query("resources").order("desc").collect();
    },
});

export const deleteResource = mutation({
    args: { id: v.id("resources") },
    handler: async (ctx, args) => {
        const res = await ctx.db.get(args.id);
        if (res?.storageId) {
            await ctx.storage.delete(res.storageId);
        }
        await ctx.db.delete(args.id);
    },
});
