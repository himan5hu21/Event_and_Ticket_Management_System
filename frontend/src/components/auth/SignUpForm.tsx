"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AxiosError } from "axios";
import { Eye, EyeOff, Mail, User, Building, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useRegister } from "@/hooks/api/auth";
import { useLoader } from "@/hooks/useLoader";
import { RegisterSchema, RegisterData } from "@/lib/schemas";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SignUpForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const registerMutation = useRegister();
  const { toast } = useToast();
  const { showLoader, hideLoader } = useLoader();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegisterData>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      role: "customer" as const,
    },
  });

  const selectedRole = watch("role");

  const onSubmit: SubmitHandler<RegisterData> = async (data: RegisterData) => {
    registerMutation.mutate(data, {
      onSuccess: (response) => {
        if (response.success) {
          router.push("/auth/signin?message=Registration successful! Please sign in.");
        }
      },
      onError: (error: Error) => {
        console.error("Registration error:", error);
        const axiosError = error as AxiosError<{ message: string }>;
        if (axiosError?.response?.data?.message) {
          toast({
            title: "Registration Failed",
            description: axiosError.response.data.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Registration Failed",
            description: "An unexpected error occurred. Please try again.",
            variant: "destructive",
          });
        }
      },
    });
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Join Eventify to discover amazing events and manage your tickets
        </p>
      </div>

      <div className="grid gap-6">
        {/* Name Field */}
        <div className="grid gap-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Full Name
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              className={cn(
                "pl-10",
                errors.name && "border-destructive focus-visible:ring-destructive"
              )}
              {...register("name")}
            />
          </div>
          {errors.name && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {errors.name.message}
            </div>
          )}
        </div>

        {/* Email Field */}
        <div className="grid gap-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              className={cn(
                "pl-10",
                errors.email && "border-destructive focus-visible:ring-destructive"
              )}
              {...register("email")}
            />
          </div>
          {errors.email && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {errors.email.message}
            </div>
          )}
        </div>

        {/* Password Field */}
        <div className="grid gap-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              className={cn(
                "pr-10",
                errors.password && "border-destructive focus-visible:ring-destructive"
              )}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {errors.password.message}
            </div>
          )}
        </div>

        {/* Role Selection */}
        <div className="grid gap-2">
          <Label htmlFor="role" className="text-sm font-medium">
            Account Type
          </Label>
          <Select
            value={selectedRole}
            onValueChange={(value: "customer" | "admin" | "event-manager") => setValue("role", value)}
          >
            <SelectTrigger className={cn(errors.role && "border-destructive")}>
              <SelectValue placeholder="Select your account type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="customer">Customer - Browse and book events</SelectItem>
              <SelectItem value="event-manager">Event Manager - Create and manage events</SelectItem>
            </SelectContent>
          </Select>
          {errors.role && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {errors.role.message}
            </div>
          )}
        </div>

        {/* Organization Field (for Event Managers) */}
        {selectedRole === "event-manager" && (
          <div className="grid gap-2">
            <Label htmlFor="organization" className="text-sm font-medium">
              Organization Name
            </Label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="organization"
                type="text"
                placeholder="Enter your organization name"
                className={cn(
                  "pl-10",
                  errors.organization && "border-destructive focus-visible:ring-destructive"
                )}
                {...register("organization")}
              />
            </div>
            {errors.organization && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {errors.organization.message}
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {registerMutation.isError && (
          <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
            <AlertCircle className="h-4 w-4" />
            {(registerMutation.error as AxiosError<{ message: string }>)?.response?.data?.message || "Registration failed. Please try again."}
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Creating Account...
            </div>
          ) : (
            "Create Account"
          )}
        </Button>

        {/* Terms and Privacy */}
        <p className="text-xs text-muted-foreground text-center">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-foreground">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-foreground">
            Privacy Policy
          </Link>
        </p>
      </div>

      {/* Sign In Link */}
      <div className="text-center text-sm">
        Already have an account?{" "}
        <Link href="/auth/signin" className="underline underline-offset-4 hover:text-foreground">
          Sign in
        </Link>
      </div>
    </form>
  );
}
