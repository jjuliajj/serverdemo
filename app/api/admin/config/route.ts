import { NextRequest, NextResponse } from 'next/server';
import { getConfig, updateConfig } from '../../../lib/store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const config = await getConfig();
  return NextResponse.json(config, {
    headers: { 'Access-Control-Allow-Origin': '*' }
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const updated = await updateConfig(body);

    return NextResponse.json({
      success: true,
      message: 'Business logic config updated',
      config: updated
    }, {
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
