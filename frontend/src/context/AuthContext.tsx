import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from "react";
import { api } from  '../helpers/apiClient/apiClient';

type User = {
  id: string;
};

type AuthContextType = {
  user: User | null;
  isLoading:boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

type Props = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: Props) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const isAuthenticated = !!user;

  useEffect(() => {


    if (window.location.pathname === "/login") {
    setIsLoading(false);
    return;
  }
    const initAuth = async () => {
      debugger;
      try {
        
        const res = await api.get("/auth/me");
        setUser(res.data.user);
        
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);


  const login = async (email: string, password: string) => {
    const res = await api.post("/auth/login", { email, password });
    setUser(res.data.user);
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};