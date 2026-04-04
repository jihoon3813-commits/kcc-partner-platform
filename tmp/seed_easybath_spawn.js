const { spawnSync } = require('child_process');

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

const jsonStr = JSON.stringify(data);

try {
    const res = spawnSync('npx.cmd', ['convex', 'run', 'products:upsertProduct', jsonStr], { encoding: 'utf8' });
    console.log('Result:', res.stdout);
    if (res.stderr) console.error('Error Output:', res.stderr);
} catch (e) {
    console.error('Fatal Error:', e.message);
}
