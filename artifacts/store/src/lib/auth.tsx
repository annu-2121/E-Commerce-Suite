import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@workspace/api-client-react";
import { getMe } from "@workspace/api-client-react";
import { queryClient } from "./queryClient";
import { getGetMeQueryKey } from "@workspace/api-client-react";

interface AuthContextType {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          // Manually fetch user bypassing react-query hook to handle global setup
          const userData = await getMe();
          setUser(userData);
          queryClient.setQueryData(getGetMeQueryKey(), userData);
        } catch (error) {
          console.error("Failed to restore session:", error);
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    }
    loadUser();
  }, [token]);

  const setAuth = (newUser: User, newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(newUser);
    queryClient.setQueryData(getGetMeQueryKey(), newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    queryClient.clear();
  };

  return (
    <AuthContext.Provider value={{ user, token, setAuth, logout: handleLogout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
