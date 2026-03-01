
const https = require('https');

async function checkGarbage() {
    const data = JSON.stringify({
        path: "debug:getGarbageCustomers",
        args: {}
    });

    const options = {
        hostname: 'modest-goose-576.convex.cloud', // Provided by context
        port: 443,
        path: '/api/query',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
            console.log(JSON.stringify(JSON.parse(body), null, 2));
        });
    });

    req.on('error', (e) => {
        console.error('Error:', e);
    });

    req.write(data);
    req.end();
}

checkGarbage();
