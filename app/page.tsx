'use client';

import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Layers, 
  Calculator, 
  Users, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  RefreshCw, 
  ExternalLink,
  Code2,
  Database,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'schema' | 'config' | 'customers' | 'json'>('schema');
  const [columns, setColumns] = useState<any[]>([]);
  const [detailFields, setDetailFields] = useState<any[]>([]);
  const [config, setConfig] = useState<any>({ vatRate: 0.10, vipGoldDiscount: 0.05, vipDiamondDiscount: 0.10 });
  const [jsonPreview, setJsonPreview] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Form states for adding new column
  const [newColKey, setNewColKey] = useState('');
  const [newColLabel, setNewColLabel] = useState('');
  const [newColType, setNewColType] = useState('text');
  const [newColTarget, setNewColTarget] = useState<'column' | 'field'>('column');

  // Form state for adding new customer
  const [newCustName, setNewCustName] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustCity, setNewCustCity] = useState('Hà Nội');
  const [newCustTaxCode, setNewCustTaxCode] = useState('');
  const [newCustLoyalty, setNewCustLoyalty] = useState('500');

  useEffect(() => {
    fetchSchemaData();
    fetchConfigData();
    fetchJsonPreview();
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

  const fetchJsonPreview = async () => {
    try {
      const res = await fetch('/api/sdui/customers');
      const data = await res.json();
      setJsonPreview(data);
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
        fetchJsonPreview();
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
      fetchJsonPreview();
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
    fetchJsonPreview();
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
        setMessage('Đã cập nhật công thức tính toán tài chính & thuế thành công!');
        fetchJsonPreview();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCustName,
          email: newCustEmail || 'demo@example.com',
          city: newCustCity,
          taxCode: newCustTaxCode || '0109998887',
          loyaltyPoints: Number(newCustLoyalty) || 300,
          tier: 'VIP Gold'
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`Đã thêm khách hàng "${newCustName}" thành công vào Database!`);
        setNewCustName('');
        setNewCustEmail('');
        fetchJsonPreview();
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
              href="http://localhost:3000" 
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
        {/* Banner Status */}
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
            <Users className="w-4 h-4" /> Thêm Khách Hàng / Dữ Liệu Demo
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition ${
              activeTab === 'json' 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Code2 className="w-4 h-4" /> Live SDUI JSON Inspector
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

        {/* TAB 2: BUSINESS LOGIC & TAX CONFIG */}
        {activeTab === 'config' && (
          <div className="max-w-2xl bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Cấu Hình Công Thức Thuế & Khuyến Mãi Phía Backend</h3>
              <p className="text-sm text-slate-400 mt-1">
                Thay đổi các tham số tính toán dưới đây. Phía Server sẽ tự động tính lại tổng doanh thu, thuế VAT và số tiền giảm giá trên từng đơn hàng gửi tới FE.
              </p>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Tỷ Lệ Thuế VAT Standard (ví dụ 0.10 = 10%, 0.08 = 8%)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="0.5"
                    value={config.vatRate || 0.10}
                    onChange={(e) => setConfig({ ...config, vatRate: parseFloat(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <span className="text-indigo-400 font-bold text-lg">{Math.round((config.vatRate || 0.10) * 100)}%</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Mức Giảm Giá VIP Gold (0.05 = 5%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={config.vipGoldDiscount || 0.05}
                  onChange={(e) => setConfig({ ...config, vipGoldDiscount: parseFloat(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Mức Giảm Giá VIP Diamond (0.10 = 10%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={config.vipDiamondDiscount || 0.10}
                  onChange={(e) => setConfig({ ...config, vipDiamondDiscount: parseFloat(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-lg transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
              >
                <Calculator className="w-4 h-4" /> Lưu Công Thức & Áp Dụng Toàn Hệ Thống
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: CUSTOMER MANAGEMENT */}
        {activeTab === 'customers' && (
          <div className="max-w-2xl bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Thêm Khách Hàng Mới Đi Kèm Trường Động</h3>
              <p className="text-sm text-slate-400 mt-1">
                Tạo một bản ghi mới với các trường dữ liệu tùy biến (Mã số thuế, Điểm thưởng...). Phía FE Shopdemo sẽ lập tức load bản ghi này theo đúng Schema.
              </p>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Tên khách hàng / Công ty</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Tập đoàn Công Nghệ ABC"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email liên hệ</label>
                  <input
                    type="email"
                    placeholder="contact@abc.vn"
                    value={newCustEmail}
                    onChange={(e) => setNewCustEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Tỉnh/Thành phố</label>
                  <input
                    type="text"
                    value={newCustCity}
                    onChange={(e) => setNewCustCity(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Mã số thuế (Trường động)</label>
                  <input
                    type="text"
                    placeholder="0108889991"
                    value={newCustTaxCode}
                    onChange={(e) => setNewCustTaxCode(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Điểm thưởng VIP (Trường động)</label>
                  <input
                    type="number"
                    value={newCustLoyalty}
                    onChange={(e) => setNewCustLoyalty(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-lg transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Thêm Khách Hàng Vào Database
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: JSON INSPECTOR */}
        {activeTab === 'json' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Code2 className="w-5 h-5 text-indigo-400" /> SDUI Payload Live JSON Served to FE
              </h3>
              <button
                onClick={fetchJsonPreview}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-lg border border-slate-700"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reload JSON
              </button>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 overflow-x-auto max-h-[600px] font-mono text-xs text-emerald-400 leading-relaxed shadow-inner">
              <pre>{JSON.stringify(jsonPreview, null, 2)}</pre>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
