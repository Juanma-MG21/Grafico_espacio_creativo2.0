import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Registrarse() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [formData, setFormData] = useState({
    nombre: '', apellido: '', telefono: '', email: '', contrasena: ''
  });
  const [mensaje,  setMensaje]  = useState({ texto: '', tipo: '' });
  const [loading,  setLoading]  = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje({ texto: '', tipo: '' });

    const result = await register(formData);

    if (result.ok) {
      setMensaje({ texto: 'Usuario registrado correctamente', tipo: 'success' });
      setTimeout(() => navigate('/login'), 1000);
    } else {
      setMensaje({ texto: result.error || 'Error al registrar', tipo: 'error' });
    }
    setLoading(false);
  };

  return (
    <section className="min-h-screen bg-[#0c0b0a] flex items-center justify-center py-20 px-4">
      <div className="bg-[#111110] p-8 md:p-10 rounded-2xl shadow-xl w-full max-w-md border border-white/8">

        <h2 className="text-2xl font-bold text-center text-white mb-8 uppercase tracking-tight"
            style={{ fontFamily: 'Cinzel, serif' }}>
          Registro de Usuario
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
          {[
            { name: 'nombre',     placeholder: 'Nombre',              type: 'text',     required: true },
            { name: 'apellido',   placeholder: 'Apellido',            type: 'text',     required: true },
            { name: 'telefono',   placeholder: 'Teléfono',            type: 'text',     required: false },
            { name: 'email',      placeholder: 'Correo electrónico',  type: 'email',    required: true },
            { name: 'contrasena', placeholder: 'Contraseña',          type: 'password', required: true },
          ].map(({ name, placeholder, type, required }) => (
            <input
              key={name}
              type={type} name={name} placeholder={placeholder} required={required}
              className="w-full p-3 text-white placeholder:text-white/30 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:outline-none transition-all"
              onChange={handleChange}
            />
          ))}

          <button
            type="submit" disabled={loading}
            className="w-full py-3 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold rounded-xl transition-all active:scale-95"
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <a href="/login" className="text-orange-400 hover:text-orange-300 text-sm font-medium transition-colors">
            ¿Ya tienes cuenta? Inicia sesión
          </a>
        </div>
      </div>
    </section>
  );
}
