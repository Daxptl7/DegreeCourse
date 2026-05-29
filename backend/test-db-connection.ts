
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
try {
    dns.setServers(['8.8.8.8']);
    console.log('Set specific DNS servers: 8.8.8.8');
} catch (e) {
    console.error('Failed to set DNS servers:', e);
}

if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

dotenv.config();

console.log('--- DNS DIAGNOSTICS - A RECORD ---');
const shardHost = 'ac-zt4tsqb-shard-00-00.hcnspmi.mongodb.net';

console.log(`Resolving A record for: ${shardHost}`);
dns.resolve(shardHost, (err, addresses) => {
    if (err) {
        console.error('DNS A Lookup FAILED:', err);
    } else {
        console.log('DNS A Lookup SUCCEEDED:', addresses);
    }
});

console.log('\n--- MONGOOSE CONNECTION TEST ---');
const uri = process.env.MONGODB_URI;
if (!uri) {
    console.error('ERROR: MONGODB_URI is undefined. Check .env');
    process.exit(1);
}

console.log('Attempting to connect with Mongoose...');
mongoose.connect(uri)
    .then(() => {
        console.log('SUCCESS: Mongoose connected!');
        process.exit(0);
    })
    .catch(err => {
        console.error('FAILURE: Mongoose connection failed:', err);
        process.exit(1);
    });
