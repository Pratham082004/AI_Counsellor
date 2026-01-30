import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

export interface OnboardingPayload {
  education_level: string;
  major: string;
  graduation_year: number;
  target_degree: string;
  target_field: string;
  target_country: string;
  budget_range: string;
}

export async function completeOnboarding(payload: OnboardingPayload) {
  const token = localStorage.getItem("access_token");

  const response = await axios.post(
    `${API_BASE_URL}/onboarding/complete`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}
