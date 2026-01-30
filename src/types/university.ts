// University types for the frontend

export interface University {
  id: string;
  name: string;
  country: string;
  degree: string;
  field: string;
  estimated_tuition: string;
  difficulty: string;
  is_shortlisted: boolean;
  web_pages?: string[];
  domains?: string[];
  budget_min?: number;
  budget_max?: number;
}

export interface UniversityResponse {
  count: number;
  universities: University[];
  cached: boolean;
  source?: string;
}

export interface UniversityFilters {
  search: string;
  country: string;
  difficulty: string;
  budgetRange: string;
}

export const UNIVERSITY_COUNTRIES = [
  { value: 'All Countries', label: 'All Countries' },
  { value: 'Canada', label: 'Canada' },
  { value: 'United States', label: 'United States' },
  { value: 'United Kingdom', label: 'United Kingdom' },
  { value: 'Australia', label: 'Australia' },
  { value: 'Germany', label: 'Germany' },
  { value: 'France', label: 'France' },
  { value: 'India', label: 'India' },
  { value: 'China', label: 'China' },
  { value: 'Japan', label: 'Japan' },
  { value: 'Singapore', label: 'Singapore' },
  { value: 'Netherlands', label: 'Netherlands' },
  { value: 'Sweden', label: 'Sweden' },
  { value: 'Switzerland', label: 'Switzerland' },
  { value: 'Ireland', label: 'Ireland' },
  { value: 'New Zealand', label: 'New Zealand' },
];

export const DIFFICULTY_LEVELS = [
  { value: 'All Difficulty', label: 'All Difficulty' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
];

export const BUDGET_RANGES = [
  { value: 'All Budgets', label: 'All Budgets' },
  { value: '0-20000', label: 'Under $20,000' },
  { value: '20000-40000', label: '$20,000 - $40,000' },
  { value: '40000-60000', label: '$40,000 - $60,000' },
  { value: '60000+', label: 'Over $60,000' },
];

export const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'LOW':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'MEDIUM':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'HIGH':
      return 'bg-red-100 text-red-700 border-red-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

export const formatBudget = (min: number, max: number): string => {
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(num);
  };

  if (min === 0 && max === 0) {
    return 'Contact for pricing';
  }
  return `${formatNumber(min)} - ${formatNumber(max)}`;
};

