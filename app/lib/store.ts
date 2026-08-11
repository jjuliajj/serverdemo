import { db, rtdb, firebaseInitialized } from './firebase';
import { SDUIPageSchema, SDUIColumn, SDUIDetailField } from './sdui-types';

export interface CustomerModel {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  tier: 'Standard' | 'VIP Gold' | 'VIP Diamond';
  joinedDate: string;
  // Dynamic extra fields
  taxCode?: string;
  loyaltyPoints?: number;
  salesRep?: string;
  shippingAddress?: string;
  notes?: string;
  [key: string]: any;
}

export interface OrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderModel {
  id: string;
  customerId: string;
  createdAt: string;
  items: OrderItem[];
  subtotal: number;
  vatRate: number; // e.g. 0.10 for 10%
  vatAmount: number;
  discountRate: number; // e.g. 0.05 for 5%
  discountAmount: number;
  shippingFee: number;
  total: number;
  status: 'Completed' | 'Processing' | 'Cancelled' | 'Pending';
  paymentMethod?: string;
  shippingNote?: string;
  [key: string]: any;
}

export interface SystemConfig {
  vatRate: number; // 0.10 (10%) or 0.08 (8%)
  vipGoldDiscount: number; // 0.05 (5%)
  vipDiamondDiscount: number; // 0.10 (10%)
  freeShippingThreshold: number; // 5000000
  shippingFeeStandard: number; // 30000
}

// Initial Seed Data
const initialCustomers: CustomerModel[] = [
  {
    id: 'CUST-001',
    name: 'Nguyễn Văn An',
    email: 'an.nguyen@example.com',
    phone: '0901234567',
    city: 'Hà Nội',
    tier: 'VIP Diamond',
    joinedDate: '2024-01-15',
    taxCode: '0101234567',
    loyaltyPoints: 1250,
    salesRep: 'Phạm Thanh Hương',
    shippingAddress: '123 Đường Lê Duẩn, Quận Hoàn Kiếm, Hà Nội',
    notes: 'Khách hàng VIP lâu năm, hay mua đơn hàng số lượng lớn.'
  },
  {
    id: 'CUST-002',
    name: 'Trần Thị Bích',
    email: 'bich.tran@example.com',
    phone: '0918765432',
    city: 'TP. Hồ Chí Minh',
    tier: 'VIP Gold',
    joinedDate: '2024-03-10',
    taxCode: '0309876543',
    loyaltyPoints: 540,
    salesRep: 'Nguyễn Minh Tuấn',
    shippingAddress: '456 Nguyễn Thị Minh Khai, Quận 1, TP.HCM',
    notes: 'Thanh toán chuyển khoản ngân hàng.'
  },
  {
    id: 'CUST-003',
    name: 'Lê Hoàng Nam',
    email: 'nam.le@example.com',
    phone: '0988112233',
    city: 'Đà Nẵng',
    tier: 'Standard',
    joinedDate: '2024-05-22',
    taxCode: '0403322110',
    loyaltyPoints: 120,
    salesRep: 'Phạm Thanh Hương',
    shippingAddress: '78 Nguyễn Văn Linh, Quận Hải Châu, Đà Nẵng',
    notes: 'Giao hàng giờ hành chính.'
  }
];

const initialOrders: OrderModel[] = [
  {
    id: 'ORD-1001',
    customerId: 'CUST-001',
    createdAt: '2026-08-01',
    items: [
      { productName: 'Máy tính xách tay Dell XPS 15', quantity: 1, unitPrice: 35000000 },
      { productName: 'Chuột không dây Logitech MX Master 3S', quantity: 2, unitPrice: 2400000 }
    ],
    subtotal: 39800000,
    vatRate: 0.10,
    vatAmount: 3980000,
    discountRate: 0.10, // VIP Diamond 10%
    discountAmount: 3980000,
    shippingFee: 0,
    total: 39800000,
    status: 'Completed',
    paymentMethod: 'Chuyển khoản Ngân hàng (Vietcombank)',
    shippingNote: 'Giao tận tay anh An'
  },
  {
    id: 'ORD-1002',
    customerId: 'CUST-001',
    createdAt: '2026-08-08',
    items: [
      { productName: 'Màn hình Dell UltraSharp 27 inch 4K', quantity: 2, unitPrice: 12500000 },
      { productName: 'Bàn phím cơ Keychron Q1 Pro', quantity: 1, unitPrice: 4200000 }
    ],
    subtotal: 29200000,
    vatRate: 0.10,
    vatAmount: 2920000,
    discountRate: 0.10,
    discountAmount: 2920000,
    shippingFee: 0,
    total: 29200000,
    status: 'Completed',
    paymentMethod: 'Thẻ tín dụng Visa',
    shippingNote: 'Đóng gói chống sốc kỹ'
  },
  {
    id: 'ORD-1003',
    customerId: 'CUST-002',
    createdAt: '2026-08-05',
    items: [
      { productName: 'Tai nghe Sony WH-1000XM5', quantity: 1, unitPrice: 8490000 },
      { productName: 'Đế sạc không dây Anker 3-in-1', quantity: 1, unitPrice: 1500000 }
    ],
    subtotal: 9990000,
    vatRate: 0.10,
    vatAmount: 999000,
    discountRate: 0.05, // VIP Gold 5%
    discountAmount: 499500,
    shippingFee: 0,
    total: 10489500,
    status: 'Completed',
    paymentMethod: 'Ví MoMo',
    shippingNote: 'Giao trước 17h'
  },
  {
    id: 'ORD-1004',
    customerId: 'CUST-003',
    createdAt: '2026-08-10',
    items: [
      { productName: 'Bàn di chuột bằng da cao cấp', quantity: 2, unitPrice: 450000 }
    ],
    subtotal: 900000,
    vatRate: 0.10,
    vatAmount: 90000,
    discountRate: 0.0,
    discountAmount: 0,
    shippingFee: 30000,
    total: 1020000,
    status: 'Processing',
    paymentMethod: 'COD (Thanh toán khi nhận hàng)',
    shippingNote: 'Gọi trước khi giao 15 phút'
  }
];

const initialConfig: SystemConfig = {
  vatRate: 0.10,
  vipGoldDiscount: 0.05,
  vipDiamondDiscount: 0.10,
  freeShippingThreshold: 5000000,
  shippingFeeStandard: 30000
};

// Initial Dynamic Column Configurations for Customers List & Order History
let customerColumns: SDUIColumn[] = [
  { key: 'id', label: 'Mã KH', type: 'text', sortable: true },
  { key: 'name', label: 'Tên khách hàng', type: 'text', sortable: true },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'phone', label: 'Số điện thoại', type: 'phone' },
  { key: 'city', label: 'Tỉnh/Thành', type: 'text' },
  {
    key: 'tier',
    label: 'Hạng hội viên',
    type: 'badge',
    badgeVariants: {
      'VIP Diamond': { label: 'VIP Diamond', color: 'purple' },
      'VIP Gold': { label: 'VIP Gold', color: 'yellow' },
      'Standard': { label: 'Phổ thông', color: 'gray' }
    }
  },
  { key: 'taxCode', label: 'Mã số thuế', type: 'text' },
  { key: 'totalSpent', label: 'Tổng chi tiêu', type: 'currency' }
];

let customerDetailFields: SDUIDetailField[] = [
  { key: 'id', label: 'Mã định danh', type: 'text' },
  { key: 'name', label: 'Họ và tên', type: 'text' },
  { key: 'email', label: 'Địa chỉ Email', type: 'email' },
  { key: 'phone', label: 'Số điện thoại', type: 'phone' },
  { key: 'city', label: 'Thành phố', type: 'text' },
  {
    key: 'tier',
    label: 'Cấp độ tài khoản',
    type: 'badge',
    badgeVariants: {
      'VIP Diamond': { label: 'VIP Diamond', color: 'purple' },
      'VIP Gold': { label: 'VIP Gold', color: 'yellow' },
      'Standard': { label: 'Chuẩn', color: 'gray' }
    }
  },
  { key: 'taxCode', label: 'Mã số thuế doanh nghiệp', type: 'text' },
  { key: 'loyaltyPoints', label: 'Điểm tích lũy', type: 'text', suffix: ' điểm' },
  { key: 'salesRep', label: 'Phụ trách nhân sự', type: 'text' },
  { key: 'shippingAddress', label: 'Địa chỉ giao hàng mặc định', type: 'text', gridSpan: 2 },
  { key: 'joinedDate', label: 'Ngày tham gia', type: 'date' }
];

let orderColumns: SDUIColumn[] = [
  { key: 'id', label: 'Mã đơn', type: 'text' },
  { key: 'createdAt', label: 'Ngày đặt', type: 'date' },
  { key: 'subtotal', label: 'Tạm tính', type: 'currency' },
  { key: 'vatAmount', label: 'Thuế VAT', type: 'currency' },
  { key: 'discountAmount', label: 'Giảm giá VIP', type: 'currency' },
  { key: 'total', label: 'Tổng tiền', type: 'currency' },
  {
    key: 'status',
    label: 'Trạng thái',
    type: 'badge',
    badgeVariants: {
      'Completed': { label: 'Hoàn thành', color: 'green' },
      'Processing': { label: 'Đang xử lý', color: 'blue' },
      'Pending': { label: 'Chờ duyệt', color: 'yellow' },
      'Cancelled': { label: 'Đã hủy', color: 'red' }
    }
  },
  { key: 'paymentMethod', label: 'Phương thức thanh toán', type: 'text' }
];

// In-Memory state for live rapid updates
let stateCustomers = [...initialCustomers];
let stateOrders = [...initialOrders];
let stateConfig = { ...initialConfig };

// Sync all state to Firebase under the node/table named 'serverdemo'
export async function syncToServerdemoTable() {
  if (!firebaseInitialized) return;

  const serverdemoData = {
    config: stateConfig,
    schemas: {
      customerColumns,
      customerDetailFields,
      orderColumns
    },
    customers: stateCustomers.reduce((acc: any, c) => { acc[c.id] = c; return acc; }, {}),
    orders: stateOrders.reduce((acc: any, o) => { acc[o.id] = o; return acc; }, {}),
    lastUpdated: new Date().toISOString()
  };

  // Write to Realtime Database at node 'serverdemo'
  if (rtdb) {
    try {
      await rtdb.ref('serverdemo').set(serverdemoData);
      console.log('Successfully synced state to Firebase Realtime Database node: /serverdemo');
    } catch (e) {
      console.warn('Realtime Database write failed, trying Firestore...', e);
    }
  }

  // Write to Firestore collection 'serverdemo'
  if (db) {
    try {
      await db.collection('serverdemo').doc('data').set(serverdemoData, { merge: true });
      console.log('Successfully synced state to Firebase Firestore collection: serverdemo');
    } catch (e) {
      console.error('Firestore write error:', e);
    }
  }
}

// Helper to seed Firebase if initialized & empty
export async function ensureFirebaseSeeded() {
  if (!firebaseInitialized) return;

  try {
    if (rtdb) {
      const snap = await rtdb.ref('serverdemo').once('value');
      if (!snap.exists()) {
        console.log('Seeding initial node "serverdemo" in Firebase Realtime Database...');
        await syncToServerdemoTable();
      }
    } else if (db) {
      const doc = await db.collection('serverdemo').doc('data').get();
      if (!doc.exists) {
        console.log('Seeding initial collection "serverdemo" in Firebase Firestore...');
        await syncToServerdemoTable();
      }
    }
  } catch (err) {
    console.error('Error seeding Firebase serverdemo table:', err);
  }
}

// Memory / Firebase getter functions
export async function getCustomers(): Promise<CustomerModel[]> {
  return stateCustomers;
}

export async function getCustomerById(id: string): Promise<CustomerModel | null> {
  return stateCustomers.find(c => c.id === id) || null;
}

export async function getOrders(): Promise<OrderModel[]> {
  return stateOrders;
}

export async function getOrdersByCustomerId(customerId: string): Promise<OrderModel[]> {
  const orders = await getOrders();
  return orders.filter(o => o.customerId === customerId);
}

export async function getConfig(): Promise<SystemConfig> {
  return stateConfig;
}

export async function updateConfig(newConfig: Partial<SystemConfig>): Promise<SystemConfig> {
  stateConfig = { ...stateConfig, ...newConfig };
  syncToServerdemoTable().catch(console.error);
  return stateConfig;
}

// Schema Management getters and modifiers
export function getCustomerColumns(): SDUIColumn[] {
  return customerColumns;
}

export function getCustomerDetailFields(): SDUIDetailField[] {
  return customerDetailFields;
}

export function getOrderColumns(): SDUIColumn[] {
  return orderColumns;
}

// Dynamic schema modifications from Serverdemo Admin UI
export function addCustomerColumn(col: SDUIColumn) {
  if (!customerColumns.some(c => c.key === col.key)) {
    customerColumns.push(col);
    syncToServerdemoTable().catch(console.error);
  }
}

export function removeCustomerColumn(key: string) {
  customerColumns = customerColumns.filter(c => c.key !== key);
  syncToServerdemoTable().catch(console.error);
}

export function addCustomerDetailField(field: SDUIDetailField) {
  if (!customerDetailFields.some(f => f.key === field.key)) {
    customerDetailFields.push(field);
    syncToServerdemoTable().catch(console.error);
  }
}

export function removeCustomerDetailField(key: string) {
  customerDetailFields = customerDetailFields.filter(f => f.key !== key);
  syncToServerdemoTable().catch(console.error);
}

export function addOrderColumn(col: SDUIColumn) {
  if (!orderColumns.some(c => c.key === col.key)) {
    orderColumns.push(col);
    syncToServerdemoTable().catch(console.error);
  }
}

export function addCustomerRecord(cust: CustomerModel) {
  stateCustomers.push(cust);
  syncToServerdemoTable().catch(console.error);
}

export function addOrderRecord(order: OrderModel) {
  stateOrders.push(order);
  syncToServerdemoTable().catch(console.error);
}
