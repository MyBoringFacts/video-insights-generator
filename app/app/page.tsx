"use client";

import { useState, useEffect, type FormEvent } from "react";
import type { ReactElement } from "react";
import { createClient } from "@/lib/supabase/client";
import AuthButton from "@/app/components/AuthButton";
import type { User } from "@supabase/supabase-js";

type AnalysisResult = {
  summary?: string;
  actionItems: string;
  insights: string;
  transcript: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
};

// Format markdown-like text to HTML
function formatMarkdownText(text: string): ReactElement {
  // First, handle inline sections separated by **Key...:** or **Overall...:**
  const parts: ReactElement[] = [];
  let currentIndex = 0;
  
  // Split by bold headers like **Key Discussion Points:** or **Overall Outcome:**
  const headerRegex = /\*\*([^*]+?)\*\*:\s*/g;
  let match;
  let lastIndex = 0;
  let sectionIdx = 0;

  // Process initial paragraph before first header
  match = headerRegex.exec(text);
  if (match && match.index > 0) {
    const introText = text.substring(0, match.index).trim();
    if (introText) {
      parts.push(
        <p key={`intro-${sectionIdx++}`} className="text-sm text-zinc-300 leading-relaxed mb-4">
          {formatInlineMarkdown(introText)}
        </p>
      );
    }
    lastIndex = match.index + match[0].length;
  }

  // Process sections with headers
  headerRegex.lastIndex = 0;
  while ((match = headerRegex.exec(text)) !== null) {
    // Add content before this header
    if (match.index > lastIndex) {
      const contentBefore = text.substring(lastIndex, match.index).trim();
      if (contentBefore) {
        parts.push(
          <div key={`section-${sectionIdx++}`} className="mb-4">
            {formatSectionContent(contentBefore)}
          </div>
        );
      }
    }

    // Process the header and its content
    const headerText = match[1];
    const headerEnd = match.index + match[0].length;
    const nextHeaderMatch = headerRegex.exec(text);
    const contentEnd = nextHeaderMatch ? nextHeaderMatch.index : text.length;
    const sectionContent = text.substring(headerEnd, contentEnd).trim();
    
    // Reset regex for next iteration
    if (nextHeaderMatch) {
      headerRegex.lastIndex = 0;
    }

    parts.push(
      <div key={`header-${sectionIdx++}`} className="mb-4">
        <h3 className="text-lg font-semibold mb-3 text-emerald-300">
          {headerText}
        </h3>
        {formatSectionContent(sectionContent)}
      </div>
    );

    lastIndex = contentEnd;
    if (!nextHeaderMatch) break;
  }

  // Add remaining content after last header
  if (lastIndex < text.length) {
    const remainingContent = text.substring(lastIndex).trim();
    if (remainingContent) {
      parts.push(
        <div key={`final-${sectionIdx++}`} className="mb-4">
          {formatSectionContent(remainingContent)}
        </div>
      );
    }
  }

  // If no headers found, process as regular content
  if (parts.length === 0) {
    return (
      <div className="space-y-4">
        {formatSectionContent(text)}
      </div>
    );
  }

  return <div className="space-y-4">{parts}</div>;
}

// Format section content (handles bullets, paragraphs, etc.)
function formatSectionContent(content: string): ReactElement {
  // Handle inline bullets separated by " * " (space asterisk space)
  // Split by " * " but preserve the asterisk context
  const bulletPattern = /(?<!\*)\s+\*\s+(?!\*)/g;
  const hasInlineBullets = bulletPattern.test(content);
  
  if (hasInlineBullets) {
    // Split by the pattern and process
    const parts = content.split(bulletPattern);
    const elements: ReactElement[] = [];
    let currentList: string[] = [];
    let listKey = 0;
    
    parts.forEach((part, idx) => {
      const trimmed = part.trim();
      if (!trimmed) return;
      
      // Check if this part starts with * (bullet point)
      if (trimmed.match(/^\*\s+/)) {
        const bulletContent = trimmed.replace(/^\*\s+/, '').trim();
        currentList.push(bulletContent);
      } else if (trimmed.match(/^\*\*/)) {
        // Bold header within content
        currentList.push(trimmed);
      } else {
        // If we have accumulated list items, render them
        if (currentList.length > 0) {
          elements.push(
            <ul key={`list-${listKey++}`} className="space-y-2 ml-4 mb-3 list-disc">
              {currentList.map((item, itemIdx) => (
                <li key={itemIdx} className="text-sm text-zinc-300 leading-relaxed">
                  {formatInlineMarkdown(item)}
                </li>
              ))}
            </ul>
          );
          currentList = [];
        }
        
        // Regular paragraph
        elements.push(
          <p key={`para-${idx}`} className="text-sm text-zinc-300 leading-relaxed mb-2">
            {formatInlineMarkdown(trimmed)}
          </p>
        );
      }
    });
    
    // Handle remaining list items
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${listKey}`} className="space-y-2 ml-4 mb-3 list-disc">
          {currentList.map((item, itemIdx) => (
            <li key={itemIdx} className="text-sm text-zinc-300 leading-relaxed">
              {formatInlineMarkdown(item)}
            </li>
          ))}
        </ul>
      );
    }
    
    return <>{elements}</>;
  }
  
  // Handle line-by-line bullets
  const lines = content.split('\n').map(l => l.trim()).filter(l => l);
  const elements: ReactElement[] = [];
  let currentList: string[] = [];
  let listKey = 0;

  lines.forEach((line, idx) => {
    // Check if it's a numbered list item with bold header (e.g., "1. **Title:**")
    const numberedBoldMatch = line.match(/^(\d+)\.\s+\*\*([^*]+?)\*\*:?\s*(.*)$/);
    if (numberedBoldMatch) {
      const [, number, boldTitle, rest] = numberedBoldMatch;
      // If we have accumulated list items, render them
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${listKey++}`} className="space-y-2 ml-4 mb-3 list-disc">
            {currentList.map((item, itemIdx) => (
              <li key={itemIdx} className="text-sm text-zinc-300 leading-relaxed">
                {formatInlineMarkdown(item)}
              </li>
            ))}
          </ul>
        );
        currentList = [];
      }
      // Render numbered item with highlighted title
      elements.push(
        <div key={`numbered-${idx}`} className="mb-3">
          <p className="text-sm text-zinc-300 leading-relaxed">
            <span className="font-semibold text-zinc-200">{number}.</span>{' '}
            <span className="text-base font-semibold text-emerald-300">
              {boldTitle}
            </span>
            {rest && `: ${rest}`}
          </p>
        </div>
      );
    } else if (line.match(/^\*\s+/)) {
      // Check if it's a bullet point
      const bulletContent = line.replace(/^\*\s+/, '').trim();
      currentList.push(bulletContent);
    } else {
      // If we have accumulated list items, render them
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${listKey++}`} className="space-y-2 ml-4 mb-3 list-disc">
            {currentList.map((item, itemIdx) => (
              <li key={itemIdx} className="text-sm text-zinc-300 leading-relaxed">
                {formatInlineMarkdown(item)}
              </li>
            ))}
          </ul>
        );
        currentList = [];
      }
      
      // Regular paragraph
      if (line) {
        elements.push(
          <p key={`para-${idx}`} className="text-sm text-zinc-300 leading-relaxed mb-2">
            {formatInlineMarkdown(line)}
          </p>
        );
      }
    }
  });

  // Handle remaining list items
  if (currentList.length > 0) {
    elements.push(
      <ul key={`list-${listKey}`} className="space-y-2 ml-4 mb-3 list-disc">
        {currentList.map((item, itemIdx) => (
          <li key={itemIdx} className="text-sm text-zinc-300 leading-relaxed">
            {formatInlineMarkdown(item)}
          </li>
        ))}
      </ul>
    );
  }

  return <>{elements}</>;
}

// Format inline markdown (bold, etc.)
function formatInlineMarkdown(text: string): (string | ReactElement)[] {
  const parts: (string | ReactElement)[] = [];
  const boldRegex = /\*\*(.*?)\*\*/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = boldRegex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    // Add the bold text with readable color
    parts.push(
      <strong key={key++} className="font-semibold text-emerald-300">
        {match[1]}
      </strong>
    );
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

// Parse action items from text
type ActionItem = {
  id: number;
  task: string;
  owner: string;
  deadline: string;
};

function parseActionItems(text: string): ActionItem[] {
  if (!text || text.trim().length === 0) return [];
  
  const actionItems: ActionItem[] = [];
  const actionItemRegex = /ACTION ITEM (\d+)\s*\n([\s\S]*?)(?=ACTION ITEM \d+|$)/gi;
  let match;
  let itemId = 0;
  
  while ((match = actionItemRegex.exec(text)) !== null) {
    itemId++;
    const itemNumber = match[1];
    const content = match[2];
    
    // Extract Task, Owner, Deadline
    const taskMatch = content.match(/Task:\s*(.+?)(?:\n|$)/i);
    const ownerMatch = content.match(/Owner:\s*(.+?)(?:\n|$)/i);
    const deadlineMatch = content.match(/Deadline:\s*(.+?)(?:\n|$)/i);
    
    actionItems.push({
      id: itemId,
      task: taskMatch ? taskMatch[1].trim() : "",
      owner: ownerMatch ? ownerMatch[1].trim() : "Unspecified",
      deadline: deadlineMatch ? deadlineMatch[1].trim() : "Unspecified",
    });
  }
  
  // If no structured format found, try to extract simple list items
  if (actionItems.length === 0) {
    const lines = text.split('\n').filter(line => line.trim());
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      // Skip headers and empty lines
      if (trimmed && !trimmed.toLowerCase().includes('action item') && 
          !trimmed.toLowerCase().includes('here are') &&
          trimmed.length > 10) {
        // Check if it's a bullet point or numbered item
        const cleanLine = trimmed.replace(/^[\d\-\*•]\s*/, '').trim();
        if (cleanLine) {
          actionItems.push({
            id: index + 1,
            task: cleanLine,
            owner: "Unspecified",
            deadline: "Unspecified",
          });
        }
      }
    });
  }
  
  return actionItems;
}

// Extract YouTube video ID from URL
function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace('www.', '');
    
    // Handle youtu.be short URLs
    if (hostname === 'youtu.be') {
      return urlObj.pathname.slice(1);
    }
    
    // Handle youtube.com URLs
    if (hostname === 'youtube.com' || hostname === 'm.youtube.com') {
      const videoId = urlObj.searchParams.get('v');
      return videoId;
    }
    
    return null;
  } catch {
    return null;
  }
}

// Check if URL is a YouTube URL
function isYouTubeUrl(url: string): boolean {
  if (!url) return false;
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace('www.', '');
    return ['youtube.com', 'm.youtube.com', 'youtu.be'].includes(hostname);
  } catch {
    return false;
  }
}

export default function AppWorkspace() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [userID, setUserID] = useState<string>("workspace");
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);
  const [historyVideos, setHistoryVideos] = useState<any[]>([]);
  const [historyQuestions, setHistoryQuestions] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [expandedAnswers, setExpandedAnswers] = useState<Set<string>>(new Set());

  // Load API key from localStorage on mount
  const [apiKey, setApiKey] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("gemini_api_key") || "";
    }
    return "";
  });
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  // Get user on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setUserID(user?.email?.split("@")[0] || "workspace");
      setCheckingAuth(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setUserID(session?.user?.email?.split("@")[0] || "workspace");
      setCheckingAuth(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Load history when user is authenticated
  useEffect(() => {
    if (user) {
      loadHistory();
    } else {
      setHistoryVideos([]);
      setHistoryQuestions([]);
      setSelectedVideo(null);
      setCurrentVideoId(null);
    }
  }, [user]);

  // Load questions for selected video
  useEffect(() => {
    if (selectedVideo && user) {
      loadQuestionsForVideo(selectedVideo.id);
    } else {
      setHistoryQuestions([]);
    }
  }, [selectedVideo, user]);

  const loadHistory = async () => {
    if (!user) return;

    try {
      const videosRes = await fetch("/api/history/videos");

      if (videosRes.ok) {
        const { videos } = await videosRes.json();
        setHistoryVideos(videos || []);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to load history:", error);
    }
  };

  const loadQuestionsForVideo = async (videoId: string) => {
    if (!user) return;

    try {
      const questionsRes = await fetch(`/api/history/questions?video_id=${videoId}`);

      if (questionsRes.ok) {
        const { questions } = await questionsRes.json();
        setHistoryQuestions(questions || []);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to load questions:", error);
    }
  };

  const handleSelectVideo = (video: any) => {
    setSelectedVideo(video);
    setCurrentVideoId(video.id);
    setVideoSource(video.video_source);
    setAnalysis({
      summary: video.summary || undefined,
      actionItems: video.action_items || "",
      insights: video.insights || "",
      transcript: video.transcript || "",
    });
    setChatMessages([]); // Clear chat when switching videos
  };

  const handleDeleteVideo = async (videoId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selecting the video when clicking delete
    
    if (!confirm("Are you sure you want to delete this video analysis?")) {
      return;
    }

    try {
      const res = await fetch(`/api/history/videos?id=${videoId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete video");
      }

      // If deleted video was selected, clear selection
      if (selectedVideo?.id === videoId) {
        setSelectedVideo(null);
        setCurrentVideoId(null);
        setVideoSource("");
        setAnalysis(null);
        setChatMessages([]);
      }

      // Reload history
      await loadHistory();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to delete video:", error);
      alert("Failed to delete video. Please try again.");
    }
  };

  const handleNewAnalysis = () => {
    setSelectedVideo(null);
    setCurrentVideoId(null);
    setVideoSource("");
    setAnalysis(null);
    setChatMessages([]);
    setAnalysisError(null);
    setChatError(null);
    setIsLoadingMinimized(false); // Reset minimize state
  };

  const [videoSource, setVideoSource] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatting, setIsChatting] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // Error popup state
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorPopupMessage, setErrorPopupMessage] = useState<string>("");

  // Loading overlay minimize state
  const [isLoadingMinimized, setIsLoadingMinimized] = useState(false);

  const isLoading = isAnalyzing || isChatting;

  // Save API key to localStorage when it changes
  const handleApiKeyChange = (newKey: string) => {
    setApiKey(newKey);
    if (typeof window !== "undefined") {
      if (newKey.trim()) {
        localStorage.setItem("gemini_api_key", newKey);
      } else {
        localStorage.removeItem("gemini_api_key");
      }
    }
  };

  async function handleAnalyze(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAnalysisError(null);
    setChatError(null);

    const trimmed = videoSource.trim();
    if (!trimmed) {
      setAnalysisError("Please paste a YouTube URL or upload a video to analyze.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/video/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          videoSource: trimmed, 
          includeSummary: true,
          apiKey: apiKey.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string; details?: string; errorCode?: string }
          | null;
        
        // Check if it's an API key error
        if (res.status === 401 || data?.errorCode === "INVALID_API_KEY" || 
            data?.error?.toLowerCase().includes("invalid api key") ||
            data?.error?.toLowerCase().includes("api key is missing")) {
          throw new Error(
            "API key is required. Get your free Gemini API key at https://aistudio.google.com/app/apikey"
          );
        }
        
        throw new Error(
          data?.error ||
            data?.details ||
            "Something went wrong while analyzing the video.",
        );
      }

      const data = (await res.json()) as AnalysisResult & { videoId?: string };
      setAnalysis(data);

      // Reload history and select the new video if user is authenticated
      if (user) {
        await loadHistory();
        // If we got a videoId from the API, use it; otherwise find by source
        if (data.videoId) {
          setCurrentVideoId(data.videoId);
          // Find the video in history to set as selected
          const videosRes = await fetch("/api/history/videos");
          if (videosRes.ok) {
            const { videos } = await videosRes.json();
            const video = videos?.find((v: any) => v.id === data.videoId);
            if (video) {
              setSelectedVideo(video);
            }
          }
        } else {
          // Fallback: find by source
          const videosRes = await fetch("/api/history/videos");
          if (videosRes.ok) {
            const { videos } = await videosRes.json();
            const recentVideo = videos?.find(
              (v: any) => v.video_source === trimmed
            );
            if (recentVideo) {
              setCurrentVideoId(recentVideo.id);
              setSelectedVideo(recentVideo);
            }
          }
        }
      }
    } catch (err) {
      setAnalysis(null);
      const errorMessage = err instanceof Error ? err.message : "Unable to analyze this video right now.";
      setAnalysisError(errorMessage);
      
      // Show error popup
      setErrorPopupMessage(errorMessage);
      setShowErrorPopup(true);
      
      // If it's an API key error, show the input field
      if (errorMessage.toLowerCase().includes("invalid api key")) {
        setShowApiKeyInput(true);
      }
    } finally {
      setIsAnalyzing(false);
      setIsLoadingMinimized(false); // Reset minimize state when done
    }
  }

  async function handleSendMessage(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setChatError(null);

    const question = chatInput.trim();
    if (!question) {
      setChatError("Type a question about the video first.");
      return;
    }

    if (!videoSource.trim()) {
      setChatError("Please provide a video link above before asking questions.");
      return;
    }

    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      content: question,
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setIsChatting(true);

    try {
      const res = await fetch("/api/video/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoSource: videoSource.trim(),
          question,
          transcript: analysis?.transcript,
          apiKey: apiKey.trim() || undefined,
          videoId: currentVideoId || undefined,
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string; details?: string; errorCode?: string }
          | null;
        
        // Check if it's an API key error
        if (res.status === 401 || data?.errorCode === "INVALID_API_KEY" || 
            data?.error?.toLowerCase().includes("invalid api key") ||
            data?.error?.toLowerCase().includes("api key is missing")) {
          throw new Error(
            "API key is required. Get your free Gemini API key at https://aistudio.google.com/app/apikey"
          );
        }
        
        throw new Error(
          data?.error ||
            data?.details ||
            "Something went wrong while answering your question.",
        );
      }

      const data = (await res.json()) as { answer?: string };
      const answer = data.answer ?? "I could not generate an answer for this.";

      const assistantMessage: ChatMessage = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content: answer,
      };

      setChatMessages((prev) => [...prev, assistantMessage]);

      // Reload questions for current video
      if (user && currentVideoId) {
        await loadQuestionsForVideo(currentVideoId);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unable to answer your question right now.";
      setChatError(errorMessage);
      
      // Show error popup
      setErrorPopupMessage(errorMessage);
      setShowErrorPopup(true);
      
      // If it's an API key error, show the input field
      if (errorMessage.toLowerCase().includes("invalid api key")) {
        setShowApiKeyInput(true);
      }
    } finally {
      setIsChatting(false);
      setIsLoadingMinimized(false); // Reset minimize state when done
    }
  }

  const summaryText =
    analysis?.summary ??
    "Once you analyze a video, you'll see a personalized executive summary here.";

  const insightsText = analysis?.insights ?? "";
  const actionItemsText = analysis?.actionItems ?? "";

  // Check if action items are empty or contain "no action items" type messages
  const hasActionItems = (() => {
    if (!actionItemsText || actionItemsText.trim().length === 0) return false;
    
    const lowerText = actionItemsText.toLowerCase();
    const noActionPatterns = [
      "no action items",
      "no explicit action items",
      "there are no action items",
      "based on the transcript provided, there are no",
      "no actionable tasks",
      "no tasks to be completed",
    ];
    
    // Check if text contains any "no action items" pattern
    if (noActionPatterns.some(pattern => lowerText.includes(pattern))) {
      return false;
    }
    
    return true;
  })();

  // Show loading state while checking authentication
  if (checkingAuth) {
    return (
      <div className="flex h-screen items-center justify-center bg-linear-to-br from-neutral-950 via-zinc-900 to-neutral-800 text-zinc-50">
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

  // Show authentication required screen if user is not authenticated
  if (!user) {
    return (
      <div className="flex h-screen flex-col overflow-hidden bg-linear-to-br from-neutral-950 via-zinc-900 to-neutral-800 text-zinc-50" style={{ position: 'relative' }}>
        {/* Header */}
        <header className="flex shrink-0 items-center justify-between border-b border-white/10 bg-black/20 px-6 py-4 backdrop-blur-sm lg:px-10">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10 backdrop-blur-md">
              <span className="text-base font-semibold tracking-tight text-zinc-50">
                VI
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-medium tracking-[0.14em] text-zinc-400">
                VIDEO INSIGHTS
              </span>
              <span className="text-sm text-zinc-500">Premium Intelligence</span>
            </div>
          </div>
          <AuthButton />
        </header>

        {/* Authentication Required Content */}
        <main className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-emerald-500/20 to-sky-500/20 border border-white/10">
              <svg
                className="h-10 w-10 text-emerald-400"
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

            <h1 className="mb-4 text-4xl font-extrabold text-zinc-50 sm:text-5xl">
              Authentication Required
            </h1>
            <p className="mb-8 text-xl font-light leading-relaxed text-zinc-300">
              You need to sign in to use Video Insights Generator.
              <br />
              Create a free account to start analyzing videos and saving your history.
            </p>

            <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <h2 className="mb-4 text-lg font-semibold text-zinc-50">
                What you'll get:
              </h2>
              <ul className="space-y-3 text-left text-zinc-300">
                <li className="flex items-start gap-3">
                  <svg
                    className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Save and access your video analysis history</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Track all your Q&A conversations</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Switch between multiple videos easily</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Secure, private data storage</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <p className="text-sm text-zinc-400">
                Click the "Sign In" button in the header to get started
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-linear-to-br from-neutral-950 via-zinc-900 to-neutral-800 text-zinc-50">
      {/* Glassmorphism Error Popup */}
      {showErrorPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md">
          <div className="relative rounded-3xl border border-red-400/30 bg-red-950/20 p-8 shadow-[0_8px_32px_0_rgba(220,38,38,0.37)] backdrop-blur-2xl max-w-md w-full mx-4">
            {/* Animated background gradient with red tones */}
            <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_top_left,#ef444415,transparent_50%),radial-gradient(circle_at_bottom_right,#dc262620,transparent_50%)]" />
            
            {/* Content */}
            <div className="relative flex flex-col items-center gap-4">
              {/* Error Icon */}
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 border border-red-400/30">
                <svg
                  className="h-8 w-8 text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              
              {/* Error text */}
              <div className="text-center">
                <p className="text-lg font-semibold text-red-200 mb-2">
                  API Error
                </p>
                <div className="text-sm text-red-300/90 leading-relaxed">
                  {errorPopupMessage.includes("https://") ? (
                    <p>
                      {errorPopupMessage.split("https://")[0]}
                      <a 
                        href={`https://${errorPopupMessage.split("https://")[1]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-red-200 transition-colors"
                      >
                        https://{errorPopupMessage.split("https://")[1]}
                      </a>
                    </p>
                  ) : (
                    <p>{errorPopupMessage}</p>
                  )}
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={() => setShowErrorPopup(false)}
                className="mt-2 rounded-xl border border-red-400/30 bg-red-500/20 px-6 py-2.5 text-sm font-semibold text-red-200 hover:bg-red-500/30 transition backdrop-blur-sm"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Glassmorphism Loading Overlay */}
      {isLoading && (
        <>
          {isLoadingMinimized ? (
            // Minimized floating indicator
            <div className="fixed bottom-4 right-4 z-50">
              <button
                onClick={() => setIsLoadingMinimized(false)}
                className="group flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 py-3 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] backdrop-blur-2xl transition hover:bg-white/15"
              >
                <div className="relative h-6 w-6">
                  <div className="absolute inset-0 rounded-full border-2 border-white/20" />
                  <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-emerald-400" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-zinc-100">
                    {isAnalyzing ? "Analyzing video..." : "Processing..."}
                  </p>
                  <p className="text-xs text-zinc-400">
                    Click to expand
                  </p>
                </div>
                <svg
                  className="h-4 w-4 text-zinc-400 transition group-hover:text-zinc-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              </button>
            </div>
          ) : (
            // Full overlay
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
              <div className="relative rounded-3xl border border-white/20 bg-white/5 p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] backdrop-blur-2xl">
                {/* Animated background gradient */}
                <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_top_left,#ffffff15,transparent_50%),radial-gradient(circle_at_bottom_right,#4ade8020,transparent_50%)]" />
                
                {/* Minimize button */}
                <button
                  onClick={() => setIsLoadingMinimized(true)}
                  className="absolute top-4 right-4 rounded-lg p-2 text-zinc-400 transition hover:bg-white/10 hover:text-zinc-300"
                  title="Minimize"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 12H4"
                    />
                  </svg>
                </button>
                
                {/* Content */}
                <div className="relative flex flex-col items-center gap-4">
                  {/* Spinner */}
                  <div className="relative h-16 w-16">
                    <div className="absolute inset-0 rounded-full border-4 border-white/10" />
                    <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-emerald-400" />
                  </div>
                  
                  {/* Loading text */}
                  <div className="text-center">
                    <p className="text-lg font-semibold text-zinc-100">
                      {isAnalyzing ? "Analyzing video..." : "Processing your question..."}
                    </p>
                    <p className="mt-2 text-sm text-zinc-400">
                      {isAnalyzing 
                        ? "This may take a moment while we process the video content."
                        : "Getting the answer from AI..."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Header - Fixed height */}
      <header className="flex shrink-0 items-center justify-between border-b border-white/10 bg-black/20 px-6 py-4 backdrop-blur-sm lg:px-10">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10 backdrop-blur-md">
            <span className="text-base font-semibold tracking-tight text-zinc-50">
              VI
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-medium tracking-[0.14em] text-zinc-400">
              VIDEO INSIGHTS
            </span>
            <span className="text-sm text-zinc-500">
              Workspace for{" "}
              <span className="font-semibold text-zinc-200">
                {userID || "guest"}
              </span>
            </span>
          </div>
        </div>

        {/* Auth and API Key */}
        <div className="flex items-center gap-3">
          <AuthButton />
          {showApiKeyInput ? (
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="password"
                  placeholder="Enter Gemini API Key"
                  value={apiKey}
                  onChange={(e) => handleApiKeyChange(e.target.value)}
                  className={`w-64 rounded-xl border px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 transition ${
                    analysisError?.toLowerCase().includes("invalid api key")
                      ? "border-red-400/50 bg-red-950/20 focus:border-red-400 focus:ring-red-400/60"
                      : "border-white/10 bg-black/40 focus:border-emerald-400 focus:ring-emerald-400/60"
                  }`}
                  onBlur={() => {
                    // Keep input visible if there's a value, hide if empty
                    if (!apiKey.trim()) {
                      setShowApiKeyInput(false);
                    }
                  }}
                  autoFocus
                />
                {(analysisError?.toLowerCase().includes("invalid api key") || 
                  analysisError?.toLowerCase().includes("api key is required")) && (
                  <span className="absolute -bottom-5 left-0 text-xs text-red-400">
                    API key required
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  setShowApiKeyInput(false);
                }}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-300 hover:bg-white/10 transition"
              >
                Hide
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowApiKeyInput(true)}
              className={`rounded-xl border px-4 py-2 text-sm transition flex items-center gap-2 ${
                analysisError?.toLowerCase().includes("invalid api key")
                  ? "border-red-400/50 bg-red-950/20 text-red-300 hover:bg-red-950/30"
                  : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
              }`}
            >
              <span>{apiKey ? "✓ API Key Set" : "Set API Key"}</span>
            </button>
          )}
        </div>
      </header>

      {/* Main content area - Fixed height with grid layout */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Video Navigation (only shown when user is authenticated) */}
        {user && (
          <aside
            className={`${
              sidebarOpen ? "w-80" : "w-0"
            } flex shrink-0 flex-col border-r border-white/10 bg-black/30 transition-all duration-300 overflow-hidden`}
          >
            <div className="flex h-full flex-col">
              {/* Sidebar Header */}
              <div className="flex shrink-0 flex-col border-b border-white/10 bg-black/40 backdrop-blur-sm">
                {/* New Analysis Button */}
                <button
                  onClick={handleNewAnalysis}
                  className="mx-3 mt-3 mb-2 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-zinc-200 transition hover:bg-white/10 hover:text-zinc-100"
                  title="Start new analysis"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span>New Analysis</span>
                </button>
                
                {/* Sidebar Title */}
                <div className="flex items-center justify-between px-4 pb-3">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-300">
                    Your Videos
                  </h2>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-white/10 hover:text-zinc-300"
                    title="Hide sidebar"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Video List */}
              <div className="flex-1 overflow-y-auto px-3 py-4">
                {historyVideos.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-zinc-500 mb-2">
                      No videos analyzed yet
                    </p>
                    <p className="text-xs text-zinc-600">
                      Analyze a video to see it here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {historyVideos.map((video) => {
                      const isSelected = selectedVideo?.id === video.id;
                      return (
                        <div
                          key={video.id}
                          className={`group relative cursor-pointer rounded-xl border p-3 transition-all ${
                            isSelected
                              ? "border-emerald-400/50 bg-emerald-500/10 shadow-lg shadow-emerald-500/10"
                              : "border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/10"
                          }`}
                        >
                          <div
                            onClick={() => handleSelectVideo(video)}
                            className="flex items-start justify-between gap-2"
                          >
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm font-medium truncate ${
                                  isSelected
                                    ? "text-emerald-200"
                                    : "text-zinc-200"
                                }`}
                                title={video.video_source}
                              >
                                {video.video_source}
                              </p>
                              <p className="text-xs text-zinc-500 mt-1">
                                {new Date(video.created_at).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  }
                                )}
                              </p>
                              {video.summary && (
                                <p className="text-xs text-zinc-400 mt-2 line-clamp-2">
                                  {video.summary.substring(0, 100)}...
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {isSelected && (
                                <div className="flex items-center justify-center rounded-full bg-emerald-400/20 p-1">
                                  <svg
                                    className="h-4 w-4 text-emerald-300"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </div>
                              )}
                              <button
                                onClick={(e) => handleDeleteVideo(video.id, e)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity rounded-lg p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
                                title="Delete video"
                              >
                                <svg
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Sidebar Footer */}
              <div className="shrink-0 border-t border-white/10 bg-black/40 px-4 py-3">
                <p className="text-xs text-zinc-500 text-center">
                  {historyVideos.length} video{historyVideos.length !== 1 ? "s" : ""} analyzed
                </p>
              </div>
            </div>
          </aside>
        )}

        {/* Sidebar Toggle Button (when closed) */}
        {user && !sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="fixed left-0 top-1/2 z-10 -translate-y-1/2 rounded-r-xl border border-l-0 border-white/10 bg-black/30 px-2 py-4 text-zinc-400 transition hover:bg-black/50 hover:text-zinc-300 backdrop-blur-sm"
            title="Show sidebar"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}

        {/* Center Column - Analysis Section with scrollable content */}
        <section className="flex flex-1 flex-col overflow-hidden border-r border-white/10">
          <div className="flex flex-1 flex-col overflow-y-auto px-6 py-6 lg:px-10">
            {/* Title Section */}
            <div className="mb-6 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-zinc-50 sm:text-3xl">
                    Analyze a video for{" "}
                    <span className="bg-linear-to-r from-zinc-100 via-zinc-300 to-zinc-500 bg-clip-text text-transparent">
                      {userID || "this workspace"}
                    </span>
                  </h1>
                  <p className="max-w-xl text-base text-zinc-300 mt-2">
                    Paste a YouTube URL and get a tailored summary, insights, and action items.
                    {user && " Select a video from the sidebar to view previous analyses."}
                  </p>
                </div>
              </div>
            </div>

            {/* Video Input Form */}
            <form
              onSubmit={handleAnalyze}
              className="mb-6 flex w-full max-w-xl flex-col gap-4 rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur-xl sm:flex-row sm:items-end"
            >
              <div className="flex-1">
                <label
                  htmlFor="video-url"
                  className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-zinc-400"
                >
                  Video link
                </label>
                <input
                  id="video-url"
                  type="url"
                  inputMode="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-base text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                  value={videoSource}
                  onChange={(e) => setVideoSource(e.target.value)}
                  disabled={isAnalyzing}
                />
              </div>

              <div className="flex flex-col gap-2 sm:w-48">
                <button
                  type="submit"
                  disabled={isAnalyzing}
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-zinc-50 px-6 py-3 text-sm font-semibold text-zinc-950 shadow-[0_0_0_1px_rgba(255,255,255,0.08)] shadow-zinc-950/50 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-400/60"
                >
                  {isAnalyzing ? "Analyzing…" : "Generate insights"}
                  {!isAnalyzing && (
                    <span className="text-xs text-zinc-700 transition group-hover:translate-x-0.5">
                      →
                    </span>
                  )}
                </button>
              </div>
            </form>

            {analysisError && (
              <div className="mb-6 max-w-xl text-sm text-red-300">
                {analysisError.includes("https://") ? (
                  <p>
                    {analysisError.split("https://")[0]}
                    <a 
                      href={`https://${analysisError.split("https://")[1]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-red-200 transition-colors"
                    >
                      https://{analysisError.split("https://")[1]}
                    </a>
                  </p>
                ) : (
                  <p>{analysisError}</p>
                )}
              </div>
            )}

            {/* Analysis Results - Scrollable */}
            <div className="space-y-4 rounded-3xl border border-white/15 bg-white/5 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.75)] backdrop-blur-2xl">
              {/* Video Player with Glassmorphism */}
              {videoSource.trim() && isYouTubeUrl(videoSource.trim()) ? (
                <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-white/10 via-white/5 to-transparent shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] backdrop-blur-2xl">
                  {/* Glassmorphism background effects */}
                  <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_top_left,#ffffff15,transparent_50%),radial-gradient(circle_at_bottom_right,#4ade8020,transparent_50%)]" />
                  
                  {/* Video Container - Responsive with aspect ratio */}
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}> {/* 16:9 aspect ratio */}
                    <div className="absolute inset-0 p-4">
                      <iframe
                        src={`https://www.youtube.com/embed/${getYouTubeVideoId(videoSource.trim())}?rel=0&modestbranding=1`}
                        className="h-full w-full rounded-xl border border-white/10 shadow-lg"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="Video player"
                      />
                    </div>
                  </div>
                  
                  {/* Video Info Footer */}
                  <div className="relative flex items-center border-t border-white/10 bg-black/20 px-5 py-4 backdrop-blur-sm">
                    <span className="truncate text-base font-medium text-zinc-200">
                      {videoSource.trim()}
                    </span>
                  </div>
                </div>
              ) : videoSource.trim() ? (
                <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-white/10 via-white/5 to-transparent shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] backdrop-blur-2xl">
                  {/* Glassmorphism background effects */}
                  <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_top_left,#ffffff15,transparent_50%),radial-gradient(circle_at_bottom_right,#4ade8020,transparent_50%)]" />
                  
                  {/* Placeholder for non-YouTube videos */}
                  <div className="relative flex items-center justify-center py-16 px-6">
                    <div className="text-center">
                      <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
                        <svg
                          className="h-8 w-8 text-zinc-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-zinc-300 mb-1">
                        Video URL Detected
                      </p>
                      <p className="text-xs text-zinc-500">
                        {videoSource.trim()}
                      </p>
                      <p className="mt-3 text-xs text-zinc-400">
                        Only YouTube videos can be embedded. Other video sources are processed via API.
                      </p>
                    </div>
                  </div>
                  
                  {/* Video Info Footer */}
                  <div className="relative flex items-center border-t border-white/10 bg-black/20 px-5 py-4 backdrop-blur-sm">
                    <span className="truncate text-base font-medium text-zinc-200">
                      {videoSource.trim()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-white/10 via-white/5 to-transparent shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] backdrop-blur-2xl">
                  {/* Glassmorphism background effects */}
                  <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_top_left,#ffffff15,transparent_50%),radial-gradient(circle_at_bottom_right,#4ade8020,transparent_50%)]" />
                  
                  {/* Empty State */}
                  <div className="relative flex items-center justify-center py-16 px-6">
                    <div className="text-center">
                      <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
                        <svg
                          className="h-8 w-8 text-zinc-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-zinc-300">
                        No video selected
                      </p>
                      <p className="mt-2 text-xs text-zinc-500">
                        Paste a YouTube URL above to analyze
                      </p>
                    </div>
                  </div>
                  
                  {/* Video Info Footer */}
                  <div className="relative flex items-center border-t border-white/10 bg-black/20 px-5 py-4 backdrop-blur-sm">
                    <span className="truncate text-base font-medium text-zinc-400">
                      Your workspace video
                    </span>
                  </div>
                </div>
              )}

              {/* Summary Section */}
              {analysis?.summary && (
                <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 via-white/5 to-transparent p-5 backdrop-blur-xl">
                  <div className="mb-3 flex items-center gap-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-400/20 border border-emerald-400/30">
                      <svg
                        className="h-3.5 w-3.5 text-emerald-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-sm font-semibold text-zinc-200">
                      Summary
                    </h3>
                  </div>
                  <div className="text-sm text-zinc-300 leading-relaxed">
                    {formatMarkdownText(summaryText)}
                  </div>
                </div>
              )}

              {/* Insights and Action Items */}
              {(insightsText || hasActionItems) && (
                <div className={`grid gap-3 ${hasActionItems && insightsText ? 'sm:grid-cols-2' : 'sm:grid-cols-1'}`}>
                  {/* Key Insights */}
                  {insightsText && (
                    <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 via-white/5 to-transparent p-4 backdrop-blur-xl">
                      <div className="mb-3 flex items-center gap-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-400/20 border border-blue-400/30">
                          <svg
                            className="h-3.5 w-3.5 text-blue-300"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                            />
                          </svg>
                        </div>
                        <h3 className="text-sm font-semibold text-zinc-200">
                          Key Insights
                        </h3>
                      </div>
                      <div className="text-sm text-zinc-300 leading-relaxed">
                        {formatMarkdownText(insightsText)}
                      </div>
                    </div>
                  )}

                  {/* Action Items - Only show if there are actual action items */}
                  {hasActionItems && (() => {
                    const parsedItems = parseActionItems(actionItemsText);
                    const hasParsedItems = parsedItems.length > 0;
                    
                    return (
                      <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 via-white/5 to-transparent p-4 backdrop-blur-xl">
                        <div className="mb-3 flex items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-400/20 border border-amber-400/30">
                            <svg
                              className="h-3.5 w-3.5 text-amber-300"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                              />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-zinc-200">
                              Action Items
                            </h3>
                          </div>
                          {hasParsedItems && (
                            <span className="rounded-full bg-amber-400/20 border border-amber-400/30 px-2 py-0.5 text-xs font-medium text-amber-300">
                              {parsedItems.length}
                            </span>
                          )}
                        </div>
                      
                      {hasParsedItems ? (
                        <div className="space-y-3">
                          {parsedItems.map((item) => (
                            <div
                              key={item.id}
                              className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/5 via-white/5 to-transparent p-4 transition-all hover:border-white/20 hover:bg-white/10"
                            >
                              {/* Glassmorphism effect */}
                              <div className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_top_left,#ffffff08,transparent_50%)]" />
                              
                              <div className="relative">
                                {/* Task Header */}
                                <div className="mb-3 flex items-start gap-3">
                                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-400/20 border border-emerald-400/30">
                                    <span className="text-xs font-semibold text-emerald-300">
                                      {item.id}
                                    </span>
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium leading-relaxed text-zinc-100">
                                      {item.task}
                                    </p>
                                  </div>
                                </div>
                                
                                {/* Metadata */}
                                <div className="ml-9 flex flex-wrap gap-4 text-xs">
                                  <div className="flex items-center gap-1.5 text-zinc-400">
                                    <svg
                                      className="h-3.5 w-3.5 shrink-0"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                      />
                                    </svg>
                                    <span className={item.owner === "Unspecified" ? "text-zinc-500" : "text-zinc-300"}>
                                      {item.owner}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-zinc-400">
                                    <svg
                                      className="h-3.5 w-3.5 shrink-0"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                      />
                                    </svg>
                                    <span className={item.deadline === "Unspecified" ? "text-zinc-500" : "text-zinc-300"}>
                                      {item.deadline}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        // Fallback to markdown rendering if parsing fails
                        <div className="text-sm text-zinc-300">
                          {formatMarkdownText(actionItemsText)}
                        </div>
                      )}
                    </div>
                  );
                })()}
                </div>
              )}

            </div>
          </div>
        </section>

        {/* Right Column - Chat Section with Fixed Height */}
        <section className="flex h-full w-full flex-col border-l border-white/10 bg-black/40 lg:w-[450px] lg:shrink-0">
          {/* Chat Header */}
          <div className="shrink-0 border-b border-white/10 bg-black/30 px-6 py-4 backdrop-blur-sm">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-400">
              Chat with this video
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              Ask questions and get answers grounded in the video content.
            </p>
          </div>

          {/* Chat Messages - Fixed height scrollable area */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-4">
              {chatMessages.length === 0 && (
                <div className="flex h-full items-center justify-center">
                  <div className="max-w-sm text-center">
                    {selectedVideo && historyQuestions.length === 0 && (
                      <>
                        <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                          Ask questions about this video:
                        </p>
                        <div className="space-y-2 text-sm text-zinc-300">
                          <p className="font-medium">
                            "What are the main arguments?"
                          </p>
                          <p className="font-medium">
                            "Summarize this for an executive."
                          </p>
                        </div>
                      </>
                    )}
                    {!selectedVideo && (
                      <>
                        <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                          Once you analyze a video, start asking questions like
                        </p>
                        <div className="space-y-2 text-sm text-zinc-300">
                          <p className="font-medium">
                            "What are the main arguments?"
                          </p>
                          <p className="font-medium">
                            "Summarize this for an executive."
                          </p>
                        </div>
                      </>
                    )}
                    {selectedVideo && historyQuestions.length > 0 && (
                      <div className="mt-6 pt-4 border-t border-white/10">
                        <p className="text-xs text-zinc-500 mb-3 uppercase tracking-wide">
                          Previous Questions ({historyQuestions.length})
                        </p>
                        <div className="space-y-3 max-h-96 overflow-y-auto text-left">
                          {historyQuestions.map((q) => {
                            const isExpanded = expandedAnswers.has(q.id);
                            const shouldTruncate = q.answer.length > 200;
                            
                            return (
                              <div
                                key={q.id}
                                className="group rounded-lg border border-white/10 bg-white/5 p-3 transition hover:border-white/20 hover:bg-white/10"
                              >
                                <div className="mb-2 flex items-start gap-2">
                                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-blue-400/20 border border-blue-400/30">
                                    <svg
                                      className="h-3 w-3 text-blue-300"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                  </div>
                                  <p className="flex-1 text-sm font-medium text-zinc-200 leading-relaxed">
                                    {q.question}
                                  </p>
                                </div>
                                
                                <div className="ml-7">
                                  <div className={`text-sm text-zinc-300 leading-relaxed ${!isExpanded && shouldTruncate ? "line-clamp-4" : ""}`}>
                                    {formatMarkdownText(q.answer)}
                                  </div>
                                  
                                  {shouldTruncate && (
                                    <button
                                      onClick={() => {
                                        setExpandedAnswers(prev => {
                                          const newSet = new Set(prev);
                                          if (isExpanded) {
                                            newSet.delete(q.id);
                                          } else {
                                            newSet.add(q.id);
                                          }
                                          return newSet;
                                        });
                                      }}
                                      className="mt-2 text-emerald-400 hover:text-emerald-300 text-xs font-medium transition flex items-center gap-1.5"
                                    >
                                      {isExpanded ? (
                                        <>
                                          <svg
                                            className="h-3.5 w-3.5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M5 15l7-7 7 7"
                                            />
                                          </svg>
                                          Show less
                                        </>
                                      ) : (
                                        <>
                                          <svg
                                            className="h-3.5 w-3.5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M19 9l-7 7-7-7"
                                            />
                                          </svg>
                                          Show more
                                        </>
                                      )}
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-emerald-500/90 text-emerald-950 font-medium"
                        : "bg-white/5 text-zinc-100"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="text-zinc-100">
                        {formatMarkdownText(msg.content)}
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Input - Fixed at bottom */}
          <div className="shrink-0 border-t border-white/10 bg-black/30 px-6 py-4 backdrop-blur-sm">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <input
                type="text"
                placeholder="Ask anything about this video…"
                className="flex-1 rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-base text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={isChatting || !videoSource.trim()}
              />
              <button
                type="submit"
                disabled={isChatting || !videoSource.trim()}
                className="inline-flex items-center justify-center rounded-xl bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-emerald-950 shadow-sm transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-emerald-700/70"
              >
                {isChatting ? "Thinking…" : "Send"}
              </button>
            </form>

            {chatError && (
              <div className="mt-3 text-sm text-red-300">
                {chatError.includes("https://") ? (
                  <p>
                    {chatError.split("https://")[0]}
                    <a 
                      href={`https://${chatError.split("https://")[1]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-red-200 transition-colors"
                    >
                      https://{chatError.split("https://")[1]}
                    </a>
                  </p>
                ) : (
                  <p>{chatError}</p>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
