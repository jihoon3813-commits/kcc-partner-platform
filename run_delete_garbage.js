
const https = require('https');

async function deleteGarbage() {
    const data = JSON.stringify({
        path: "customers:deleteGarbageCustomers",
        args: {}
    });

    const options = {
        hostname: 'limitless-nightingale-980.convex.cloud',
        port: 443,
        path: '/api/mutation',
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
                console.log(JSON.stringify(result, null, 2));
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

deleteGarbage();
