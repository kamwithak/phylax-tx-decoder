import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hash = searchParams.get('hash');
  const ETHERSCAN_API_KEY = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;

  if (!hash) {
    return NextResponse.json(
      { error: 'Transaction hash is required' },
      { status: 400 }
    );
  }

  if (!ETHERSCAN_API_KEY) {
    return NextResponse.json(
      { error: 'Etherscan API key not configured' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://api.etherscan.io/api?module=account&action=txlistinternal&txhash=${hash}&apikey=${ETHERSCAN_API_KEY}`
    );
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ 
      error: `Failed to fetch trace data: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
} 