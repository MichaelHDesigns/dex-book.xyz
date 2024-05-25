import { getOrders } from "./getOrders";

export async function GET(request: Request, { params }: { params: { address: string } }) {

  try {
    const response = await getOrders(params.address);
    return new Response(JSON.stringify(response));
  } catch (error :any) {
    console.error('Request failed:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
