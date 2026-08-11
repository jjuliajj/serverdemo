import { NextRequest, NextResponse } from 'next/server';
import { addCustomerRecord, getCustomers } from '../../../lib/store';

export async function GET() {
  const customers = await getCustomers();
  return NextResponse.json(customers, {
    headers: { 'Access-Control-Allow-Origin': '*' }
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newCustomer = {
      id: body.id || `CUST-00${Math.floor(Math.random() * 900) + 100}`,
      name: body.name || 'Khách Hàng Mới',
      email: body.email || 'customer@example.com',
      phone: body.phone || '0900000000',
      city: body.city || 'Hà Nội',
      tier: body.tier || 'Standard',
      joinedDate: new Date().toISOString().split('T')[0],
      ...body
    };

    addCustomerRecord(newCustomer);

    return NextResponse.json({
      success: true,
      message: 'Customer added successfully',
      customer: newCustomer
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
