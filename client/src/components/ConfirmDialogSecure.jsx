import { useState } from 'react';

export default function ConfirmDialogSecure({ message, expectedPhrase, onConfirm, onCancel }) {
  const [phrase, setPhrase] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (phrase !== expectedPhrase) {
      setError('La frase no coincide');
      return;
    }
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
        <div className="px-6 py-5" style={{ backgroundColor: '#fdeaea', borderBottom: '1px solid #fbd5d5' }}>
          <h3 className="text-base font-bold" style={{ color: '#e53935' }}>
            ⚠ Acción permanente
          </h3>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm mb-4" style={{ color: '#4a4a4a' }}>
            {message}
          </p>
          <p className="text-xs mb-3" style={{ color: '#6b6b6b' }}>
            Para confirmar, escribe la siguiente clave de seguridad:
          </p>
          <p className="text-sm font-mono font-bold mb-3 px-3 py-2 rounded-lg"
            style={{ backgroundColor: '#f5f5f3', color: '#4a4a4a', userSelect: 'none' }}>
            {expectedPhrase}
          </p>
          <input
            type="text"
            value={phrase}
            onChange={e => { setPhrase(e.target.value); setError(''); }}
            placeholder="Escribe la clave aquí"
            autoFocus
            className="w-full rounded-lg px-4 py-2 text-sm outline-none mb-2"
            style={{
              border: error ? '1.5px solid #e53935' : '1.5px solid #ddd',
              backgroundColor: '#fff',
              color: '#4a4a4a'
            }}
          />
          {error && (
            <p className="text-xs mb-2" style={{ color: '#e53935' }}>{error}</p>
          )}
        </div>

        <div className="px-6 py-4 flex gap-2" style={{ borderTop: '1px solid #f0f0f0' }}>
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-lg text-sm font-semibold transition"
            style={{ border: '1px solid #ddd', color: '#6b6b6b', backgroundColor: '#fff' }}
            onMouseEnter={e => e.target.style.backgroundColor = '#f5f5f3'}
            onMouseLeave={e => e.target.style.backgroundColor = '#fff'}>
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={phrase !== expectedPhrase}
            className="flex-1 py-2 rounded-lg text-sm font-semibold transition text-white disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: phrase === expectedPhrase ? '#e53935' : '#cccccc' }}
            onMouseEnter={e => { if (phrase === expectedPhrase) e.target.style.backgroundColor = '#c62828' }}
            onMouseLeave={e => { if (phrase === expectedPhrase) e.target.style.backgroundColor = '#e53935' }}>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}