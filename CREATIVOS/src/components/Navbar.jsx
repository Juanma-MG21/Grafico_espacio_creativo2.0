import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isLoggedIn, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);

  const go = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    go('/');
  };

  return (
    <>
      {/* BANNER SUPERIOR */}
      <div
        className="w-full h-48 md:h-70 bg-slate-300 bg-center bg-no-repeat bg-contain shadow-xl"
        style={{ backgroundImage: "url('/src/assets/LOGO.png')" }}
      />

      {/* BOTÓN TOGGLE */}
      <button
        onClick={toggleMenu}
        className="fixed top-5 left-5 text-2xl cursor-pointer z-50 bg-gray-600 p-2 rounded-lg shadow-md hover:bg-slate-500 transition-colors"
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {/* BARRA LATERAL */}
      <nav className={`
        fixed top-2 h-full w-64 bg-white/95 shadow-2xl z-40 transition-all duration-300 ease-in-out overflow-y-auto
        ${isOpen ? 'left-0' : '-left-64'}
      `}>
        <ul
          className="h-full p-4 bg-center bg-cover bg-no-repeat space-y-2 pt-16"
          style={{ backgroundImage: "url('/src/assets/jupa.png')" }}
        >
          {/* <MenuItem icon="/src/assets/INICIO.png"    onClick={() => go('/')} /> */}
          <MenuItem icon="/src/assets/TRABAJOS.png"  onClick={() => go('/trabajos')} />
          <MenuItem icon="/src/assets/SOBRE_MI.png"  onClick={() => go('/SobreMi')} />
          <MenuItem icon="/src/assets/CONTACTO.png"  onClick={() => go('/contacto')} />

          {isLoggedIn && isAdmin && (
            <>
              <hr className="border-slate-300 my-2" />
              {/* <MenuItem icon="/src/assets/galeria.png"  onClick={() => go('/obras')} /> */}
              <MenuItem icon="/src/assets/usuario.png"  onClick={() => go('/usuarios')} />
              <MenuItem icon="/src/assets/agregar.png"  onClick={() => go('/artic')} />
            </>
          )}

          <hr className="border-slate-300 my-2" />

          {!isLoggedIn ? (
            <>
              <MenuItem icon="/src/assets/INICIAR_SE.png"   onClick={() => go('/login')} />
              <MenuItem icon="/src/assets/REGISTRARSE.png"  onClick={() => go('/registrarse')} />
            </>
          ) : (
            <MenuItem icon="/src/assets/CERRARSE.png" onClick={handleLogout} />
          )}
        </ul>
      </nav>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30"
          onClick={toggleMenu}
        />
      )}
    </>
  );
}

function MenuItem({ icon, onClick }) {
  return (
    <li
      onClick={onClick}
      className="h-16 bg-white/30 bg-center bg-no-repeat bg-contain cursor-pointer hover:bg-white/50 transition-all rounded-md"
      style={{ backgroundImage: `url('${icon}')` }}
    />
  );
}
