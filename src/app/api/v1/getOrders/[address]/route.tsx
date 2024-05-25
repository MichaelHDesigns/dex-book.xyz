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

export async function getOrders(queryAddress: string) {
  try {
    const values = [queryAddress];

    // Fetch buy orders
    let sql = `
      SELECT taking_mint, making_mint, taking_amount, making_amount
      FROM jupoNjAx_txs
      WHERE taking_mint = ?
      ORDER BY taking_amount ASC
    `;
    const [buyOrdersRows] = await db.query(sql, values);

    // Fetch sell orders
    sql = `
      SELECT taking_mint, making_mint, taking_amount, making_amount
      FROM jupoNjAx_txs
      WHERE making_mint = ?
      ORDER BY making_amount DESC
    `;
    const [sellOrdersRows] = await db.query(sql, values);

    // Process and format the results
    const buyOrders = buyOrdersRows.map(row => ({
      taking_mint: row.taking_mint,
      making_mint: row.making_mint,
      taking_amount: row.taking_amount,
      making_amount: row.making_amount
    }));
    
    const sellOrders = sellOrdersRows.map(row => ({
      taking_mint: row.taking_mint,
      making_mint: row.making_mint,
      taking_amount: row.taking_amount,
      making_amount: row.making_amount
    }));

    return { buyOrders, sellOrders, request: request };

  } catch (error) {
    console.error('Database query failed:', error);
    throw new Error('Failed to fetch orders from database');
  }
}

// export async function GET(request: Request, { params }: { params: { address: string } }) {

//   try {
//     const response = await getOrders(params.address);
//     return new Response(JSON.stringify(response));
//   } catch (error :any) {
//     console.error('Request failed:', error);
//     return new Response(JSON.stringify({ error: error.message }), { status: 500 });
//   }
// }
