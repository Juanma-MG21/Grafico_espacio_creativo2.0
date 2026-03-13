import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Intro from './components/Intro';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Contacto from './components/Contacto';
import SobreMi from './components/SobreMi';
import Registrarse from './components/Registrarse';
import Login from './components/Login';
import Galeria from './components/Galeria';
import AgregarObra from './components/AgregarObra';
import ActualizarObra from './components/ActualizarObra';
import Usuarios from './components/Usuarios';
import ActualizarUsuario from './components/ActualizarUsuario';

function Layout() {
  return (
    <div className="min-h-screen bg-[#0c0b0a] text-white">
      <Navbar />
      <main>
        <Routes>
          <Route path="/SobreMi"                          element={<SobreMi />} />
          <Route path="/trabajos"                  element={<Galeria />} />
          <Route path="/contacto"                  element={<Contacto />} />
          <Route path="/login"                     element={<Login />} />
          <Route path="/registrarse"               element={<Registrarse />} />
          <Route path="/artic"                     element={<AgregarObra />} />
          <Route path="/actualizar/:id"            element={<ActualizarObra />} />
          <Route path="/usuarios"                  element={<Usuarios />} />
          <Route path="/actualizar_usuario/:id"    element={<ActualizarUsuario />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <BrowserRouter>
      {showIntro ? (
        <Intro onFinish={() => setShowIntro(false)} />
      ) : (
        <div className="fade-in-web">
          <Layout />
        </div>
      )}
    </BrowserRouter>
  );
}

export default App;
