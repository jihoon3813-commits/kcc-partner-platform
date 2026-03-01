
const fetch = require('node-fetch');

async function checkGarbage() {
    try {
        // We use the existing GET /api/data?action=read_customers
        // or we can talk to Convex directly via fetch if we have the URL
        const convexUrl = "https://modest-goose-576.convex.cloud"; // From current state or .env
        const response = await fetch(`${convexUrl}/api/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                path: "debug:getGarbageCustomers",
                args: {}
            })
        });
        const result = await response.json();
        console.log(JSON.stringify(result, null, 2));
    } catch (err) {
        console.error('Error:', err);
    }
}

checkGarbage();
