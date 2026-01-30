import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type SignupFormData = z.infer<typeof signupSchema>;

export const otpSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().length(6, 'OTP must be 6 digits'),
});

export type OtpFormData = z.infer<typeof otpSchema>;

export const onboardingSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  mobile_number: z.string().optional(),
  education_level: z.string().min(1, 'Education level is required'),
  major: z.string().min(1, 'Major is required'),
  graduation_year: z.coerce.number().min(2000, 'Invalid year').max(new Date().getFullYear() + 10, 'Invalid year'),
  ielts_score: z.coerce.number().min(0).max(9).optional(),
  toefl_score: z.coerce.number().min(0).max(120).optional(),
  sop_status: z.string().optional(),
  lor_status: z.string().optional(),
  target_degree: z.string().min(1, 'Target degree is required'),
  target_field: z.string().min(1, 'Target field is required'),
  target_country: z.string().min(1, 'Target country is required'),
  budget_range: z.string().min(1, 'Budget range is required'),
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;

export const profileEditSchema = z.object({
  first_name: z.string().min(1, 'First name is required').optional(),
  last_name: z.string().min(1, 'Last name is required').optional(),
  mobile_number: z.string().optional(),
  education_level: z.string().min(1, 'Education level is required').optional(),
  major: z.string().min(1, 'Major is required').optional(),
  graduation_year: z.coerce.number().min(2000, 'Invalid year').max(new Date().getFullYear() + 10, 'Invalid year').optional(),
  ielts_score: z.coerce.number().min(0).max(9).optional(),
  toefl_score: z.coerce.number().min(0).max(120).optional(),
  sop_status: z.string().optional(),
  lor_status: z.string().optional(),
  target_degree: z.string().min(1, 'Target degree is required').optional(),
  target_field: z.string().min(1, 'Target field is required').optional(),
  target_country: z.string().min(1, 'Target country is required').optional(),
  budget_range: z.string().min(1, 'Budget range is required').optional(),
});

export type ProfileEditData = z.infer<typeof profileEditSchema>;

export const profileUpdateSchema = z.object({
  education_level: z.string().optional(),
  major: z.string().optional(),
  target_degree: z.string().optional(),
});

export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;

