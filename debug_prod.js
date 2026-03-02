const { ConvexHttpClient } = require("convex/browser");
const { api } = require("./convex/_generated/api");

async function checkProduction() {
    const client = new ConvexHttpClient("https://neat-eagle-186.convex.cloud");
    console.log("Fetching from production...");
    const customers = await client.query(api.customers.listCustomers);
    const recent = customers.slice(0, 5);
    console.log(JSON.stringify(recent, (key, value) => {
        if (typeof value === 'bigint') return value.toString();
        return value;
    }, 2));
}

checkProduction().catch(console.error);
