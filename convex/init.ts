import { mutation } from "./_generated/server";

export const seed = mutation({
    handler: async (ctx) => {
        // Seed Admin
        const admin = await ctx.db
            .query("admins")
            .withIndex("by_uid", (q) => q.eq("uid", "admin"))
            .unique();
        if (!admin) {
            await ctx.db.insert("admins", {
                uid: "admin",
                password: "admin1234",
                name: "최고관리자",
                role: "admin",
            });
        }

        const tmAdmin = await ctx.db
            .query("admins")
            .withIndex("by_uid", (q) => q.eq("uid", "TM"))
            .unique();
        if (!tmAdmin) {
            await ctx.db.insert("admins", {
                uid: "TM",
                password: "1234",
                name: "TM센터",
                role: "tm",
            });
        }

        // Seed Initial Products if empty
        const products = await ctx.db.query("products").collect();
        if (products.length === 0) {
            await ctx.db.insert("products", {
                code: "P001",
                name: "KCC홈씨씨 윈도우ONE 구독 서비스",
                category: "창호/샷시",
                price: "별도문의",
                status: "판매중",
                description: "국내 최고 수준의 단열 성능과 기밀성을 자랑하는 프리미엄 창호 브랜드",
                image: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=400",
                link: "/products/onev",
                specs: JSON.stringify(['단열등급: 1~3등급', '유리두께: 24~28mm', '프레임폭: 140~251mm']),
            });
        }
    },
});
