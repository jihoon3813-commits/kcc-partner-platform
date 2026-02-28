async function test() {
    const url = "https://iorderapp.innosysit.com/v/share/excel/download.do?id=KCC-EX-2026022628a8509508bc4f928d773fa693d01c6c";
    console.log("Testing fetch for:", url);
    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        });
        console.log("Status:", res.status);
        console.log("Status Text:", res.statusText);
        console.log("Headers:", JSON.stringify([...res.headers.entries()]));
    } catch (e) {
        console.error("Fetch failed with error:", e);
        if (e.cause) console.error("Cause:", e.cause);
    }
}
test();
