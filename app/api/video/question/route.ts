import { NextRequest, NextResponse } from "next/server";
import {
  answerQuestion,
  answerQuestionFromTranscript,
} from "@/lib/geminiClient";
import { createErrorResponse } from "@/app/api/utils/errorResponse";
import { createClient } from "@/lib/supabase/server";
import { addRateLimitHeaders } from "@/app/api/utils/rateLimit";
import { RATE_LIMITS } from "@/lib/rateLimit";
import {
  checkRateLimit,
  getClientIdentifier,
  getIpAddress,
} from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  try {
    // Authentication is optional - allow guest mode
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    // Check rate limit (works for both authenticated and guest users)
    const ipAddress = getIpAddress(request);
    const identifier = getClientIdentifier(user?.id || null, ipAddress);
    const rateLimitResult = checkRateLimit(
      identifier,
      RATE_LIMITS.videoQuestion
    );

    if (!rateLimitResult.success) {
      const retryAfter = Math.ceil(
        (rateLimitResult.reset - Date.now()) / 1000
      );
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: `You've reached the limit of ${RATE_LIMITS.videoQuestion.maxRequests} questions per hour. Please try again later.`,
          retryAfter,
          limit: rateLimitResult.limit,
          reset: rateLimitResult.reset,
        },
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": rateLimitResult.limit.toString(),
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.reset.toString(),
            "Retry-After": retryAfter.toString(),
          },
        }
      );
    }

    const body = await request.json();
    const videoSource = body.videoSource as string | undefined;
    const question = body.question as string | undefined;
    const transcript = body.transcript as string | undefined;
    const apiKey = body.apiKey as string | undefined;
    const videoId = body.videoId as string | undefined;

    if (!question || typeof question !== "string") {
      return createErrorResponse(
        new Error("Missing or invalid 'question'."),
        "Invalid request body.",
        { status: 400, context: "/api/video/question" },
      );
    }

    let answer: string;

    // If the client already has a transcript (first analysis call done),
    // answer based on that text to avoid reprocessing the video.
    if (typeof transcript === "string" && transcript.trim().length > 0) {
      answer = await answerQuestionFromTranscript(transcript, question, apiKey);
    } else {
      // Fallback: answer directly from the video source (requires videoSource).
      if (!videoSource || typeof videoSource !== "string") {
        return createErrorResponse(
          new Error(
            "Missing 'videoSource'. Provide either a transcript or a videoSource.",
          ),
          "Invalid request body.",
          { status: 400, context: "/api/video/question" },
        );
      }

      answer = await answerQuestion(videoSource, question, apiKey);
    }

    // Save to history only if user is authenticated (skip for guest mode)
    if (user && !userError) {
      try {
        await supabase.from("questions").insert({
          user_id: user.id,
          video_id: videoId || null,
          question,
          answer,
          video_source: videoSource || null,
        });
      } catch (historyError) {
        // Don't fail the request if history save fails
        // eslint-disable-next-line no-console
        console.error("Failed to save question to history:", historyError);
      }
    }

    const response = new NextResponse(JSON.stringify({ answer }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

    // Add rate limit headers
    return addRateLimitHeaders(
      response,
      rateLimitResult.limit,
      rateLimitResult.remaining,
      rateLimitResult.reset
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[/api/video/question] Error:", error);
    
    // Check if it's an API key validation error
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isApiKeyError = (error as any)?.isApiKeyError || 
      errorMessage?.toLowerCase().includes("invalid api key") ||
      errorMessage?.toLowerCase().includes("api key is missing");
    
    const statusCode = (error as any)?.statusCode || (isApiKeyError ? 401 : 500);
    
    return createErrorResponse(
      error,
      isApiKeyError ? "API key is required. Get your free Gemini API key at https://aistudio.google.com/app/apikey" : "Failed to answer question.",
      { status: statusCode, context: "/api/video/question" },
    );
  }
}
