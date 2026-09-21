import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle2, KeyRound } from "@/components/icons";
import { authApi } from "@/lib/api";
import Loader1 from "@/components/ui/loader1";
import { ApiException } from "@/types/ApiTypes";
import { AuthShell } from "@/components/common/auth-shell";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) {
      setError("No reset token found. Please request a new password reset link.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await authApi.resetPassword({
        token,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      setIsSuccess(true);
    } catch (err) {
      if (err instanceof ApiException) {
        if (err.code === "TOKEN_EXPIRED") {
          setError("This reset link has expired. Please request a new one.");
        } else if (err.code === "TOKEN_INVALID") {
          setError("This reset link is invalid or has already been used.");
        } else if (err.code === "VALIDATION_ERROR" && err.fields?.length) {
          setError(err.fields.map((f) => f.message).join(". "));
        } else {
          setError(err.message);
        }
      } else {
        setError("A network error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthShell>
        <div className="space-y-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 border border-destructive/20">
            <KeyRound className="h-5 w-5 text-destructive" />
          </div>
          <div className="space-y-1.5">
            <h1 className="font-display text-[24px] font-semibold tracking-[0.02em] leading-snug text-foreground">
              Invalid link
            </h1>
            <p className="text-[14px] text-muted-foreground">
              This password reset link is missing a token. Please request a new one.
            </p>
          </div>
          <Button className="w-full h-11 rounded-xl text-[14px]" asChild>
            <Link to="/forgot-password">Request reset link</Link>
          </Button>
        </div>
      </AuthShell>
    );
  }

  if (isSuccess) {
    return (
      <AuthShell>
        <div className="space-y-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/10 border border-green-500/20">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </div>
          <div className="space-y-1.5">
            <h1 className="font-display text-[24px] font-semibold tracking-[0.02em] leading-snug text-foreground">
              Password updated
            </h1>
            <p className="text-[14px] text-muted-foreground">
              Your password has been reset. You can now sign in with your new password.
            </p>
          </div>
          <Button
            className="w-full h-11 rounded-xl text-[14px] font-medium"
            onClick={() => navigate("/login")}
          >
            Go to sign in
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div className="space-y-7">
        <div className="space-y-1.5">
          <h1 className="font-display text-[24px] font-semibold tracking-[0.02em] leading-snug text-foreground">
            Set new password
          </h1>
          <p className="text-[14px] text-muted-foreground">
            Choose a strong password for your account.
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-[13px] text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-[13px] font-medium">
              New password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Min. 8 characters"
              className="h-11 rounded-xl border-border/70 bg-muted/30 text-[14px] focus-visible:ring-1 focus-visible:ring-primary"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-[12px] text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-[13px] font-medium">
              Confirm password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Repeat your password"
              className="h-11 rounded-xl border-border/70 bg-muted/30 text-[14px] focus-visible:ring-1 focus-visible:ring-primary"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-[12px] text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-11 rounded-xl text-[14px] font-medium"
            disabled={isLoading}
          >
            {isLoading && <Loader1 className="mr-2 h-4 w-4" />}
            Reset password
          </Button>
        </form>

        <Link
          to="/login"
          className="flex items-center justify-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to sign in
        </Link>
      </div>
    </AuthShell>
  );
}
