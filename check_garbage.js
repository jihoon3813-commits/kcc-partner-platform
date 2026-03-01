
import { api } from './convex/_generated/api.js';
import { ConvexHttpClient } from 'convex/browser';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

async function checkGarbage() {
    try {
        const result = await client.query(api.debug.getGarbageCustomers);
        console.log(JSON.stringify(result, null, 2));
    } catch (err) {
        console.error('Error:', err);
    }
}

checkGarbage();
