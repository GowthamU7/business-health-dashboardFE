import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export const analyzeBusiness = async (payload) => {
  const response = await axios.post(`${API_BASE}/analyze`, payload);
  return response.data;
};

export const analyzeBusinessFile = async ({ file, assumptions }) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("growth_rate_adjustment", assumptions.growth_rate_adjustment);
  formData.append("owner_salary_adjustment", assumptions.owner_salary_adjustment);
  formData.append("cost_structure_adjustment", assumptions.cost_structure_adjustment);

  const response = await axios.post(`${API_BASE}/analyze-file`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};