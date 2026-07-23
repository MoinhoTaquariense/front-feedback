"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

type Papel = "RH_MASTER" | "GESTOR_SETOR" | "OPERADOR_RH";

interface AuthContextType {
  token: string | null;
  papel: Papel | null;
  sessionReady: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function papelDoToken(token: string | null): Papel | null {
  if (!token) return null;
  try {
    const payload = token.split(".")[1]?.replace(/-/g, "+").replace(/_/g, "/");
    if (!payload) return null;
    const dados = JSON.parse(
      atob(payload.padEnd(Math.ceil(payload.length / 4) * 4, "=")),
    );
    return ["RH_MASTER", "GESTOR_SETOR", "OPERADOR_RH"].includes(dados.papel)
      ? dados.papel
      : null;
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [papel, setPapel] = useState<Papel | null>(null);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        setToken(storedToken);
        setPapel(papelDoToken(storedToken));
      }
    } finally {
      setSessionReady(true);
    }
  }, []);

  const login = async (email: string, senha: string) => {
    // Usar a rota API do Next.js como proxy
    const apiUrl = "/api/auth/login";
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });
    const response = await res.json().catch(() => ({}));
    if (!res.ok || !response.success) {
      throw new Error(response.message || "Não foi possível realizar o login.");
    }
    const token = response.token || (response.data && response.data.token);
    if (token) {
      setToken(token);
      setPapel(papelDoToken(token));
      localStorage.setItem("token", token);
    } else {
      throw new Error("A resposta de login não trouxe uma sessão válida.");
    }
  };

  const logout = () => {
    setToken(null);
    setPapel(null);
    localStorage.removeItem("token");
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider value={{ token, papel, sessionReady, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
