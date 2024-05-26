import mysql2 from 'mysql2/promise';

const db = mysql2.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 3
});

interface TokenMetadata<T> {
    [symbol: string]: T;
  }

let tokenDictionary: TokenMetadata<string> = {}

export async function getSymbol(address: string): Promise<string> {

    if (tokenDictionary[address]) return tokenDictionary[address];

    const values = [address];

    // Fetch buy orders
    let sql = `
        SELECT token_symbol
        FROM token_metadata
        WHERE token_hash = ?
        LIMIT 1;
    `;

    const [symbol] = await db.query(sql, values);
    console.log(symbol);
    const tokenSymbol = symbol[0]?.token_symbol ? symbol[0].token_symbol : 'SPL';
    tokenDictionary[address] = tokenSymbol
    return tokenSymbol;

}

export async function getOrders(queryAddress: string) {
  try {
    const values = [queryAddress];

    // Fetch buy orders
    let sql = `
        SELECT making_mint, making_amount, taking_amount, making_taking, taking_making
        FROM orders_jupoNjAx
        WHERE taking_mint = ? AND order_status IN ('ACTIVE', 'PARTIAL-FILL')
        ORDER BY taking_amount ASC
    `;
    const [buyOrdersRows] = await db.query(sql, values);

    // Fetch sell orders
    sql = `
      SELECT taking_mint, making_amount, taking_amount, making_taking, taking_making
      FROM orders_jupoNjAx
      WHERE making_mint = ? AND order_status IN ('ACTIVE', 'PARTIAL-FILL')
      ORDER BY making_amount DESC
    `;

    const [sellOrdersRows] = await db.query(sql, values);

    // Process and format the results
    const buyOrders = await Promise.all(buyOrdersRows.map(async row => {
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

    const sellOrders = await Promise.all(sellOrdersRows.map(async row => {
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

    return { buyOrders, sellOrders };

  } catch (error) {
    console.error('Database query failed:', error);
    throw new Error(`Error: ${error}`);
  }
}