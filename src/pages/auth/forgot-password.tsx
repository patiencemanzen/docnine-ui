import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, MailCheck } from "@/components/icons";
import { authApi } from "@/lib/api";
import Loader1 from "@/components/ui/loader1";
import { ApiException } from "@/types/ApiTypes";
import { AuthShell } from "@/components/common/auth-shell";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      await authApi.forgotPassword(data.email);
      setIsSuccess(true);
    } catch (err) {
      if (err instanceof ApiException) {
        setError(err.message);
      } else {
        setError("A network error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell>
      {isSuccess ? (
        <div className="space-y-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
            <MailCheck className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-1.5">
            <h1 className="font-display text-[24px] font-semibold tracking-[0.02em] leading-snug text-foreground">
              Check your inbox
            </h1>
            <p className="text-[14px] text-muted-foreground leading-relaxed">
              If an account exists with that email, we've sent a password reset link. It may take a
              minute to arrive.
            </p>
          </div>
          <Button variant="outline" className="w-full h-11 rounded-xl text-[14px]" asChild>
            <Link to="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to sign in
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-7">
          <div className="space-y-1.5">
            <h1 className="font-display text-[24px] font-semibold tracking-[0.02em] leading-snug text-foreground">
              Forgot password?
            </h1>
            <p className="text-[14px] text-muted-foreground">
              Enter your email and we'll send you a reset link.
            </p>
          </div>

          {error && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-[13px] text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[13px] font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                className="h-11 rounded-xl border-border/70 bg-muted/30 text-[14px] focus-visible:ring-1 focus-visible:ring-primary"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-[12px] text-destructive">{errors.email.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-xl text-[14px] font-medium"
              disabled={isLoading}
            >
              {isLoading && <Loader1 className="mr-2 h-4 w-4" />}
              Send reset link
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
      )}
    </AuthShell>
  );
}
