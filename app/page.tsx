'use client';

import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Layers, 
  Calculator, 
  Users, 
  Plus, 
  Trash2, 
  Edit,
  CheckCircle2, 
  RefreshCw, 
  ExternalLink,
  ShieldCheck,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  X
} from 'lucide-react';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'schema' | 'config' | 'customers'>('schema');
  const [columns, setColumns] = useState<any[]>([]);
  const [detailFields, setDetailFields] = useState<any[]>([]);
  const [config, setConfig] = useState<any>({ 
    vatRate: 0.10, 
    vipGoldDiscount: 0.05, 
    vipDiamondDiscount: 0.10,
    freeShippingThreshold: 5000000,
    shippingFeeStandard: 30000,
    rules: []
  });
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Form states for adding new column / field in SDUI Schema
  const [newColKey, setNewColKey] = useState('');
  const [newColLabel, setNewColLabel] = useState('');
  const [newColType, setNewColType] = useState('text');
  const [newColTarget, setNewColTarget] = useState<'column' | 'field'>('column');

  // Form state for adding custom financial calculation rule
  const [showAddRuleForm, setShowAddRuleForm] = useState(false);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleType, setNewRuleType] = useState<'vat' | 'discount_tier' | 'shipping' | 'custom'>('custom');
  const [newRuleTarget, setNewRuleTarget] = useState('All');
  const [newRuleValue, setNewRuleValue] = useState('0.05');
  const [newRuleDesc, setNewRuleDesc] = useState('');

  // Customer Form state (for Create & Edit)
  const [showCustModal, setShowCustModal] = useState(false);
  const [editingCustId, setEditingCustId] = useState<string | null>(null);
  const [custForm, setCustForm] = useState<any>({
    id: '',
    name: '',
    email: '',
    phone: '',
    city: 'Hà Nội',
    tier: 'Standard',
    taxCode: '',
    loyaltyPoints: '500',
    salesRep: '',
    shippingAddress: '',
    notes: ''
  });
  // Custom extra dynamic fields for customer
  const [customFieldsList, setCustomFieldsList] = useState<Array<{ key: string; label: string; value: string }>>([]);
  const [newCustomKey, setNewCustomKey] = useState('');
  const [newCustomLabel, setNewCustomLabel] = useState('');
  const [newCustomVal, setNewCustomVal] = useState('');

  useEffect(() => {
    fetchSchemaData();
    fetchConfigData();
    fetchCustomersData();
  }, []);

  const fetchSchemaData = async () => {
    try {
      const res = await fetch('/api/admin/schema');
      const data = await res.json();
      setColumns(data.customerColumns || []);
      setDetailFields(data.customerDetailFields || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchConfigData = async () => {
    try {
      const res = await fetch('/api/admin/config');
      const data = await res.json();
      setConfig(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCustomersData = async () => {
    try {
      const res = await fetch('/api/admin/customers');
      const data = await res.json();
      if (Array.isArray(data)) {
        setCustomers(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddColOrField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColKey || !newColLabel) return;

    setLoading(true);
    try {
      const res = await fetch('/api/admin/schema', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add',
          target: newColTarget === 'column' ? 'customer_column' : 'customer_field',
          data: {
            key: newColKey.trim(),
            label: newColLabel.trim(),
            type: newColType
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`Đã thêm thành công trường/cột "${newColLabel}" vào SDUI Schema!`);
        setNewColKey('');
        setNewColLabel('');
        fetchSchemaData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (key: string, target: 'column' | 'field') => {
    setLoading(true);
    try {
      await fetch('/api/admin/schema', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'remove',
          target: target === 'column' ? 'customer_column' : 'customer_field',
          data: { key }
        })
      });
      setMessage(`Đã xóa "${key}" khỏi SDUI Schema.`);
      fetchSchemaData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAddPreset = async (presetKey: string) => {
    setLoading(true);
    let itemsToAdd: Array<{ target: string; key: string; label: string; type: string }> = [];
    if (presetKey === 'tax_info') {
      itemsToAdd = [
        { target: 'customer_column', key: 'taxCode', label: 'Mã số thuế', type: 'text' },
        { target: 'customer_field', key: 'taxCode', label: 'Mã số thuế doanh nghiệp', type: 'text' }
      ];
    } else if (presetKey === 'loyalty') {
      itemsToAdd = [
        { target: 'customer_column', key: 'loyaltyPoints', label: 'Điểm thưởng', type: 'text' },
        { target: 'customer_field', key: 'loyaltyPoints', label: 'Điểm tích lũy VIP', type: 'text' }
      ];
    } else if (presetKey === 'agent') {
      itemsToAdd = [
        { target: 'customer_column', key: 'salesRep', label: 'Sale phụ trách', type: 'text' },
        { target: 'customer_field', key: 'salesRep', label: 'Chuyên viên phụ trách', type: 'text' }
      ];
    }

    for (const item of itemsToAdd) {
      await fetch('/api/admin/schema', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', target: item.target, data: item })
      });
    }

    setMessage(`Đã thêm bộ trường mẫu thành công! FE Shopdemo sẽ lập tức hiển thị các trường mới.`);
    fetchSchemaData();
    setLoading(false);
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Đã cập nhật công thức tính toán tài chính & thuế thành công! Shopdemo đã tự động tính lại tổng số tiền.');
        fetchConfigData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Toggle rule enable/disable
  const handleToggleRule = (ruleId: string) => {
    const updatedRules = (config.rules || []).map((r: any) => {
      if (r.id === ruleId) return { ...r, enabled: !r.enabled };
      return r;
    });
    setConfig({ ...config, rules: updatedRules });
  };

  // Remove rule
  const handleRemoveRule = (ruleId: string) => {
    const updatedRules = (config.rules || []).filter((r: any) => r.id !== ruleId);
    setConfig({ ...config, rules: updatedRules });
  };

  // Add rule
  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName) return;

    const newRule = {
      id: `rule-${Date.now()}`,
      name: newRuleName,
      type: newRuleType,
      target: newRuleTarget,
      value: parseFloat(newRuleValue) || 0,
      enabled: true,
      description: newRuleDesc || 'Quy tắc tính toán tùy chỉnh'
    };

    const currentRules = config.rules || [];
    setConfig({
      ...config,
      rules: [...currentRules, newRule]
    });

    setNewRuleName('');
    setNewRuleDesc('');
    setShowAddRuleForm(false);
  };

  // Open modal for Create New Customer
  const handleOpenCreateModal = () => {
    setEditingCustId(null);
    setCustForm({
      id: `CUST-${Math.floor(Math.random() * 9000) + 1000}`,
      name: '',
      email: '',
      phone: '',
      city: 'Hà Nội',
      tier: 'Standard',
      taxCode: '',
      loyaltyPoints: '500',
      salesRep: '',
      shippingAddress: '',
      notes: ''
    });
    setCustomFieldsList([]);
    setShowCustModal(true);
  };

  // Open modal for Edit Existing Customer
  const handleOpenEditModal = (cust: any) => {
    setEditingCustId(cust.id);
    const standardKeys = ['id', 'name', 'email', 'phone', 'city', 'tier', 'taxCode', 'loyaltyPoints', 'salesRep', 'shippingAddress', 'joinedDate', 'notes'];
    
    // Extract non-standard dynamic fields
    const extra: Array<{ key: string; label: string; value: string }> = [];
    Object.keys(cust).forEach(k => {
      if (!standardKeys.includes(k) && typeof cust[k] !== 'object') {
        const schemaField = detailFields.find(f => f.key === k);
        extra.push({
          key: k,
          label: schemaField ? schemaField.label : k,
          value: String(cust[k])
        });
      }
    });

    setCustForm({
      id: cust.id,
      name: cust.name || '',
      email: cust.email || '',
      phone: cust.phone || '',
      city: cust.city || 'Hà Nội',
      tier: cust.tier || 'Standard',
      taxCode: cust.taxCode || '',
      loyaltyPoints: String(cust.loyaltyPoints ?? '0'),
      salesRep: cust.salesRep || '',
      shippingAddress: cust.shippingAddress || '',
      notes: cust.notes || ''
    });
    setCustomFieldsList(extra);
    setShowCustModal(true);
  };

  // Add custom extra field inside Customer Modal
  const handleAddCustomFieldToCust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomKey || !newCustomVal) return;

    const keyClean = newCustomKey.trim().replace(/\s+/g, '_');
    const labelClean = newCustomLabel.trim() || keyClean;

    setCustomFieldsList([
      ...customFieldsList,
      { key: keyClean, label: labelClean, value: newCustomVal.trim() }
    ]);

    // Also proactively register field to SDUI detailFields if not existing
    if (!detailFields.some(f => f.key === keyClean)) {
      fetch('/api/admin/schema', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add',
          target: 'customer_field',
          data: { key: keyClean, label: labelClean, type: 'text' }
        })
      }).then(() => fetchSchemaData());
    }

    setNewCustomKey('');
    setNewCustomLabel('');
    setNewCustomVal('');
  };

  // Remove custom extra field inside Customer Modal
  const handleRemoveCustomFieldFromCust = (key: string) => {
    setCustomFieldsList(customFieldsList.filter(f => f.key !== key));
  };

  // Submit Create or Update Customer
  const handleSaveCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custForm.name) return;

    setLoading(true);
    try {
      const extraObj: Record<string, any> = {};
      customFieldsList.forEach(f => {
        extraObj[f.key] = f.value;
      });

      const payload = {
        action: editingCustId ? 'update' : 'create',
        ...custForm,
        ...extraObj,
        loyaltyPoints: Number(custForm.loyaltyPoints) || 0
      };

      const res = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setMessage(data.message);
        setShowCustModal(false);
        fetchCustomersData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Delete Customer
  const handleDeleteCustomer = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa khách hàng "${name}" (${id}) khỏi Database?`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id })
      });
      const data = await res.json();
      if (data.success) {
        setMessage(data.message);
        fetchCustomersData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/30">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
                  Serverdemo Admin
                </h1>
                <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full font-medium border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Firebase Node: /serverdemo Active
                </span>
              </div>
              <p className="text-xs text-slate-400">Server-Driven UI Schema & Financial Logic Controller Engine</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <a 
              href="https://shopdemo-iota-three.vercel.app" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition shadow-md shadow-indigo-600/20"
            >
              Mở FE Shopdemo <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Message Banner */}
        {message && (
          <div className="mb-6 p-4 bg-indigo-950/60 border border-indigo-500/30 rounded-xl flex items-center justify-between text-indigo-200 text-sm animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-400" />
              <span>{message}</span>
            </div>
            <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex space-x-2 border-b border-slate-800 mb-8 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('schema')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition ${
              activeTab === 'schema' 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" /> Quản Lý SDUI Schema (Cột & Trường Động)
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition ${
              activeTab === 'config' 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Calculator className="w-4 h-4" /> Quy Tắc Thuế & Thu Chi Phía Server
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition ${
              activeTab === 'customers' 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" /> Quản Lý Danh Sách Khách Hàng (CRUD)
          </button>
        </div>

        {/* TAB 1: SDUI SCHEMA MANAGER */}
        {activeTab === 'schema' && (
          <div className="space-y-8">
            {/* Presets */}
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 backdrop-blur">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" /> Thử Nghiệm Nhanh Demo Đối Tác (1 Click Add)
                  </h3>
                  <p className="text-sm text-slate-400">
                    Bấm để thêm ngay các trường mới vào Database/Schema. Sau đó mở/refresh <strong className="text-indigo-300">Shopdemo</strong> để xem giao diện tự động bổ sung trường đó!
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => handleQuickAddPreset('tax_info')}
                  disabled={loading}
                  className="flex items-center justify-between p-4 bg-slate-900/80 hover:bg-slate-900 border border-slate-700 hover:border-indigo-500 rounded-xl transition text-left group"
                >
                  <div>
                    <span className="text-sm font-semibold text-indigo-300 group-hover:text-indigo-200">+ Trường "Mã Số Thuế"</span>
                    <p className="text-xs text-slate-400 mt-1">Thêm Mã số thuế vào Bảng & Trang Chi Tiết</p>
                  </div>
                  <Plus className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition" />
                </button>
                <button
                  onClick={() => handleQuickAddPreset('loyalty')}
                  disabled={loading}
                  className="flex items-center justify-between p-4 bg-slate-900/80 hover:bg-slate-900 border border-slate-700 hover:border-indigo-500 rounded-xl transition text-left group"
                >
                  <div>
                    <span className="text-sm font-semibold text-indigo-300 group-hover:text-indigo-200">+ Trường "Điểm Thưởng VIP"</span>
                    <p className="text-xs text-slate-400 mt-1">Thêm Điểm tích lũy cho Khách hàng</p>
                  </div>
                  <Plus className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition" />
                </button>
                <button
                  onClick={() => handleQuickAddPreset('agent')}
                  disabled={loading}
                  className="flex items-center justify-between p-4 bg-slate-900/80 hover:bg-slate-900 border border-slate-700 hover:border-indigo-500 rounded-xl transition text-left group"
                >
                  <div>
                    <span className="text-sm font-semibold text-indigo-300 group-hover:text-indigo-200">+ Trường "Sale Phụ Trách"</span>
                    <p className="text-xs text-slate-400 mt-1">Hiển thị nhân sự tư vấn chăm sóc</p>
                  </div>
                  <Plus className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition" />
                </button>
              </div>
            </div>

            {/* Custom Field / Column Form */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Thêm Cột / Trường Thủ Công</h3>
                <form onSubmit={handleAddColOrField} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Loại thành phần áp dụng</label>
                    <select
                      value={newColTarget}
                      onChange={(e: any) => setNewColTarget(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="column">Cột Bảng Khách Hàng (DataTable Column)</option>
                      <option value="field">Trường Thẻ Chi Tiết (DetailCard Field)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Key trong Database (Variable Name)</label>
                    <input
                      type="text"
                      placeholder="ví dụ: taxCode, loyaltyPoints, region"
                      value={newColKey}
                      onChange={(e) => setNewColKey(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Nhãn Hiển Thị (UI Label)</label>
                    <input
                      type="text"
                      placeholder="ví dụ: Mã Số Thuế Doanh Nghiệp"
                      value={newColLabel}
                      onChange={(e) => setNewColLabel(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Định dạng hiển thị (Field Type)</label>
                    <select
                      value={newColType}
                      onChange={(e) => setNewColType(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="text">Văn bản (Text)</option>
                      <option value="currency">Số tiền (Currency VNĐ)</option>
                      <option value="badge">Huy hiệu (Badge)</option>
                      <option value="date">Ngày tháng (Date)</option>
                      <option value="email">Email</option>
                      <option value="phone">Số điện thoại</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-lg transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Cập Nhật Vào SDUI Schema Phía Server
                  </button>
                </form>
              </div>

              {/* Current Schema Lists */}
              <div className="lg:col-span-2 space-y-6">
                {/* Table Columns List */}
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
                  <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center justify-between">
                    <span>Cột Bảng Khách Hàng Hiện Tại ({columns.length} cột)</span>
                    <button onClick={fetchSchemaData} className="text-slate-400 hover:text-white"><RefreshCw className="w-4 h-4" /></button>
                  </h4>
                  <div className="divide-y divide-slate-700/60">
                    {columns.map((col) => (
                      <div key={col.key} className="py-3 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-white text-sm">{col.label}</span>
                          <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
                            <span className="bg-slate-900 px-2 py-0.5 rounded font-mono text-indigo-300">{col.key}</span>
                            <span>• type: {col.type}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(col.key, 'column')}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition"
                          title="Xóa cột khỏi SDUI"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer Detail Fields List */}
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
                  <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">
                    Trường Chi Tiết Khách Hàng (DetailCard Fields - {detailFields.length} trường)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {detailFields.map((field) => (
                      <div key={field.key} className="p-3 bg-slate-900/60 border border-slate-700/60 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="text-xs text-slate-400">{field.label}</p>
                          <span className="font-mono text-xs text-indigo-300">{field.key} ({field.type})</span>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(field.key, 'field')}
                          className="p-1 text-slate-400 hover:text-red-400 rounded transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BUSINESS LOGIC & CUSTOM FORMULA RULES */}
        {activeTab === 'config' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form parameters */}
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-indigo-400" /> Cấu Hình Tham Số Tính Toán
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Khi lưu, Server sẽ tính lại ngay tổng doanh thu, thuế VAT và số tiền giảm giá trên toàn bộ đơn hàng của FE.
                  </p>
                </div>

                <form onSubmit={handleSaveConfig} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Tỷ Lệ Thuế VAT Standard (ví dụ 0.10 = 10%)</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        value={config.vatRate !== undefined ? config.vatRate : 0.10}
                        onChange={(e) => setConfig({ ...config, vatRate: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                      />
                      <span className="text-indigo-400 font-bold text-lg min-w-[50px] text-right">
                        {Math.round((config.vatRate || 0) * 100)}%
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Chiết Khấu VIP Gold (ví dụ 0.05 = 5%)</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        value={config.vipGoldDiscount !== undefined ? config.vipGoldDiscount : 0.05}
                        onChange={(e) => setConfig({ ...config, vipGoldDiscount: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                      />
                      <span className="text-amber-400 font-bold text-lg min-w-[50px] text-right">
                        {Math.round((config.vipGoldDiscount || 0) * 100)}%
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Chiết Khấu VIP Diamond (ví dụ 0.10 = 10%)</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        value={config.vipDiamondDiscount !== undefined ? config.vipDiamondDiscount : 0.10}
                        onChange={(e) => setConfig({ ...config, vipDiamondDiscount: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                      />
                      <span className="text-purple-400 font-bold text-lg min-w-[50px] text-right">
                        {Math.round((config.vipDiamondDiscount || 0) * 100)}%
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-lg transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
                  >
                    <Calculator className="w-4 h-4" /> Lưu Công Thức & Tự Động Tính Tức Thì
                  </button>
                </form>
              </div>

              {/* Dynamic Calculation Rules Manager */}
              <div className="lg:col-span-2 bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Danh Sách Quy Tắc Tính Toán Tùy Chỉnh (Rules Engine)</h3>
                    <p className="text-xs text-slate-400 mt-1">Bật/tắt hoặc thêm bớt các quy tắc tính toán thu chi. Phía Server sẽ tự động áp dụng công thức mới.</p>
                  </div>
                  <button
                    onClick={() => setShowAddRuleForm(!showAddRuleForm)}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-2 rounded-lg transition"
                  >
                    <Plus className="w-4 h-4" /> Thêm Quy Tắc Mới
                  </button>
                </div>

                {/* Add Rule Form */}
                {showAddRuleForm && (
                  <form onSubmit={handleAddRule} className="p-4 bg-slate-950 border border-indigo-500/40 rounded-xl space-y-4 animate-fadeIn">
                    <h4 className="text-sm font-semibold text-indigo-300">Tạo Quy Tắc Tính Toán Mới</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-300 mb-1">Tên Quy Tắc</label>
                        <input
                          type="text"
                          placeholder="Ví dụ: Giảm giá đặc biệt Khách VIP"
                          value={newRuleName}
                          onChange={(e) => setNewRuleName(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-300 mb-1">Loại Quy Tắc</label>
                        <select
                          value={newRuleType}
                          onChange={(e: any) => setNewRuleType(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                        >
                          <option value="vat">Thuế VAT (VAT Tax)</option>
                          <option value="discount_tier">Chiết khấu Hạng (Tier Discount)</option>
                          <option value="shipping">Vận chuyển (Shipping Fee)</option>
                          <option value="custom">Quy tắc tùy chỉnh (Custom Rule)</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-300 mb-1">Đối tượng áp dụng</label>
                        <input
                          type="text"
                          placeholder="Ví dụ: VIP Diamond hoặc Tất cả"
                          value={newRuleTarget}
                          onChange={(e) => setNewRuleTarget(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-300 mb-1">Giá trị áp dụng (Tỷ lệ % hoặc Số tiền)</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.05"
                          value={newRuleValue}
                          onChange={(e) => setNewRuleValue(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">Mô tả công thức</label>
                      <input
                        type="text"
                        placeholder="Mô tả ngắn gọn quy tắc này áp dụng như thế nào"
                        value={newRuleDesc}
                        onChange={(e) => setNewRuleDesc(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddRuleForm(false)}
                        className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-lg"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg"
                      >
                        Thêm Vào Danh Sách Quy Tắc
                      </button>
                    </div>
                  </form>
                )}

                {/* Rules List */}
                <div className="space-y-3">
                  {(config.rules || []).length === 0 ? (
                    <p className="text-xs text-slate-400 italic">Chưa có quy tắc tính toán tùy chỉnh nào.</p>
                  ) : (
                    (config.rules || []).map((rule: any) => (
                      <div 
                        key={rule.id} 
                        className={`p-4 rounded-xl border transition flex items-center justify-between ${
                          rule.enabled 
                            ? 'bg-slate-900/80 border-slate-700' 
                            : 'bg-slate-950/40 border-slate-800 opacity-60'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-white">{rule.name}</span>
                            <span className="bg-slate-800 px-2 py-0.5 rounded text-[11px] font-mono text-indigo-300">
                              {rule.type} {rule.target ? `(${rule.target})` : ''}
                            </span>
                            <span className="font-mono text-xs text-emerald-400 font-bold">
                              Val: {rule.value}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">{rule.description || 'Không có mô tả'}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleToggleRule(rule.id)}
                            className="flex items-center gap-1 text-xs font-semibold transition"
                            title={rule.enabled ? "Tắt quy tắc" : "Bật quy tắc"}
                          >
                            {rule.enabled ? (
                              <span className="flex items-center gap-1 text-emerald-400"><ToggleRight className="w-6 h-6" /> Đang Bật</span>
                            ) : (
                              <span className="flex items-center gap-1 text-slate-500"><ToggleLeft className="w-6 h-6" /> Đã Tắt</span>
                            )}
                          </button>
                          <button
                            onClick={() => handleRemoveRule(rule.id)}
                            className="p-1.5 text-slate-400 hover:text-red-400 rounded transition"
                            title="Xóa hàng quy tắc này"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CUSTOMER CRUD MANAGEMENT */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Quản Lý Danh Sách Khách Hàng (Firebase Realtime CRUD)</h3>
                <p className="text-sm text-slate-400 mt-1">
                  Mọi thao tác Thêm, Sửa, Xóa thông tin khách hàng dưới đây sẽ trực tiếp ghi vào Firebase node <strong className="text-indigo-300">/serverdemo</strong> và tự động cập nhật bên Shopdemo!
                </p>
              </div>
              <button
                onClick={handleOpenCreateModal}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition text-sm"
              >
                <Plus className="w-4 h-4" /> Thêm Khách Hàng Mới
              </button>
            </div>

            {/* Customers Table */}
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-900/80 text-slate-400 font-semibold text-xs uppercase tracking-wider border-b border-slate-700/80">
                      <th className="px-5 py-3.5">Mã KH</th>
                      <th className="px-5 py-3.5">Tên Khách Hàng</th>
                      <th className="px-5 py-3.5">Email</th>
                      <th className="px-5 py-3.5">Số Điện Thoại</th>
                      <th className="px-5 py-3.5">Tỉnh / Thành</th>
                      <th className="px-5 py-3.5">Hạng</th>
                      <th className="px-5 py-3.5">Mã Số Thuế</th>
                      <th className="px-5 py-3.5">Điểm VIP</th>
                      <th className="px-5 py-3.5 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60 text-slate-200">
                    {customers.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-10 text-center text-slate-400">
                          Chưa có dữ liệu khách hàng
                        </td>
                      </tr>
                    ) : (
                      customers.map((cust) => (
                        <tr key={cust.id} className="hover:bg-slate-800/60 transition">
                          <td className="px-5 py-4 font-mono text-indigo-300 font-semibold">{cust.id}</td>
                          <td className="px-5 py-4 font-semibold text-white">{cust.name}</td>
                          <td className="px-5 py-4 text-slate-300">{cust.email || '-'}</td>
                          <td className="px-5 py-4 font-mono text-slate-300">{cust.phone || '-'}</td>
                          <td className="px-5 py-4">{cust.city || '-'}</td>
                          <td className="px-5 py-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              cust.tier === 'VIP Diamond' 
                                ? 'bg-purple-900/60 text-purple-300 border border-purple-700' 
                                : cust.tier === 'VIP Gold'
                                ? 'bg-amber-900/60 text-amber-300 border border-amber-700'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}>
                              {cust.tier}
                            </span>
                          </td>
                          <td className="px-5 py-4 font-mono text-slate-300">{cust.taxCode || '-'}</td>
                          <td className="px-5 py-4 font-semibold text-amber-400">{cust.loyaltyPoints ?? 0}</td>
                          <td className="px-5 py-4 text-right space-x-2 whitespace-nowrap">
                            <button
                              onClick={() => handleOpenEditModal(cust)}
                              className="inline-flex items-center gap-1 bg-slate-700 hover:bg-slate-600 text-white text-xs px-3 py-1.5 rounded-lg border border-slate-600 transition"
                            >
                              <Edit className="w-3.5 h-3.5 text-indigo-300" /> Sửa
                            </button>
                            <button
                              onClick={() => handleDeleteCustomer(cust.id, cust.name)}
                              className="inline-flex items-center gap-1 bg-rose-950/80 hover:bg-rose-900 text-rose-300 text-xs px-3 py-1.5 rounded-lg border border-rose-800/80 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Xóa
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* CREATE / EDIT CUSTOMER MODAL WITH DYNAMIC CUSTOM FIELDS */}
            {showCustModal && (
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn overflow-y-auto">
                <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-indigo-400" />
                      {editingCustId ? `Chỉnh Sửa Khách Hàng (${editingCustId})` : 'Thêm Khách Hàng Mới'}
                    </h3>
                    <button onClick={() => setShowCustModal(false)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveCustomerSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Tên khách hàng / Tên Công ty</label>
                      <input
                        type="text"
                        placeholder="Ví dụ: Nguyễn Văn An hoặc Công Ty ABC"
                        value={custForm.name}
                        onChange={(e) => setCustForm({ ...custForm, name: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Email liên hệ</label>
                        <input
                          type="email"
                          placeholder="an.nguyen@example.com"
                          value={custForm.email}
                          onChange={(e) => setCustForm({ ...custForm, email: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Số điện thoại</label>
                        <input
                          type="text"
                          placeholder="0901234567"
                          value={custForm.phone}
                          onChange={(e) => setCustForm({ ...custForm, phone: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Tỉnh / Thành phố</label>
                        <input
                          type="text"
                          placeholder="Hà Nội"
                          value={custForm.city}
                          onChange={(e) => setCustForm({ ...custForm, city: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Hạng Hội Viên</label>
                        <select
                          value={custForm.tier}
                          onChange={(e: any) => setCustForm({ ...custForm, tier: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                        >
                          <option value="Standard">Standard (Chuẩn)</option>
                          <option value="VIP Gold">VIP Gold</option>
                          <option value="VIP Diamond">VIP Diamond</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Mã Số Thuế (Trường động)</label>
                        <input
                          type="text"
                          placeholder="0101234567"
                          value={custForm.taxCode}
                          onChange={(e) => setCustForm({ ...custForm, taxCode: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Điểm Tích Lũy VIP (Trường động)</label>
                        <input
                          type="number"
                          value={custForm.loyaltyPoints}
                          onChange={(e) => setCustForm({ ...custForm, loyaltyPoints: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Sale / Chuyên Viên Phụ Trách</label>
                        <input
                          type="text"
                          placeholder="Phạm Thanh Hương"
                          value={custForm.salesRep}
                          onChange={(e) => setCustForm({ ...custForm, salesRep: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Địa Chỉ Giao Hàng Mặc Định</label>
                        <input
                          type="text"
                          placeholder="123 Đường Lê Duẩn, Hoàn Kiếm, Hà Nội"
                          value={custForm.shippingAddress}
                          onChange={(e) => setCustForm({ ...custForm, shippingAddress: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    {/* DYNAMIC CUSTOM EXTRA FIELDS FOR THIS CUSTOMER */}
                    <div className="pt-4 border-t border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-amber-400" /> Các Trường Tùy Chỉnh Động Của Khách Hàng Này ({customFieldsList.length})
                        </h4>
                      </div>

                      {/* Custom fields list */}
                      {customFieldsList.length > 0 && (
                        <div className="space-y-2">
                          {customFieldsList.map((f) => (
                            <div key={f.key} className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
                              <div>
                                <span className="font-semibold text-white">{f.label}</span>
                                <span className="font-mono text-indigo-300 ml-2">[{f.key}]</span>: <span className="text-emerald-300 font-semibold">{f.value}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveCustomFieldFromCust(f.key)}
                                className="text-slate-400 hover:text-red-400 p-1"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Form to add a new custom field on the fly */}
                      <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                        <span className="text-[11px] font-semibold text-slate-400">+ Thêm 1 trường tùy chỉnh mới cho Khách hàng:</span>
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="text"
                            placeholder="Tên biến (e.g. bietDanh, stk)"
                            value={newCustomKey}
                            onChange={(e) => setNewCustomKey(e.target.value)}
                            className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                          />
                          <input
                            type="text"
                            placeholder="Nhãn UI (e.g. Biệt danh VIP)"
                            value={newCustomLabel}
                            onChange={(e) => setNewCustomLabel(e.target.value)}
                            className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                          />
                          <input
                            type="text"
                            placeholder="Giá trị nhập"
                            value={newCustomVal}
                            onChange={(e) => setNewCustomVal(e.target.value)}
                            className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleAddCustomFieldToCust}
                          className="w-full bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold py-1.5 rounded transition border border-slate-700 flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Thêm Trường Tùy Chỉnh Này
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => setShowCustModal(false)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-indigo-600/30 transition flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" /> {editingCustId ? 'Lưu Cập Nhật' : 'Thêm Vào Database'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
