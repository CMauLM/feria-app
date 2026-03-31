import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.jpeg';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Ingresa tu correo y contraseña');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await login(email, password);
    } catch (err) {
      setError('Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#f5f5f3' }}>

      {/* Panel izquierdo */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center p-12"
        style={{ backgroundColor: '#4a4a4a' }}>
        <img src={logo} alt="Dipamex" className="w-64 mb-8 rounded-xl" />
        <p className="text-white text-lg font-light text-center opacity-80">
          Sistema de Órdenes de Compra
        </p>
        <p className="text-white text-sm text-center opacity-50 mt-2">
          Feria Comercial 2026
        </p>
      </div>

      {/* Panel derecho */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">

          {/* Logo mobile */}
          <div className="md:hidden flex justify-center mb-8">
            <img src={logo} alt="Dipamex" className="w-40 rounded-xl" />
          </div>

          <h2 className="text-2xl font-bold mb-1" style={{ color: '#4a4a4a' }}>
            Bienvenido
          </h2>
          <p className="text-sm mb-8" style={{ color: '#9a9a9a' }}>
            Inicia sesión para continuar
          </p>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-2 mb-4">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" style={{ color: '#4a4a4a' }}>
              Correo
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              className="w-full rounded-lg px-4 py-2.5 text-sm outline-none transition"
              style={{
                border: '1.5px solid #ddd',
                backgroundColor: '#fff',
                color: '#4a4a4a'
              }}
              onFocus={e => e.target.style.borderColor = '#5a8a3c'}
              onBlur={e => e.target.style.borderColor = '#ddd'}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-1" style={{ color: '#4a4a4a' }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="w-full rounded-lg px-4 py-2.5 text-sm outline-none transition"
              style={{
                border: '1.5px solid #ddd',
                backgroundColor: '#fff',
                color: '#4a4a4a'
              }}
              onFocus={e => e.target.style.borderColor = '#5a8a3c'}
              onBlur={e => e.target.style.borderColor = '#ddd'}
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
            style={{ backgroundColor: '#5a8a3c' }}
            onMouseEnter={e => e.target.style.backgroundColor = '#3d6b28'}
            onMouseLeave={e => e.target.style.backgroundColor = '#5a8a3c'}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>

        </div>
      </div>
    </div>
  );
}