
const https = require('https');

async function checkGarbage() {
    const data = JSON.stringify({
        path: "debug:getGarbageCustomers",
        args: {}
    });

    const options = {
        hostname: 'modest-goose-576.convex.cloud',
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
                    console.log(`Status: ${res.statusCode}`);
                    console.log(`Body: ${body}`);
                    return;
                }
                const result = JSON.parse(body);
                console.log(JSON.stringify(result, null, 2));
            } catch (e) {
                console.log('Parse Error:', e.message);
                console.log('Raw Body:', body);
            }
        });
    });

    req.on('error', (e) => {
        console.error('Request Error:', e);
    });

    req.write(data);
    req.end();
}

checkGarbage();
