import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import ObraModal from "./ObraModal";

const API = "http://localhost:5000";

export default function Galeria() {
  const { isAdmin }             = useAuth();
  const [obras, setObras]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch(`${API}/api/obras`, { credentials: "include" })
      .then((r) => {
        if (!r.ok) throw new Error("Error al cargar obras");
        return r.json();
      })
      .then((data) => { setObras(data); setLoading(false); })
      .catch((e)   => { setError(e.message); setLoading(false); });
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar esta obra?")) return;
    try {
      const r = await fetch(`${API}/api/eliminar_obra/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!r.ok) throw new Error("Error al eliminar");
      setObras((prev) => prev.filter((o) => o.id !== id));
      setSelected(null);
    } catch {
      alert("No se pudo eliminar la obra.");
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=DM+Mono:wght@300&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .obra-card { animation: fadeUp 0.5s ease both; }
      `}</style>

      <section className="min-h-screen bg-[#0c0b0a] px-6 md:px-14 pt-24 pb-20">

        {/* Encabezado */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-white/8 pb-8">
          <h1
            className="text-[15vw] md:text-[7vw] font-black leading-none tracking-tighter text-white/90 uppercase"
            style={{ fontFamily: "Cinzel, serif" }}
          >
            Obras
          </h1>
          <p
            className="text-white/25 text-[10px] uppercase tracking-[0.35em] md:mb-2"
            style={{ fontFamily: "DM Mono, monospace" }}
          >
            {obras.length} piezas en total
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border border-white/20 border-t-white/70 rounded-full animate-spin" />
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-center text-red-400/70 text-sm py-20"
             style={{ fontFamily: "DM Mono, monospace" }}>
            {error}
          </p>
        )}

        {/* Grilla */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {obras.map((obra, i) => (
              <GalleryCard
                key={obra.id}
                obra={obra}
                index={i}
                apiBase={API}
                onClick={() => setSelected(obra)}
              />
            ))}
          </div>
        )}
      </section>

      {selected && (
        <ObraModal
          obra={selected}
          apiBase={API}
          isAdmin={isAdmin}
          onClose={() => setSelected(null)}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}

function GalleryCard({ obra, index, apiBase, onClick }) {
  return (
    <div
      className="obra-card group relative overflow-hidden rounded-xl cursor-pointer"
      style={{ animationDelay: `${index * 60}ms`, height: "300px" }}
      onClick={onClick}
    >
      <img
        src={`${apiBase}/static/uploads/${obra.imagen_principal}`}
        alt={obra.titulo}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-5">
        <p className="text-white text-base font-semibold leading-tight"
           style={{ fontFamily: "Cinzel, serif" }}>
          {obra.titulo}
        </p>
        {obra.materiales && (
          <p className="text-white/50 text-[10px] uppercase tracking-wider mt-1"
             style={{ fontFamily: "DM Mono, monospace" }}>
            {obra.materiales}
          </p>
        )}
      </div>
    </div>
  );
}
