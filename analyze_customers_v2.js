
const https = require('https');

async function analyzeCustomers() {
    const data = JSON.stringify({
        path: "customers:listCustomers",
        args: {}
    });

    const options = {
        hostname: 'limitless-nightingale-980.convex.cloud', // Updated
        port: 443,
        path: '/api/query',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data)
        }
    };

    const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
            try {
                if (res.statusCode !== 200) {
                    console.log(`Status: ${res.statusCode}, Body: ${body}`);
                    return;
                }
                const result = JSON.parse(body);
                // Convex query returns { value: [...] } or just the array depending on the exact endpoint
                const customers = result.value || result;

                if (!Array.isArray(customers)) {
                    console.log('Result is not an array:', result);
                    return;
                }

                // Logic to find garbage
                const garbage = customers.filter(c => {
                    const hasInvalidDate = !c.created_at || isNaN(new Date(c.created_at).getTime());
                    const isMissingInfo = !c.name || !c.contact;
                    const isOld = c.updatedAt !== 1 && (!c.updatedAt || c.updatedAt < 1740000000000);
                    return hasInvalidDate || isMissingInfo || isOld;
                });

                console.log(JSON.stringify({
                    total: customers.length,
                    garbageCount: garbage.length,
                    sample: garbage.slice(0, 10).map(g => ({
                        id: g._id,
                        name: g.name || '(이름없음)',
                        contact: g.contact || '(연락처없음)',
                        created_at: g.created_at,
                        no: g.no,
                        updatedAt: g.updatedAt
                    }))
                }, null, 2));
            } catch (e) {
                console.log('Error:', e.message);
                console.log('Raw Body:', body);
            }
        });
    });

    req.on('error', (e) => console.error('Req error:', e));
    req.write(data);
    req.end();
}

analyzeCustomers();
