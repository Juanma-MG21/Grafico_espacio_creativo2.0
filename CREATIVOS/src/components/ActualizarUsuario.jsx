import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const API = "http://localhost:5000";

export default function ActualizarUsuario() {
  const { id } = useParams();
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [form,     setForm]     = useState(null);
  const [mensaje,  setMensaje]  = useState({ texto: "", tipo: "" });
  const [loading,  setLoading]  = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    fetch(`${API}/api/usuario/${id}`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => { setForm(data); setFetching(false); })
      .catch(() => setFetching(false));
  }, [id, authLoading]);

  if (authLoading || fetching) return (
    <div className="min-h-screen bg-[#0c0b0a] flex items-center justify-center">
      <div className="w-8 h-8 border border-white/20 border-t-white/70 rounded-full animate-spin" />
    </div>
  );

  if (!isAdmin) return (
    <div className="min-h-screen bg-[#0c0b0a] flex items-center justify-center">
      <p className="text-white/40 text-sm" style={{ fontFamily: "DM Mono, monospace" }}>
        Acceso restringido
      </p>
    </div>
  );

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje({ texto: "", tipo: "" });

    try {
      const res = await fetch(`${API}/api/actualizar_usuario/${id}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await res.json();
      if (result.ok) {
        setMensaje({ texto: "Usuario actualizado correctamente", tipo: "success" });
        setTimeout(() => navigate("/usuarios"), 900);
      } else {
        setMensaje({ texto: result.error || "Error al actualizar", tipo: "error" });
      }
    } catch {
      setMensaje({ texto: "Error de conexión", tipo: "error" });
    }
    setLoading(false);
  };

  const inputCls = "w-full p-3 text-white placeholder:text-white/20 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:outline-none transition-all";

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=DM+Mono:wght@300&display=swap');`}</style>

      <section className="min-h-screen bg-[#0c0b0a] px-6 md:px-14 pt-24 pb-20">
        <div className="max-w-lg mx-auto">

          <div className="mb-10 border-b border-white/8 pb-6">
            <h1 className="text-4xl font-black tracking-tighter text-white/90 uppercase"
                style={{ fontFamily: "Cinzel, serif" }}>
              Actualizar Usuario
            </h1>
          </div>

          {mensaje.texto && (
            <div className={`mb-6 p-3 rounded-xl text-sm font-semibold ${
              mensaje.tipo === "success" ? "bg-green-900/40 text-green-400" : "bg-red-900/40 text-red-400"
            }`}>
              {mensaje.texto}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {[
              { name: "nombre",    label: "Nombre",             type: "text" },
              { name: "apellido",  label: "Apellido",           type: "text" },
              { name: "telefono",  label: "Teléfono",           type: "text" },
              { name: "email",     label: "Correo electrónico", type: "email" },
              { name: "contrasena",label: "Nueva contraseña",   type: "password" },
            ].map(({ name, label, type }) => (
              <div key={name} className="flex flex-col gap-1.5">
                <label className="text-white/40 text-[11px] uppercase tracking-wider"
                       style={{ fontFamily: "DM Mono, monospace" }}>{label}</label>
                <input
                  type={type} name={name}
                  value={name === "contrasena" ? (form?.[name] || "") : (form?.[name] || "")}
                  placeholder={name === "contrasena" ? "Dejar vacío para no cambiar" : ""}
                  onChange={handleChange}
                  className={inputCls}
                  required={name !== "contrasena"}
                />
              </div>
            ))}

            {/* Rol */}
            <div className="flex flex-col gap-1.5">
              <label className="text-white/40 text-[11px] uppercase tracking-wider"
                     style={{ fontFamily: "DM Mono, monospace" }}>Rol</label>
              <select name="rol" value={form?.rol ?? 0} onChange={handleChange}
                      className={inputCls + " bg-[#1a1a18]"}>
                <option value={0}>Usuario</option>
                <option value={1}>Administrador</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit" disabled={loading}
                className="flex-1 py-3 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold rounded-xl transition-all active:scale-95"
              >
                {loading ? "Guardando..." : "Actualizar"}
              </button>
              <button
                type="button" onClick={() => navigate("/usuarios")}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white/60 rounded-xl transition-all"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
