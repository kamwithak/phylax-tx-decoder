import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://api.etherscan.io/api?module=contract&action=getsourcecode&address=${address}&apikey=${process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY}`
    );
    
    const data = await response.json();
    
    if (data.status === '1' && data.result[0]) {
      const contractName = data.result[0].ContractName || address;
      return NextResponse.json({ contractName });
    }
    
    return NextResponse.json({ contractName: address });
  } catch (error) {
    console.error('Error fetching from Etherscan:', error);
    return NextResponse.json({ contractName: address });
  }
} 