import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

async function main() {
    try {
        const customers = await client.query(api.customers.listCustomers);
        const target = customers.find(c => c.name === "조선주");
        console.log("RESULT_START");
        console.log(JSON.stringify(target, null, 2));
        console.log("RESULT_END");
    } catch (e) {
        console.error(e);
    }
}

main();
