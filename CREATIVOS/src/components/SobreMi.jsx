const SKILLS = [
  { name: "CorelDraw",  img: "/src/assets/icon_corel.png" },
  { name: "Photoshop",  img: "/src/assets/icon_photoshop.png" },
  { name: "Word",       img: "/src/assets/icon_word.png" },
  { name: "Excel",      img: "/src/assets/icon_excel.png" },
];

export default function SobreMi() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=DM+Mono:wght@300&family=Libre+Baskerville:ital,wght@0,400;1,400&display=swap');
        .diagonal-line {
          position: absolute;
          left: -5%;
          width: 110%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.07) 30%, rgba(255,255,255,0.07) 70%, transparent);
          transform: rotate(-2deg);
          pointer-events: none;
        }
      `}</style>

      <div className="bg-[#0c0b0a] min-h-screen text-white">
        <section className="relative max-w-7xl mx-auto px-6 md:px-16 pt-24 pb-20 flex flex-col md:flex-row gap-12 md:gap-20 items-start">
          <div className="diagonal-line" style={{ top: "60%" }} />

          {/* Foto */}
          <div className="w-full md:w-2/5 shrink-0">
            <div className="relative overflow-hidden rounded-2xl">
              <img
                src="/src/assets/yo.png"
                alt="Juan Pablo Medina"
                className="w-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                style={{ aspectRatio: "4/5" }}
              />
              {/* Overlay — bg-gradient-to-t corregido */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
          </div>

          {/* Texto */}
          <div className="flex flex-col justify-end md:pt-16 gap-6">
            <p
              className="text-white/30 text-[10px] uppercase tracking-[0.4em]"
              style={{ fontFamily: "DM Mono, monospace" }}
            >
              Diseñador Gráfico · Bogotá, CO
            </p>

            <h1
              className="text-5xl md:text-6xl font-black leading-tight tracking-tight text-white"
              style={{ fontFamily: "Cinzel, serif" }}
            >
              Juan Pablo<br />
              <span className="text-white/40">Medina Hende</span>
            </h1>

            <p
              className="text-white/55 text-base md:text-lg leading-relaxed max-w-md"
              style={{ fontFamily: "Libre Baskerville, serif", fontStyle: "italic" }}
            >
              Autónomo y creativo, con formación en diseño gráfico y dominio de
              CorelDraw y Photoshop. En búsqueda de forjar piezas digitales y 3D
              que expresen imagen corporativa dinámica y con determinación.
            </p>

            {/* Skills */}
            <div className="flex flex-wrap gap-4 pt-4 border-t border-white/8">
              {SKILLS.map((s) => (
                <div key={s.name} className="flex items-center gap-2 group">
                  <img
                    src={s.img} alt={s.name}
                    className="w-7 h-7 object-contain opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                  />
                  <span
                    className="text-white/30 text-[10px] uppercase tracking-wider group-hover:text-white/60 transition-colors duration-300"
                    style={{ fontFamily: "DM Mono, monospace" }}
                  >
                    {s.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
