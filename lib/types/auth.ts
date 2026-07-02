export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  newPassword: string;
  confirmPassword?: string;
}

export interface VerifyOtpInput {
  email: string;
  otp: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    user: User;
    accessToken: string;
    refreshToken?: string;
  };
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  data: {
    resetToken: string;
  };
}

export interface GenericResponse {
  success: boolean;
  message: string;
}
