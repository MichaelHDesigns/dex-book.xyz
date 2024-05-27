import { getOrders } from "./getOrders";



export async function GET(request: Request, { params }: { params: { token: string } }) {

  // if (whitelistedAddresses.includes(params.address)) {
    // if (!blacklistedAddresses.includes(params.address)) {
      try {
        const response = await getOrders(params.token);
        return new Response(JSON.stringify(response));
      } catch (error :any) {
        console.error('Request failed:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
      }
    // }
  // }
}
