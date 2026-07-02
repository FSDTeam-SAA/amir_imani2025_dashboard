import axiosInstance from "./axios-instance";
import type {
  LoginInput,
  RegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  VerifyOtpInput,
  ChangePasswordInput,
  AuthResponse,
  VerifyOtpResponse,
  GenericResponse,
  User,
} from "../types/auth";

export const authService = {
  // Login
  login: async (input: LoginInput): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>(
      "/auth/login",
      input
    );
    return response.data;
  },

  // Register
  register: async (input: RegisterInput): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>(
      "/auth/register",
      input
    );
    return response.data;
  },

  // Verify OTP
  verifyOtp: async (input: VerifyOtpInput): Promise<VerifyOtpResponse> => {
    const response = await axiosInstance.post<VerifyOtpResponse>(
      "/auth/verify-otp",
      input
    );
    return response.data;
  },

  // Forgot Password
  forgotPassword: async (
    input: ForgotPasswordInput
  ): Promise<GenericResponse> => {
    const response = await axiosInstance.post<GenericResponse>(
      "/auth/forgot-password",
      input
    );
    return response.data;
  },

  // Reset Password
  resetPassword: async (
    token: string,
    input: ResetPasswordInput
  ): Promise<GenericResponse> => {
    // Assuming token is passed as a query param or in body.
    // Based on previous code it was in header, but usually reset token is in URL or body.
    // Previous code: Authorization: Bearer ${token}
    // I will follow that pattern if that's what the backend expects for reset password.
    const response = await axiosInstance.post<GenericResponse>(
      "/auth/reset-password",
      input,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  // Change Password
  changePassword: async (
    input: ChangePasswordInput
  ): Promise<GenericResponse> => {
    const response = await axiosInstance.post<GenericResponse>(
      "/auth/change-password",
      input
    );
    return response.data;
  },

  // Get Current User Profile
  getMe: async (): Promise<{ data: User }> => {
    const response = await axiosInstance.get<{ data: User }>("/auth/me");
    return response.data;
  },

  // Get All Users (Admin?)
  getAllUsers: async (): Promise<{ data: User[] }> => {
    const response = await axiosInstance.get<{ data: User[] }>("/users");
    return response.data;
  },

  // Get User Conversation
  getUserConversation: async (userId: string): Promise<{ data: any[] }> => {
    const response = await axiosInstance.get<{ data: any[] }>(
      `/conversations/${userId}`
    );
    return response.data;
  },
};
