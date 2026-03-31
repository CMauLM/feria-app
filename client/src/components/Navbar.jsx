import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.jpeg';

export default function Navbar({ title, subtitle }) {
  const { user, logout } = useAuth();

  return (
    <div className="shadow px-6 py-3 flex justify-between items-center"
      style={{ backgroundColor: '#4a4a4a' }}>
      <div className="flex items-center gap-4">
        <img src={logo} alt="Dipamex" className="h-10 rounded-lg" />
        <div className="w-px h-8 opacity-30" style={{ backgroundColor: '#fff' }} />
        <div>
          <p className="text-white font-semibold text-sm">{title}</p>
          {subtitle && <p className="text-xs opacity-60" style={{ color: '#fff' }}>{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm opacity-70" style={{ color: '#fff' }}>{user?.name}</span>
        <button
          onClick={logout}
          className="text-xs px-3 py-1.5 rounded-lg transition font-medium"
          style={{ backgroundColor: '#5a8a3c', color: '#fff' }}
          onMouseEnter={e => e.target.style.backgroundColor = '#3d6b28'}
          onMouseLeave={e => e.target.style.backgroundColor = '#5a8a3c'}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}