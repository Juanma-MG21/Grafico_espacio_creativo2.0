export default function Hero() {
  return (
    <section className="flex flex-col items-center justify-center py-20 px-6  from-white to-slate-100">
      <div className="max-w-4xl text-center">
        <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tight mb-6">
          Crea tu <span className="text-indigo-600">Realidad</span>
        </h1>
        <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto">
          Estamos migrando el contenido de tu proyecto antiguo a una interfaz 
          ultra rápida y reactiva. ¿Qué sección quieres construir ahora?
        </p>
        <div className="flex gap-4 justify-center">
          <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl">
            Ver Proyectos
          </button>
          <button className="border-2 border-slate-200 text-slate-900 px-8 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all">
            Saber más
          </button>
        </div>
      </div>
    </section>
  );
}
