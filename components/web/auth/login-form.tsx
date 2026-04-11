"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { HugeiconsIcon } from '@hugeicons/react';
import { Mail01FreeIcons } from '@hugeicons/core-free-icons';
import { AuthPanelAlert } from "@/components/web/auth/auth-panel-alert";

const CALLBACK_PATH = "/auth/callback";
const DEFAULT_NEXT = "/dashboard";

const inputClassName = cn(
  "flex h-11 w-full appearance-none rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-base text-gray-900 outline-none transition-[border-color,box-shadow]",
  "placeholder:text-gray-400 focus-visible:border-gray-400",
  "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
  "[&:-webkit-autofill]:border-gray-200 [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_rgb(255_255_255)] [&:-webkit-autofill]:[-webkit-text-fill-color:#111827]",
  "[&:-webkit-autofill]:[transition:background-color_99999s_ease-out]",
  "[&:-webkit-autofill:hover]:border-gray-200 [&:-webkit-autofill:focus]:border-gray-400",
  "[&:-moz-autofill]:border-gray-200 [&:-moz-autofill]:bg-white [&:-moz-autofill]:text-gray-900 [&:-moz-autofill:focus]:border-gray-400",
);

const emailMagicLinkButtonClassName =
  "w-full flex items-center justify-center gap-3 rounded-xl bg-gray-900 py-3.5 px-4 text-sm font-medium text-white transition-all hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50";

function buildEmailRedirectUrl(postAuthPath: string) {
  if (typeof window === "undefined") return "";
  const next = encodeURIComponent(postAuthPath);
  return `${window.location.origin}${CALLBACK_PATH}?next=${next}`;
}

export function LoginForm({
  className,
  embedded,
  postAuthPath = DEFAULT_NEXT,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & { embedded?: boolean; postAuthPath?: string }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);
    setSent(false);

    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: buildEmailRedirectUrl(postAuthPath),
          shouldCreateUser: true,
        },
      });
      if (otpError) throw otpError;
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const formBody = (
    <form onSubmit={handleMagicLink} className="space-y-4">
      {embedded ? (
        <p className="text-sm text-gray-600 text-center">
          We&apos;ll email you a one-time sign-in link — no password.
        </p>
      ) : null}

      {error ? (
        <AuthPanelAlert variant="error" onDismiss={() => setError(null)}>
          {error}
        </AuthPanelAlert>
      ) : null}

      {sent ? (
        <AuthPanelAlert variant="success" onDismiss={() => setSent(false)}>
          Check your email — open the link we sent to sign in.
        </AuthPanelAlert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
          Email
        </Label>
        <input
          id="email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClassName}
        />
      </div>

      <button type="submit" className={emailMagicLinkButtonClassName} disabled={isLoading}>
        <HugeiconsIcon icon={Mail01FreeIcons} size={20} className="shrink-0 text-white/70" aria-hidden />
        {isLoading ? "Sending link…" : "Email me a sign-in link"}
      </button>
    </form>
  );

  return (
    <div className={cn("flex flex-col", className)} {...props}>
      {embedded ? (
        formBody
      ) : (
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold text-gray-900">Login</CardTitle>
            <CardDescription className="text-base text-gray-600">
              Enter your email and we&apos;ll send you a magic link to sign in.
            </CardDescription>
          </CardHeader>
          <CardContent>{formBody}</CardContent>
        </Card>
      )}
    </div>
  );
}
