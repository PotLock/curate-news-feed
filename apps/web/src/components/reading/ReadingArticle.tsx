import { Button } from "../ui/button";
import { Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import type { PanInfo } from "motion/react";
import { useReadingSettings } from "@/contexts/reading-settings-context";
import { authClient } from "@/lib/auth-client";

// Helper function to convert Twitter handles to clickable links
const linkifyTwitterHandles = (text: string) => {
  // Regex to match @username (alphanumeric + underscore, not at start of word boundary after @)
  const twitterHandleRegex = /(@)([a-zA-Z0-9_]+)/g;
  
  return text.split(twitterHandleRegex).map((part, index) => {
    // If this part is '@', skip it as it's handled with the next part
    if (part === '@') return null;
    
    // If the previous part was '@', this is a username
    const prevPart = text.split(twitterHandleRegex)[index - 1];
    if (prevPart === '@') {
      return (
        <a
          key={index}
          href={`https://twitter.com/${part}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          @{part}
        </a>
      );
    }
    
    // Regular text
    return part;
  }).filter(Boolean); // Remove null entries
};

interface ArticleItem {
  id?: string;
  title: string;
  date: string;
  published?: string;
  author?: Array<{
    name?: string;
    email?: string;
    link?: string;
    avatar?: string;
  }>;
  category?: Array<{
    name?: string;
    domain?: string;
    scheme?: string;
    term?: string;
  }>;
  description?: string;
  content?: string;
  link: string;
  image?:
    | string
    | { url: string; type?: string; length?: number; title?: string };
  copyright?: string;
}

interface ReadingArticleProps {
  item: ArticleItem;
  feedId: string;
  prevItem?: ArticleItem | null;
  nextItem?: ArticleItem | null;
  generateSlug: (title: string) => string;
  onNavigateToNext?: () => void;
  onNavigateToPrev?: () => void;
  onNavigateToArticle?: (item: ArticleItem) => void; // Keep for backward compatibility
  onTTSStateChange?: (isPlaying: boolean, isPaused: boolean) => void;
  onTTSHandlersReady?: (handlers: {
    startTTS: () => void;
    pauseTTS: () => void;
    resumeTTS: () => void;
    stopTTS: () => void;
  }) => void;
  sourceFeed?: {
    id: string;
    title: string;
  };
  showMultiFeedIndicator?: boolean;
}

export function ReadingArticle({
  item,
  feedId,
  prevItem,
  nextItem,
  generateSlug,
  onNavigateToNext,
  onNavigateToPrev,
  onNavigateToArticle,
  onTTSStateChange,
  onTTSHandlersReady,
  sourceFeed,
  showMultiFeedIndicator,
}: ReadingArticleProps) {
  const navigate = useNavigate();
  const { showImages, autoAdvance, readingSpeed, textToSpeech } =
    useReadingSettings();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(
    null
  );
  const [swipeOpacity, setSwipeOpacity] = useState(0);

  // Track swipe distance for visual feedback
  const swipeDistance = useRef(0);

  // Auto-advance state
  const [timeRemaining, setTimeRemaining] = useState(readingSpeed);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Text-to-Speech state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTTSPaused, setIsTTSPaused] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Notify parent of TTS state changes
  useEffect(() => {
    onTTSStateChange?.(isPlaying, isTTSPaused);
  }, [isPlaying, isTTSPaused, onTTSStateChange]);

  // Auto-advance functionality
  const startAutoAdvance = () => {
    if (!autoAdvance || !nextItem) return;

    // Clear any existing timers
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);

    setTimeRemaining(readingSpeed);
    setIsPaused(false);

    // Update countdown every second
    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Navigate to next article
          if (intervalRef.current) clearInterval(intervalRef.current);
          navigate({
            to: "/reading/$feedId/$slug",
            params: { feedId, slug: generateSlug(nextItem.title) },
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseAutoAdvance = () => {
    setIsPaused(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const resumeAutoAdvance = () => {
    if (!autoAdvance || !nextItem || timeRemaining <= 0) return;

    setIsPaused(false);

    // Resume with current timeRemaining value
    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Navigate to next article
          if (intervalRef.current) clearInterval(intervalRef.current);
          navigate({
            to: "/reading/$feedId/$slug",
            params: { feedId, slug: generateSlug(nextItem.title) },
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Start auto-advance when component mounts or settings change
  useEffect(() => {
    if (autoAdvance && nextItem && !isTransitioning) {
      startAutoAdvance();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoAdvance, readingSpeed, nextItem, isTransitioning]);

  // Pause auto-advance on user interaction
  const handleMouseEnter = () => {
    if (autoAdvance) pauseAutoAdvance();
  };

  const handleMouseLeave = () => {
    if (autoAdvance && isPaused) resumeAutoAdvance();
  };

  // Text-to-Speech functionality
  const extractTextContent = (articleData: ArticleItem) => {
    // Start with title
    let textToRead = item.title + ". ";

    // Add content if available (parsed and cleaned)
    const contentParagraphs = parseContent(item.content || "");
    if (contentParagraphs.length > 0) {
      textToRead += contentParagraphs.join(" ");
    } else if (item.description) {
      // Fallback to description if no content
      const cleanDescription = item.description
        .replace(/<[^>]*>/g, " ") // Remove HTML tags
        .replace(/\s+/g, " ") // Normalize whitespace
        .trim();
      textToRead += cleanDescription;
    }

    return textToRead;
  };

  const startTextToSpeech = () => {
    if (!window.speechSynthesis) {
      console.warn("Text-to-speech not supported in this browser");
      return;
    }

    // Stop any existing speech
    window.speechSynthesis.cancel();

    const textToRead = extractTextContent(item);
    const utterance = new SpeechSynthesisUtterance(textToRead);

    // Configure speech settings
    utterance.rate = 0.9; // Slightly slower for better comprehension
    utterance.pitch = 1;
    utterance.volume = 1;

    // Set voice if selectedVoice is configured
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      // Use first available voice or find specific voice
      utterance.voice = voices[0];
    }

    // Event handlers
    utterance.onstart = () => {
      setIsPlaying(true);
      setIsTTSPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsTTSPaused(false);
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event.error);
      setIsPlaying(false);
      setIsTTSPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const pauseTextToSpeech = () => {
    if (window.speechSynthesis && isPlaying) {
      window.speechSynthesis.pause();
      setIsTTSPaused(true);
    }
  };

  const resumeTextToSpeech = () => {
    if (window.speechSynthesis && isTTSPaused) {
      window.speechSynthesis.resume();
      setIsTTSPaused(false);
    }
  };

  const stopTextToSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsTTSPaused(false);
    }
  };

  // Clean up TTS when component unmounts or article changes
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [item.id]);

  // Provide TTS handlers to parent
  useEffect(() => {
    onTTSHandlersReady?.({
      startTTS: startTextToSpeech,
      pauseTTS: pauseTextToSpeech,
      resumeTTS: resumeTextToSpeech,
      stopTTS: stopTextToSpeech,
    });
  }, [onTTSHandlersReady]);

  // Save like/dislike preference to localStorage
  const saveLikeDislikePreference = async (liked: boolean) => {
    try {
      // Get user account ID (same logic as ReadingActions)
      let accountId: string;
      try {
        const { data: session } = await authClient.getSession();
        if (session?.user) {
          try {
            const { data: nearProfile } = await authClient.near.getProfile();
            accountId =
              (window as any)?.near?.accountId?.() ||
              session.user.email ||
              session.user.id;
          } catch {
            accountId = session.user.email || session.user.id;
          }
        } else {
          // Use a generic account ID for anonymous users
          accountId = "anonymous-user";
        }
      } catch {
        // Use a generic account ID for anonymous users
        accountId = "anonymous-user";
      }

      const preferencesKey = `article-preferences-${accountId}`;
      const preferences = JSON.parse(
        localStorage.getItem(preferencesKey) || "{}"
      );

      preferences[item.id || item.title] = {
        id: item.id || item.title,
        title: item.title,
        url: item.link,
        feedId: feedId,
        liked: liked,
        preferenceAt: new Date().toISOString(),
      };

      localStorage.setItem(preferencesKey, JSON.stringify(preferences));
    } catch (error) {
      console.warn("Failed to save preference:", error);
    }
  };

  const handleDrag = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const offset = info.offset.x;
    swipeDistance.current = offset;

    // Update swipe direction and opacity based on gesture
    if (Math.abs(offset) > 20) {
      setSwipeDirection(offset > 0 ? "right" : "left");
      // Calculate opacity based on swipe distance (max at 200px)
      const opacity = Math.min(Math.abs(offset) / 200, 0.6);
      setSwipeOpacity(opacity);
    } else {
      setSwipeDirection(null);
      setSwipeOpacity(0);
    }
  };

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const threshold = 100;
    const velocity = info.velocity.x;
    const offset = info.offset.x;

    // Reset swipe visuals
    setSwipeDirection(null);
    setSwipeOpacity(0);
    swipeDistance.current = 0;

    // Check if swipe is strong enough (velocity or distance)
    if (Math.abs(velocity) > 500 || Math.abs(offset) > threshold) {
      // Pause auto-advance when user manually navigates
      if (autoAdvance) pauseAutoAdvance();

      // Save like/dislike preference based on swipe direction
      const liked = offset > 0; // Right swipe = like, Left swipe = dislike
      saveLikeDislikePreference(liked);

      // Both left and right swipes go to next article (if available)
      if (nextItem) {
        setIsTransitioning(true);
        // Use new navigation handlers if provided
        setTimeout(() => {
          if (onNavigateToNext) {
            onNavigateToNext();
          } else if (onNavigateToArticle) {
            // Backward compatibility
            onNavigateToArticle(nextItem);
          } else {
            navigate({
              to: "/reading/$feedId/$slug",
              params: { feedId, slug: generateSlug(nextItem.title) },
            });
          }
          setIsTransitioning(false);
        }, 200); // Quick transition
      }
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 31536000)
      return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
  };

  const getImageUrl = (image: string | { url: string } | undefined) => {
    if (!image) return null;
    return typeof image === "string" ? image : image.url;
  };

  const parseContent = (content: string) => {
    if (!content) return [];

    // Remove HTML tags and clean up text
    const textContent = content
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    // Split by sentences (periods followed by space and capital letter or end of string)
    const sentences = textContent
      .split(/\.\s+(?=[A-Z])/)
      .filter((s) => s.trim().length > 0);

    if (sentences.length === 0) return [];

    // First sentence becomes first paragraph
    const firstParagraph =
      sentences[0] + (sentences[0].endsWith(".") ? "" : ".");

    // All remaining sentences become second paragraph
    if (sentences.length > 1) {
      const remainingSentences = sentences.slice(1);
      const secondParagraph = remainingSentences
        .map((sentence) => sentence + (sentence.endsWith(".") ? "" : "."))
        .join(" ");

      return [firstParagraph, secondParagraph];
    }

    return [firstParagraph];
  };


  const ArticleCard = ({
    articleData,
    isBackground = false,
  }: {
    articleData: ArticleItem;
    isBackground?: boolean;
  }) => (
    <article
      className={`w-full max-w-[660px] justify-center gap-[24px] sm:gap-[32px] lg:gap-[40px] flex flex-col bg-white rounded-2xl ${isBackground ? "" : "shadow-xl"}`}
    >
      <div className="p-6 sm:p-8">
        {/* 1. Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-[40px] font-bold leading-tight sm:leading-[40px] lg:leading-[50px] text-[#0A0A0A] font-Inter px-4 sm:px-0">
            {item.title}
          </h1>
          {/* Source Feed Indicator (for multi-feed) */}
          {showMultiFeedIndicator && sourceFeed && (
            <div className="mt-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                from {sourceFeed.title}
              </span>
            </div>
          )}
        </div>

        {/* 2. Meta Information Row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 px-4 sm:px-0 mb-6">
          {/* 2.1.1 Time div */}
          <div className="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M12 6V12H16.5M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                stroke="#09090B"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-[#737373] font-Inter text-sm sm:text-base font-normal leading-6">
              {formatTimeAgo(item.date)}
            </span>
          </div>

          {/* 2.1.2 Author div */}
          <div className="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M4 22H20C20.5304 22 21.0391 21.7893 21.4142 21.4142C21.7893 21.0391 22 20.5304 22 20V4C22 3.46957 21.7893 2.96086 21.4142 2.58579C21.0391 2.21071 20.5304 2 20 2H8C7.46957 2 6.96086 2.21071 6.58579 2.58579C6.21071 2.96086 6 3.46957 6 4V20C6 20.5304 5.78929 21.0391 5.41421 21.4142C5.03914 21.7893 4.53043 22 4 22ZM4 22C3.46957 22 2.96086 21.7893 2.58579 21.4142C2.21071 21.0391 2 20.5304 2 20V11C2 9.9 2.9 9 4 9H6M18 14H10M15 18H10M10 6H18V10H10V6Z"
                stroke="#020617"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-[#737373] font-Inter text-sm sm:text-base font-medium leading-6">
              From{" "}
              {item.author && item.author[0] ? item.author[0].name : "Unknown"}
            </span>
          </div>
        </div>

        {/* 3. Feed Image - Only show for non-background cards and if showImages is enabled */}
        {!isBackground && showImages && getImageUrl(item.image) && (
          <div className="mb-6 sm:mb-8 lg:mb-10 px-4 sm:px-0">
            <img
              src={getImageUrl(item.image)!}
              alt={item.title}
              className="w-full rounded-lg sm:rounded-xl object-cover max-h-[300px] sm:max-h-[400px] lg:max-h-[414px]"
            />
          </div>
        )}

        {/* 4. Content Paragraphs */}
        {parseContent(item.content || "").length > 0 && (
          <div className="flex flex-col px-4 sm:px-0">
            {/* First paragraph with special styling */}
            <p className="text-[#737373] font-Inter text-lg sm:text-xl lg:text-2xl font-light leading-[28px] sm:leading-[32px] lg:leading-[39px] mb-6 sm:mb-8">
              {linkifyTwitterHandles(parseContent(item.content || "")[0])}
            </p>

            {/* Subsequent paragraphs */}
            {parseContent(item.content || "")
              .slice(1)
              .map((paragraph, index) => (
                <p
                  key={index}
                  className="text-[#0A0A0A] font-Inter text-base text-wrap sm:text-lg font-normal leading-[24px] sm:leading-[29.25px] mb-4 sm:mb-6"
                >
                  {linkifyTwitterHandles(paragraph)}
                </p>
              ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center min-h-[62px] justify-between border-t-[1px] border-[#E2E8F0] gap-4 sm:gap-2 py-4 sm:py-0 px-4 sm:px-0 mt-6">
          <div className="flex gap-2 items-center justify-center sm:justify-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="sm:w-6 sm:h-6"
            >
              <path
                d="M17.743 3H20.7952L14.1285 10.6707L22 21.0723H15.8153L10.996 14.7671L5.45382 21.0723H2.40161L9.5502 12.8795L2 3H8.34538L12.7229 8.78313L17.743 3ZM16.6586 19.2249H18.3454L7.42169 4.72691H5.5743L16.6586 19.2249Z"
                fill="#09090B"
              />
            </svg>
            <p className="text-sm sm:text-base text-[#737373] leading-[24px] text-center sm:text-left">
              Submitted by{" "}
              {item.author && item.author[0] ? item.author[0].name : "Unknown"}
            </p>
          </div>
          <Button asChild className="w-full sm:w-auto touch-manipulation relative z-40">
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="15"
                viewBox="0 0 17 16"
                fill="none"
                className="sm:w-[17px] sm:h-4"
              >
                <path
                  d="M10.5 2H14.5M14.5 2V6M14.5 2L7.16667 9.33333M12.5 8.66667V12.6667C12.5 13.0203 12.3595 13.3594 12.1095 13.6095C11.8594 13.8595 11.5203 14 11.1667 14H3.83333C3.47971 14 3.14057 13.8595 2.89052 13.6095C2.64048 13.3594 2.5 13.0203 2.5 12.6667V5.33333C2.5 4.97971 2.64048 4.64057 2.89052 4.39052C3.14057 4.14048 3.47971 4 3.83333 4H7.83333"
                  stroke="#F8FAFC"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p>View Tweet</p>
            </a>
          </Button>
        </div>

        {/* Fallback to description if no content */}
        {!item.content && item.description && (
          <div className="flex flex-col px-4 sm:px-0">
            <p className="text-[#737373] font-Inter text-lg sm:text-xl lg:text-2xl font-light leading-[28px] sm:leading-[32px] lg:leading-[39px] mb-6 sm:mb-8">
              {linkifyTwitterHandles(item.description)}
            </p>
          </div>
        )}
      </div>
    </article>
  );

  // Simple fade animations for content transitions
  const variants = {
    enter: {
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
    center: {
      opacity: 1,
      transition: {
        duration: 0.2,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <div
      className="h-full overflow-y-auto w-full max-w-[660px] pb-[70px] sm:pb-0"
      style={{ perspective: "1000px" }}
    >
      {/* Card Container - Stationary */}
      <div className="relative">
        {/* Main card with content transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={item.id}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className="relative"
            style={{ zIndex: 10 }}
          >
            {/* Invisible drag layer for gesture detection */}
            <motion.div
              drag="x"
              dragElastic={0.2}
              dragConstraints={{ left: -300, right: 300 }}
              dragSnapToOrigin={true}
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              whileTap={{ scale: 0.99 }}
              className="absolute inset-0 z-30 cursor-grab active:cursor-grabbing touch-manipulation"
              style={{ touchAction: "pan-x" }}
            />

            {/* Stationary card content */}
            <ArticleCard articleData={item} />

            {/* Swipe hints - Green for like (right), Red for dislike (left) */}
            {swipeDirection && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: swipeOpacity }}
                exit={{ opacity: 0 }}
                className={`absolute inset-0 rounded-2xl flex items-center justify-center pointer-events-none z-20 ${
                  swipeDirection === "right"
                    ? "bg-green-500/20 border-2 border-green-500/50"
                    : "bg-red-500/20 border-2 border-red-500/50"
                }`}
              >
                <div
                  className={`flex flex-col items-center gap-2 ${
                    swipeDirection === "right"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {swipeDirection === "right" ? (
                    <>
                      {/* Like/Heart icon */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="drop-shadow-lg"
                      >
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                      <span className="text-lg font-bold drop-shadow-lg">
                        LIKE
                      </span>
                    </>
                  ) : (
                    <>
                      {/* Dislike/X icon */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="drop-shadow-lg"
                      >
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                      </svg>
                      <span className="text-lg font-bold drop-shadow-lg">
                        PASS
                      </span>
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {/* Auto-advance countdown indicator */}
            {autoAdvance && nextItem && timeRemaining > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: isPaused ? 0.3 : 1, scale: 1 }}
                className="absolute top-4 right-4 bg-black/80 text-white px-3 py-2 rounded-full text-sm font-medium flex items-center gap-2 backdrop-blur-sm"
              >
                {isPaused ? (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <rect
                        x="6"
                        y="4"
                        width="4"
                        height="16"
                        fill="currentColor"
                      />
                      <rect
                        x="14"
                        y="4"
                        width="4"
                        height="16"
                        fill="currentColor"
                      />
                    </svg>
                    Paused
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    {timeRemaining}s
                  </>
                )}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
