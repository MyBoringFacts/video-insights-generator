"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-zinc-900 to-neutral-950 text-zinc-50">
      {/* Animated Background Grid */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5" />
      </div>

      {/* Professional Navigation with Glassmorphism */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "border-b border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]"
            : "border-b border-white/5 bg-white/[0.02] backdrop-blur-md"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30 ring-1 ring-emerald-400/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-emerald-500/50">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-zinc-50">Video Insights</span>
              <span className="text-[10px] text-zinc-500 font-medium">AI-Powered Analysis</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/app"
              className="px-5 py-2 text-sm font-medium text-amber-300 hover:text-amber-200 transition-all duration-200 rounded-lg border border-amber-400/30 bg-amber-500/10 hover:bg-amber-500/20"
            >
              Try as Guest
            </Link>
            <Link
              href="/auth?mode=signin"
              className="px-5 py-2 text-sm font-medium text-zinc-300 hover:text-zinc-50 transition-all duration-200 rounded-lg hover:bg-white/5"
            >
              Sign In
            </Link>
            <Link
              href="/auth?mode=signup"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg shadow-lg shadow-emerald-500/30 ring-1 ring-emerald-400/20 hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-200"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28">
        {/* Enhanced Background Effects */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 h-[600px] w-[600px] rounded-full bg-emerald-500/20 blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-purple-500/10 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            {/* Glassmorphic Badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-white/5 backdrop-blur-xl px-4 py-1.5 text-sm font-medium text-emerald-400 shadow-[0_8px_32px_0_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/20">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Powered by Google Gemini AI
            </div>

            {/* Main Headline */}
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-zinc-50 sm:text-6xl lg:text-7xl">
              Turn Long Videos Into
              <span className="block mt-2 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400 bg-clip-text text-transparent">
                Actionable Insights
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mb-4 text-xl leading-relaxed text-zinc-400 sm:text-2xl">
              Get instant summaries, key insights, and action items from any video.
              <br className="hidden sm:block" />
              <span className="text-zinc-300">Save hours every week.</span>
            </p>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-zinc-500">
              Trusted by professionals who need to extract value from video content quickly and accurately.
            </p>

            {/* CTA Buttons with Glassmorphism */}
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-4">
              <Link
                href="/app"
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl border border-amber-400/30 bg-amber-500/10 px-8 py-4 text-base font-semibold text-amber-300 shadow-[0_8px_32px_0_rgba(245,158,11,0.2)] ring-1 ring-amber-400/20 transition-all duration-300 hover:scale-105 hover:bg-amber-500/20 hover:shadow-[0_12px_40px_0_rgba(245,158,11,0.3)]"
              >
                <span className="relative z-10">Try as Guest</span>
                <svg className="relative z-10 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/auth?mode=signup"
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-4 text-base font-semibold text-white shadow-[0_8px_32px_0_rgba(16,185,129,0.4)] ring-1 ring-emerald-400/30 transition-all duration-300 hover:scale-105 hover:shadow-[0_12px_40px_0_rgba(16,185,129,0.5)]"
              >
                <span className="relative z-10">Start Free Trial</span>
                <svg className="relative z-10 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </Link>
              <button
                onClick={() => {
                  document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="group inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-base font-semibold text-zinc-200 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] ring-1 ring-white/5 transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:shadow-[0_12px_40px_0_rgba(0,0,0,0.5)]"
              >
                See How It Works
                <svg className="h-5 w-5 transition-transform duration-300 group-hover:translate-y-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Trust Indicators with Glassmorphism */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
              {[
                { icon: "✓", text: "No sign up required" },
                { icon: "⚡", text: "Results in seconds" },
                { icon: "🔒", text: "Bring your own API key" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] ring-1 ring-white/5 transition-all duration-300 hover:border-white/20 hover:bg-white/10"
                >
                  <span className="text-emerald-400">{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold tracking-tight text-zinc-50 sm:text-5xl">
              Everything You Need to
              <span className="block mt-2 bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">
                Extract Maximum Value
              </span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-zinc-400">
              Powerful AI features designed to help you understand and act on video content faster than ever.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] ring-1 ring-white/5 transition-all duration-300 hover:border-emerald-500/30 hover:bg-white/10 hover:shadow-[0_12px_40px_0_rgba(16,185,129,0.2)]">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 backdrop-blur-sm ring-1 ring-emerald-500/30 transition-transform duration-300 group-hover:scale-110">
                  <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="mb-3 text-xl font-semibold text-zinc-50">Executive Summaries</h3>
                <p className="text-zinc-400 leading-relaxed">
                  Get comprehensive summaries that capture the essence of any video. Never miss critical information, even in hours-long content.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] ring-1 ring-white/5 transition-all duration-300 hover:border-emerald-500/30 hover:bg-white/10 hover:shadow-[0_12px_40px_0_rgba(16,185,129,0.2)]">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 backdrop-blur-sm ring-1 ring-emerald-500/30 transition-transform duration-300 group-hover:scale-110">
                  <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="mb-3 text-xl font-semibold text-zinc-50">Key Insights</h3>
                <p className="text-zinc-400 leading-relaxed">
                  Discover the most important takeaways automatically. Our AI identifies patterns, themes, and critical points you might have missed.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] ring-1 ring-white/5 transition-all duration-300 hover:border-emerald-500/30 hover:bg-white/10 hover:shadow-[0_12px_40px_0_rgba(16,185,129,0.2)]">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 backdrop-blur-sm ring-1 ring-emerald-500/30 transition-transform duration-300 group-hover:scale-110">
                  <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h3 className="mb-3 text-xl font-semibold text-zinc-50">Action Items</h3>
                <p className="text-zinc-400 leading-relaxed">
                  Automatically extract actionable tasks and next steps. Turn insights into action with clear, organized action items.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] ring-1 ring-white/5 transition-all duration-300 hover:border-emerald-500/30 hover:bg-white/10 hover:shadow-[0_12px_40px_0_rgba(16,185,129,0.2)]">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 backdrop-blur-sm ring-1 ring-emerald-500/30 transition-transform duration-300 group-hover:scale-110">
                  <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="mb-3 text-xl font-semibold text-zinc-50">Interactive Chat</h3>
                <p className="text-zinc-400 leading-relaxed">
                  Ask questions about the video content and get instant answers. Deep dive into any topic with our AI-powered chat interface.
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] ring-1 ring-white/5 transition-all duration-300 hover:border-emerald-500/30 hover:bg-white/10 hover:shadow-[0_12px_40px_0_rgba(16,185,129,0.2)]">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 backdrop-blur-sm ring-1 ring-emerald-500/30 transition-transform duration-300 group-hover:scale-110">
                  <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="mb-3 text-xl font-semibold text-zinc-50">Lightning Fast</h3>
                <p className="text-zinc-400 leading-relaxed">
                  Get results in seconds, not hours. Process hours of video content in the time it takes to make a coffee.
                </p>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] ring-1 ring-white/5 transition-all duration-300 hover:border-emerald-500/30 hover:bg-white/10 hover:shadow-[0_12px_40px_0_rgba(16,185,129,0.2)]">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 backdrop-blur-sm ring-1 ring-emerald-500/30 transition-transform duration-300 group-hover:scale-110">
                  <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="mb-3 text-xl font-semibold text-zinc-50">Full Transcripts</h3>
                <p className="text-zinc-400 leading-relaxed">
                  Access complete transcripts of all videos. Search, reference, and share the full content whenever you need it.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
            <div>
              <h2 className="mb-6 text-4xl font-bold tracking-tight text-zinc-50 sm:text-5xl">
                Save Hours Every Week
                <span className="block mt-2 bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">
                  Focus on What Matters
                </span>
              </h2>
              <p className="mb-10 text-lg leading-relaxed text-zinc-400">
                Stop spending hours watching videos and taking notes. Our AI extracts everything you need—summaries, insights, action items, and transcripts—so you can focus on making decisions and taking action.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                    <svg className="h-5 w-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="mb-1 text-lg font-semibold text-zinc-50">Never Miss Critical Details</h3>
                    <p className="text-zinc-400">
                      Our AI captures every important point, even in lengthy content. No more worrying about missing key information.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                    <svg className="h-5 w-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="mb-1 text-lg font-semibold text-zinc-50">Make Faster Decisions</h3>
                    <p className="text-zinc-400">
                      Get instant access to summaries and insights. Make informed decisions without watching entire videos.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                    <svg className="h-5 w-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="mb-1 text-lg font-semibold text-zinc-50">Stay Organized</h3>
                    <p className="text-zinc-400">
                      All your insights, action items, and transcripts in one place. Easy to reference, share, and act on.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] ring-1 ring-white/5">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-blue-500/10" />
                <div className="relative">
                  <div className="mb-6">
                    <div className="mb-2 text-sm font-medium text-zinc-400">Time Saved</div>
                    <div className="text-5xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">6.3</div>
                    <div className="text-lg font-medium text-zinc-400">hours per week</div>
                  </div>
                  <div className="space-y-4 border-t border-white/10 pt-6">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Video analysis time</span>
                      <span className="font-semibold text-emerald-400">-85%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Note-taking time</span>
                      <span className="font-semibold text-emerald-400">-90%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Information retrieval</span>
                      <span className="font-semibold text-emerald-400">-95%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section with Glassmorphism */}
      <section className="relative py-20 lg:py-28">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] ring-1 ring-white/5">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-blue-500/5 to-purple-500/10" />
            <div className="relative">
              <h2 className="mb-4 text-4xl font-bold text-zinc-50 sm:text-5xl">
                Ready to Save Time?
              </h2>
              <p className="mb-8 text-lg text-zinc-400">
                Start extracting insights from your videos in seconds.
                <br className="hidden sm:block" />
                <span className="text-zinc-300">No sign up required. Use guest mode or create an account.</span>
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-4">
                <Link
                  href="/app"
                  className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl border border-amber-400/30 bg-amber-500/10 px-8 py-4 text-base font-semibold text-amber-300 shadow-[0_8px_32px_0_rgba(245,158,11,0.2)] ring-1 ring-amber-400/20 transition-all duration-300 hover:scale-105 hover:bg-amber-500/20 hover:shadow-[0_12px_40px_0_rgba(245,158,11,0.3)]"
                >
                  <span className="relative z-10">Try as Guest</span>
                  <svg className="relative z-10 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href="/auth?mode=signup"
                  className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-4 text-base font-semibold text-white shadow-[0_8px_32px_0_rgba(16,185,129,0.4)] ring-1 ring-emerald-400/30 transition-all duration-300 hover:scale-105 hover:shadow-[0_12px_40px_0_rgba(16,185,129,0.5)]"
                >
                  <span className="relative z-10">Create Account</span>
                  <svg className="relative z-10 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer with Glassmorphism */}
      <footer className="relative border-t border-white/10 bg-white/5 py-12 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400/20">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-zinc-50">Video Insights</div>
                <div className="text-xs text-zinc-500">AI-Powered Analysis</div>
              </div>
            </div>
            <div className="flex gap-6 text-sm text-zinc-500">
              <button className="transition-colors hover:text-zinc-300">Privacy</button>
              <Link href="/terms" className="transition-colors hover:text-zinc-300">
                Terms
              </Link>
              <Link href="/app" className="transition-colors hover:text-zinc-300">
                App
              </Link>
            </div>
            <div className="text-sm text-zinc-500">
              © {new Date().getFullYear()} Video Insights. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
