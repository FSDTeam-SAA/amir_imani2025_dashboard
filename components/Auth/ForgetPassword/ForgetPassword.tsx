"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/lib/hooks/useAuth";

// ✅ Validation schema
const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export default function ForgetPassword() {
  const { forgotPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: {
      email: "",
    },
  });

  const router = useRouter();

  const onSubmit = async (values: ForgotFormValues) => {
    const toastId = "forgot-password";
    setIsLoading(true);

    try {
      toast.loading("Sending OTP...", { id: toastId });

      await forgotPassword({ email: values.email });

      toast.success("OTP sent! Check your email.", { id: toastId });

      // Store email for verify-otp page
      localStorage.setItem("userEmail", values.email);

      // Use setTimeout to ensure redirect happens after current call stack
      setTimeout(() => {
        router.push(`/verify-otp?mode=forgot`);
      }, 100);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to send OTP";
      toast.error(message, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[756px] shadow-[0px_0px_20px_0px_rgba(0,0,0,0.10)] rounded-[12px] p-10">
      <h2 className="text-3xl md:text-[48px] font-bold leading-[150%] font-playfair text-primary mb-2 font-heading text-center">
        Reset Your Password
      </h2>
      <p className="text-gray-500 mb-6">
        Enter your email address and we'll send you code to reset your password.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[16px] leading-[150%] font-medium text-[#343A40]">
                  Email Address
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    className="h-12 w-full"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit */}
          <Button
            type="submit"
            className="w-full h-10 bg-foreground hover:bg-foreground/50 cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? "Sending OTP..." : "Send OTP"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
