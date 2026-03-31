import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Users from './Users';
import Products from './Products';
import Customers from './Customers';
import Navbar from '../components/Navbar';

export default function Dashboard() {
  const { user } = useAuth();
  const [view, setView] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
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

      const { data } = await api.get('/orders', { params });
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const handleExport = async () => {
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

  const totalGeneral = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <Navbar title="Panel Administrador" />

      {/* Pestañas */}
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

      {/* Vista Usuarios */}
      {view === 'users' && <Users />}
      {/* Vista Productos */}
      {view === 'products' && <Products />}
      {/* Vista Clientes */}
      {view === 'customers' && <Customers />}
      {/* Vista Órdenes */}
      {view === 'orders' && (
        <div className="max-w-7xl mx-auto px-6 py-6">

          {/* Métricas */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-sm text-gray-500">Total órdenes</p>
              <p className="text-2xl font-bold text-gray-800">{orders.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-sm text-gray-500">Total ventas</p>
              <p className="text-2xl font-bold text-blue-600">
                ${totalGeneral.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-sm text-gray-500">Requieren factura</p>
              <p className="text-2xl font-bold text-gray-800">
                {orders.filter(o => o.requiresInvoice).length}
              </p>
            </div>
          </div>

          {/* Filtros */}

          <div className="bg-white rounded-xl shadow p-4 mb-6 flex gap-3 flex-wrap items-center">
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={filters.customer || ''}
              onChange={e => setFilters({ ...filters, customer: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={{ minWidth: '160px' }}
              onFocus={e => e.target.style.borderColor = '#5a8a3c'}
              onBlur={e => e.target.style.borderColor = '#d1d5db'}
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
              onClick={handleExport}
              className="ml-auto text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
              style={{ backgroundColor: '#5a8a3c' }}
              onMouseEnter={e => e.target.style.backgroundColor = '#3d6b28'}
              onMouseLeave={e => e.target.style.backgroundColor = '#5a8a3c'}
            >
              Exportar Excel
            </button>
          </div>

          {/* Tabla */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Cargando órdenes...</div>
            ) : orders.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No hay órdenes registradas</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs uppercase" style={{ color: '#6b6b6b' }}>
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
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-blue-600">{order.orderNumber}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{order.customer.name}</p>
                        <p className="text-gray-400 text-xs">{order.customer.email}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{order.stand}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.customer?.paymentType === 'contado'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                          }`}>
                          {order.customer?.paymentType || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {order.customer?.deliveryDate
                          ? new Date(order.customer.deliveryDate).toLocaleDateString('es-MX')
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {order.requiresInvoice
                          ? <span className="text-blue-600 font-medium">Sí</span>
                          : <span className="text-gray-400">No</span>
                        }
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-800">
                        ${order.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </div>
      )}

    </div>
  );
}