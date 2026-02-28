import { NextRequest, NextResponse } from "next/server";
import https from "https";

export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get("url");

    if (!url) {
        return new NextResponse("Missing url parameter", { status: 400 });
    }

    let targetUrl = url;
    if (targetUrl.startsWith("//")) {
        targetUrl = "https:" + targetUrl;
    } else if (!targetUrl.startsWith("http")) {
        // If it doesn't have a protocol, try assuming https
        targetUrl = "https://" + targetUrl;
    }

    // Special handling for iorderapp.innosysit.com shared links
    if (targetUrl.includes("iorderapp.innosysit.com")) {
        console.log("Detected iorderapp URL, checking for ID...");
        const idMatch = targetUrl.match(/[?&]id=([^&]+)/);
        if (idMatch && idMatch[1]) {
            const id = idMatch[1];
            targetUrl = `https://iorderapp.innosysit.com/v/share/excel/download.do?id=${id}`;
            console.log("Automatically converted to direct download URL:", targetUrl);
        }
    }

    console.log("Proxy attempting download from:", targetUrl);

    try {
        // Use https module to bypass SSL certificate validation issues
        const data: Buffer = await new Promise((resolve, reject) => {
            const options = {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Referer': 'https://iorderapp.innosysit.com/'
                },
                rejectUnauthorized: false,
                timeout: 10000 // 10 seconds timeout
            };

            https.get(targetUrl, options, (res) => {
                if (res.statusCode !== 200) {
                    reject(new Error(`Target server returned ${res.statusCode}: ${res.statusMessage}`));
                    return;
                }

                const chunks: Buffer[] = [];
                res.on('data', (chunk: Buffer) => chunks.push(chunk));
                res.on('end', () => resolve(Buffer.concat(chunks)));
                res.on('error', (err) => reject(err));
            }).on('error', (err) => reject(err));
        });

        const contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

        return new NextResponse(new Uint8Array(data), {
            headers: {
                "Content-Type": contentType,
                "Access-Control-Allow-Origin": "*",
            },
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return new NextResponse(`Proxy error: ${message} (URL: ${targetUrl})`, { status: 500 });
    }
}
