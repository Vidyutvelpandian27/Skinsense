const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

const resolveImageUrl = (imageUrl) => {
  if (!imageUrl) {
    return null;
  }

  return imageUrl.startsWith("http")
    ? imageUrl
    : `${API_ORIGIN}${imageUrl}`;
};
import api from "./api";

const validateImage = (file) => {
  if (!file) {
    return {
      valid: false,
      message: "Please select a facial image before analyzing.",
    };
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      message: "Only JPG, PNG, and WEBP images are allowed.",
    };
  }

  if (file.size > 5 * 1024 * 1024) {
    return {
      valid: false,
      message: "Image size must be 5 MB or less.",
    };
  }

  return { valid: true, message: "Image is valid." };
};

const analyzeImage = async (imageFile, userId = null) => {
  try {
    const validation = validateImage(imageFile);

    if (!validation.valid) {
      throw new Error(validation.message);
    }

    const currentUser = JSON.parse(
      localStorage.getItem("skinsense_user") || "null"
    );

    const resolvedUserId = userId ?? currentUser?.id;

    if (!resolvedUserId) {
      throw new Error("User ID is required for skin analysis.");
    }

    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("user_id", String(resolvedUserId));

    const response = await api.post("/analysis", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    throw getErrorMessage(
      error,
      "Unable to analyze the image. Please try again."
    );
  }
};

const getAnalysis = async (analysisId) => {
  try {
    if (!analysisId) {
      throw new Error("Analysis ID is required.");
    }

    const response = await api.get(`/analysis/${analysisId}`);
    return response.data;
  } catch (error) {
    throw getErrorMessage(
      error,
      "Unable to retrieve the analysis."
    );
  }
};

const formatAnalysisResult = (response) => {
  const analysis = response?.analysis ?? response?.data ?? response ?? {};

  if (!analysis || typeof analysis !== "object") {
    return {};
  }

  return {
    id: analysis.id ?? analysis.analysis_id ?? null,
    analysisId: analysis.id ?? analysis.analysis_id ?? null,
    userId: analysis.user_id ?? analysis.userId ?? null,
    imagePath: analysis.image_path ?? analysis.imagePath ?? null,
    imageUrl: resolveImageUrl(analysis.image_url ?? analysis.imageUrl),
    annotatedImageUrl: resolveImageUrl(
      analysis.annotated_image_url ?? analysis.annotatedImageUrl
    ),
    parameterImages: Object.fromEntries(
      Object.entries(
        analysis.parameter_image_urls ?? analysis.parameterImages ?? {}
      ).map(([key, value]) => [key, resolveImageUrl(value)])
    ),
    overallScore:
      analysis.overall_score ?? analysis.overallScore ?? null,
    scoreCategory:
      analysis.score_category ?? analysis.scoreCategory ?? null,
    skinType: analysis.skin_type ?? analysis.skinType ?? "Unknown",
    imageQualityScore:
      analysis.image_quality_score ?? analysis.imageQualityScore ?? null,
    analysisStatus:
      analysis.analysis_status ?? analysis.analysisStatus ?? "Completed",
    parameters: analysis.parameters ?? {},
    concerns: analysis.concerns ?? [],
    recommendations: (analysis.recommendations ?? []).map((item) => ({
      ...item,
      concern: item.concern ?? item.concern_name ?? "",
    })),
    createdAt: analysis.created_at ?? analysis.createdAt ?? null,
    updatedAt: analysis.updated_at ?? analysis.updatedAt ?? null,
  };
};

const getErrorMessage = (error, defaultMessage) => {
  if (error.response?.data?.message) {
    return new Error(error.response.data.message);
  }

  if (error.response?.data?.error) {
    return new Error(error.response.data.error);
  }

  if (error.message) {
    return new Error(error.message);
  }

  return new Error(defaultMessage);
};

const analysisService = {
  validateImage,
  analyzeImage,
  getAnalysis,
  formatAnalysisResult,
};

export default analysisService;