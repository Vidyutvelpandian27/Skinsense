import { useContext } from "react";
import SkinAnalysisContext from "../services/SkinAnalysisContext";

const useSkinAnalysis = () => {
  const context = useContext(
    SkinAnalysisContext
  );

  if (!context) {
    throw new Error(
      "useSkinAnalysis must be used inside SkinAnalysisProvider."
    );
  }

  return context;
};

export default useSkinAnalysis;