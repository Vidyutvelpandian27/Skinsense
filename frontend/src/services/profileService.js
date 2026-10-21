import api from "./api";

/*
 * Get current user's profile
 */
const getProfile = async () => {
  try {
    const response = await api.get(
      "/profile"
    );

    return response.data;
  } catch (error) {
    throw getErrorMessage(
      error,
      "Unable to retrieve your profile."
    );
  }
};

/*
 * Update current user's profile
 */
const updateProfile = async (profileData) => {
  try {
    if (!profileData) {
      throw new Error(
        "Profile information is required."
      );
    }

    const response = await api.put(
      "/profile",
      profileData
    );

    return response.data;
  } catch (error) {
    throw getErrorMessage(
      error,
      "Unable to update your profile."
    );
  }
};

/*
 * Upload profile picture
 */
const uploadProfileImage = async (imageFile) => {
  try {
    if (!imageFile) {
      throw new Error(
        "Please select a profile image."
      );
    }

    const formData = new FormData();

    formData.append(
      "profile_image",
      imageFile
    );

    const response = await api.post(
      "/profile/image",
      formData,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    throw getErrorMessage(
      error,
      "Unable to upload profile image."
    );
  }
};

/*
 * Delete profile picture
 */
const deleteProfileImage = async () => {
  try {
    const response = await api.delete(
      "/profile/image"
    );

    return response.data;
  } catch (error) {
    throw getErrorMessage(
      error,
      "Unable to remove profile image."
    );
  }
};

/*
 * Update user's name
 */
const updateName = async (name) => {
  try {
    if (!name || !name.trim()) {
      throw new Error(
        "Name cannot be empty."
      );
    }

    const response = await api.put(
      "/profile/name",
      {
        name: name.trim(),
      }
    );

    return response.data;
  } catch (error) {
    throw getErrorMessage(
      error,
      "Unable to update your name."
    );
  }
};

/*
 * Update user's email
 */
const updateEmail = async (email) => {
  try {
    if (!email || !email.trim()) {
      throw new Error(
        "Email cannot be empty."
      );
    }

    const response = await api.put(
      "/profile/email",
      {
        email: email.trim(),
      }
    );

    return response.data;
  } catch (error) {
    throw getErrorMessage(
      error,
      "Unable to update your email."
    );
  }
};

/*
 * Get basic profile statistics
 */
const getProfileStats = async () => {
  try {
    const response = await api.get(
      "/profile/stats"
    );

    return response.data;
  } catch (error) {
    throw getErrorMessage(
      error,
      "Unable to retrieve profile statistics."
    );
  }
};

/*
 * Format profile data for the frontend
 */
const formatProfile = (profile) => {
  if (!profile) {
    return null;
  }

  return {
    id:
      profile.id ||
      profile.user_id ||
      null,

    name:
      profile.name ||
      profile.full_name ||
      "",

    email:
      profile.email ||
      "",

    profileImage:
      profile.profile_image ||
      profile.profile_image_url ||
      null,

    createdAt:
      profile.created_at ||
      null,

    totalAnalyses:
      profile.total_analyses ??
      0,

    latestScore:
      profile.latest_score ??
      0,
  };
};

/*
 * Common API error handler
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

const profileService = {
  getProfile,
  updateProfile,
  uploadProfileImage,
  deleteProfileImage,
  updateName,
  updateEmail,
  getProfileStats,
  formatProfile,
};

export default profileService;