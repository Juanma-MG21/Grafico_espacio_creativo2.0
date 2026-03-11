import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [formData, setFormData] = useState({ nombre: '', email: '', contrasena: '' });
  const [mensaje,  setMensaje]  = useState({ texto: '', tipo: '' });
  const [loading,  setLoading]  = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje({ texto: '', tipo: '' });

    const result = await login(formData);

    if (result.ok) {
      setMensaje({ texto: 'Sesión iniciada correctamente', tipo: 'success' });
      setTimeout(() => navigate('/'), 800);
    } else {
      setMensaje({ texto: result.error || 'Credenciales incorrectas', tipo: 'error' });
    }
    setLoading(false);
  };

  return (
    <section className="min-h-screen bg-[#0c0b0a] flex items-center justify-center py-20 px-4">
      <div className="bg-[#111110] p-8 md:p-10 rounded-2xl shadow-xl w-full max-w-md border border-white/8">

        <h2 className="text-2xl font-bold text-center text-white mb-8 uppercase tracking-tight"
            style={{ fontFamily: 'Cinzel, serif' }}>
          Iniciar Sesión
        </h2>

        {mensaje.texto && (
          <div className={`mb-6 text-center font-bold p-3 rounded-lg text-sm ${
            mensaje.tipo === 'success'
              ? 'bg-green-900/40 text-green-400'
              : 'bg-red-900/40 text-red-400'
          }`}>
            {mensaje.texto}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text" name="nombre" placeholder="Nombre" required
            className="w-full p-3 text-white placeholder:text-white/30 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:outline-none transition-all"
            onChange={handleChange}
          />
          <input
            type="email" name="email" placeholder="Correo electrónico" required
            className="w-full p-3 text-white placeholder:text-white/30 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:outline-none transition-all"
            onChange={handleChange}
          />
          <input
            type="password" name="contrasena" placeholder="Contraseña" required
            className="w-full p-3 text-white placeholder:text-white/30 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:outline-none transition-all"
            onChange={handleChange}
          />

          <button
            type="submit" disabled={loading}
            className="w-full py-3 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold rounded-xl transition-all active:scale-95"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <a href="/registrarse" className="text-orange-400 hover:text-orange-300 text-sm font-medium transition-colors">
            ¿No tienes cuenta? Regístrate
          </a>
        </div>
      </div>
    </section>
  );
}
