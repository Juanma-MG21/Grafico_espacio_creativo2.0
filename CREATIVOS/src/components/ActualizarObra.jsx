import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const API = "http://localhost:5000";
const MAX_MB = 5 * 1024 * 1024;

export default function ActualizarObra() {
  const { id } = useParams();
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [obra,         setObra]         = useState(null);
  const [secundarias,  setSecundarias]  = useState([]);
  const [eliminar,     setEliminar]     = useState([]); // ids a eliminar
  const [nuevasImgs,   setNuevasImgs]   = useState([]);
  const [nuevaPrinc,   setNuevaPrinc]   = useState(null);
  const [mensaje,      setMensaje]      = useState({ texto: "", tipo: "" });
  const [loading,      setLoading]      = useState(false);
  const [fetching,     setFetching]     = useState(true);

  useEffect(() => {
    if (!isAdmin && !authLoading) return;
    fetch(`${API}/api/obra/${id}`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        setObra(data.obra);
        setSecundarias(data.secundarias || []);
        setFetching(false);
      })
      .catch(() => setFetching(false));
  }, [id, isAdmin, authLoading]);

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

  const toggleEliminar = (imgId) =>
    setEliminar((prev) =>
      prev.includes(imgId) ? prev.filter((i) => i !== imgId) : [...prev, imgId]
    );

  const handleChange = (e) =>
    setObra({ ...obra, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (nuevaPrinc && nuevaPrinc.size > MAX_MB)
      return setMensaje({ texto: "La imagen principal supera 5MB", tipo: "error" });
    for (const img of nuevasImgs)
      if (img.size > MAX_MB)
        return setMensaje({ texto: `"${img.name}" supera 5MB`, tipo: "error" });

    setLoading(true);
    const data = new FormData();
    ["titulo","descripcion","materiales","medidas_largo","medidas_ancho","medidas_alto"]
      .forEach((k) => data.append(k, obra[k] ?? ""));
    if (eliminar.length) data.append("eliminar_secundarias", eliminar.join(","));
    if (nuevaPrinc) data.append("imagen_principal", nuevaPrinc);
    nuevasImgs.forEach((f) => data.append("nuevas_secundarias", f));

    try {
      const res = await fetch(`${API}/api/actualizar/${id}`, {
        method: "POST", credentials: "include", body: data,
      });
      const result = await res.json();
      if (result.ok) {
        setMensaje({ texto: "Obra actualizada correctamente", tipo: "success" });
        setTimeout(() => navigate("/obras"), 900);
      } else {
        setMensaje({ texto: result.error || "Error al actualizar", tipo: "error" });
      }
    } catch {
      setMensaje({ texto: "Error de conexión", tipo: "error" });
    }
    setLoading(false);
  };

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=DM+Mono:wght@300&display=swap');`}</style>

      <section className="min-h-screen bg-[#0c0b0a] px-6 md:px-14 pt-24 pb-20">
        <div className="max-w-2xl mx-auto">

          <div className="mb-10 border-b border-white/8 pb-6">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white/90 uppercase"
                style={{ fontFamily: "Cinzel, serif" }}>
              Actualizar Obra
            </h1>
          </div>

          {mensaje.texto && (
            <div className={`mb-6 p-3 rounded-xl text-sm font-semibold ${
              mensaje.tipo === "success" ? "bg-green-900/40 text-green-400" : "bg-red-900/40 text-red-400"
            }`}>
              {mensaje.texto}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {[
              { name: "titulo",       label: "Título",      required: true },
              { name: "materiales",   label: "Materiales",  required: false },
            ].map(({ name, label, required }) => (
              <div key={name} className="flex flex-col gap-1.5">
                <label className="text-white/40 text-[11px] uppercase tracking-wider"
                       style={{ fontFamily: "DM Mono, monospace" }}>{label}</label>
                <input
                  name={name} required={required} value={obra?.[name] || ""}
                  onChange={handleChange}
                  className="w-full p-3 text-white bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:outline-none transition-all"
                />
              </div>
            ))}

            <div className="flex flex-col gap-1.5">
              <label className="text-white/40 text-[11px] uppercase tracking-wider"
                     style={{ fontFamily: "DM Mono, monospace" }}>Descripción</label>
              <textarea
                name="descripcion" rows={4} required value={obra?.descripcion || ""}
                onChange={handleChange}
                className="w-full p-3 text-white bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:outline-none transition-all resize-none"
              />
            </div>

            {/* Dimensiones */}
            <div>
              <label className="block text-white/40 text-[11px] uppercase tracking-wider mb-2"
                     style={{ fontFamily: "DM Mono, monospace" }}>Dimensiones (cm)</label>
              <div className="grid grid-cols-3 gap-3">
                {["medidas_largo","medidas_ancho","medidas_alto"].map((name) => (
                  <input
                    key={name} type="number" step="0.01" name={name}
                    placeholder={name.split("_")[1].charAt(0).toUpperCase() + name.split("_")[1].slice(1)}
                    value={obra?.[name] || ""} onChange={handleChange}
                    className="w-full p-3 text-white placeholder:text-white/20 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:outline-none transition-all"
                  />
                ))}
              </div>
            </div>

            {/* Imagen principal actual */}
            {obra?.imagen_principal && (
              <div className="flex flex-col gap-2">
                <label className="text-white/40 text-[11px] uppercase tracking-wider"
                       style={{ fontFamily: "DM Mono, monospace" }}>Imagen principal actual</label>
                <img
                  src={`${API}/static/uploads/${obra.imagen_principal}`}
                  alt="actual" className="w-40 h-40 object-cover rounded-xl border border-white/10"
                />
              </div>
            )}

            {/* Nueva imagen principal */}
            <div className="flex flex-col gap-1.5">
              <label className="text-white/40 text-[11px] uppercase tracking-wider"
                     style={{ fontFamily: "DM Mono, monospace" }}>Nueva imagen principal (opcional)</label>
              <input
                type="file" accept="image/*"
                onChange={(e) => setNuevaPrinc(e.target.files[0])}
                className="text-white/50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-orange-500 file:text-white file:text-xs file:cursor-pointer hover:file:bg-orange-400"
              />
            </div>

            {/* Imágenes secundarias actuales */}
            {secundarias.length > 0 && (
              <div className="flex flex-col gap-2">
                <label className="text-white/40 text-[11px] uppercase tracking-wider"
                       style={{ fontFamily: "DM Mono, monospace" }}>
                  Imágenes secundarias — click para marcar eliminación
                </label>
                <div className="flex flex-wrap gap-3">
                  {secundarias.map((img) => (
                    <div
                      key={img.id}
                      onClick={() => toggleEliminar(img.id)}
                      className="relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-200"
                      style={{ borderColor: eliminar.includes(img.id) ? "rgb(239,68,68)" : "transparent" }}
                    >
                      <img
                        src={`${API}/static/uploads/secundarias/${img.imagen_url}`}
                        className="w-20 h-20 object-cover"
                      />
                      {eliminar.includes(img.id) && (
                        <div className="absolute inset-0 bg-red-500/50 flex items-center justify-center">
                          <span className="text-white text-xl">✕</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {eliminar.length > 0 && (
                  <p className="text-red-400/70 text-[10px]" style={{ fontFamily: "DM Mono, monospace" }}>
                    {eliminar.length} imagen(es) marcada(s) para eliminar
                  </p>
                )}
              </div>
            )}

            {/* Nuevas secundarias */}
            <div className="flex flex-col gap-1.5">
              <label className="text-white/40 text-[11px] uppercase tracking-wider"
                     style={{ fontFamily: "DM Mono, monospace" }}>Agregar nuevas imágenes secundarias</label>
              <input
                type="file" accept="image/*" multiple
                onChange={(e) => setNuevasImgs(Array.from(e.target.files))}
                className="text-white/50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white/10 file:text-white file:text-xs file:cursor-pointer hover:file:bg-white/20"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit" disabled={loading}
                className="flex-1 py-3 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold rounded-xl transition-all active:scale-95"
              >
                {loading ? "Guardando..." : "Actualizar Obra"}
              </button>
              <button
                type="button" onClick={() => navigate("/obras")}
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
