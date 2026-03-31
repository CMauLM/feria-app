import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/Navbar';

const steps = ['Cliente', 'Productos', 'Confirmar'];

export default function Orders() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);

  // Cliente
  const [customerQuery, setCustomerQuery] = useState('');
  const [customerResults, setCustomerResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '' });

  // Productos
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [items, setItems] = useState([]);
  const searchRef = useRef(null);

  // Orden
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Buscar cliente
  useEffect(() => {
    if (!customerQuery || customerQuery.length < 2) {
      setCustomerResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const { data } = await api.get('/customers', { params: { q: customerQuery } });
        setCustomerResults(data);
      } catch (err) {
        console.error(err);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [customerQuery]);

  // Foco en buscador de productos
  useEffect(() => {
    if (step === 1) searchRef.current?.focus();
  }, [step, items]);

  // Buscar productos
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const { data } = await api.get('/products/search', { params: { q: query } });
        setResults(data);
        if (data.length === 1 && data[0].barcode === query) {
          addItem(data[0]);
          setQuery('');
          setResults([]);
        }
      } catch (err) {
        console.error(err);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const getPaymentType = () => {
    if (selectedCustomer) return selectedCustomer.paymentType;
    return 'contado';
  };

  const addItem = (product) => {
    const paymentType = getPaymentType();
    setItems(prev => {
      const exists = prev.find(i => i.product === product._id);
      if (exists) {
        return prev.map(i =>
          i.product === product._id
            ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.appliedPrice }
            : i
        );
      }
      const appliedPrice = paymentType === 'contado' ? product.priceContado : product.priceCredito;
      return [...prev, {
        product: product._id,
        barcode: product.barcode,
        name: product.name,
        priceContado: product.priceContado,
        priceCredito: product.priceCredito,
        appliedPrice,
        quantity: 1,
        subtotal: appliedPrice
      }];
    });
    setQuery('');
    setResults([]);
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return;
    setItems(prev =>
      prev.map(i =>
        i.product === productId
          ? { ...i, quantity, subtotal: quantity * i.appliedPrice }
          : i
      )
    );
  };

  const removeItem = (productId) => {
    setItems(prev => prev.filter(i => i.product !== productId));
  };

  const total = items.reduce((sum, i) => sum + i.subtotal, 0);

  const canGoNext = () => {
    if (step === 0) {
      if (isNewCustomer) return newCustomer.name.trim() !== '';
      return selectedCustomer !== null;
    }
    if (step === 1) return items.length > 0;
    return true;
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      const payload = {
        items: items.map(i => ({ productId: i.product, quantity: i.quantity }))
      };

      if (isNewCustomer) {
        payload.customer = newCustomer;
        payload.paymentType = 'contado';
        payload.deliveryDate = new Date().toISOString();
        payload.requiresInvoice = false;
      } else {
        payload.customerId = selectedCustomer._id;
      }

      await api.post('/orders', payload);
      setSuccess('¡Orden creada correctamente!');
      setStep(0);
      setItems([]);
      setSelectedCustomer(null);
      setNewCustomer({ name: '', email: '' });
      setIsNewCustomer(false);
      setCustomerQuery('');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError('Error al crear la orden');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f5f3' }}>

      <Navbar title="Nueva Orden" subtitle={user?.stand || user?.name} />

      {/* Stepper */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          {steps.map((label, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition"
                  style={{
                    backgroundColor: i < step ? '#5a8a3c' : i === step ? '#4a4a4a' : '#e5e5e5',
                    color: i <= step ? '#fff' : '#9a9a9a'
                  }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className="text-sm font-medium"
                  style={{ color: i === step ? '#4a4a4a' : i < step ? '#5a8a3c' : '#9a9a9a' }}>
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-4"
                  style={{ backgroundColor: i < step ? '#5a8a3c' : '#e5e5e5' }} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">

        {success && (
          <div className="text-sm font-medium rounded-xl px-5 py-4 mb-6"
            style={{ backgroundColor: '#edf7e6', color: '#3d6b28', border: '1px solid #c3e6a8' }}>
            ✅ {success}
          </div>
        )}

        {/* PASO 1 — Cliente */}
        {step === 0 && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-bold mb-1" style={{ color: '#4a4a4a' }}>
              ¿Quién realiza la compra?
            </h2>
            <p className="text-sm mb-6" style={{ color: '#9a9a9a' }}>
              Busca un cliente existente o registra uno nuevo
            </p>

            <div className="flex gap-2 mb-6">
              <button
                onClick={() => { setIsNewCustomer(false); setSelectedCustomer(null); }}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition"
                style={{
                  backgroundColor: !isNewCustomer ? '#5a8a3c' : '#f0f0f0',
                  color: !isNewCustomer ? '#fff' : '#6b6b6b'
                }}
              >
                Cliente existente
              </button>
              <button
                onClick={() => { setIsNewCustomer(true); setSelectedCustomer(null); setCustomerQuery(''); }}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition"
                style={{
                  backgroundColor: isNewCustomer ? '#5a8a3c' : '#f0f0f0',
                  color: isNewCustomer ? '#fff' : '#6b6b6b'
                }}
              >
                Cliente nuevo
              </button>
            </div>

            {!isNewCustomer && (
              <div>
                <input
                  type="text"
                  value={customerQuery}
                  onChange={e => { setCustomerQuery(e.target.value); setSelectedCustomer(null); }}
                  placeholder="Buscar por nombre, código o empresa..."
                  className="w-full rounded-lg px-4 py-2 text-sm outline-none mb-2"
                  style={{ border: '1.5px solid #ddd' }}
                  onFocus={e => e.target.style.borderColor = '#5a8a3c'}
                  onBlur={e => e.target.style.borderColor = '#ddd'}
                />
                {customerResults.length > 0 && !selectedCustomer && (
                  <div className="border border-gray-200 rounded-lg overflow-hidden mb-2">
                    {customerResults.map(c => (
                      <button key={c._id}
                        onClick={() => { setSelectedCustomer(c); setCustomerQuery(c.name); setCustomerResults([]); }}
                        className="w-full text-left px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50">
                        <p className="text-sm font-medium" style={{ color: '#4a4a4a' }}>{c.name}</p>
                        <p className="text-xs" style={{ color: '#9a9a9a' }}>
                          {c.company || ''} {c.email ? `· ${c.email}` : ''}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
                {selectedCustomer && (
                  <div className="rounded-lg px-4 py-3 flex justify-between items-center"
                    style={{ backgroundColor: '#edf7e6', border: '1px solid #c3e6a8' }}>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#3d6b28' }}>
                        {selectedCustomer.name}
                      </p>
                      <p className="text-xs" style={{ color: '#5a8a3c' }}>
                        {selectedCustomer.paymentType} · {selectedCustomer.requiresInvoice ? 'Con factura' : 'Sin factura'}
                      </p>
                    </div>
                    <button onClick={() => { setSelectedCustomer(null); setCustomerQuery(''); }}
                      className="text-sm" style={{ color: '#5a8a3c' }}>✕</button>
                  </div>
                )}
              </div>
            )}

            {isNewCustomer && (
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#6b6b6b' }}>Nombre *</label>
                  <input type="text" value={newCustomer.name}
                    onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })}
                    placeholder="Nombre completo o empresa"
                    className="w-full rounded-lg px-4 py-2 text-sm outline-none"
                    style={{ border: '1.5px solid #ddd' }}
                    onFocus={e => e.target.style.borderColor = '#5a8a3c'}
                    onBlur={e => e.target.style.borderColor = '#ddd'}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#6b6b6b' }}>Correo</label>
                  <input type="email" value={newCustomer.email}
                    onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    placeholder="correo@empresa.com"
                    className="w-full rounded-lg px-4 py-2 text-sm outline-none"
                    style={{ border: '1.5px solid #ddd' }}
                    onFocus={e => e.target.style.borderColor = '#5a8a3c'}
                    onBlur={e => e.target.style.borderColor = '#ddd'}
                  />
                </div>
              </div>
            )}

            <button onClick={() => setStep(1)} disabled={!canGoNext()}
              className="w-full mt-6 text-white font-semibold py-3 rounded-xl transition disabled:opacity-40"
              style={{ backgroundColor: '#5a8a3c' }}>
              Siguiente →
            </button>
          </div>
        )}

        {/* PASO 2 — Productos */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-bold mb-1" style={{ color: '#4a4a4a' }}>
              Agregar productos
            </h2>
            <p className="text-sm mb-6" style={{ color: '#9a9a9a' }}>
              Busca por nombre o escanea el código de barras
            </p>

            <input ref={searchRef} type="text" value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Nombre o código de barras..."
              className="w-full rounded-lg px-4 py-2 text-sm outline-none mb-2"
              style={{ border: '1.5px solid #ddd' }}
              onFocus={e => e.target.style.borderColor = '#5a8a3c'}
              onBlur={e => e.target.style.borderColor = '#ddd'}
            />

            {results.length > 0 && (
              <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
                {results.map(product => (
                  <button key={product._id} onClick={() => addItem(product)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0">
                    <p className="text-sm font-medium" style={{ color: '#4a4a4a' }}>{product.name}</p>
                    <p className="text-xs" style={{ color: '#9a9a9a' }}>
                      {product.barcode} — ${getPaymentType() === 'contado' ? product.priceContado : product.priceCredito} MXN
                    </p>
                  </button>
                ))}
              </div>
            )}

            {items.length === 0 ? (
              <div className="text-center py-10 text-sm" style={{ color: '#9a9a9a' }}>
                Sin productos agregados
              </div>
            ) : (
              <div className="flex flex-col gap-2 mb-4">
                {items.map(item => (
                  <div key={item.product} className="flex items-center gap-3 rounded-xl p-3"
                    style={{ border: '1px solid #e5e5e5' }}>
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: '#4a4a4a' }}>{item.name}</p>
                      <p className="text-xs" style={{ color: '#9a9a9a' }}>${item.appliedPrice} MXN c/u</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.product, item.quantity - 1)}
                        className="w-7 h-7 rounded-full text-sm font-bold"
                        style={{ backgroundColor: '#f0f0f0', color: '#4a4a4a' }}>−</button>
                      <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product, item.quantity + 1)}
                        className="w-7 h-7 rounded-full text-sm font-bold"
                        style={{ backgroundColor: '#f0f0f0', color: '#4a4a4a' }}>+</button>
                    </div>
                    <p className="text-sm font-semibold w-20 text-right" style={{ color: '#4a4a4a' }}>
                      ${item.subtotal.toLocaleString('es-MX')}
                    </p>
                    <button onClick={() => removeItem(item.product)}
                      className="text-xs ml-1" style={{ color: '#e57373' }}>✕</button>
                  </div>
                ))}
                <div className="flex justify-between pt-3 border-t border-gray-100">
                  <span className="text-sm font-semibold" style={{ color: '#4a4a4a' }}>Total parcial</span>
                  <span className="text-lg font-bold" style={{ color: '#5a8a3c' }}>
                    ${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <button onClick={() => setStep(0)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold transition"
                style={{ border: '1px solid #ddd', color: '#6b6b6b' }}>
                ← Atrás
              </button>
              <button onClick={() => setStep(2)} disabled={!canGoNext()}
                className="flex-1 py-3 rounded-xl text-white text-sm font-semibold transition disabled:opacity-40"
                style={{ backgroundColor: '#5a8a3c' }}>
                Siguiente →
              </button>
            </div>
          </div>
        )}

        {/* PASO 3 — Confirmar */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-bold mb-1" style={{ color: '#4a4a4a' }}>
              Confirmar orden
            </h2>
            <p className="text-sm mb-6" style={{ color: '#9a9a9a' }}>
              Revisa los detalles antes de confirmar
            </p>

            {/* Resumen cliente */}
            <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: '#f5f5f3' }}>
              <p className="text-xs mb-2 font-medium uppercase tracking-wide" style={{ color: '#9a9a9a' }}>
                Cliente
              </p>
              <p className="text-sm font-semibold" style={{ color: '#4a4a4a' }}>
                {isNewCustomer ? newCustomer.name : selectedCustomer?.name}
              </p>
              {!isNewCustomer && selectedCustomer && (
                <div className="flex gap-4 mt-2">
                  <span className="text-xs px-2 py-1 rounded-full font-medium"
                    style={{
                      backgroundColor: selectedCustomer.paymentType === 'contado' ? '#edf7e6' : '#fff8e6',
                      color: selectedCustomer.paymentType === 'contado' ? '#3d6b28' : '#b07d00'
                    }}>
                    {selectedCustomer.paymentType}
                  </span>
                  {selectedCustomer.deliveryDate && (
                    <span className="text-xs" style={{ color: '#6b6b6b' }}>
                      Entrega: {new Date(selectedCustomer.deliveryDate).toLocaleDateString('es-MX')}
                    </span>
                  )}
                  <span className="text-xs" style={{ color: '#6b6b6b' }}>
                    {selectedCustomer.requiresInvoice ? '📄 Con factura' : 'Sin factura'}
                  </span>
                </div>
              )}
            </div>

            {/* Resumen productos */}
            <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: '#f5f5f3' }}>
              <p className="text-xs mb-2 font-medium uppercase tracking-wide" style={{ color: '#9a9a9a' }}>
                Productos ({items.length})
              </p>
              {items.map(item => (
                <div key={item.product} className="flex justify-between text-sm py-1">
                  <span style={{ color: '#4a4a4a' }}>{item.name} × {item.quantity}</span>
                  <span className="font-medium" style={{ color: '#4a4a4a' }}>
                    ${item.subtotal.toLocaleString('es-MX')}
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex justify-between items-center rounded-xl px-5 py-4 mb-6"
              style={{ backgroundColor: '#edf7e6', border: '1px solid #c3e6a8' }}>
              <span className="text-sm font-semibold" style={{ color: '#3d6b28' }}>Total de la orden</span>
              <span className="text-2xl font-bold" style={{ color: '#3d6b28' }}>
                ${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-2 mb-4">{error}</div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold"
                style={{ border: '1px solid #ddd', color: '#6b6b6b' }}>
                ← Atrás
              </button>
              <button onClick={handleSubmit} disabled={loading}
                className="flex-1 py-3 rounded-xl text-white font-bold transition disabled:opacity-50"
                style={{ backgroundColor: '#5a8a3c' }}>
                {loading ? 'Guardando...' : '✓ Confirmar Orden'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}