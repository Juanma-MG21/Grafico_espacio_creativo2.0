import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const API = "http://localhost:5000";

const CATEGORIAS = [
  { value: "1", label: "Armas" },
  { value: "2", label: "Publicidad" },
  { value: "3", label: "Aerógrafo" },
  { value: "4", label: "Imantados" },
  { value: "5", label: "Metalmecánica" },
  { value: "6", label: "Esculturas" },
];

const MAX_MB = 5 * 1024 * 1024;

export default function AgregarObra() {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm]       = useState({
    titulo: "", descripcion: "", materiales: "",
    medidas_largo: "", medidas_ancho: "", medidas_alto: "",
    categoria: "",
  });
  const [imgPrincipal,   setImgPrincipal]   = useState(null);
  const [imgSecundarias, setImgSecundarias] = useState([]);
  const [mensaje,  setMensaje]  = useState({ texto: "", tipo: "" });
  const [loading,  setLoading]  = useState(false);

  if (authLoading) return null;
  if (!isAdmin) return (
    <div className="min-h-screen bg-[#0c0b0a] flex items-center justify-center">
      <p className="text-white/40 text-sm" style={{ fontFamily: "DM Mono, monospace" }}>
        Acceso restringido — solo administradores
      </p>
    </div>
  );

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar tamaño de imágenes
    if (imgPrincipal && imgPrincipal.size > MAX_MB)
      return setMensaje({ texto: "La imagen principal supera 5MB", tipo: "error" });
    for (const img of imgSecundarias)
      if (img.size > MAX_MB)
        return setMensaje({ texto: `"${img.name}" supera 5MB`, tipo: "error" });

    setLoading(true);
    setMensaje({ texto: "", tipo: "" });

    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    if (imgPrincipal) data.append("imagen_principal", imgPrincipal);
    imgSecundarias.forEach((f) => data.append("imagenes_secundarias", f));

    try {
      const res = await fetch(`${API}/api/artic`, {
        method: "POST",
        credentials: "include",
        body: data,
      });
      const result = await res.json();
      if (result.ok) {
        setMensaje({ texto: "Obra agregada correctamente", tipo: "success" });
        setTimeout(() => navigate("/obras"), 900);
      } else {
        setMensaje({ texto: result.error || "Error al agregar", tipo: "error" });
      }
    } catch {
      setMensaje({ texto: "Error de conexión con el servidor", tipo: "error" });
    }
    setLoading(false);
  };

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=DM+Mono:wght@300&display=swap');`}</style>

      <section className="min-h-screen bg-[#0c0b0a] px-6 md:px-14 pt-24 pb-20">
        <div className="max-w-2xl mx-auto">

          {/* Encabezado */}
          <div className="mb-10 border-b border-white/8 pb-6">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white/90 uppercase"
                style={{ fontFamily: "Cinzel, serif" }}>
              Agregar Obra
            </h1>
          </div>

          {/* Mensaje */}
          {mensaje.texto && (
            <div className={`mb-6 p-3 rounded-xl text-sm font-semibold ${
              mensaje.tipo === "success"
                ? "bg-green-900/40 text-green-400"
                : "bg-red-900/40 text-red-400"
            }`}>
              {mensaje.texto}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            <Field label="Título" required>
              <input name="titulo" required value={form.titulo} onChange={handleChange} />
            </Field>

            <Field label="Descripción" required>
              <textarea name="descripcion" required rows={4} value={form.descripcion} onChange={handleChange} />
            </Field>

            <Field label="Materiales">
              <input name="materiales" value={form.materiales} onChange={handleChange} />
            </Field>

            {/* Dimensiones */}
            <div>
              <label className="block text-white/40 text-[11px] uppercase tracking-wider mb-2"
                     style={{ fontFamily: "DM Mono, monospace" }}>
                Dimensiones (cm)
              </label>
              <div className="grid grid-cols-3 gap-3">
                {["medidas_largo", "medidas_ancho", "medidas_alto"].map((name) => (
                  <input
                    key={name}
                    type="number" step="0.01" name={name}
                    placeholder={name.split("_")[1].charAt(0).toUpperCase() + name.split("_")[1].slice(1)}
                    value={form[name]} onChange={handleChange}
                    className={inputCls}
                  />
                ))}
              </div>
            </div>

            <Field label="Imagen principal *">
              <input
                type="file" accept="image/*" required
                onChange={(e) => setImgPrincipal(e.target.files[0])}
                className="text-white/50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-orange-500 file:text-white file:text-xs file:cursor-pointer hover:file:bg-orange-400"
              />
            </Field>

            <Field label="Imágenes secundarias">
              <input
                type="file" accept="image/*" multiple
                onChange={(e) => setImgSecundarias(Array.from(e.target.files))}
                className="text-white/50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white/10 file:text-white file:text-xs file:cursor-pointer hover:file:bg-white/20"
              />
              {imgSecundarias.length > 0 && (
                <p className="text-white/30 text-[10px] mt-1" style={{ fontFamily: "DM Mono, monospace" }}>
                  {imgSecundarias.length} archivo(s) seleccionado(s)
                </p>
              )}
            </Field>

            <Field label="Categoría" required>
              <select name="categoria" required value={form.categoria} onChange={handleChange}
                      className={inputCls + " bg-[#1a1a18]"}>
                <option value="" disabled>Seleccione una categoría</option>
                {CATEGORIAS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </Field>

            <div className="flex gap-3 pt-2">
              <button
                type="submit" disabled={loading}
                className="flex-1 py-3 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold rounded-xl transition-all active:scale-95"
              >
                {loading ? "Guardando..." : "Agregar Obra"}
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

const inputCls = "w-full p-3 text-white placeholder:text-white/20 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:outline-none transition-all";

function Field({ label, required, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-white/40 text-[11px] uppercase tracking-wider"
             style={{ fontFamily: "DM Mono, monospace" }}>
        {label}{required && " *"}
      </label>
      {children?.type === "input" || children?.type === "textarea" || children?.type === "select"
        ? (() => {
            const Tag = children.type;
            return <Tag {...children.props} className={(children.props.className || "") + " " + inputCls} />;
          })()
        : children}
    </div>
  );
}
