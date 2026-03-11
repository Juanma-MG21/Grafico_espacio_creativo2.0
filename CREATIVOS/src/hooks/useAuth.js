import { useState, useEffect, useCallback } from "react";

const API = "http://localhost:5000";

export function useAuth() {
  const [user, setUser]       = useState(null);   // { username, rol, user_id }
  const [loading, setLoading] = useState(true);

  // ── Consultar sesión activa al montar ──
  const checkSession = useCallback(async () => {
    try {
      const res  = await fetch(`${API}/api/session`, { credentials: "include" });
      const data = await res.json();
      setUser(data.logged_in ? data : null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { checkSession(); }, [checkSession]);

  // ── Login ──
  const login = async ({ nombre, email, contrasena }) => {
    const res  = await fetch(`${API}/api/login`, {
      method:      "POST",
      credentials: "include",
      headers:     { "Content-Type": "application/json" },
      body:        JSON.stringify({ nombre, email, contrasena }),
    });
    const data = await res.json();
    if (data.ok) {
      setUser({ logged_in: true, username: data.username, rol: data.rol });
    }
    return data; // { ok, error? }
  };

  // ── Logout ──
  const logout = async () => {
    await fetch(`${API}/api/logout`, { method: "POST", credentials: "include" });
    setUser(null);
  };

  // ── Registro ──
  const register = async ({ nombre, apellido, telefono, email, contrasena }) => {
    const res  = await fetch(`${API}/api/registrarse`, {
      method:      "POST",
      credentials: "include",
      headers:     { "Content-Type": "application/json" },
      body:        JSON.stringify({ nombre, apellido, telefono, email, contrasena }),
    });
    return await res.json(); // { ok, error? }
  };

  return {
    user,                              // objeto con datos del usuario, o null
    loading,                           // true mientras consulta la sesión
    isAdmin:     user?.rol === 1,      // true si es administrador
    isLoggedIn:  !!user?.logged_in,    // true si hay sesión activa
    login,
    logout,
    register,
  };
}
