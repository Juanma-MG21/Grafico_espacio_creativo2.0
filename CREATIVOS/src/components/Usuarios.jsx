import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const API = "http://localhost:5000";

export default function Usuarios() {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [mensaje,  setMensaje]  = useState({ texto: "", tipo: "" });

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) { setFetching(false); return; }
    fetch(`${API}/api/usuarios`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => { setUsuarios(data); setFetching(false); })
      .catch(() => setFetching(false));
  }, [isAdmin, authLoading]);

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este usuario?")) return;
    try {
      const r = await fetch(`${API}/api/eliminar_usuario/${id}`, {
        method: "DELETE", credentials: "include",
      });
      const result = await r.json();
      if (result.ok) {
        setUsuarios((prev) => prev.filter((u) => u.id !== id));
        setMensaje({ texto: "Usuario eliminado", tipo: "success" });
      } else {
        setMensaje({ texto: result.error || "Error al eliminar", tipo: "error" });
      }
    } catch {
      setMensaje({ texto: "Error de conexión", tipo: "error" });
    }
  };

  if (authLoading || fetching) return (
    <div className="min-h-screen bg-[#0c0b0a] flex items-center justify-center">
      <div className="w-8 h-8 border border-white/20 border-t-white/70 rounded-full animate-spin" />
    </div>
  );

  if (!isAdmin) return (
    <div className="min-h-screen bg-[#0c0b0a] flex items-center justify-center">
      <p className="text-white/40 text-sm" style={{ fontFamily: "DM Mono, monospace" }}>
        Acceso restringido — solo administradores
      </p>
    </div>
  );

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=DM+Mono:wght@300&display=swap');`}</style>

      <section className="min-h-screen bg-[#0c0b0a] px-6 md:px-14 pt-24 pb-20">

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-white/8 pb-8">
          <h1 className="text-[12vw] md:text-[6vw] font-black leading-none tracking-tighter text-white/90 uppercase"
              style={{ fontFamily: "Cinzel, serif" }}>
            Usuarios
          </h1>
          <p className="text-white/25 text-[10px] uppercase tracking-[0.35em] md:mb-2"
             style={{ fontFamily: "DM Mono, monospace" }}>
            {usuarios.length} registrados
          </p>
        </div>

        {mensaje.texto && (
          <div className={`mb-6 p-3 rounded-xl text-sm font-semibold ${
            mensaje.tipo === "success" ? "bg-green-900/40 text-green-400" : "bg-red-900/40 text-red-400"
          }`}>
            {mensaje.texto}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {usuarios.map((u) => (
            <div key={u.id}
                 className="bg-white/3 border border-white/8 rounded-2xl p-5 flex flex-col gap-3">

              {/* Info */}
              <div className="flex flex-col gap-1">
                <p className="text-white font-semibold text-base"
                   style={{ fontFamily: "Cinzel, serif" }}>
                  {u.nombre} {u.apellido}
                </p>
                <p className="text-white/35 text-[11px] uppercase tracking-wider"
                   style={{ fontFamily: "DM Mono, monospace" }}>
                  {u.rol === 1 ? "Administrador" : "Usuario"}
                </p>
              </div>

              <div className="flex flex-col gap-1 text-[11px] text-white/40"
                   style={{ fontFamily: "DM Mono, monospace" }}>
                <span>{u.email}</span>
                {u.telefono && <span>{u.telefono}</span>}
                <span className="text-white/20">ID: {u.id}</span>
              </div>

              {/* Acciones */}
              <div className="flex gap-2 mt-auto pt-3 border-t border-white/6">
                <button
                  onClick={() => navigate(`/actualizar_usuario/${u.id}`)}
                  className="flex-1 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-white text-xs font-semibold transition-colors"
                  style={{ fontFamily: "DM Mono, monospace" }}
                >
                  Editar
                </button>
                <button
                  onClick={() => handleEliminar(u.id)}
                  className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-colors"
                  style={{ fontFamily: "DM Mono, monospace" }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
