import { createContext, useContext, useEffect, useState } from "react";
import { getMe, signout, getToken } from "../services/api";
import { useNavigate, useLocation } from "react-router-dom";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      const token = getToken();
      if (!token) {
        setUser(null);
        setLoading(false);
        if (location.pathname !== "/") {
          navigate("/");
        }
        return;
      }

      try {
        const data = await getMe();
        if (data) {
          setUser(data);
        } else {
          throw new Error("Invalid user data");
        }
      } catch (err) {
        // Token expired or invalid
        console.error("Auth Error:", err);
        signout();
        setUser(null);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate, location.pathname]);

  const logout = () => {
    signout();
    setUser(null);
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
