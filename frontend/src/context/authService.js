import api from "../services/api";

/*
 * Login user
 */
const login = async (email, password) => {
  try {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    const data = response.data;

    if (data.token) {
      localStorage.setItem(
        "skinsense_token",
        data.token
      );
    }

    if (data.user) {
      localStorage.setItem(
        "skinsense_user",
        JSON.stringify(data.user)
      );
    }

    return data;
  } catch (error) {
    throw getErrorMessage(
      error,
      "Login failed. Please check your credentials."
    );
  }
};

/*
 * Register new user
 */
const signup = async (userData) => {
  try {
    const response = await api.post(
      "/auth/register",
      userData
    );

    const data = response.data;

    if (data.token) {
      localStorage.setItem(
        "skinsense_token",
        data.token
      );
    }

    if (data.user) {
      localStorage.setItem(
        "skinsense_user",
        JSON.stringify(data.user)
      );
    }

    return data;
  } catch (error) {
    throw getErrorMessage(
      error,
      "Registration failed. Please try again."
    );
  }
};

/*
 * Logout user
 */
const logout = () => {
  localStorage.removeItem("skinsense_token");
  localStorage.removeItem("skinsense_user");
};

/*
 * Get currently logged-in user
 */
const getCurrentUser = () => {
  const user = localStorage.getItem(
    "skinsense_user"
  );

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch (error) {
    localStorage.removeItem("skinsense_user");
    return null;
  }
};

/*
 * Get stored authentication token
 */
const getToken = () => {
  return localStorage.getItem(
    "skinsense_token"
  );
};

/*
 * Check whether user is logged in
 */
const isAuthenticated = () => {
  return Boolean(
    localStorage.getItem("skinsense_token")
  );
};

/*
 * Get logged-in user's profile from backend
 */
const getProfile = async () => {
  try {
    const currentUser = getCurrentUser();
    const response = await api.get("/profile", {
      params: { user_id: currentUser?.id },
    });

    const data = response.data;

    if (data.user) {
      localStorage.setItem(
        "skinsense_user",
        JSON.stringify(data.user)
      );
    }

    return data;
  } catch (error) {
    throw getErrorMessage(
      error,
      "Unable to retrieve user information."
    );
  }
};

/*
 * Change password
 */
const changePassword = async (
  currentPassword,
  newPassword
) => {
  try {
    const response = await api.put(
      "/auth/change-password",
      {
        current_password: currentPassword,
        new_password: newPassword,
      }
    );

    return response.data;
  } catch (error) {
    throw getErrorMessage(
      error,
      "Unable to change password."
    );
  }
};

/*
 * Clear authentication data
 */
const clearAuth = () => {
  localStorage.removeItem("skinsense_token");
  localStorage.removeItem("skinsense_user");
};

/*
 * Common error handler
 */
const getErrorMessage = (
  error,
  defaultMessage
) => {
  if (error.response?.data?.message) {
    return new Error(
      error.response.data.message
    );
  }

  if (error.response?.data?.error) {
    return new Error(
      error.response.data.error
    );
  }

  if (error.message) {
    return new Error(error.message);
  }

  return new Error(defaultMessage);
};

const authService = {
  login,
  signup,
  logout,
  getCurrentUser,
  getToken,
  isAuthenticated,
  getProfile,
  changePassword,
  clearAuth,
};

export default authService;