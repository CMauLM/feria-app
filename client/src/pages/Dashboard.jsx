import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Users from './Users';
import Products from './Products';
import Customers from './Customers';

export default function Dashboard() {
  const { user } = useAuth();
  const [view, setView] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [filters, setFilters] = useState({
    stand: '',
    paymentType: '',
    requiresInvoice: '',
    customer: '',
    sortBy: 'createdAt',
    order: 'desc'
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.stand) params.stand = filters.stand;
      if (filters.paymentType) params.paymentType = filters.paymentType;
      if (filters.requiresInvoice !== '') params.requiresInvoice = filters.requiresInvoice;
      if (filters.customer) params.customer = filters.customer;
      if (filters.sortBy) params.sortBy = filters.sortBy;
      if (filters.order) params.order = filters.order;

      const { data } = await api.get('/orders', { params });
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [filters]);

  const handleExportAll = async () => {
    try {
      const params = {};
      if (filters.stand) params.stand = filters.stand;
      if (filters.paymentType) params.paymentType = filters.paymentType;
      if (filters.requiresInvoice !== '') params.requiresInvoice = filters.requiresInvoice;

      const response = await api.get('/export/orders', {
        params,
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'ordenes_feria.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCustomer = async (customerId, customerCode, customerName) => {
    try {
      const response = await api.get(`/export/customer/${customerId}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${customerCode}_${customerName}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSort = (field) => {
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      order: prev.sortBy === field && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  const SortIcon = ({ field }) => {
    if (filters.sortBy !== field) return <span style={{ color: '#ccc' }}> ↕</span>;
    return <span style={{ color: '#5a8a3c' }}>{filters.order === 'asc' ? ' ↑' : ' ↓'}</span>;
  };

  const groupedByCustomer = orders.reduce((acc, order) => {
    const key = order.customer?._id || order.customer?.name || 'Sin cliente';
    if (!acc[key]) {
      acc[key] = {
        customerId: order.customer?._id,
        customerCode: order.customer?.customerCode,
        customerName: order.customer?.name || 'Sin nombre',
        paymentType: order.customer?.paymentType,
        orders: []
      };
    }
    acc[key].orders.push(order);
    return acc;
  }, {});

  const totalGeneral = orders.reduce((sum, o) => sum + o.total, 0);
  const isGrouped = filters.customer !== '';

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f5f3' }}>
      <Navbar title="Panel Administrador" />

      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex gap-1 py-2">
          {[
            { key: 'orders', label: 'Órdenes' },
            { key: 'customers', label: 'Clientes' },
            { key: 'products', label: 'Productos' },
            { key: 'users', label: 'Usuarios' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className="text-sm px-4 py-2 rounded-lg font-medium transition"
              style={{
                backgroundColor: view === key ? '#5a8a3c' : 'transparent',
                color: view === key ? '#fff' : '#6b6b6b'
              }}
              onMouseEnter={e => { if (view !== key) e.target.style.backgroundColor = '#f0f0f0' }}
              onMouseLeave={e => { if (view !== key) e.target.style.backgroundColor = 'transparent' }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {view === 'users' && <Users />}
      {view === 'products' && <Products />}
      {view === 'customers' && <Customers />}

      {view === 'orders' && (
        <div className="max-w-7xl mx-auto px-6 py-6">

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-sm" style={{ color: '#9a9a9a' }}>Total órdenes</p>
              <p className="text-2xl font-bold" style={{ color: '#4a4a4a' }}>{orders.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-sm" style={{ color: '#9a9a9a' }}>Total ventas</p>
              <p className="text-2xl font-bold" style={{ color: '#5a8a3c' }}>
                ${totalGeneral.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-sm" style={{ color: '#9a9a9a' }}>Clientes</p>
              <p className="text-2xl font-bold" style={{ color: '#4a4a4a' }}>
                {Object.keys(groupedByCustomer).length}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-4 mb-6 flex gap-3 flex-wrap items-center">
            <input
              type="text"
              placeholder="Filtrar por cliente..."
              value={filters.customer || ''}
              onChange={e => setFilters({ ...filters, customer: e.target.value })}
              className="rounded-lg px-3 py-2 text-sm outline-none"
              style={{ border: '1.5px solid #ddd', minWidth: '180px' }}
              onFocus={e => e.target.style.borderColor = '#5a8a3c'}
              onBlur={e => e.target.style.borderColor = '#ddd'}
            />
            <select
              value={filters.stand}
              onChange={e => setFilters({ ...filters, stand: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
            >
              <option value="">Todos los stands</option>
              {[...new Set(orders.map(o => o.stand))].map(stand => (
                <option key={stand} value={stand}>{stand}</option>
              ))}
            </select>
            <select
              value={filters.paymentType}
              onChange={e => setFilters({ ...filters, paymentType: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
            >
              <option value="">Tipo de pago</option>
              <option value="contado">Contado</option>
              <option value="credito">Crédito</option>
            </select>
            <select
              value={filters.requiresInvoice}
              onChange={e => setFilters({ ...filters, requiresInvoice: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
            >
              <option value="">Factura</option>
              <option value="true">Con factura</option>
              <option value="false">Sin factura</option>
            </select>
            <button
              onClick={() => setFilters({ stand: '', paymentType: '', requiresInvoice: '', customer: '', sortBy: 'createdAt', order: 'desc' })}
              className="text-sm px-3 py-2 rounded-lg"
              style={{ color: '#6b6b6b', backgroundColor: '#f0f0f0' }}
            >
              Limpiar
            </button>
            <button
              onClick={handleExportAll}
              className="ml-auto text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
              style={{ backgroundColor: '#5a8a3c' }}
              onMouseEnter={e => e.target.style.backgroundColor = '#3d6b28'}
              onMouseLeave={e => e.target.style.backgroundColor = '#5a8a3c'}
            >
              Exportar todo
            </button>
          </div>

          {isGrouped ? (
            <div className="flex flex-col gap-4">
              {Object.values(groupedByCustomer).map(group => (
                <div key={group.customerId} className="bg-white rounded-xl shadow overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4"
                    style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold px-2 py-1 rounded-full"
                        style={{ backgroundColor: '#edf7e6', color: '#3d6b28' }}>
                        {group.customerCode || '—'}
                      </span>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: '#4a4a4a' }}>
                          {group.customerName}
                        </p>
                        <p className="text-xs" style={{ color: '#9a9a9a' }}>
                          {group.orders.length} orden{group.orders.length > 1 ? 'es' : ''} ·{' '}
                          ${group.orders.reduce((s, o) => s + o.total, 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleExportCustomer(group.customerId, group.customerCode, group.customerName)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition"
                      style={{ backgroundColor: '#5a8a3c' }}
                      onMouseEnter={e => e.target.style.backgroundColor = '#3d6b28'}
                      onMouseLeave={e => e.target.style.backgroundColor = '#5a8a3c'}
                    >
                      Exportar Microsip
                    </button>
                  </div>

                  <table className="w-full text-sm">
                    <thead className="uppercase text-xs" style={{ backgroundColor: '#f9f9f9', color: '#9a9a9a' }}>
                      <tr>
                        <th className="px-5 py-2 text-left"># Orden</th>
                        <th className="px-5 py-2 text-left">Stand</th>
                        <th className="px-5 py-2 text-left">Productos</th>
                        <th className="px-5 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {group.orders.map(order => (
                        <>
                          <tr key={order._id}
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}>
                            <td className="px-5 py-3 font-medium" style={{ color: '#5a8a3c' }}>
                              {order.orderNumber}
                            </td>
                            <td className="px-5 py-3" style={{ color: '#6b6b6b' }}>{order.stand}</td>
                            <td className="px-5 py-3" style={{ color: '#6b6b6b' }}>
                              {order.items.length} producto{order.items.length > 1 ? 's' : ''}
                            </td>
                            <td className="px-5 py-3 text-right font-semibold" style={{ color: '#4a4a4a' }}>
                              ${order.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                          {expandedOrder === order._id && (
                            <tr key={`${order._id}-detail`}>
                              <td colSpan={4} className="px-5 py-3" style={{ backgroundColor: '#fafafa' }}>
                                <table className="w-full text-xs" style={{ tableLayout: 'fixed' }}>
  <thead>
    <tr style={{ color: '#9a9a9a' }}>
      <th className="text-left py-1" style={{ width: '35%' }}>Producto</th>
      <th className="text-left py-1" style={{ width: '12%' }}>SKU</th>
      <th className="text-center py-1" style={{ width: '10%' }}>Cantidad</th>
      <th className="text-right py-1" style={{ width: '10%' }}>Precio</th>
      <th className="text-right py-1" style={{ width: '10%' }}>Subtotal</th>
      <th className="text-left py-1 pl-3" style={{ width: '23%' }}>Observaciones</th>
    </tr>
  </thead>
  <tbody>
    {order.items.map((item, i) => (
      <tr key={i} className="border-t border-gray-100">
        <td className="py-1.5 pr-2" style={{ color: '#4a4a4a' }}>{item.name}</td>
        <td className="py-1.5" style={{ color: '#6b6b6b' }}>{item.barcode}</td>
        <td className="py-1.5 text-center" style={{ color: '#6b6b6b' }}>{item.quantity}</td>
        <td className="py-1.5 text-right" style={{ color: '#6b6b6b' }}>
          ${item.appliedPrice?.toLocaleString('es-MX')}
        </td>
        <td className="py-1.5 text-right font-medium" style={{ color: '#4a4a4a' }}>
          ${item.subtotal?.toLocaleString('es-MX')}
        </td>
        <td className="py-1.5 pl-3" style={{ color: '#6b6b6b', fontStyle: 'italic' }}>
          {item.notes || '—'}
        </td>
      </tr>
    ))}
  </tbody>
</table>
                              </td>
                            </tr>
                          )}
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow overflow-hidden">
              {loading ? (
                <div className="p-8 text-center text-sm" style={{ color: '#9a9a9a' }}>
                  Cargando órdenes...
                </div>
              ) : orders.length === 0 ? (
                <div className="p-8 text-center text-sm" style={{ color: '#9a9a9a' }}>
                  No hay órdenes registradas
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="uppercase text-xs" style={{ backgroundColor: '#f5f5f3', color: '#6b6b6b' }}>
                    <tr>
                      <th className="px-4 py-3 text-left"># Orden</th>
                      <th className="px-4 py-3 text-left">
                        <button onClick={() => handleSort('customer.name')} className="flex items-center hover:opacity-70">
                          Cliente <SortIcon field="customer.name" />
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left">Stand</th>
                      <th className="px-4 py-3 text-left">Pago</th>
                      <th className="px-4 py-3 text-left">
                        <button onClick={() => handleSort('customer.deliveryDate')} className="flex items-center hover:opacity-70">
                          Entrega <SortIcon field="customer.deliveryDate" />
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left">Factura</th>
                      <th className="px-4 py-3 text-right">
                        <button onClick={() => handleSort('total')} className="flex items-center ml-auto hover:opacity-70">
                          Total <SortIcon field="total" />
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.map(order => (
                      <>
                        <tr key={order._id}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}>
                          <td className="px-4 py-3 font-medium" style={{ color: '#5a8a3c' }}>
                            {order.orderNumber}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {order.customer?.customerCode && (
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                                  style={{ backgroundColor: '#edf7e6', color: '#3d6b28' }}>
                                  {order.customer.customerCode}
                                </span>
                              )}
                              <p className="font-medium" style={{ color: '#4a4a4a' }}>
                                {order.customer?.name}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3" style={{ color: '#6b6b6b' }}>{order.stand}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: order.customer?.paymentType === 'contado' ? '#edf7e6' : '#fff8e6',
                                color: order.customer?.paymentType === 'contado' ? '#3d6b28' : '#b07d00'
                              }}>
                              {order.customer?.paymentType || '—'}
                            </span>
                          </td>
                          <td className="px-4 py-3" style={{ color: '#6b6b6b' }}>
                            {order.customer?.deliveryDate
                              ? new Date(order.customer.deliveryDate).toLocaleDateString('es-MX')
                              : '—'}
                          </td>
                          <td className="px-4 py-3">
                            {order.customer?.requiresInvoice
                              ? <span className="font-medium" style={{ color: '#5a8a3c' }}>Sí</span>
                              : <span style={{ color: '#9a9a9a' }}>No</span>}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold" style={{ color: '#4a4a4a' }}>
                            ${order.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                        {expandedOrder === order._id && (
                          <tr key={`${order._id}-detail`}>
                            <td colSpan={7} className="px-4 py-3" style={{ backgroundColor: '#fafafa' }}>
                             <table className="w-full text-xs" style={{ tableLayout: 'fixed' }}>
  <thead>
    <tr style={{ color: '#9a9a9a' }}>
      <th className="text-left py-1" style={{ width: '35%' }}>Producto</th>
      <th className="text-left py-1" style={{ width: '12%' }}>SKU</th>
      <th className="text-center py-1" style={{ width: '10%' }}>Cantidad</th>
      <th className="text-right py-1" style={{ width: '10%' }}>Precio</th>
      <th className="text-right py-1" style={{ width: '10%' }}>Subtotal</th>
      <th className="text-left py-1 pl-3" style={{ width: '23%' }}>Observaciones</th>
    </tr>
  </thead>
  <tbody>
    {order.items.map((item, i) => (
      <tr key={i} className="border-t border-gray-100">
        <td className="py-1.5 pr-2" style={{ color: '#4a4a4a' }}>{item.name}</td>
        <td className="py-1.5" style={{ color: '#6b6b6b' }}>{item.barcode}</td>
        <td className="py-1.5 text-center" style={{ color: '#6b6b6b' }}>{item.quantity}</td>
        <td className="py-1.5 text-right" style={{ color: '#6b6b6b' }}>
          ${item.appliedPrice?.toLocaleString('es-MX')}
        </td>
        <td className="py-1.5 text-right font-medium" style={{ color: '#4a4a4a' }}>
          ${item.subtotal?.toLocaleString('es-MX')}
        </td>
        <td className="py-1.5 pl-3" style={{ color: '#6b6b6b', fontStyle: 'italic' }}>
          {item.notes || '—'}
        </td>
      </tr>
    ))}
  </tbody>
</table>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}