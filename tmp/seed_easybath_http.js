const { ConvexHttpClient } = require('convex/browser');
require('dotenv').config({ path: '.env.local' });

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

async function seed() {
    const data = {
        code: "P002",
        name: "홈씨씨 이지바스",
        category: "욕실",
        price: "별도문의",
        status: "판매중",
        description: "단 하루 만에 완성되는 이음매 없는 프리미엄 욕실. 곰팡이 걱정 없는 무줄눈 혁신 소재.",
        image: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&q=80",
        link: "/products/easybath",
        specs: JSON.stringify(["단 1~2일 시공", "이음매 없는 무줄눈 구조", "거주 중 시공 가능"])
    };

    try {
        console.log('Seeding product...');
        // upsertProduct is a mutation, client.mutation()
        // Wait, for browser client it might be something different, but let's try.
        // Actually, ConvexHttpClient.mutation is not a function usually, but let's check.
        // For node scripts, we might need a special key.
        
        // Let's try upsertProduct as a mutation
        const result = await client.mutation("products:upsertProduct", data);
        console.log('Seeding done! result:', result);
    } catch (e) {
        console.error('Error seeding:', e.message);
    }
}

seed();
