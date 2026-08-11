import { NextRequest, NextResponse } from 'next/server';
import { 
  addCustomerRecord, 
  updateCustomerRecord, 
  deleteCustomerRecord, 
  getCustomers 
} from '../../../lib/store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const customers = await getCustomers();
  return NextResponse.json(customers, {
    headers: { 
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action = 'create', ...data } = body;

    if (action === 'delete') {
      if (!data.id) {
        return NextResponse.json({ error: 'Missing customer id' }, { status: 400 });
      }
      deleteCustomerRecord(data.id);
      return NextResponse.json({
        success: true,
        message: `Đã xóa khách hàng ${data.id} thành công khỏi Database`,
        customers: await getCustomers()
      }, { headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    if (action === 'update') {
      if (!data.id) {
        return NextResponse.json({ error: 'Missing customer id' }, { status: 400 });
      }
      updateCustomerRecord(data);
      return NextResponse.json({
        success: true,
        message: `Đã cập nhật thông tin khách hàng ${data.name || data.id} thành công`,
        customers: await getCustomers()
      }, { headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    // Default: Create
    const newCustomer = {
      id: data.id || `CUST-${Math.floor(Math.random() * 9000) + 1000}`,
      name: data.name || 'Khách Hàng Mới',
      email: data.email || 'customer@example.com',
      phone: data.phone || '0900000000',
      city: data.city || 'Hà Nội',
      tier: data.tier || 'Standard',
      joinedDate: data.joinedDate || new Date().toISOString().split('T')[0],
      taxCode: data.taxCode || '',
      loyaltyPoints: data.loyaltyPoints !== undefined ? Number(data.loyaltyPoints) : 0,
      salesRep: data.salesRep || '',
      shippingAddress: data.shippingAddress || '',
      ...data
    };

    addCustomerRecord(newCustomer);

    return NextResponse.json({
      success: true,
      message: `Đã thêm khách hàng "${newCustomer.name}" vào Database`,
      customer: newCustomer,
      customers: await getCustomers()
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
      'Access-Control-Allow-Headers': 'Content-Type, Cache-Control, Pragma, Authorization'
    }
  });
}
