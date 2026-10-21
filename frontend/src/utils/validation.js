/*
 * Validate email address
 */
export const isValidEmail = (email) => {
  if (!email) {
    return false;
  }

  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(email.trim());
};

/*
 * Validate password
 */
export const isValidPassword = (password) => {
  if (!password) {
    return false;
  }

  return password.length >= 6;
};

/*
 * Validate name
 */
export const isValidName = (name) => {
  if (!name || !name.trim()) {
    return false;
  }

  return name.trim().length >= 2;
};

/*
 * Validate signup form
 */
export const validateSignup = (formData) => {
  const errors = {};

  if (!isValidName(formData.name)) {
    errors.name =
      "Name must contain at least 2 characters.";
  }

  if (!isValidEmail(formData.email)) {
    errors.email =
      "Please enter a valid email address.";
  }

  if (!isValidPassword(formData.password)) {
    errors.password =
      "Password must contain at least 6 characters.";
  }

  if (
    formData.confirmPassword !==
    formData.password
  ) {
    errors.confirmPassword =
      "Passwords do not match.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/*
 * Validate login form
 */
export const validateLogin = (formData) => {
  const errors = {};

  if (!isValidEmail(formData.email)) {
    errors.email =
      "Please enter a valid email address.";
  }

  if (!formData.password) {
    errors.password =
      "Password is required.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/*
 * Validate image
 */
export const validateImage = (file) => {
  if (!file) {
    return {
      valid: false,
      message: "Please select an image.",
    };
  }

  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      message:
        "Only JPG, JPEG, PNG and WEBP images are supported.",
    };
  }

  const maxSize =
    5 * 1024 * 1024;

  if (file.size > maxSize) {
    return {
      valid: false,
      message:
        "Image size must be less than 5 MB.",
    };
  }

  return {
    valid: true,
    message: "",
  };
};

/*
 * Validate profile information
 */
export const validateProfile = (formData) => {
  const errors = {};

  if (!isValidName(formData.name)) {
    errors.name =
      "Please enter a valid name.";
  }

  if (!isValidEmail(formData.email)) {
    errors.email =
      "Please enter a valid email address.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};