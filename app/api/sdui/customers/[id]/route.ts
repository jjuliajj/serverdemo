import { NextRequest, NextResponse } from 'next/server';
import { buildCustomerDetailSDUI } from '../../../../lib/business-logic';
import { ensureFirebaseSeeded } from '../../../../lib/store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureFirebaseSeeded();
  const { id } = await params;
  const sduiPayload = await buildCustomerDetailSDUI(id);

  if (!sduiPayload) {
    return NextResponse.json(
      { error: 'Customer not found' },
      { 
        status: 404,
        headers: { 
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Cache-Control, Pragma, Authorization',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0' 
        } 
      }
    );
  }

  return NextResponse.json(sduiPayload, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Cache-Control, Pragma, Authorization',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
    }
  });
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Cache-Control, Pragma, Authorization'
    }
  });
}
