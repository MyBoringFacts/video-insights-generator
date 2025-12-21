"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") || "signup"; // Default to signup

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSignUp, setIsSignUp] = useState(initialMode === "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
      // If already authenticated, redirect to app
      if (user) {
        router.push("/app");
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        router.push("/app");
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setSuccessMessage(null);
    setAuthLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/app`,
          },
        });
        
        if (error) throw error;
        
        // Check if email confirmation is required
        // If user.email_confirmed_at is null, email confirmation is enabled
        // If user exists but email_confirmed_at is set, confirmation was skipped
        if (data.user && !data.user.email_confirmed_at) {
          // Email confirmation is required
          setSuccessMessage(
            "Account created! Please check your email (including spam folder) to confirm your account before signing in."
          );
          setPendingEmail(email); // Store email for resend functionality
        } else if (data.user) {
          // Email confirmation is disabled - user can sign in immediately
          setSuccessMessage(
            "Account created successfully! You can now sign in."
          );
          setPendingEmail(null);
        }
        
        // Clear form
        setEmail("");
        setPassword("");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        // Redirect will happen via auth state change
        router.push("/app");
      }
    } catch (error: any) {
      // Provide more detailed error messages
      let errorMessage = error.message || "An error occurred";
      
      // Handle specific error cases
      if (error.message?.includes("Email not confirmed") || error.message?.includes("email_not_confirmed")) {
        errorMessage = "Please check your email and click the confirmation link before signing in. Check your spam folder if you don't see it.";
        setPendingEmail(email); // Store email for resend functionality
      } else if (error.message?.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password. If you just signed up, make sure you've confirmed your email first.";
      } else if (error.message?.includes("rate limit")) {
        errorMessage = "Too many requests. Please wait a few minutes before trying again.";
      }
      
      setAuthError(errorMessage);
      
      // Log error for debugging (remove in production)
      if (process.env.NODE_ENV === "development") {
        console.error("Auth error:", error);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!pendingEmail) return;
    
    setResendLoading(true);
    setAuthError(null);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: pendingEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/app`,
        },
      });
      
      if (error) throw error;
      
      setSuccessMessage(
        `Confirmation email resent to ${pendingEmail}. Please check your email (including spam folder).`
      );
    } catch (error: any) {
      let errorMessage = error.message || "Failed to resend email";
      
      if (error.message?.includes("rate limit")) {
        errorMessage = "Too many requests. Please wait a few minutes before requesting another email.";
      } else if (error.message?.includes("already confirmed")) {
        errorMessage = "This email is already confirmed. You can sign in now.";
        setPendingEmail(null);
      }
      
      setAuthError(errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setSuccessMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/app`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      setAuthError(error.message || "Failed to sign in with Google");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-linear-to-br from-neutral-950 via-zinc-900 to-neutral-800">
        <div className="text-center">
          <div className="relative mx-auto mb-4 h-16 w-16">
            <div className="absolute inset-0 rounded-full border-4 border-white/10" />
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-emerald-400" />
          </div>
          <p className="text-lg font-semibold text-zinc-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    // Will redirect via useEffect, but show loading state
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-linear-to-br from-neutral-950 via-zinc-900 to-neutral-800 text-zinc-50">
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-emerald-500/30 via-sky-500/20 to-purple-500/30 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-amber-500/20 via-emerald-500/25 to-sky-500/20 blur-3xl" />
      </div>

      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 px-6 py-5 backdrop-blur-sm lg:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-4 transition hover:opacity-80"
          >
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-white/10 to-white/5 ring-1 ring-white/20 backdrop-blur-xl shadow-lg">
              <span className="text-base font-bold tracking-tighter text-zinc-50">
                VI
              </span>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-transparent opacity-50" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-[0.2em] text-zinc-300 uppercase">
                VIDEO INSIGHTS
              </span>
              <span className="text-[10px] tracking-widest text-zinc-500 uppercase">
                Premium Intelligence
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="text-sm text-zinc-400 transition hover:text-zinc-300"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Auth Card */}
          <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] backdrop-blur-2xl">
            <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_top_left,#ffffff15,transparent_50%),radial-gradient(circle_at_bottom_right,#4ade8020,transparent_50%)]" />

            <div className="relative">
              {/* Header */}
              <div className="mb-8 text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-sky-500/20 border border-white/10">
                  <svg
                    className="h-8 w-8 text-emerald-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h1 className="mb-2 text-3xl font-extrabold text-zinc-50">
                  {isSignUp ? "Create Account" : "Welcome Back"}
                </h1>
                <p className="text-sm text-zinc-400">
                  {isSignUp
                    ? "Start analyzing videos and saving your insights"
                    : "Sign in to access your video insights"}
                </p>
              </div>

              {/* Success Message */}
              {successMessage && (
                <div className="mb-6 rounded-xl border border-emerald-400/30 bg-emerald-950/20 p-4 text-sm text-emerald-300">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <svg
                        className="h-5 w-5 shrink-0 text-emerald-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="flex-1">{successMessage}</p>
                    </div>
                    {pendingEmail && (
                      <button
                        onClick={handleResendConfirmation}
                        disabled={resendLoading}
                        className="ml-8 mt-2 text-left text-xs text-emerald-400 underline hover:text-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {resendLoading ? "Sending..." : "Didn't receive the email? Resend confirmation"}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Error Message */}
              {authError && (
                <div className="mb-6 rounded-xl border border-red-400/30 bg-red-950/20 p-4 text-sm text-red-300">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <svg
                        className="h-5 w-5 shrink-0 text-red-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="flex-1">{authError}</p>
                    </div>
                    {pendingEmail && (authError.includes("Email not confirmed") || authError.includes("email_not_confirmed") || authError.includes("confirm")) && (
                      <button
                        onClick={handleResendConfirmation}
                        disabled={resendLoading}
                        className="ml-8 mt-2 text-left text-xs text-red-400 underline hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {resendLoading ? "Sending..." : "Resend confirmation email"}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Google Sign In Button - Disabled for now */}
              {false && (
                <>
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={authLoading}
                    className="group relative mb-4 w-full overflow-hidden rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-semibold text-zinc-100 backdrop-blur-sm transition-all duration-300 hover:border-white/30 hover:bg-white/10 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 to-sky-400/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      <span>Continue with Google</span>
                    </span>
                  </button>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-gradient-to-br from-white/10 to-transparent px-2 text-zinc-500">
                        Or continue with email
                      </span>
                    </div>
                  </div>
                </>
              )}

              {/* Form */}
              <form onSubmit={handleAuth} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-base text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/60 transition"
                    placeholder="your@email.com"
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-base text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/60 transition"
                    placeholder="••••••••"
                    autoComplete={isSignUp ? "new-password" : "current-password"}
                  />
                  {isSignUp && (
                    <p className="mt-2 text-xs text-zinc-500">
                      Password must be at least 6 characters
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="group relative w-full overflow-hidden rounded-full bg-gradient-to-r from-zinc-50 to-zinc-100 px-6 py-4 text-base font-bold tracking-wide text-zinc-950 shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_20px_40px_rgba(0,0,0,0.4)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.2),0_25px_50px_rgba(0,0,0,0.5)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {authLoading
                      ? "Processing..."
                      : isSignUp
                        ? "Create Account"
                        : "Sign In"}
                    {!authLoading && (
                      <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-sky-400/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </button>
              </form>

              {/* Toggle Sign In/Sign Up */}
              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setAuthError(null);
                    setSuccessMessage(null);
                    setPendingEmail(null);
                    setEmail("");
                    setPassword("");
                  }}
                  className="text-sm text-zinc-400 transition hover:text-zinc-300"
                >
                  {isSignUp
                    ? "Already have an account? "
                    : "Don't have an account? "}
                  <span className="font-semibold text-emerald-400">
                    {isSignUp ? "Sign in" : "Sign up"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-6 text-center">
            <p className="text-xs text-zinc-500">
              By {isSignUp ? "signing up" : "signing in"}, you agree to our Terms
              of Service and Privacy Policy
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

