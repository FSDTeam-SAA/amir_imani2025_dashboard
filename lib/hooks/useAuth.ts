"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/lib/api/auth-service";
import { queryKeys } from "@/lib/query-keys";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type {
  LoginInput,
  RegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  VerifyOtpInput,
  ChangePasswordInput,
  User,
} from "@/lib/types/auth";

// --------------------
// useCurrentUser Hook
// --------------------
export function useCurrentUser() {
  const queryResult = useQuery({
    queryKey: queryKeys.auth.currentUser(),
    queryFn: () => authService.getMe(),
    retry: false,
    // Only fetch if we have a token
    enabled:
      typeof window !== "undefined" && !!localStorage.getItem("authToken"),
  });

  return {
    user: queryResult.data?.data,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
    refetch: queryResult.refetch,
  };
}

// --------------------
// useAuth Hook
// --------------------
export const useAuth = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (input: LoginInput) => authService.login(input),
    onMutate: () => {
      toast.loading("Logging in...", { id: "auth-login" });
    },
    onSuccess: async (res) => {
      if (res.data?.accessToken) {
        localStorage.setItem("authToken", res.data.accessToken);

        // Invalidate and refetch user data
        await queryClient.invalidateQueries({
          queryKey: queryKeys.auth.currentUser(),
        });

        toast.success("Login successful!", { id: "auth-login" });
        router.push("/dashboard");
      }
    },
    onError: (err: any) => {
      const message =
        err.response?.data?.message || err.message || "Login failed";
      toast.error(message, { id: "auth-login" });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (input: RegisterInput) => authService.register(input),
    onMutate: () => {
      toast.loading("Creating account...", { id: "auth-register" });
    },
    onSuccess: async (res) => {
      if (res.data?.accessToken) {
        localStorage.setItem("authToken", res.data.accessToken);

        await queryClient.invalidateQueries({
          queryKey: queryKeys.auth.currentUser(),
        });

        toast.success("Account created successfully!", { id: "auth-register" });
        router.push("/dashboard");
      }
    },
    onError: (err: any) => {
      const message =
        err.response?.data?.message || err.message || "Registration failed";
      toast.error(message, { id: "auth-register" });
    },
  });

  // Verify OTP mutation
  const verifyOtpMutation = useMutation({
    mutationFn: (input: VerifyOtpInput) => authService.verifyOtp(input),
  });

  // Forgot password mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: (input: ForgotPasswordInput) =>
      authService.forgotPassword(input),
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: ({
      token,
      input,
    }: {
      token: string;
      input: ResetPasswordInput;
    }) => authService.resetPassword(token, input),
    onMutate: () => {
      toast.loading("Resetting password...", { id: "auth-reset-password" });
    },
    onSuccess: () => {
      toast.success("Password reset successfully!", {
        id: "auth-reset-password",
      });
      router.push("/login");
    },
    onError: (err: any) => {
      const message =
        err.response?.data?.message || err.message || "Password reset failed";
      toast.error(message, { id: "auth-reset-password" });
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: (input: ChangePasswordInput) =>
      authService.changePassword(input),
    onMutate: () => {
      toast.loading("Changing password...", { id: "auth-change-password" });
    },
    onSuccess: () => {
      toast.success("Password changed successfully!", {
        id: "auth-change-password",
      });
    },
    onError: (err: any) => {
      const message =
        err.response?.data?.message || err.message || "Password change failed";
      toast.error(message, { id: "auth-change-password" });
    },
  });

  // Logout function
  const logout = () => {
    localStorage.removeItem("authToken");

    // Clear all auth-related queries
    queryClient.removeQueries({ queryKey: queryKeys.auth.all });

    toast.success("Logged out successfully");
    router.push("/login");
  };

  return {
    // Async methods (return promises)
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    verifyOtp: verifyOtpMutation.mutateAsync,
    forgotPassword: forgotPasswordMutation.mutateAsync,
    resetPassword: ({
      token,
      input,
    }: {
      token: string;
      input: ResetPasswordInput;
    }) => resetPasswordMutation.mutateAsync({ token, input }),
    changePassword: changePasswordMutation.mutateAsync,

    // Sync methods (fire and forget)
    loginSync: loginMutation.mutate,
    registerSync: registerMutation.mutate,
    verifyOtpSync: verifyOtpMutation.mutate,
    forgotPasswordSync: forgotPasswordMutation.mutate,
    resetPasswordSync: resetPasswordMutation.mutate,
    changePasswordSync: changePasswordMutation.mutate,

    // Logout
    logout,

    // Loading states
    isLoading:
      loginMutation.isPending ||
      registerMutation.isPending ||
      verifyOtpMutation.isPending ||
      forgotPasswordMutation.isPending ||
      resetPasswordMutation.isPending ||
      changePasswordMutation.isPending,

    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
    isVerifyOtpLoading: verifyOtpMutation.isPending,
    isForgotPasswordLoading: forgotPasswordMutation.isPending,
    isResetPasswordLoading: resetPasswordMutation.isPending,
    isChangePasswordLoading: changePasswordMutation.isPending,

    // Error states
    error:
      loginMutation.error ||
      registerMutation.error ||
      verifyOtpMutation.error ||
      forgotPasswordMutation.error ||
      resetPasswordMutation.error ||
      changePasswordMutation.error,
  };
};

// --------------------
// useAllUsers Hook
// --------------------
export const useAllUsers = () => {
  const queryResult = useQuery({
    queryKey: queryKeys.auth.users(),
    queryFn: () => authService.getAllUsers(),
    // Only fetch if authenticated
    enabled:
      typeof window !== "undefined" && !!localStorage.getItem("authToken"),
  });

  return {
    users: queryResult.data?.data || [],
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
    refetch: queryResult.refetch,
  };
};
