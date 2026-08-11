import { 
  getCustomers, 
  getCustomerById, 
  getOrders, 
  getOrdersByCustomerId, 
  getConfig, 
  getCustomerColumns, 
  getCustomerDetailFields, 
  getOrderColumns 
} from './store';
import { SDUIPageSchema } from './sdui-types';

export async function calculateCustomerStats(customerId: string) {
  const orders = await getOrdersByCustomerId(customerId);
  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
  const totalSubtotal = orders.reduce((sum, o) => sum + o.subtotal, 0);
  const totalVatPaid = orders.reduce((sum, o) => sum + o.vatAmount, 0);
  const totalDiscounts = orders.reduce((sum, o) => sum + o.discountAmount, 0);
  const orderCount = orders.length;
  const avgOrderValue = orderCount > 0 ? Math.round(totalSpent / orderCount) : 0;

  return {
    totalSpent,
    totalSubtotal,
    totalVatPaid,
    totalDiscounts,
    orderCount,
    avgOrderValue
  };
}

export async function calculateGlobalFinancials() {
  const orders = await getOrders();
  const customers = await getCustomers();
  const config = await getConfig();

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalVatCollected = orders.reduce((sum, o) => sum + o.vatAmount, 0);
  const totalDiscountsGiven = orders.reduce((sum, o) => sum + o.discountAmount, 0);
  const activeCustomersCount = customers.length;
  const completedOrdersCount = orders.filter(o => o.status === 'Completed').length;

  return {
    totalRevenue,
    totalVatCollected,
    totalDiscountsGiven,
    activeCustomersCount,
    completedOrdersCount,
    vatRatePercent: Math.round(config.vatRate * 100)
  };
}

/**
 * Builds the SDUI Schema + Computed Data for Customer List View
 */
export async function buildCustomersListSDUI(): Promise<SDUIPageSchema> {
  const financials = await calculateGlobalFinancials();
  const customers = await getCustomers();
  const orders = await getOrders();
  const columns = getCustomerColumns();

  // Augment customer data with backend calculated fields
  const augmentedCustomers = customers.map(c => {
    const customerOrders = orders.filter(o => o.customerId === c.id);
    const totalSpent = customerOrders.reduce((sum, o) => sum + o.total, 0);
    return {
      ...c,
      totalSpent
    };
  });

  return {
    pageKey: 'customers_list',
    version: '1.4.0',
    lastUpdated: new Date().toISOString(),
    title: 'Quản Lý Khách Hàng & Thu Chi Cửa Hàng',
    subtitle: 'Giao diện được điều khiển hoàn toàn tự động từ Server (Server-Driven UI)',
    components: [
      {
        id: 'global_financial_stats',
        type: 'StatsGroup',
        title: 'Chỉ Số Tài Chính Hệ Thống (Server Calculated)',
        items: [
          {
            id: 'total_revenue',
            label: 'Tổng Doanh Thu',
            value: financials.totalRevenue,
            type: 'currency',
            change: '+15.4% tháng này',
            changeType: 'positive',
            description: 'Đã bao gồm VAT & Giảm giá'
          },
          {
            id: 'total_vat',
            label: `Tổng Thuế VAT (${financials.vatRatePercent}%)`,
            value: financials.totalVatCollected,
            type: 'currency',
            change: 'Server Rules Applied',
            changeType: 'neutral',
            description: 'Thuế phải nộp vào ngân sách'
          },
          {
            id: 'active_customers',
            label: 'Khách Hàng Hoạt Động',
            value: financials.activeCustomersCount,
            type: 'text',
            change: '+3 mới trong tuần',
            changeType: 'positive'
          },
          {
            id: 'completed_orders',
            label: 'Đơn Hàng Hoàn Tất',
            value: financials.completedOrdersCount,
            type: 'text',
            change: '100% đúng hạn',
            changeType: 'positive'
          }
        ]
      },
      {
        id: 'customers_table',
        type: 'DataTable',
        title: 'Danh Sách Khách Hàng (Tự Động Render Cột)',
        subtitle: 'Thêm/bớt cột hoặc thay đổi kiểu dữ liệu tại Serverdemo sẽ lập tức cập nhật ở đây',
        columns: columns,
        rowActionUrl: '/customers/{id}',
        emptyText: 'Chưa có dữ liệu khách hàng'
      }
    ],
    // Store data inside schema response
    data: {
      customers: augmentedCustomers
    } as any
  };
}

/**
 * Builds the SDUI Schema + Computed Data for Customer Detail View
 */
export async function buildCustomerDetailSDUI(customerId: string): Promise<SDUIPageSchema | null> {
  const customer = await getCustomerById(customerId);
  if (!customer) return null;

  const stats = await calculateCustomerStats(customerId);
  const orders = await getOrdersByCustomerId(customerId);
  const detailFields = getCustomerDetailFields();
  const orderTableColumns = getOrderColumns();

  return {
    pageKey: 'customer_detail',
    version: '1.4.0',
    lastUpdated: new Date().toISOString(),
    title: `Chi Tiết Khách Hàng: ${customer.name}`,
    subtitle: `Mã KH: ${customer.id} | Hạng: ${customer.tier}`,
    components: [
      {
        id: 'customer_stats',
        type: 'StatsGroup',
        title: 'Thống Kê Thu Chi Khách Hàng',
        items: [
          {
            id: 'cust_total_spent',
            label: 'Tổng Chi Tiêu tích lũy',
            value: stats.totalSpent,
            type: 'currency',
            changeType: 'positive'
          },
          {
            id: 'cust_vat_paid',
            label: 'Thuế VAT Đã Đóng',
            value: stats.totalVatPaid,
            type: 'currency'
          },
          {
            id: 'cust_discount',
            label: 'Ưu Đãi Đã Giảm Giá',
            value: stats.totalDiscounts,
            type: 'currency',
            changeType: 'positive'
          },
          {
            id: 'cust_orders_count',
            label: 'Tổng Số Đơn Hàng',
            value: stats.orderCount,
            type: 'text',
            suffix: ' đơn'
          }
        ]
      },
      {
        id: 'customer_profile_card',
        type: 'DetailCard',
        title: 'Thông Tin Chi Tiết Khách Hàng',
        subtitle: 'Các trường thông tin dưới đây do Server cấu hình động',
        fields: detailFields
      },
      {
        id: 'customer_orders_table',
        type: 'DataTable',
        title: 'Lịch Sử Đơn Hàng & Tính Toán Thuế',
        subtitle: 'Các cột bảng và công thức thuế được Server xử lý',
        columns: orderTableColumns,
        emptyText: 'Khách hàng chưa có đơn hàng nào'
      }
    ],
    data: {
      customer: customer,
      orders: orders,
      stats: stats
    } as any
  };
}
