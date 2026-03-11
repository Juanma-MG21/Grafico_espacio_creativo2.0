import { useState, useRef, useEffect, useCallback } from "react";

export default function ImageVisor({ images, initialIndex = 0, onClose }) {
  const [index, setIndex]       = useState(initialIndex);
  const [scale, setScale]       = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const isDragging               = useRef(false);
  const dragStart                = useRef({ x: 0, y: 0 });
  const imgRef                   = useRef(null);

  const MIN_SCALE = 1;
  const MAX_SCALE = 4;

  const resetZoom = useCallback(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, []);

  const goNext = useCallback(() => {
    resetZoom();
    setIndex((i) => (i + 1) % images.length);
  }, [images.length, resetZoom]);

  const goPrev = useCallback(() => {
    resetZoom();
    setIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length, resetZoom]);

  // Teclado
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape")      onClose();
      if (e.key === "ArrowRight")  goNext();
      if (e.key === "ArrowLeft")   goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, goNext, goPrev]);

  // Zoom con rueda
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.2 : -0.2;
    setScale((s) => {
      const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, s + delta));
      if (next === MIN_SCALE) setTranslate({ x: 0, y: 0 });
      return next;
    });
  };

  // Arrastre
  const onMouseDown = (e) => {
    if (scale <= 1) return;
    isDragging.current = true;
    dragStart.current = {
      x: e.clientX - translate.x,
      y: e.clientY - translate.y,
    };
  };
  const onMouseMove = (e) => {
    if (!isDragging.current) return;
    setTranslate({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };
  const onMouseUp = () => { isDragging.current = false; };

  const zoomIn  = () => setScale((s) => Math.min(MAX_SCALE, +(s + 0.3).toFixed(1)));
  const zoomOut = () => {
    setScale((s) => {
      const next = Math.max(MIN_SCALE, +(s - 0.3).toFixed(1));
      if (next <= 1) setTranslate({ x: 0, y: 0 });
      return next;
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {/* Cerrar */}
      <button
        onClick={onClose}
        className="absolute top-5 right-6 text-white/50 hover:text-white text-4xl leading-none z-10 transition-colors"
      >
        ×
      </button>

      {/* Flecha izquierda */}
      {images.length > 1 && (
        <button
          onClick={goPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-black/40 hover:bg-orange-500 text-white text-2xl flex items-center justify-center transition-colors duration-200"
        >
          ‹
        </button>
      )}

      {/* Imagen */}
      <div
        className="relative w-full h-full flex items-center justify-center overflow-hidden"
        onWheel={handleWheel}
        style={{ cursor: scale > 1 ? "grab" : "default" }}
      >
        <img
          ref={imgRef}
          src={images[index]}
          alt=""
          onMouseDown={onMouseDown}
          draggable={false}
          className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg select-none transition-transform duration-150"
          style={{
            transform: `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)`,
            cursor: scale > 1 ? (isDragging.current ? "grabbing" : "grab") : "default",
          }}
        />
      </div>

      {/* Flecha derecha */}
      {images.length > 1 && (
        <button
          onClick={goNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-black/40 hover:bg-orange-500 text-white text-2xl flex items-center justify-center transition-colors duration-200"
        >
          ›
        </button>
      )}

      {/* Controles de zoom */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {[
          { label: "+", action: zoomIn },
          { label: "−", action: zoomOut },
          { label: "Reset", action: resetZoom },
        ].map(({ label, action }) => (
          <button
            key={label}
            onClick={action}
            className="px-4 py-2 rounded-lg bg-[#222] hover:bg-[#333] text-white text-sm transition-colors duration-200"
            style={{ fontFamily: "DM Mono, monospace", minWidth: "48px" }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Contador */}
      {images.length > 1 && (
        <p
          className="absolute bottom-6 right-6 text-white/25 text-[10px] uppercase tracking-wider"
          style={{ fontFamily: "DM Mono, monospace" }}
        >
          {index + 1} / {images.length}
        </p>
      )}
    </div>
  );
}
