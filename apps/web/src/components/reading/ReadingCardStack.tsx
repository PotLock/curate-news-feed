import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import type { PanInfo } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import { useReadingSettings } from "@/contexts/reading-settings-context";
import { authClient } from "@/lib/auth-client";
import { Button } from "../ui/button";

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

interface ReadingCardStackProps {
  articles: ArticleItem[];
  feedId: string;
  currentIndex: number;
  onNavigateToNext: () => void;
  onNavigateToPrev: () => void;
  generateSlug: (title: string) => string;
  sourceFeed?: {
    id: string;
    title: string;
  };
  showMultiFeedIndicator?: boolean;
}

export function ReadingCardStack({
  articles,
  feedId,
  currentIndex,
  onNavigateToNext,
  onNavigateToPrev,
  generateSlug,
  sourceFeed,
  showMultiFeedIndicator,
}: ReadingCardStackProps) {
  const navigate = useNavigate();
  const { showImages, autoAdvance, readingSpeed } = useReadingSettings();
  
  // Get visible articles (current + next 3)
  const visibleArticles = articles.slice(currentIndex, Math.min(currentIndex + 4, articles.length));
  
  // Save like/dislike preference to localStorage
  const saveLikeDislikePreference = async (article: ArticleItem, liked: boolean) => {
    try {
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
          accountId = "anonymous-user";
        }
      } catch {
        accountId = "anonymous-user";
      }

      const preferencesKey = `article-preferences-${accountId}`;
      const preferences = JSON.parse(
        localStorage.getItem(preferencesKey) || "{}"
      );

      preferences[article.id || article.title] = {
        id: article.id || article.title,
        title: article.title,
        url: article.link,
        feedId: feedId,
        liked: liked,
        preferenceAt: new Date().toISOString(),
      };

      localStorage.setItem(preferencesKey, JSON.stringify(preferences));
    } catch (error) {
      console.warn("Failed to save preference:", error);
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

    const textContent = content
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const sentences = textContent
      .split(/\.\s+(?=[A-Z])/)
      .filter((s) => s.trim().length > 0);

    if (sentences.length === 0) return [];

    const firstParagraph =
      sentences[0] + (sentences[0].endsWith(".") ? "" : ".");

    if (sentences.length > 1) {
      const remainingSentences = sentences.slice(1);
      const secondParagraph = remainingSentences
        .map((sentence) => sentence + (sentence.endsWith(".") ? "" : "."))
        .join(" ");

      return [firstParagraph, secondParagraph];
    }

    return [firstParagraph];
  };

  return (
    <div className="relative h-full w-full flex items-center justify-center" style={{ perspective: "1000px" }}>
      {/* Card Stack Container */}
      <div className="relative w-full max-w-[660px] h-[600px]">
        <AnimatePresence>
          {visibleArticles.map((article, index) => (
            <Card
              key={article.id || article.title}
              article={article}
              index={index}
              isActive={index === 0}
              totalCards={visibleArticles.length}
              onSwipe={(liked: boolean) => {
                saveLikeDislikePreference(article, liked);
                onNavigateToNext();
              }}
              showImages={showImages}
              formatTimeAgo={formatTimeAgo}
              getImageUrl={getImageUrl}
              parseContent={parseContent}
              sourceFeed={index === 0 ? sourceFeed : undefined}
              showMultiFeedIndicator={index === 0 ? showMultiFeedIndicator : false}
            />
          ))}
        </AnimatePresence>
        
        {/* No more articles indicator */}
        {visibleArticles.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">No more articles</h2>
              <p className="text-gray-600">You've reached the end of the feed</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface CardProps {
  article: ArticleItem;
  index: number;
  isActive: boolean;
  totalCards: number;
  onSwipe: (liked: boolean) => void;
  showImages: boolean;
  formatTimeAgo: (date: string) => string;
  getImageUrl: (image: any) => string | null;
  parseContent: (content: string) => string[];
  sourceFeed?: { id: string; title: string };
  showMultiFeedIndicator?: boolean;
}

function Card({
  article,
  index,
  isActive,
  totalCards,
  onSwipe,
  showImages,
  formatTimeAgo,
  getImageUrl,
  parseContent,
  sourceFeed,
  showMultiFeedIndicator,
}: CardProps) {
  const x = useMotionValue(0);
  
  // Rotation based on drag
  const rotateRaw = useTransform(x, [-150, 150], [-18, 18]);
  
  // Opacity fades out as card is dragged
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  
  // Calculate rotation with offset for stacked cards
  const rotate = useTransform(() => {
    if (!isActive) {
      // Background cards have alternating rotation
      const offset = index % 2 ? 6 : -6;
      return `${offset}deg`;
    }
    return `${rotateRaw.get()}deg`;
  });

  // Scale for depth effect
  const scale = isActive ? 1 : 0.95 - (index * 0.02);
  
  // Y position for stacking
  const yOffset = index * -10;
  
  // Z-index for proper layering
  const zIndex = totalCards - index;

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 100;
    const velocity = info.velocity.x;
    const offset = info.offset.x;

    // Check if swipe is strong enough
    if (Math.abs(velocity) > 500 || Math.abs(offset) > threshold) {
      const liked = offset > 0;
      onSwipe(liked);
    }
  };

  return (
    <motion.div
      className="absolute inset-0"
      style={{
        x: isActive ? x : 0,
        opacity,
        rotate,
        scale,
        y: yOffset,
        zIndex,
      }}
      drag={isActive ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      initial={false}
      animate={{
        scale,
        y: yOffset,
      }}
      exit={{
        x: x.get() > 0 ? 300 : -300,
        opacity: 0,
        transition: { duration: 0.3 }
      }}
      transition={{
        scale: { duration: 0.2 },
        y: { duration: 0.2 },
      }}
    >
      {/* Card Content */}
      <article 
        className={`w-full h-full bg-white rounded-2xl overflow-hidden ${
          isActive ? "shadow-2xl cursor-grab active:cursor-grabbing" : "shadow-lg"
        }`}
      >
        <div className="h-full overflow-y-auto p-6 sm:p-8">
          {/* Title */}
          <div className="text-center mb-4">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight text-[#0A0A0A] font-Inter">
              {article.title}
            </h1>
            {showMultiFeedIndicator && sourceFeed && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  from {sourceFeed.title}
                </span>
              </div>
            )}
          </div>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-4 text-sm">
            <div className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 6V12H16.5M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="#09090B" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-[#737373]">{formatTimeAgo(article.date)}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M4 22H20C20.5304 22 21.0391 21.7893 21.4142 21.4142C21.7893 21.0391 22 20.5304 22 20V4C22 3.46957 21.7893 2.96086 21.4142 2.58579C21.0391 2.21071 20.5304 2 20 2H8C7.46957 2 6.96086 2.21071 6.58579 2.58579C6.21071 2.96086 6 3.46957 6 4V20C6 20.5304 5.78929 21.0391 5.41421 21.4142C5.03914 21.7893 4.53043 22 4 22ZM4 22C3.46957 22 2.96086 21.7893 2.58579 21.4142C2.21071 21.0391 2 20.5304 2 20V11C2 9.9 2.9 9 4 9H6M18 14H10M15 18H10M10 6H18V10H10V6Z" stroke="#020617" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-[#737373]">
                {article.author?.[0]?.name || "Unknown"}
              </span>
            </div>
          </div>

          {/* Image */}
          {showImages && getImageUrl(article.image) && (
            <div className="mb-4">
              <img
                src={getImageUrl(article.image)!}
                alt={article.title}
                className="w-full rounded-lg object-cover max-h-[200px]"
              />
            </div>
          )}

          {/* Content */}
          {parseContent(article.content || "").length > 0 && (
            <div className="space-y-3">
              <p className="text-[#737373] text-base sm:text-lg font-light leading-relaxed">
                {parseContent(article.content || "")[0]}
              </p>
              {parseContent(article.content || "").slice(1).map((paragraph, idx) => (
                <p key={idx} className="text-[#0A0A0A] text-sm sm:text-base leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          )}

          {/* Fallback to description */}
          {!article.content && article.description && (
            <p className="text-[#737373] text-base sm:text-lg font-light leading-relaxed">
              {article.description}
            </p>
          )}

          {/* View Tweet Button */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <Button asChild className="w-full">
              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="15" viewBox="0 0 17 16" fill="none">
                  <path d="M10.5 2H14.5M14.5 2V6M14.5 2L7.16667 9.33333M12.5 8.66667V12.6667C12.5 13.0203 12.3595 13.3594 12.1095 13.6095C11.8594 13.8595 11.5203 14 11.1667 14H3.83333C3.47971 14 3.14057 13.8595 2.89052 13.6095C2.64048 13.3594 2.5 13.0203 2.5 12.6667V5.33333C2.5 4.97971 2.64048 4.64057 2.89052 4.39052C3.14057 4.14048 3.47971 4 3.83333 4H7.83333" stroke="#F8FAFC" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                View Tweet
              </a>
            </Button>
          </div>
        </div>

        {/* Swipe Indicators (only for active card) */}
        {isActive && (
          <>
            {/* Like indicator */}
            <motion.div
              className="absolute inset-0 bg-green-500/20 rounded-2xl pointer-events-none"
              style={{
                opacity: useTransform(x, [0, 100], [0, 1]),
              }}
            >
              <div className="flex items-center justify-center h-full">
                <div className="text-green-600 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  <p className="text-lg font-bold mt-2">LIKE</p>
                </div>
              </div>
            </motion.div>

            {/* Pass indicator */}
            <motion.div
              className="absolute inset-0 bg-red-500/20 rounded-2xl pointer-events-none"
              style={{
                opacity: useTransform(x, [0, -100], [0, 1]),
              }}
            >
              <div className="flex items-center justify-center h-full">
                <div className="text-red-600 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                  <p className="text-lg font-bold mt-2">PASS</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </article>
    </motion.div>
  );
}