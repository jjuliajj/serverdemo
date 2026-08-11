import { NextRequest, NextResponse } from 'next/server';
import { 
  addCustomerColumn, 
  removeCustomerColumn, 
  addCustomerDetailField, 
  removeCustomerDetailField,
  addOrderColumn,
  getCustomerColumns,
  getCustomerDetailFields,
  getOrderColumns
} from '../../../lib/store';

export async function GET() {
  return NextResponse.json({
    customerColumns: getCustomerColumns(),
    customerDetailFields: getCustomerDetailFields(),
    orderColumns: getOrderColumns()
  }, {
    headers: { 'Access-Control-Allow-Origin': '*' }
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, target, data } = body;

    if (target === 'customer_column') {
      if (action === 'add') {
        addCustomerColumn({
          key: data.key,
          label: data.label,
          type: data.type || 'text',
          sortable: true
        });
      } else if (action === 'remove') {
        removeCustomerColumn(data.key);
      }
    } else if (target === 'customer_field') {
      if (action === 'add') {
        addCustomerDetailField({
          key: data.key,
          label: data.label,
          type: data.type || 'text',
          suffix: data.suffix
        });
      } else if (action === 'remove') {
        removeCustomerDetailField(data.key);
      }
    } else if (target === 'order_column') {
      if (action === 'add') {
        addOrderColumn({
          key: data.key,
          label: data.label,
          type: data.type || 'text'
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Schema successfully updated',
      customerColumns: getCustomerColumns(),
      customerDetailFields: getCustomerDetailFields(),
      orderColumns: getOrderColumns()
    }, {
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
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
