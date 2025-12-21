import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const videoId = request.nextUrl.searchParams.get("video_id");

    let query = supabase
      .from("questions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (videoId) {
      query = query.eq("video_id", videoId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ questions: data || [] }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { video_id, question, answer, video_source } = body;

    if (!question || !answer) {
      return NextResponse.json(
        { error: "question and answer are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("questions")
      .insert({
        user_id: user.id,
        video_id: video_id || null,
        question,
        answer,
        video_source: video_source || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ question: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save question" },
      { status: 500 }
    );
  }
}

