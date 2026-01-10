
import React, { useMemo, useState } from 'react';
import { 
  LineChart, Line, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, ComposedChart, Area
} from 'recharts';
import { TrendingUp, DollarSign, Package, ArrowUpRight, ArrowDownRight, Mail, ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import { Item, Transaction, UserSettings } from '../types';

interface DashboardProps {
  items: Item[];
  transactions: Transaction[];
  settings: UserSettings;
}

type Timeframe = 'Weekly' | 'Monthly' | 'Yearly';

export const Dashboard: React.FC<DashboardProps> = ({ items, transactions, settings }) => {
  const [salesTimeframe, setSalesTimeframe] = useState<Timeframe>('Monthly');
  const [purchaseTimeframe, setPurchaseTimeframe] = useState<Timeframe>('Monthly');
  const [earningsTimeframe, setEarningsTimeframe] = useState<Timeframe>('Monthly');
  const [topProductSort, setTopProductSort] = useState<'Quantity' | 'Revenue'>('Revenue');
  const [turnoverRange, setTurnoverRange] = useState<3 | 6 | 12>(12);

  // Formatting helpers
  const fmt = (val: number) => {
    return new Intl.NumberFormat(settings.locale, {
      style: 'currency',
      currency: settings.currency,
      maximumFractionDigits: 0
    }).format(val);
  };

  const fmtCompact = (val: number) => {
    if (Math.abs(val) >= 1000) return `£${(val / 1000).toFixed(1)}k`;
    return `£${val}`;
  };

  // 1. Metric Calculations
  const metrics = useMemo(() => {
    const totalSales = transactions.filter(t => t.type === 'sale').reduce((acc, t) => acc + (t.quantity * t.unitPrice), 0);
    const totalPurchases = transactions.filter(t => t.type === 'purchase').reduce((acc, t) => acc + (t.quantity * t.unitPrice), 0);
    const totalEarnings = totalSales - totalPurchases;
    const profitMargin = totalSales > 0 ? (totalEarnings / totalSales) * 100 : 0;
    const totalOrders = transactions.filter(t => t.type === 'sale').length;
    const stockValue = items.reduce((acc, item) => acc + (item.stock * item.unitCost), 0);

    return { totalSales, totalEarnings, totalOrders, stockValue, profitMargin };
  }, [items, transactions]);

  // 2. Chart Data Processing
  const getGroupedData = (typeFilter: ('sale' | 'purchase')[], timeframe: Timeframe) => {
    const dataMap: Record<string, { sales: number; purchases: number; date: Date }> = {};
    
    transactions.forEach(t => {
      if (t.type === 'opening') return;
      if (!typeFilter.includes(t.type as any)) return;
      const date = new Date(t.date);
      let key = '';

      if (timeframe === 'Yearly') {
        key = date.getFullYear().toString();
      } else if (timeframe === 'Monthly') {
        key = date.toLocaleDateString(settings.locale, { month: 'short', year: '2-digit' });
      } else {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
        const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
        key = `W${weekNum} '${date.getFullYear().toString().slice(2)}`;
      }

      if (!dataMap[key]) dataMap[key] = { sales: 0, purchases: 0, date: new Date(date.getFullYear(), date.getMonth(), 1) };
      const amount = t.quantity * t.unitPrice;
      if (t.type === 'sale') dataMap[key].sales += amount;
      if (t.type === 'purchase') dataMap[key].purchases += amount;
    });

    return Object.entries(dataMap)
      .map(([name, val]) => ({ name, ...val }))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(-12);
  };

  const salesLineData = useMemo(() => getGroupedData(['sale'], salesTimeframe), [transactions, salesTimeframe]);
  const purchaseBarData = useMemo(() => getGroupedData(['sale', 'purchase'], purchaseTimeframe), [transactions, purchaseTimeframe]);
  
  const earningsData = useMemo(() => {
    const base = getGroupedData(['sale', 'purchase'], earningsTimeframe);
    return base.map(d => {
      const revenue = d.sales;
      const cogs = d.purchases;
      const grossProfit = revenue - cogs;
      const margin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
      return { ...d, revenue, cogs, grossProfit, margin };
    });
  }, [transactions, earningsTimeframe]);

  const topProductsData = useMemo(() => {
    const productStats = items.map(item => {
      const itemSales = transactions.filter(t => t.itemId === item.id && t.type === 'sale');
      const qty = itemSales.reduce((acc, t) => acc + t.quantity, 0);
      const rev = itemSales.reduce((acc, t) => acc + (t.quantity * t.unitPrice), 0);
      return { name: item.name, value: topProductSort === 'Quantity' ? qty : rev };
    }).filter(p => p.value > 0).sort((a, b) => b.value - a.value).slice(0, 8);
    return productStats;
  }, [items, transactions, topProductSort]);

  const turnoverData = useMemo(() => {
    return items.map(item => {
      const itemSales = transactions.filter(t => t.itemId === item.id && t.type === 'sale');
      const totalSold = itemSales.reduce((acc, t) => acc + t.quantity, 0);
      return { name: item.name, rate: Number((totalSold / (turnoverRange / 12)).toFixed(2)) };
    }).sort((a, b) => b.rate - a.rate).slice(0, 6);
  }, [items, transactions, turnoverRange]);

  const COLORS = ['#8E54E9', '#FFA500', '#4ADE80', '#FF4D4D', '#00C49F', '#FFBB28', '#FF8042', '#0088FE'];

  const getStockStatus = (stock: number, alert: number = 5) => {
    if (stock <= 0) return { label: 'Critical', color: 'bg-red-500', dot: 'bg-red-500', badge: 'bg-red-100 text-red-600' };
    if (stock <= alert) return { label: 'Critical', color: 'bg-red-500', dot: 'bg-red-500', badge: 'bg-red-100 text-red-600' };
    if (stock <= alert * 2) return { label: 'Low Stock', color: 'bg-orange-400', dot: 'bg-yellow-500', badge: 'bg-yellow-100 text-yellow-600' };
    if (stock <= alert * 5) return { label: 'Medium', color: 'bg-blue-500', dot: 'bg-blue-500', badge: 'bg-blue-100 text-blue-600' };
    return { label: 'Good', color: 'bg-green-500', dot: 'bg-green-500', badge: 'bg-green-100 text-green-600' };
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      
      {/* 1. Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Total Sale" 
          value={fmt(metrics.totalSales)} 
          subValue="+13.6% Performance"
          icon={<ArrowUpRight size={16} className="text-green-400" />}
          color="text-gray-800"
        />
        <MetricCard 
          title="Total Earnings" 
          value={fmt(metrics.totalEarnings)} 
          subValue={`${metrics.profitMargin.toFixed(1)}% Margin`}
          icon={<TrendingUp size={16} className="text-[#8E54E9]" />}
          color="text-gray-800"
        />
        <MetricCard 
          title="Total Order" 
          value={metrics.totalOrders.toString()} 
          subValue="Consolidated Orders"
          icon={<ShoppingCart size={16} className="text-orange-400" />}
          color="text-gray-800"
        />
        <MetricCard 
          title="Total Stock Value" 
          value={fmt(metrics.stockValue)} 
          subValue={`${items.length} Product Lines`}
          icon={<Package size={16} className="text-blue-400" />}
          color="text-gray-800"
        />
      </div>

      {/* 2. Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Total Sales Line Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col transition-all hover:shadow-md">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-800">Total Sales</h3>
              <p className="text-2xl font-black text-gray-900">{fmt(metrics.totalSales)}</p>
              <p className="text-[10px] text-green-500 font-bold">Rolling Performance History</p>
            </div>
            <TimeframeSwitcher current={salesTimeframe} onChange={setSalesTimeframe} />
          </div>
          <div className="flex justify-between items-center mb-6">
             <button className="text-[10px] font-bold text-gray-400 flex items-center bg-gray-50 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors">
                <ChevronLeft size={10} className="mr-1" /> Previous
             </button>
             <span className="text-[10px] font-bold text-gray-400">Range: Last 12 {salesTimeframe === 'Monthly' ? 'Months' : salesTimeframe === 'Weekly' ? 'Weeks' : 'Years'}</span>
             <button className="text-[10px] font-bold text-gray-400 flex items-center bg-gray-50 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors">
                Next <ChevronRight size={10} className="ml-1" />
             </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesLineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis fontSize={9} tickLine={false} axisLine={false} tickFormatter={fmtCompact} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(val: any) => [fmt(val), 'Sales']}
                />
                <Line type="monotone" dataKey="sales" stroke="#8E54E9" strokeWidth={3} dot={{ r: 4, fill: '#8E54E9', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales & Purchases Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col transition-all hover:shadow-md">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-800">Sales & Purchases</h3>
              <div className="flex gap-4 mt-1">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-orange-400"></div><span className="text-[10px] text-gray-500 font-bold">Purchases</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-[#8E54E9]"></div><span className="text-[10px] text-gray-500 font-bold">Sales</span></div>
              </div>
            </div>
            <TimeframeSwitcher current={purchaseTimeframe} onChange={setPurchaseTimeframe} />
          </div>
          <div className="flex justify-between items-center mb-6">
             <button className="text-[10px] font-bold text-gray-400 flex items-center bg-gray-50 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors"><ChevronLeft size={10} className="mr-1" /> Previous</button>
             <span className="text-[10px] font-bold text-gray-400">Consolidated Flow View</span>
             <button className="text-[10px] font-bold text-gray-400 flex items-center bg-gray-50 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors">Next <ChevronRight size={10} className="ml-1" /></button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={purchaseBarData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis fontSize={9} tickLine={false} axisLine={false} tickFormatter={fmtCompact} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="purchases" fill="#FFA500" radius={[4, 4, 0, 0]} barSize={10} />
                <Bar dataKey="sales" fill="#8E54E9" radius={[4, 4, 0, 0]} barSize={10} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Sold Products Pie Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col transition-all hover:shadow-md">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-sm font-bold text-gray-800">Top Sold Products</h3>
              <p className="text-xl font-black text-gray-900">{topProductsData.length} Products</p>
              <p className="text-[10px] text-[#8E54E9] font-bold">Distribution Analysis</p>
            </div>
            <div className="flex bg-gray-100 p-1 rounded-lg">
                <button 
                  onClick={() => setTopProductSort('Quantity')}
                  className={`px-3 py-1 text-[9px] font-bold rounded-md transition-all ${topProductSort === 'Quantity' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'}`}
                >By Quantity</button>
                <button 
                  onClick={() => setTopProductSort('Revenue')}
                  className={`px-3 py-1 text-[9px] font-bold rounded-md transition-all ${topProductSort === 'Revenue' ? 'bg-[#8E54E9] text-white shadow-sm' : 'text-gray-400'}`}
                >By Revenue</button>
            </div>
          </div>
          <div className="flex justify-between items-center mb-4">
             <button className="text-[10px] font-bold text-gray-400 flex items-center bg-gray-50 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors"><ChevronLeft size={10} className="mr-1" /> Previous</button>
             <span className="text-[10px] font-bold text-gray-400">Total by {topProductSort}</span>
             <button className="text-[10px] font-bold text-gray-400 flex items-center bg-gray-50 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors">Next <ChevronRight size={10} className="ml-1" /></button>
          </div>
          <div className="flex items-center h-56">
            <ResponsiveContainer width="55%" height="100%">
              <PieChart>
                <Pie
                  data={topProductsData}
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {topProductsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-[45%] space-y-2 overflow-y-auto max-h-full no-scrollbar px-2">
               {topProductsData.map((entry, index) => (
                 <div key={entry.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                    <span className="text-[9px] font-bold text-gray-600 truncate">{entry.name}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Earnings Analysis Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col transition-all hover:shadow-md">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-800">Earnings Analysis</h3>
              <p className="text-2xl font-black text-gray-900">{fmt(metrics.totalEarnings)}</p>
              <p className="text-[10px] text-green-500 font-bold">Overall Net Profit Margin: {metrics.profitMargin.toFixed(1)}%</p>
            </div>
            <TimeframeSwitcher current={earningsTimeframe} onChange={setEarningsTimeframe} />
          </div>
          <div className="flex justify-between items-center mb-4">
             <button className="text-[10px] font-bold text-gray-400 flex items-center bg-gray-50 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors"><ChevronLeft size={10} className="mr-1" /> Previous</button>
             <span className="text-[10px] font-bold text-gray-400">Financial Dynamics</span>
             <button className="text-[10px] font-bold text-gray-400 flex items-center bg-gray-50 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors">Next <ChevronRight size={10} className="ml-1" /></button>
          </div>
          <div className="flex flex-wrap gap-4 mb-4">
             <LegendItem color="#4ADE80" label="Revenue" />
             <LegendItem color="#FF4D4D" label="COGS" />
             <LegendItem color="#8E54E9" label="Gross Profit" />
             <LegendItem color="#FFA500" label="Margin %" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={earningsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" fontSize={9} tickLine={false} axisLine={false} tickFormatter={fmtCompact} />
                <YAxis yAxisId="right" orientation="right" fontSize={9} tickLine={false} axisLine={false} tickFormatter={v => `${Math.round(v)}%`} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar yAxisId="left" dataKey="revenue" fill="#4ADE80" barSize={12} radius={[3,3,0,0]} />
                <Bar yAxisId="left" dataKey="cogs" fill="#FF4D4D" barSize={12} radius={[3,3,0,0]} />
                <Line yAxisId="left" type="monotone" dataKey="grossProfit" stroke="#8E54E9" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="margin" stroke="#FFA500" strokeWidth={2} dot={{ r: 3, fill: '#FFA500' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inventory Turnover Rate Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col transition-all hover:shadow-md">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-800">Inventory Turnover Rate</h3>
              <p className="text-xl font-black text-gray-900">{items.length} Products</p>
              <p className="text-[10px] text-blue-500 font-bold">Sales Velocity (Average Units Sold/Month)</p>
            </div>
            <div className="flex bg-gray-100 p-1 rounded-lg">
                {[3, 6, 12].map(m => (
                  <button 
                    key={m}
                    onClick={() => setTurnoverRange(m as any)}
                    className={`px-2 py-1 text-[9px] font-bold rounded-md transition-all ${turnoverRange === m ? 'bg-[#8E54E9] text-white shadow-sm' : 'text-gray-400'}`}
                  >Last {m} Months</button>
                ))}
            </div>
          </div>
          <div className="flex justify-between items-center mb-6">
             <button className="text-[10px] font-bold text-gray-400 flex items-center bg-gray-50 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors"><ChevronLeft size={10} className="mr-1" /> Previous</button>
             <span className="text-[10px] font-bold text-gray-400">Velocity: Last {turnoverRange} Months</span>
             <button className="text-[10px] font-bold text-gray-400 flex items-center bg-gray-50 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors">Next <ChevronRight size={10} className="ml-1" /></button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={turnoverData} layout="vertical" margin={{ left: 10, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" fontSize={9} tickLine={false} axisLine={false} width={80} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="rate" fill="#FF8042" radius={[0, 4, 4, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock Alert Table */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden transition-all hover:shadow-md">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-800">Stock Alert</h3>
            <p className="text-xl font-black text-gray-900">{items.filter(i => i.stock <= (i.stockAlertLevel || 5)).length} Products</p>
            <p className="text-[10px] text-green-500 font-bold">Real-time Inventory Status</p>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] text-gray-400 font-bold uppercase sticky top-0 bg-white">
                <tr>
                  <th className="pb-3 px-2">Products</th>
                  <th className="pb-3 px-2">SKU</th>
                  <th className="pb-3 px-2 text-center">Stock</th>
                  <th className="pb-3 px-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.sort((a,b) => a.stock - b.stock).map((item) => {
                  const status = getStockStatus(item.stock, item.stockAlertLevel);
                  return (
                    <tr key={item.id} className="group hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full shrink-0 ${status.dot}`}></div>
                          <span className="font-bold text-gray-700 whitespace-nowrap">{item.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-gray-400 font-bold uppercase">{item.sku}</td>
                      <td className="py-3 px-2 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${status.badge}`}>
                          {item.stock} / {item.stockAlertLevel || 5}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <span className={`px-2.5 py-0.5 rounded-lg text-[9px] uppercase font-black text-white ${status.color} shadow-sm`}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f9fafb; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
      `}</style>
    </div>
  );
};

const MetricCard: React.FC<{
  title: string;
  value: string;
  subValue: string;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, subValue, icon, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-lg transition-all border-b-4 border-b-transparent hover:border-b-[#8E54E9]">
    <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</span>
            <span className={`text-2xl font-black tracking-tight ${color}`}>{value}</span>
        </div>
        <div className="p-2.5 bg-gray-50 rounded-xl group-hover:bg-white transition-colors">
            {icon}
        </div>
    </div>
    <span className="text-[10px] text-gray-400 font-bold">
        <span className="text-green-500 mr-1">●</span> {subValue}
    </span>
  </div>
);

const TimeframeSwitcher: React.FC<{ current: Timeframe, onChange: (t: Timeframe) => void }> = ({ current, onChange }) => (
  <div className="flex bg-gray-100 p-1 rounded-lg shadow-inner">
    {['Weekly', 'Monthly', 'Yearly'].map((t) => (
      <button
        key={t}
        onClick={() => onChange(t as Timeframe)}
        className={`px-3 py-1 rounded-md text-[9px] font-bold transition-all active:scale-95 ${
          current === t 
          ? 'bg-[#8E54E9] text-white shadow-sm' 
          : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        {t}
      </button>
    ))}
  </div>
);

const LegendItem: React.FC<{ color: string, label: string }> = ({ color, label }) => (
  <div className="flex items-center gap-1.5 shrink-0">
    <div className="w-2 h-2 rounded-sm" style={{backgroundColor: color}}></div>
    <span className="text-[9px] font-bold text-gray-500 whitespace-nowrap">{label}</span>
  </div>
);
