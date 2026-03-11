import { useState, useEffect, useRef } from "react";
import ImageVisor from "./ImageVisor";

export default function ObraModal({ obra, apiBase, isAdmin, onClose, onDelete }) {
  const [thumbnails, setThumbnails] = useState([]);
  const [mainImg, setMainImg]       = useState(`${apiBase}/static/uploads/${obra.imagen_principal}`);
  const [visorOpen, setVisorOpen]   = useState(false);
  const [visorIndex, setVisorIndex] = useState(0);
  const thumbRef                    = useRef(null);

  const allImages = [mainImg, ...thumbnails.filter((t) => t !== mainImg)];

  const medidas =
    obra.medidas_ancho && !String(obra.medidas_ancho).includes("None")
      ? `${obra.medidas_ancho} x ${obra.medidas_largo} x ${obra.medidas_alto} cm`
      : null;

  // Cargar imágenes secundarias — ruta API corregida
  useEffect(() => {
    fetch(`${apiBase}/api/imagenes_secundarias/${obra.id}`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        const urls = (data || []).map((src) =>
          src.startsWith("http") ? src : `${apiBase}${src}`
        );
        setThumbnails(urls);
      })
      .catch(() => setThumbnails([]));
  }, [obra.id, apiBase]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const scrollThumbs = (dir) =>
    thumbRef.current?.scrollBy({ left: dir * 150, behavior: "smooth" });

  const openVisor = () => {
    setVisorIndex(allImages.indexOf(mainImg));
    setVisorOpen(true);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=DM+Mono:wght@300&family=Libre+Baskerville:ital@1&display=swap');
        .modal-scroll::-webkit-scrollbar { width: 4px; }
        .modal-scroll::-webkit-scrollbar-track { background: transparent; }
        .modal-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        .thumb-row::-webkit-scrollbar { display: none; }
      `}</style>

      <div
        className="fixed inset-0 z-40 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
        onClick={onClose}
      >
        <div
          className="relative bg-[#111110] rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden shadow-2xl border border-white/6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Cerrar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-orange-500 hover:bg-orange-400 flex items-center justify-center text-white text-lg leading-none transition-colors duration-200"
          >
            ×
          </button>

          {/* Imagen principal */}
          <div
            className="relative md:w-[58%] bg-black flex items-center justify-center overflow-hidden"
            style={{ minHeight: "280px" }}
          >
            <img
              src={mainImg}
              alt={obra.titulo}
              className="max-w-full max-h-full object-contain"
              style={{ maxHeight: "90vh" }}
            />
            <button
              onClick={openVisor}
              className="absolute top-3 left-3 w-10 h-10 rounded-full bg-orange-500 hover:bg-orange-400 flex items-center justify-center text-white text-base transition-colors duration-200"
              title="Ver ampliado"
            >
              🔍
            </button>
          </div>

          {/* Info */}
          <div className="md:w-[42%] flex flex-col justify-between p-6 modal-scroll overflow-y-auto">
            <div className="flex flex-col gap-4">
              <h2
                className="text-2xl font-black text-white leading-tight"
                style={{ fontFamily: "Cinzel, serif" }}
              >
                {obra.titulo}
              </h2>

              {obra.descripcion && (
                <p
                  className="text-white/55 text-sm leading-relaxed"
                  style={{ fontFamily: "Libre Baskerville, serif", fontStyle: "italic" }}
                >
                  {obra.descripcion}
                </p>
              )}

              <div className="flex flex-col gap-2 mt-1">
                {obra.materiales && (
                  <p className="text-[11px] text-white/40 uppercase tracking-wider"
                     style={{ fontFamily: "DM Mono, monospace" }}>
                    <span className="text-white/25">Materiales — </span>{obra.materiales}
                  </p>
                )}
                {medidas && (
                  <p className="text-[11px] text-white/40 uppercase tracking-wider"
                     style={{ fontFamily: "DM Mono, monospace" }}>
                    <span className="text-white/25">Medidas — </span>{medidas}
                  </p>
                )}
              </div>

              {/* Botones admin */}
              {isAdmin && (
                <div className="flex gap-3 mt-4 flex-wrap">
                  <a
                    href={`/actualizar/${obra.id}`}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold tracking-wide transition-colors duration-200"
                    style={{ fontFamily: "DM Mono, monospace" }}
                  >
                    Actualizar
                  </a>
                  <button
                    onClick={() => onDelete(obra.id)}
                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold tracking-wide transition-colors duration-200"
                    style={{ fontFamily: "DM Mono, monospace" }}
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {thumbnails.length > 0 && (
              <div className="mt-6">
                <div className="relative flex items-center gap-2">
                  {thumbnails.length > 4 && (
                    <button
                      onClick={() => scrollThumbs(-1)}
                      className="shrink-0 w-7 h-7 rounded-full bg-orange-500 hover:bg-orange-400 text-white text-xs flex items-center justify-center transition-colors"
                    >‹</button>
                  )}
                  <div ref={thumbRef} className="thumb-row flex gap-2 overflow-x-auto flex-1">
                    {thumbnails.map((src, i) => (
                      <img
                        key={i} src={src} alt=""
                        onClick={() => setMainImg(src)}
                        className="shrink-0 w-14 h-14 object-cover rounded-lg cursor-pointer border-2 transition-all duration-200 hover:scale-105"
                        style={{ borderColor: mainImg === src ? "rgb(249,115,22)" : "transparent" }}
                      />
                    ))}
                  </div>
                  {thumbnails.length > 4 && (
                    <button
                      onClick={() => scrollThumbs(1)}
                      className="shrink-0 w-7 h-7 rounded-full bg-orange-500 hover:bg-orange-400 text-white text-xs flex items-center justify-center transition-colors"
                    >›</button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {visorOpen && (
        <ImageVisor
          images={allImages}
          initialIndex={visorIndex}
          onClose={() => setVisorOpen(false)}
        />
      )}
    </>
  );
}
