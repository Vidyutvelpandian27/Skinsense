import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import authService from "./authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /*
   * Check existing login session
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser =
          authService.getCurrentUser();

        const authenticated =
          authService.isAuthenticated();

        if (authenticated && storedUser) {
          setUser(storedUser);

          try {
            const response = await authService.getProfile();
            const refreshedUser = response.profile || response.user;

            if (refreshedUser) {
              setUser(refreshedUser);
              localStorage.setItem(
                "skinsense_user",
                JSON.stringify(refreshedUser)
              );
            }
          } catch (profileError) {
            console.warn("Unable to refresh the current user:", profileError);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error(
          "Authentication initialization failed:",
          error
        );

        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /*
   * Login
   */
  const login = async (email, password) => {
    setLoading(true);

    try {
      const response =
        await authService.login(
          email,
          password
        );

      const loggedInUser =
        response.user ||
        authService.getCurrentUser();

      setUser(loggedInUser);

      return response;
    } finally {
      setLoading(false);
    }
  };

  /*
   * Signup
   */
  const signup = async (userData) => {
    setLoading(true);

    try {
      const response =
        await authService.signup(
          userData
        );

      const registeredUser =
        response.user ||
        authService.getCurrentUser();

      if (registeredUser) {
        setUser(registeredUser);
      }

      return response;
    } finally {
      setLoading(false);
    }
  };

  /*
   * Logout
   */
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  /*
   * Refresh user information
   */
  const refreshUser = async () => {
    try {
      const response =
        await authService.getProfile();

      const updatedUser =
        response.user ||
        response.profile;

      if (updatedUser) {
        setUser(updatedUser);

        localStorage.setItem(
          "skinsense_user",
          JSON.stringify(updatedUser)
        );
      }

      return updatedUser;
    } catch (error) {
      console.error(
        "Unable to refresh user:",
        error
      );

      return null;
    }
  };

  /*
   * Check authentication status
   */
  const isAuthenticated = () =>
    Boolean(user || authService.isAuthenticated());

  const value = {
    user,
    setUser,
    loading,
    login,
    signup,
    logout,
    refreshUser,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/*
 * Custom hook
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
};

export default AuthContext;