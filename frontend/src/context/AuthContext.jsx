import {
  createContext,
  useContext,
  useState,
} from "react";
import API from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({
  children,
}) => {
  const normalizeToken = (rawToken) => {
    if (!rawToken || typeof rawToken !== "string") {
      return "";
    }
    return rawToken.trim().replace(/^"|"$/g, "").replace(/^Bearer\s+/i, "").trim();
  };

  const storeTokens = (accessToken, refreshToken) => {
    const normalizedAccessToken = normalizeToken(accessToken);
    const normalizedRefreshToken = normalizeToken(refreshToken);

    localStorage.setItem("token", normalizedAccessToken);
    if (normalizedRefreshToken) {
      localStorage.setItem("refresh_token", normalizedRefreshToken);
    }

    if (normalizedAccessToken) {
      API.defaults.headers.common["Authorization"] = `Bearer ${normalizedAccessToken}`;
    }
  };

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");

    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = (userData, token) => {
    setUser(userData);

    localStorage.setItem(
      "user",
      JSON.stringify(userData)
    );

    storeTokens(token?.token || token, token?.refresh_token);
  };

  const updateUser = (nextUser) => {
    setUser((currentUser) => {
      const updatedUser = typeof nextUser === "function"
        ? nextUser(currentUser)
        : { ...currentUser, ...nextUser };

      localStorage.setItem("user", JSON.stringify(updatedUser));

      return updatedUser;
    });
  };

  const logout = () => {
    setUser(null);

    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    delete API.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);