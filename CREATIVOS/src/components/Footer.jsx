export default function Footer() {
  return (
    <footer 
      className="relative mt-auto w-full text-white text-center py-5 shadow-[0px_-10px_20px_rgba(1,158,255,0.5)] bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('./src/assets/mazo.JPG')" }} 
    >
      {/* Overlay oscuro opcional para que el texto se lea mejor si la imagen es clara */}
      <div className="absolute inset-0 bg-black/50 -z-10"></div>

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row justify-between flex-wrap p-5 w-full gap-8">
          
          {/* Sección Bienvenidos */}
          <div className="flex-1 min-width-[250px] p-5"> 
            <h2 className="text-2xl font-bold mb-2">Bienvenidos</h2>
            <p className="text-slate-200">
              Descubre nuestro contenido exclusivo y explora nuestras categorías.
            </p>
          </div>

          {/* Sección Contacto */}
          <div className="flex-1 min-width-[250px] p-5">
            <h2 className="text-2xl font-bold mb-2">Contacto</h2>
            <p>Email: <a href="mailto:espaciocreativo1979@gmail.com" className="hover:underline">espaciocreativo1979@gmail.com</a></p>
            <p>Tel: +57 3114964343</p>
          </div>
        </div>

        <div>
          <p>© 2025. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
