import { useEffect, useRef } from "react";

function DustCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const COUNT = 55;
    const dots = Array.from({ length: COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.2 + 0.3,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      o: Math.random() * 0.35 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dots.forEach((d) => {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0) d.x = canvas.width;
        if (d.x > canvas.width) d.x = 0;
        if (d.y < 0) d.y = canvas.height;
        if (d.y > canvas.height) d.y = 0;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(252, 248, 238, " + d.o + ")";
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}

function TextSlider() {
  const text = "CONTÁCTANOS";
  const items = Array(12).fill(text);

  return (
    <div className="w-full overflow-hidden">
      <div className="flex w-max animate-[slide_18s_linear_infinite]">
        {items.map((t, i) => (
          <span
            key={i}
            className="text-[64px] md:text-[90px] font-black mx-8 md:mx-14 select-none"
            style={{
              fontFamily: "Londrina Shadow, cursive",
              color: i % 2 === 0 ? "rgba(252,248,238,0.85)" : "transparent",
              WebkitTextStroke: i % 2 !== 0 ? "1.5px rgba(252,248,238,0.3)" : "none",
            }}
          >
            {t}
          </span>
        ))}
      </div>

      <div className="flex w-max animate-[slideRev_22s_linear_infinite] mt-1">
        {items.map((t, i) => (
          <span
            key={i}
            className="text-[38px] md:text-[52px] font-black mx-6 md:mx-10 select-none"
            style={{
              fontFamily: "Londrina Shadow, cursive",
              color: i % 2 !== 0 ? "rgba(252,248,238,0.4)" : "transparent",
              WebkitTextStroke: i % 2 === 0 ? "1px rgba(252,248,238,0.15)" : "none",
            }}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function IconCard({ href, img, label, color }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col items-center gap-3"
    >
      <div
        className="relative w-24 h-24 md:w-28 md:h-28 flex items-center justify-center rounded-2xl transition-all duration-500"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `linear-gradient(135deg, ${color}22, transparent)`,
            border: `1px solid ${color}55`,
          }}
        />
        <img
          src={img}
          alt={label}
          className="w-12 h-12 md:w-14 md:h-14 object-contain relative z-10 transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <span
        className="text-[10px] uppercase tracking-widest text-white/25 group-hover:text-white/60 transition-colors duration-300"
        style={{ fontFamily: "DM Mono, monospace" }}
      >
        {label}
      </span>
    </a>
  );
}

export default function Contacto() {
  return (
    <section className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-[#0c0b0a]">

      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "200px",
        }}
      />

      <DustCanvas />

      <div
        className="absolute pointer-events-none"
        style={{
          top: "18%",
          left: "-5%",
          width: "110%",
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 30%, rgba(255,255,255,0.06) 70%, transparent)",
          transform: "rotate(-4deg)",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: "22%",
          left: "-5%",
          width: "110%",
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.04) 30%, rgba(255,255,255,0.04) 70%, transparent)",
          transform: "rotate(-4deg)",
        }}
      />

      <div className="pt-16 md:pt-24">
        <TextSlider />
      </div>

      <div className="flex-1 flex items-center justify-center px-8">
        <div className="flex flex-wrap justify-center gap-8 md:gap-12">
          <IconCard href="https://www.instagram.com" img="/src/assets/icon_ig.png"       label="Instagram" color="#E1306C" />
          <IconCard href="https://mail.google.com"                             img="/src/assets/icon_gmail.png"    label="Gmail"     color="#EA4335" />
          <IconCard href="https://outlook.live.com"                            img="/src/assets/icon_hotmail.png"  label="Outlook"   color="#0078D4" />
          <IconCard href="https://wa.me"                         img="/src/assets/icon_whatsapp.png" label="WhatsApp"  color="#25D366" />
        </div>
      </div>

      <div className="pb-10 flex flex-col items-center gap-2">
        <p
          className="text-white/15 text-[10px] uppercase tracking-[0.4em]"
          style={{ fontFamily: "DM Mono, monospace" }}
        >
          Bogotá, Colombia
        </p>
      </div>

    </section>
  );
}
