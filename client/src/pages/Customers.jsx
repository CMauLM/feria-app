import { useState, useEffect } from 'react';
import { Eye, Trash2, Pencil } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

const emptyForm = {
  name: '', email: '', phone: '', company: '', rfc: '',
  personType: 'fisica', paymentType: 'contado',
  deliveryDate: '', requiresInvoice: false
};

const validateForm = (form) => {
  if (!form.name) return 'El nombre es requerido';
  if (!form.deliveryDate) return 'La fecha de entrega es requerida';
  if (form.phone && !/^\d{10}$/.test(form.phone)) return 'El teléfono debe tener exactamente 10 dígitos';
  if (form.rfc) {
    const rfcLength = form.personType === 'fisica' ? 13 : 12;
    const rfcRegex = form.personType === 'fisica'
      ? /^[A-Z]{4}\d{6}[A-Z0-9]{3}$/
      : /^[A-Z]{3}\d{6}[A-Z0-9]{3}$/;
    if (form.rfc.length !== rfcLength || !rfcRegex.test(form.rfc.toUpperCase())) {
      return `RFC inválido para persona ${form.personType} (${rfcLength} caracteres)`;
    }
  }
  return null;
};

const InputField = ({ label, field, type = 'text', placeholder, form, setForm, disabled }) => (
  <div>
    <label className="block text-xs mb-1" style={{ color: '#6b6b6b' }}>{label}</label>
    <input
      type={type}
      value={form[field]}
      onChange={e => setForm({ ...form, [field]: e.target.value })}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full rounded-lg px-4 py-2 text-sm outline-none transition"
      style={{
        border: '1.5px solid #ddd',
        backgroundColor: disabled ? '#f5f5f3' : '#fff',
        color: '#4a4a4a'
      }}
      onFocus={e => { if (!disabled) e.target.style.borderColor = '#5a8a3c' }}
      onBlur={e => e.target.style.borderColor = '#ddd'}
    />
  </div>
);

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [query, setQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [viewCustomer, setViewCustomer] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [confirmId, setConfirmId] = useState(null);
  const [originalForm, setOriginalForm] = useState(emptyForm);

  const fetchCustomers = async (q = '') => {
    try {
      const { data } = await api.get('/customers', { params: q ? { q } : {} });
      setCustomers(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  useEffect(() => {
    const timeout = setTimeout(() => fetchCustomers(query), 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const openCreate = () => {
    setViewCustomer(null);
    setIsEditing(false);
    setForm(emptyForm);
    setError('');
    setShowModal(true);
  };

  const openView = (customer) => {
    const data = {
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      company: customer.company || '',
      rfc: customer.rfc || '',
      personType: customer.personType || 'fisica',
      paymentType: customer.paymentType || 'contado',
      deliveryDate: customer.deliveryDate
        ? new Date(customer.deliveryDate).toISOString().split('T')[0]
        : '',
      requiresInvoice: customer.requiresInvoice || false
    };
    setViewCustomer(customer);
    setIsEditing(false);
    setForm(data);
    setOriginalForm(data);
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    const validationError = validateForm(form);
    if (validationError) return setError(validationError);
    try {
      setError('');
      if (viewCustomer) {
        await api.put(`/customers/${viewCustomer._id}`, form);
        setSuccess('Cliente actualizado correctamente');
      } else {
        await api.post('/customers', form);
        setSuccess('Cliente registrado correctamente');
      }
      setShowModal(false);
      setViewCustomer(null);
      setIsEditing(false);
      setForm(emptyForm);
      fetchCustomers(query);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/customers/${confirmId}`);
      setSuccess('Cliente eliminado');
      setConfirmId(null);
      fetchCustomers(query);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    try {
      setImporting(true);
      setImportResult(null);
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('/customers/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImportResult(data);
      setFile(null);
      document.getElementById('customerFile').value = '';
      fetchCustomers();
    } catch (err) {
      setError('Error al importar');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold" style={{ color: '#4a4a4a' }}>Clientes</h2>
        <button
          onClick={openCreate}
          className="text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
          style={{ backgroundColor: '#5a8a3c' }}
          onMouseEnter={e => e.target.style.backgroundColor = '#3d6b28'}
          onMouseLeave={e => e.target.style.backgroundColor = '#5a8a3c'}
        >
          + Registrar cliente
        </button>
      </div>

      {success && (
        <div className="text-sm rounded-lg px-4 py-2 mb-4"
          style={{ backgroundColor: '#edf7e6', color: '#3d6b28' }}>
          {success}
        </div>
      )}

      {/* Buscador */}
      <div className="bg-white rounded-xl shadow p-4 mb-4">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar por nombre, código, empresa o correo..."
          className="w-full rounded-lg px-4 py-2 text-sm outline-none"
          style={{ border: '1.5px solid #ddd' }}
          onFocus={e => e.target.style.borderColor = '#5a8a3c'}
          onBlur={e => e.target.style.borderColor = '#ddd'}
        />
      </div>

      {/* Import Excel */}
      <div className="bg-white rounded-xl shadow p-4 mb-6 flex items-center gap-4 flex-wrap">
        <input id="customerFile" type="file" accept=".xlsx,.xls"
          onChange={e => setFile(e.target.files[0])} className="hidden" />
        <label htmlFor="customerFile"
          className="cursor-pointer text-sm font-medium" style={{ color: '#5a8a3c' }}>
          📄 {file ? file.name : 'Seleccionar Excel'}
        </label>
        {file && (
          <button onClick={handleImport} disabled={importing}
            className="text-white text-sm font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50"
            style={{ backgroundColor: '#5a8a3c' }}>
            {importing ? 'Importando...' : 'Importar'}
          </button>
        )}
        {importResult && (
          <span className="text-sm" style={{ color: '#3d6b28' }}>
            ✅ {importResult.inserted} insertados, {importResult.updated} actualizados
          </span>
        )}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {customers.length === 0 ? (
          <div className="p-8 text-center text-sm" style={{ color: '#9a9a9a' }}>
            No hay clientes registrados
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 uppercase text-xs" style={{ color: '#6b6b6b' }}>
              <tr>
                <th className="px-4 py-3 text-left">Código</th>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Empresa/Razón Social</th>
                <th className="px-4 py-3 text-left">Pago</th>
                <th className="px-4 py-3 text-left">Entrega</th>
                <th className="px-4 py-3 text-left">Factura</th>
                <th className="px-4 py-3 text-left"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.map(c => (
                <tr key={c._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="text-xs font-bold px-2 py-1 rounded-full"
                      style={{ backgroundColor: '#edf7e6', color: '#3d6b28' }}>
                      {c.customerCode || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium" style={{ color: '#4a4a4a' }}>{c.name}</p>
                    <p className="text-xs" style={{ color: '#9a9a9a' }}>{c.email || '—'}</p>
                  </td>
                  <td className="px-4 py-3" style={{ color: '#6b6b6b' }}>{c.company || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: c.paymentType === 'contado' ? '#edf7e6' : '#fff8e6',
                        color: c.paymentType === 'contado' ? '#3d6b28' : '#b07d00'
                      }}>
                      {c.paymentType}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ color: '#6b6b6b' }}>
                    {c.deliveryDate
                      ? new Date(c.deliveryDate).toLocaleDateString('es-MX')
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {c.requiresInvoice
                      ? <span className="font-medium" style={{ color: '#5a8a3c' }}>Sí</span>
                      : <span style={{ color: '#9a9a9a' }}>No</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openView(c)}
                        className="p-1.5 rounded-lg transition"
                        style={{ color: '#9a9a9a' }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#5a8a3c'; e.currentTarget.style.backgroundColor = '#edf7e6'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#9a9a9a'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                        title="Ver cliente">
                        <Eye size={14} />
                      </button>
                      <button onClick={() => setConfirmId(c._id)}
                        className="p-1.5 rounded-lg transition"
                        style={{ color: '#9a9a9a' }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#e57373'; e.currentTarget.style.backgroundColor = '#fdeaea'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#9a9a9a'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                        title="Eliminar">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal ver/crear/editar */}
      {showModal && (
        <Modal
          title={
            viewCustomer
              ? isEditing ? 'Editar cliente' : 'Detalle del cliente'
              : 'Registrar cliente'
          }
          onClose={() => {
            setShowModal(false);
            setViewCustomer(null);
            setIsEditing(false);
            setError('');
          }}
          actions={viewCustomer && !isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 rounded-lg transition"
              style={{ color: '#9a9a9a' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#3d6b28'; e.currentTarget.style.backgroundColor = '#edf7e6'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#9a9a9a'; e.currentTarget.style.backgroundColor = 'transparent'; }}
              title="Editar"
            >
              <Pencil size={15} />
            </button>
          ) : null}
        >
          <div className="flex flex-col gap-3">

            {/* Código de cliente */}
            {viewCustomer && (
              <div className="mb-1">
                <span className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{ backgroundColor: '#edf7e6', color: '#3d6b28' }}>
                  {viewCustomer.customerCode || '—'}
                </span>
              </div>
            )}

            <InputField label="Nombre *" field="name" placeholder="Nombre completo"
              form={form} setForm={setForm} disabled={!isEditing && viewCustomer} />
            <InputField label="Correo" field="email" type="email" placeholder="correo@empresa.com"
              form={form} setForm={setForm} disabled={!isEditing && viewCustomer} />
            <InputField label="Teléfono (10 dígitos)" field="phone" placeholder="9981234567"
              form={form} setForm={setForm} disabled={!isEditing && viewCustomer} />

            {/* Tipo de persona */}
            <div>
              <label className="block text-xs mb-1" style={{ color: '#6b6b6b' }}>Tipo de persona</label>
              <div className="flex gap-2">
                {['fisica', 'moral'].map(type => (
                  <button key={type}
                    onClick={() => { if (isEditing || !viewCustomer) setForm({ ...form, personType: type, rfc: '' }); }}
                    disabled={!isEditing && viewCustomer}
                    className="flex-1 py-2 rounded-lg text-sm font-semibold transition"
                    style={{
                      backgroundColor: form.personType === type ? '#5a8a3c' : '#f0f0f0',
                      color: form.personType === type ? '#fff' : '#6b6b6b',
                      opacity: (!isEditing && viewCustomer) ? 0.7 : 1
                    }}>
                    {type === 'fisica' ? 'Física' : 'Moral'}
                  </button>
                ))}
              </div>
            </div>

            <InputField
              label={`RFC (${form.personType === 'fisica' ? '13 caracteres' : '12 caracteres'})`}
              field="rfc"
              placeholder={form.personType === 'fisica' ? 'LOPM800101ABC' : 'DPM800101ABC'}
              form={form} setForm={setForm} disabled={!isEditing && viewCustomer}
            />
            <InputField label="Empresa/Razón Social" field="company" placeholder="Nombre de la empresa"
              form={form} setForm={setForm} disabled={!isEditing && viewCustomer} />

            {/* Tipo de pago */}
            <div>
              <label className="block text-xs mb-1" style={{ color: '#6b6b6b' }}>Tipo de pago</label>
              <div className="flex gap-2">
                {['contado', 'credito'].map(type => (
                  <button key={type}
                    onClick={() => { if (isEditing || !viewCustomer) setForm({ ...form, paymentType: type }); }}
                    disabled={!isEditing && viewCustomer}
                    className="flex-1 py-2 rounded-lg text-sm font-semibold transition"
                    style={{
                      backgroundColor: form.paymentType === type
                        ? type === 'contado' ? '#5a8a3c' : '#f59e0b'
                        : '#f0f0f0',
                      color: form.paymentType === type ? '#fff' : '#6b6b6b',
                      opacity: (!isEditing && viewCustomer) ? 0.7 : 1
                    }}>
                    {type === 'contado' ? 'Contado' : 'Crédito'}
                  </button>
                ))}
              </div>
            </div>

            <InputField label="Fecha de entrega *" field="deliveryDate" type="date"
              form={form} setForm={setForm} disabled={!isEditing && viewCustomer} />

            {/* Factura */}
            <div className="flex items-center gap-2">
              <input type="checkbox" id="modalInvoice" checked={form.requiresInvoice}
                onChange={e => { if (isEditing || !viewCustomer) setForm({ ...form, requiresInvoice: e.target.checked }); }}
                disabled={!isEditing && viewCustomer}
                className="w-4 h-4 accent-green-600"
              />
              <label htmlFor="modalInvoice" className="text-sm" style={{ color: '#4a4a4a' }}>
                Requiere factura
              </label>
            </div>

            {error && (
              <div className="text-sm rounded-lg px-4 py-2"
                style={{ backgroundColor: '#fdeaea', color: '#e53935' }}>
                {error}
              </div>
            )}

            {/* Botones acción */}
            {(isEditing || !viewCustomer) && (
              <div className="flex gap-2 mt-1">
                {isEditing && (
                  <button
                    onClick={() => { setIsEditing(false); setForm(originalForm); setError(''); }}
                    className="flex-1 py-2 rounded-lg text-sm font-semibold transition"
                    style={{ border: '1px solid #ddd', color: '#6b6b6b' }}>
                    Cancelar
                  </button>
                )}
                <button onClick={handleSave}
                  className="flex-1 py-2 rounded-lg text-white text-sm font-semibold transition"
                  style={{ backgroundColor: '#5a8a3c' }}
                  onMouseEnter={e => e.target.style.backgroundColor = '#3d6b28'}
                  onMouseLeave={e => e.target.style.backgroundColor = '#5a8a3c'}>
                  {viewCustomer ? 'Guardar cambios' : 'Registrar cliente'}
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {confirmId && (
        <ConfirmDialog
          message="¿Estás seguro de eliminar este cliente?"
          onConfirm={handleDelete}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}