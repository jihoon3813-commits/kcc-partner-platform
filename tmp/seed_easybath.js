const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const data = {
    code: "P002",
    name: "홈씨씨 이지바스",
    category: "욕실",
    price: "별도문의",
    status: "판매중",
    description: "단 하루 만에 완성되는 이음매 없는 프리미엄 욕실. 곰팡이 걱정 없는 무줄눈 혁신 소재.",
    image: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&q=80",
    link: "/products/easybath",
    specs: "[\"단 1~2일 시공\", \"이음매 없는 무줄눈 구조\", \"거주 중 시공 가능\"]"
};

const jsonStr = JSON.stringify(data);
const escaped = jsonStr.replace(/"/g, '\\"');

try {
    const cmd = `npx convex run products:upsertProduct "${escaped}"`;
    console.log(`Running: ${cmd}`);
    const output = execSync(cmd, { encoding: 'utf8' });
    console.log('Output:', output);
} catch (e) {
    console.error('Error:', e.stdout || e.message);
}
