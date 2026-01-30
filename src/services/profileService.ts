import apiClient from "./apiClient";

export const getProfile = async () => {
  const res = await apiClient.get("/auth/me");
  return res.data;
};

export const updateProfile = async (profileData: any) => {
  const res = await apiClient.put("/profile", profileData);
  return res.data;
};

export const getDashboardData = async () => {
  const res = await apiClient.get("/dashboard");
  return res.data;
};
