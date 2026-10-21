import api from "./api";

/*
 * Get all products
 */
const getProducts = async (params = {}) => {
  try {
    const response = await api.get(
      "/products",
      {
        params,
      }
    );

    return response.data;
  } catch (error) {
    throw getErrorMessage(
      error,
      "Unable to retrieve products."
    );
  }
};

const createProduct = async (product) => {
  try {
    const response = await api.post("/products", product);
    return response.data;
  } catch (error) {
    throw getErrorMessage(error, "Unable to add product.");
  }
};

const updateProductImage = async (productId, imageUrl) => {
  try {
    const response = await api.put(`/products/${productId}`, { image_url: imageUrl });
    return response.data;
  } catch (error) {
    throw getErrorMessage(error, "Unable to update product image.");
  }
};

/*
 * Get a single product
 */
const getProduct = async (productId) => {
  try {
    if (!productId) {
      throw new Error("Product ID is required.");
    }

    const response = await api.get(
      `/products/${productId}`
    );

    return response.data;
  } catch (error) {
    throw getErrorMessage(
      error,
      "Unable to retrieve the product."
    );
  }
};

/*
 * Search products
 */
const searchProducts = async (searchTerm) => {
  try {
    const response = await api.get(
      "/products/search",
      {
        params: {
          q: searchTerm,
        },
      }
    );

    return response.data;
  } catch (error) {
    throw getErrorMessage(
      error,
      "Unable to search products."
    );
  }
};

/*
 * Get products for a specific skin concern
 */
const getProductsByConcern = async (
  concern
) => {
  try {
    if (!concern) {
      throw new Error(
        "Skin concern is required."
      );
    }

    const response = await api.get(
      "/products/concern",
      {
        params: {
          concern,
        },
      }
    );

    return response.data;
  } catch (error) {
    throw getErrorMessage(
      error,
      "Unable to retrieve products for this concern."
    );
  }
};

/*
 * Get products for a specific skin type
 */
const getProductsBySkinType = async (
  skinType
) => {
  try {
    if (!skinType) {
      throw new Error(
        "Skin type is required."
      );
    }

    const response = await api.get(
      "/products/skin-type",
      {
        params: {
          skin_type: skinType,
        },
      }
    );

    return response.data;
  } catch (error) {
    throw getErrorMessage(
      error,
      "Unable to retrieve products for this skin type."
    );
  }
};

/*
 * Get recommended products from an analysis
 */
const getRecommendedProducts = async (
  analysisId
) => {
  try {
    if (!analysisId) {
      throw new Error(
        "Analysis ID is required."
      );
    }

    const response = await api.get(
      `/products/recommended/${analysisId}`
    );

    return response.data;
  } catch (error) {
    throw getErrorMessage(
      error,
      "Unable to retrieve recommended products."
    );
  }
};

/*
 * Format product data for ProductCard.jsx
 */
const formatProduct = (product) => {
  if (!product) {
    return null;
  }

  return {
    id:
      product.id ||
      product.product_id ||
      null,

    name:
      product.name ||
      product.product_name ||
      "Skincare Product",

    brand:
      product.brand ||
      "",

    description:
      product.description ||
      "",

    ingredients:
      product.ingredients ||
      "",

    category:
      product.category ||
      "Skincare",

    price:
      product.price ??
      null,

    image:
      product.image ||
      product.image_url ||
      null,

    productUrl:
      product.product_url ||
      product.url ||
      null,

    concern:
      product.concern ||
      product.concern_name ||
      null,

    skinType:
      product.skin_type ||
      null,
  };
};

/*
 * Format multiple products
 */
const formatProducts = (products) => {
  if (!Array.isArray(products)) {
    return [];
  }

  return products
    .map(formatProduct)
    .filter(Boolean);
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

const productService = {
  getProducts,
  createProduct,
  updateProductImage,
  getProduct,
  searchProducts,
  getProductsByConcern,
  getProductsBySkinType,
  getRecommendedProducts,
  formatProduct,
  formatProducts,
};

export default productService;