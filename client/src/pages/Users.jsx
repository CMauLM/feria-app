import { useState, useEffect } from 'react';
import { Eye, Trash2, Pencil } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

const SUPPLIER_PRESETS = [
  { name: 'Norma', prefixes: ['50'] },
  { name: 'D\'novac', prefixes: ['21'] },
  { name: 'Pelikan', prefixes: ['10'] },
  { name: 'Fortec', prefixes: ['24'] },
  { name: 'Imperial', prefixes: ['79'] },
  { name: 'Henkel', prefixes: ['49'] },
  { name: 'Rodin', prefixes: ['80'] },
  { name: 'Acco', prefixes: ['23', '11'] },
  { name: 'Dietrix', prefixes: ['88'] },
  { name: 'Padi', prefixes: ['44'] },
  { name: 'Tuk', prefixes: ['52'] },
  { name: 'Dipamex', prefixes: [] },
];

const emptyForm = {
  name: '', email: '', password: '',
  role: 'vendor', stand: '', productPrefixes: []
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [viewUser, setViewUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [originalForm, setOriginalForm] = useState(emptyForm);
  const [supplierMode, setSupplierMode] = useState('preset');
  const [selectedPreset, setSelectedPreset] = useState('');

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/auth/users');
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const openCreate = () => {
    setViewUser(null);
    setIsEditing(false);
    setForm(emptyForm);
    setSupplierMode('preset');
    setSelectedPreset('');
    setError('');
    setShowModal(true);
  };

  const openView = (user) => {
    const data = {
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'vendor',
      stand: user.stand || '',
      productPrefixes: user.productPrefixes || []
    };
    setViewUser(user);
    setIsEditing(false);
    setForm(data);
    setOriginalForm(data);
    setSupplierMode('custom');
    setError('');
    setShowModal(true);
  };

  const handlePresetSelect = (presetName) => {
    setSelectedPreset(presetName);
    const preset = SUPPLIER_PRESETS.find(p => p.name === presetName);
    if (preset) {
      setForm({
        ...form,
        stand: preset.name,
        productPrefixes: preset.prefixes
      });
    }
  };

  const handleSave = async () => {
    if (!form.name) return setError('El nombre es requerido');
    if (!form.email) return setError('El correo es requerido');
    if (!viewUser && !form.password) return setError('La contraseña es requerida');
    if (form.role === 'vendor' && !form.stand) return setError('El stand es requerido para vendors');

    try {
      setError('');
      const payload = { ...form };
      delete payload.productPrefixesRaw;
      if (viewUser) {
        if (!payload.password) delete payload.password;
        await api.put(`/auth/users/${viewUser._id}`, payload);
        setSuccess('Usuario actualizado correctamente');
      } else {
        await api.post('/auth/register', payload);
        setSuccess('Usuario creado correctamente');
      }
      setShowModal(false);
      setViewUser(null);
      setIsEditing(false);
      setForm(emptyForm);
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/auth/users/${confirmId}`);
      setSuccess('Usuario eliminado');
      setConfirmId(null);
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const isDisabled = !isEditing && viewUser;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold" style={{ color: '#4a4a4a' }}>Usuarios y Stands</h2>
        <button
          onClick={openCreate}
          className="text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
          style={{ backgroundColor: '#5a8a3c' }}
          onMouseEnter={e => e.target.style.backgroundColor = '#3d6b28'}
          onMouseLeave={e => e.target.style.backgroundColor = '#5a8a3c'}
        >
          + Nuevo usuario
        </button>
      </div>

      {success && (
        <div className="text-sm rounded-lg px-4 py-2 mb-4"
          style={{ backgroundColor: '#edf7e6', color: '#3d6b28' }}>
          {success}
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 uppercase text-xs" style={{ color: '#6b6b6b' }}>
            <tr>
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3 text-left">Correo</th>
              <th className="px-4 py-3 text-left">Rol</th>
              <th className="px-4 py-3 text-left">Stand</th>
              <th className="px-4 py-3 text-left">Prefijos</th>
              <th className="px-4 py-3 text-left"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(user => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium" style={{ color: '#4a4a4a' }}>{user.name}</td>
                <td className="px-4 py-3" style={{ color: '#6b6b6b' }}>{user.email}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: user.role === 'admin' ? '#f3e8ff' : '#edf7e6',
                      color: user.role === 'admin' ? '#7c3aed' : '#3d6b28'
                    }}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3" style={{ color: '#6b6b6b' }}>{user.stand || '—'}</td>
                <td className="px-4 py-3">
                  {user.productPrefixes?.length > 0 ? (
                    <div className="flex gap-1 flex-wrap">
                      {user.productPrefixes.map(p => (
                        <span key={p} className="text-xs font-mono px-2 py-0.5 rounded"
                          style={{ backgroundColor: '#f0f0f0', color: '#4a4a4a' }}>
                          {p}.
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span style={{ color: '#9a9a9a' }}>—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => openView(user)}
                      className="p-1.5 rounded-lg transition"
                      style={{ color: '#9a9a9a' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#5a8a3c'; e.currentTarget.style.backgroundColor = '#edf7e6'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#9a9a9a'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                      title="Ver">
                      <Eye size={14} />
                    </button>
                    <button onClick={() => setConfirmId(user._id)}
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
      </div>

      {showModal && (
        <Modal
          title={
            viewUser
              ? isEditing ? 'Editar usuario' : 'Detalle del usuario'
              : 'Nuevo usuario'
          }
          onClose={() => { setShowModal(false); setViewUser(null); setIsEditing(false); setError(''); }}
          actions={viewUser && !isEditing ? (
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

            <div>
              <label className="block text-xs mb-1" style={{ color: '#6b6b6b' }}>Nombre *</label>
              <input type="text" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                disabled={isDisabled}
                placeholder="Nombre completo"
                className="w-full rounded-lg px-4 py-2 text-sm outline-none"
                style={{
                  border: '1.5px solid #ddd',
                  backgroundColor: isDisabled ? '#f5f5f3' : '#fff',
                  color: '#4a4a4a'
                }}
              />
            </div>

            <div>
              <label className="block text-xs mb-1" style={{ color: '#6b6b6b' }}>Correo *</label>
              <input type="email" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                disabled={isDisabled}
                placeholder="correo@ejemplo.com"
                className="w-full rounded-lg px-4 py-2 text-sm outline-none"
                style={{
                  border: '1.5px solid #ddd',
                  backgroundColor: isDisabled ? '#f5f5f3' : '#fff',
                  color: '#4a4a4a'
                }}
              />
            </div>

            <div>
              <label className="block text-xs mb-1" style={{ color: '#6b6b6b' }}>
                {viewUser ? 'Nueva contraseña (opcional)' : 'Contraseña *'}
              </label>
              <input type="password" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                disabled={isDisabled}
                placeholder={viewUser ? 'Dejar vacío para no cambiar' : '••••••••'}
                className="w-full rounded-lg px-4 py-2 text-sm outline-none"
                style={{
                  border: '1.5px solid #ddd',
                  backgroundColor: isDisabled ? '#f5f5f3' : '#fff',
                  color: '#4a4a4a'
                }}
              />
            </div>

            <div>
              <label className="block text-xs mb-1" style={{ color: '#6b6b6b' }}>Rol</label>
              <select value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}
                disabled={isDisabled}
                className="w-full rounded-lg px-4 py-2 text-sm outline-none"
                style={{
                  border: '1.5px solid #ddd',
                  backgroundColor: isDisabled ? '#f5f5f3' : '#fff',
                  color: '#4a4a4a'
                }}>
                <option value="vendor">Vendor</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {form.role === 'vendor' && (
              <>
                {!viewUser && (
                  <div>
                    <label className="block text-xs mb-2" style={{ color: '#6b6b6b' }}>Tipo de proveedor</label>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setSupplierMode('preset')}
                        className="flex-1 py-2 rounded-lg text-sm font-semibold transition"
                        style={{
                          backgroundColor: supplierMode === 'preset' ? '#5a8a3c' : '#f0f0f0',
                          color: supplierMode === 'preset' ? '#fff' : '#6b6b6b'
                        }}>
                        Predefinido
                      </button>
                      <button type="button" onClick={() => setSupplierMode('custom')}
                        className="flex-1 py-2 rounded-lg text-sm font-semibold transition"
                        style={{
                          backgroundColor: supplierMode === 'custom' ? '#5a8a3c' : '#f0f0f0',
                          color: supplierMode === 'custom' ? '#fff' : '#6b6b6b'
                        }}>
                        Personalizado
                      </button>
                    </div>
                  </div>
                )}

                {supplierMode === 'preset' && !viewUser && (
                  <div>
                    <label className="block text-xs mb-1" style={{ color: '#6b6b6b' }}>Selecciona proveedor</label>
                    <select value={selectedPreset}
                      onChange={e => handlePresetSelect(e.target.value)}
                      className="w-full rounded-lg px-4 py-2 text-sm outline-none"
                      style={{ border: '1.5px solid #ddd', backgroundColor: '#fff', color: '#4a4a4a' }}>
                      <option value="">Selecciona...</option>
                      {SUPPLIER_PRESETS.map(s => (
                        <option key={s.name} value={s.name}>
                          {s.name} {s.prefixes.length > 0 ? `(${s.prefixes.join(', ')})` : '(todos)'}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {(supplierMode === 'custom' || viewUser) && (
                  <>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: '#6b6b6b' }}>Stand / Proveedor *</label>
                      <input type="text" value={form.stand}
                        onChange={e => setForm({ ...form, stand: e.target.value })}
                        disabled={isDisabled}
                        placeholder="Nombre del stand"
                        className="w-full rounded-lg px-4 py-2 text-sm outline-none"
                        style={{
                          border: '1.5px solid #ddd',
                          backgroundColor: isDisabled ? '#f5f5f3' : '#fff',
                          color: '#4a4a4a'
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: '#6b6b6b' }}>
                        Prefijos de productos (separados por coma)
                      </label>
                      <input type="text"
                        value={form.productPrefixesRaw !== undefined ? form.productPrefixesRaw : form.productPrefixes.join(', ')}
                        onChange={e => {
                          const raw = e.target.value;
                          setForm({
                            ...form,
                            productPrefixesRaw: raw,
                            productPrefixes: raw.split(',').map(p => p.trim()).filter(Boolean)
                          });
                        }}
                        onBlur={() => setForm({ ...form, productPrefixesRaw: undefined })}
                        disabled={isDisabled}
                        placeholder="ej: 23, 11"
                        className="w-full rounded-lg px-4 py-2 text-sm outline-none"
                        style={{
                          border: '1.5px solid #ddd',
                          backgroundColor: isDisabled ? '#f5f5f3' : '#fff',
                          color: '#4a4a4a'
                        }}
                      />
                      <p className="text-xs mt-1" style={{ color: '#9a9a9a' }}>
                        Deja vacío para acceso a todos los productos
                      </p>
                    </div>
                  </>
                )}

                {supplierMode === 'preset' && !viewUser && form.productPrefixes.length > 0 && (
                  <div className="rounded-lg px-4 py-3"
                    style={{ backgroundColor: '#edf7e6' }}>
                    <p className="text-xs mb-1" style={{ color: '#3d6b28' }}>Prefijos asignados:</p>
                    <div className="flex gap-1">
                      {form.productPrefixes.map(p => (
                        <span key={p} className="text-xs font-mono px-2 py-0.5 rounded"
                          style={{ backgroundColor: '#fff', color: '#3d6b28' }}>
                          {p}.
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {error && (
              <div className="text-sm rounded-lg px-4 py-2"
                style={{ backgroundColor: '#fdeaea', color: '#e53935' }}>
                {error}
              </div>
            )}

            {(isEditing || !viewUser) && (
              <div className="flex gap-2 mt-1">
                {isEditing && (
                  <button onClick={() => { setIsEditing(false); setForm(originalForm); setError(''); }}
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
                  {viewUser ? 'Guardar cambios' : 'Crear usuario'}
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {confirmId && (
        <ConfirmDialog
          message="¿Estás seguro de eliminar este usuario?"
          onConfirm={handleDelete}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}