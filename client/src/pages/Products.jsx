import { useState, useEffect } from 'react';
import api from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Products() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [productCount, setProductCount] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchCount = async () => {
    try {
      const { data } = await api.get('/products?limit=1');
      setProductCount(data.total || 0);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchCount(); }, []);

  const handleImport = async () => {
    if (!file) return setError('Selecciona un archivo Excel');

    try {
      setLoading(true);
      setError('');
      setResult(null);

      const formData = new FormData();
      formData.append('file', file);

      const { data } = await api.post('/products/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setResult(data);
      setFile(null);
      document.getElementById('productFile').value = '';
      fetchCount();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al importar');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    try {
      setDeleting(true);
      const { data } = await api.delete('/products/all');
      setResult({ message: data.message, deleted: data.deleted });
      setConfirmDelete(false);
      fetchCount();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al borrar');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <h2 className="text-xl font-bold mb-6" style={{ color: '#4a4a4a' }}>
        Catálogo de Productos
      </h2>

      {/* Estado del catálogo */}
      <div className="bg-white rounded-xl shadow p-4 mb-4 flex justify-between items-center">
        <div>
          <p className="text-xs" style={{ color: '#9a9a9a' }}>Productos en catálogo</p>
          <p className="text-2xl font-bold" style={{ color: '#5a8a3c' }}>{productCount}</p>
        </div>
        {productCount > 0 && (
          <button
            onClick={() => setConfirmDelete(true)}
            className="text-sm font-semibold px-4 py-2 rounded-lg transition"
            style={{ backgroundColor: '#fdeaea', color: '#e53935' }}
            onMouseEnter={e => { e.target.style.backgroundColor = '#e53935'; e.target.style.color = '#fff'; }}
            onMouseLeave={e => { e.target.style.backgroundColor = '#fdeaea'; e.target.style.color = '#e53935'; }}
          >
            Vaciar catálogo
          </button>
        )}
      </div>

      {/* Importar */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-sm font-semibold mb-4" style={{ color: '#4a4a4a' }}>
          Importar productos desde Excel
        </h3>
        <p className="text-sm mb-4" style={{ color: '#6b6b6b' }}>
          Sube el Excel exportado de Microsip.
        </p>

        <div className="border-2 border-dashed rounded-xl p-6 text-center mb-4"
          style={{ borderColor: '#ddd' }}>
          <input
            id="productFile"
            type="file"
            accept=".xlsx,.xls"
            onChange={e => setFile(e.target.files[0])}
            className="hidden"
          />
          <label
            htmlFor="productFile"
            className="cursor-pointer text-sm font-medium"
            style={{ color: '#5a8a3c' }}
          >
            Haz clic para seleccionar archivo
          </label>
          {file && (
            <p className="text-sm mt-2" style={{ color: '#6b6b6b' }}>📄 {file.name}</p>
          )}
        </div>

        {error && (
          <div className="text-sm rounded-lg px-4 py-2 mb-4"
            style={{ backgroundColor: '#fdeaea', color: '#e53935' }}>
            {error}
          </div>
        )}

        {result && (
          <div className="text-sm rounded-lg px-4 py-3 mb-4"
            style={{ backgroundColor: '#edf7e6', color: '#3d6b28' }}>
            <p className="font-semibold mb-1">{result.message || 'Operación exitosa'}</p>
            {result.inserted !== undefined && <p>Insertados: {result.inserted}</p>}
            {result.updated !== undefined && <p>Actualizados: {result.updated}</p>}
            {result.deleted !== undefined && <p>Eliminados: {result.deleted}</p>}
            {result.total !== undefined && <p>Total procesados: {result.total}</p>}
          </div>
        )}

        <button
          onClick={handleImport}
          disabled={loading || !file}
          className="w-full text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
          style={{ backgroundColor: '#5a8a3c' }}
          onMouseEnter={e => !e.target.disabled && (e.target.style.backgroundColor = '#3d6b28')}
          onMouseLeave={e => !e.target.disabled && (e.target.style.backgroundColor = '#5a8a3c')}
        >
          {loading ? 'Importando...' : 'Importar productos'}
        </button>
      </div>

      {confirmDelete && (
        <ConfirmDialog
          message={`¿Estás seguro de eliminar TODOS los ${productCount} productos del catálogo? Esta acción no se puede deshacer.`}
          onConfirm={handleDeleteAll}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}