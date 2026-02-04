import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const generateUploadUrl = mutation(async (ctx) => {
    return await ctx.storage.generateUploadUrl();
});

export const saveResource = mutation({
    args: {
        storageId: v.optional(v.string()),
        type: v.string(),
        title: v.string(),
        description: v.optional(v.string()),
        thumbnailStorageId: v.optional(v.string()),
        manualDownloadUrl: v.optional(v.string()),
        manualThumbnailUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        let downloadUrl = args.manualDownloadUrl || "";
        if (args.storageId) {
            const url = await ctx.storage.getUrl(args.storageId);
            if (url) downloadUrl = url;
        }

        let thumbnail = args.manualThumbnailUrl || "";
        if (args.thumbnailStorageId) {
            const url = await ctx.storage.getUrl(args.thumbnailStorageId);
            if (url) thumbnail = url;
        }

        return await ctx.db.insert("resources", {
            storageId: args.storageId,
            thumbnailStorageId: args.thumbnailStorageId,
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
