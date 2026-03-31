import { useState } from 'react';
import api from '../services/api';

export default function Products() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

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
      // Limpiar el input
      document.getElementById('productFile').value = '';
    } catch (err) {
      setError(err.response?.data?.message || 'Error al importar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Importar Catálogo de Productos</h2>

      <div className="bg-white rounded-xl shadow p-6">
        <p className="text-sm text-gray-600 mb-4">
          Sube el Excel exportado de Microsip. Las columnas esperadas son:
          <span className="font-medium"> Codigo, Nombre, PrecioContado, PrecioCredito, Proveedor, Unidad.</span>
        </p>

        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center mb-4">
          <input
            id="productFile"
            type="file"
            accept=".xlsx,.xls"
            onChange={e => setFile(e.target.files[0])}
            className="hidden"
          />
          <label
            htmlFor="productFile"
            className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Haz clic para seleccionar archivo
          </label>
          {file && (
            <p className="text-sm text-gray-600 mt-2">📄 {file.name}</p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-2 mb-4">
            {error}
          </div>
        )}

        {result && (
          <div className="bg-green-50 text-green-700 text-sm rounded-lg px-4 py-3 mb-4">
            <p className="font-semibold mb-1">Importación completada</p>
            <p>Insertados: {result.inserted}</p>
            <p>Actualizados: {result.updated}</p>
            <p>Total procesados: {result.total}</p>
          </div>
        )}

        <button
          onClick={handleImport}
          disabled={loading || !file}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
        >
          {loading ? 'Importando...' : 'Importar productos'}
        </button>
      </div>
    </div>
  );
}