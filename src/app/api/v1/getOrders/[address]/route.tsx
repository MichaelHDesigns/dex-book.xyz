import { getOrders } from "./getOrders";

const whitelistedAddresses = [
  '25p2BoNp6qrJH5As6ek6H7Ei495oSkyZd3tGb97sqFmH'
]

export async function GET(request: Request, { params }: { params: { address: string } }) {

  if (whitelistedAddresses.includes(params.address)) {
    try {
      const response = await getOrders(params.address);
      return new Response(JSON.stringify(response));
    } catch (error :any) {
      console.error('Request failed:', error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  }
}
