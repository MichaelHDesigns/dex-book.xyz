import base58 from 'bs58';
import mysql2 from 'mysql2/promise';
import { QueryResult, FieldPacket } from 'mysql2';
import { PublicKey, Connection } from '@solana/web3.js';
import { getAccount } from '@solana/spl-token';
import nacl from 'tweetnacl';

const db = mysql2.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 3
});

const CHAOS = '25p2BoNp6qrJH5As6ek6H7Ei495oSkyZd3tGb97sqFmH';
const CHAOS_THRESHOLD = 1000000000000;

const endpoint = 'https://holy-powerful-sea.solana-mainnet.quiknode.pro/efcd822fbc815a7c554bdfbae66bc04bec9463bc/';
const node = new Connection(endpoint, 'confirmed');

const DELAY_TIME = 250;

const whitelistedTokens = [
    '25p2BoNp6qrJH5As6ek6H7Ei495oSkyZd3tGb97sqFmH',
    'ukHH6c7mMyiWCf1b9pnWe25TSpkDDt3H5pQZgZ74J82',
    'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
    'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263'
]

const blacklistedTokens = [
    'So11111111111111111111111111111111111111112',
    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
]

const whitelistedAccounts = [
    'AtmEmuV5BD4fV563eeYsUKQNxx1jDsywJv1CG4ytzyE7'
]

const blacklistedAccounts = [
    'HY4Xvyb9VLq78weau6AqXnm5azcPMMrsFembF9xSbZkg'
]

interface TokenMetadata<T> {
    [symbol: string]: T;
}

let tokenDictionary: TokenMetadata<string> = {}

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function getSymbol(address: string): Promise<string> {

    if (tokenDictionary[address]) return tokenDictionary[address];

    const values = [address];

    let sql = `
        SELECT token_symbol
        FROM token_metadata
        WHERE token_hash = ?
        LIMIT 1;
    `;

    interface SymbolResult {
        token_symbol: string;
    }
    
    const [symbol, field]: [QueryResult, FieldPacket[]] = await db.query(sql, values);
    const symbolResults = symbol as SymbolResult[];
    console.log(symbol);
    const tokenSymbol = symbolResults[0]?.token_symbol ? symbolResults[0].token_symbol : 'SPL';
    tokenDictionary[address] = tokenSymbol;
    return tokenSymbol;

}

async function verifySignature(message: string, signature: string, publicKey: string) {
    const pubKey = new PublicKey(publicKey).toBytes();
    const signatureUint8 = base58.decode(signature);
    const messageUint8 = new TextEncoder().encode(message);
    return nacl.sign.detached.verify(messageUint8, signatureUint8, pubKey);
}

export async function getTokenBalance(address: string, tokenAddress: string, retries = 3) {
    let attempt = 0;
    let error;

    while (attempt < retries) {
        try {
            await delay(DELAY_TIME);
            const tokenAccounts = await node.getTokenAccountsByOwner(
                new PublicKey(address),
                {
                    mint: new PublicKey(tokenAddress)
                }
            );

            if (!tokenAccounts.value) {
                throw new Error('Invalid Token Account response.');
            }

            if (tokenAccounts.value.length === 0) {
                return 0;
            }

            const tokenAccountPubkey = tokenAccounts.value[0].pubkey;
            await delay(DELAY_TIME);
            const tokenAccountInfo = await getAccount(node, tokenAccountPubkey);
            return tokenAccountInfo.amount;
        } catch (err) {
            attempt++;
            error = err;
            console.error(`Error fetching token balance (attempt ${attempt}):`, error);
        }
    }

    throw Error(`Couldn't get balance of '${address}'`)
}

export async function getOrders(tokenAddress: string, account: string = '', signature: string = '') {
    try {
        let signatureBytes;

        if (blacklistedTokens.includes(tokenAddress)) {
            throw Error(`Cannot query for address '${tokenAddress}'`);
        }

        interface OrderRow {
            taking_mint: string;
            making_mint: string;
            making_amount: Number;
            taking_amount: Number;
            making_taking: Number;
            taking_making: Number;
        }

        const values = [tokenAddress];

        let sql = `
            SELECT making_mint, making_amount, taking_amount, making_taking, taking_making
            FROM orders_jupoNjAx
            WHERE taking_mint = ? AND order_status IN ('ACTIVE', 'PARTIAL-FILL')
            ORDER BY taking_amount ASC
        `;
        const [buyOrdersRows, buyFields]: [QueryResult, FieldPacket[]] = await db.query(sql, values);
        const buyOrdersRowsTyped = buyOrdersRows as Array<OrderRow>;

        sql = `
            SELECT taking_mint, making_amount, taking_amount, making_taking, taking_making
            FROM orders_jupoNjAx
            WHERE making_mint = ? AND order_status IN ('ACTIVE', 'PARTIAL-FILL')
            ORDER BY making_amount DESC
        `;
        const [sellOrdersRows, sellFields]: [QueryResult, FieldPacket[]] = await db.query(sql, values);
        const sellOrdersRowsTyped = sellOrdersRows as Array<OrderRow>;

        const buyOrders = await Promise.all(buyOrdersRowsTyped.map(async row => {
            const takingSymbol = await getSymbol(row.taking_mint);
            const makingSymbol = await getSymbol(row.making_mint);
            return {
                making_mint: row.making_mint,
                making_amount: row.making_amount,
                taking_amount: row.taking_amount,
                making_taking: row.making_taking,
                taking_making: row.taking_making,
                BuyAmount: `${row.taking_amount} ${takingSymbol}`,
                SellAmount: `${row.making_amount} ${makingSymbol}`,
                Exchange: `${row.making_taking} ${takingSymbol}/${makingSymbol}`
            };
        }));

        const sellOrders = await Promise.all(sellOrdersRowsTyped.map(async row => {
            const makingSymbol = await getSymbol(row.making_mint);
            const takingSymbol = await getSymbol(row.taking_mint);
            return {
                taking_mint: row.taking_mint,
                making_amount: row.making_amount,
                taking_amount: row.taking_amount,
                making_taking: row.making_taking,
                taking_making: row.taking_making,
                BuyAmount: `${row.taking_amount} ${takingSymbol}`,
                SellAmount: `${row.making_amount} ${makingSymbol}`,
                Exchange: `${row.taking_making} ${makingSymbol}/${takingSymbol}`
            };
        }));

        db.end();

        return { response: { buyOrders, sellOrders } };

    } catch (error) {
        console.error('Database query failed:', error);
        throw new Error(`Error: ${error}`);
    }
}
