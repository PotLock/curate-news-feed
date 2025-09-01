import { Button } from "../ui/button";
import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import type { PanInfo } from "framer-motion";

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
}

export function ReadingArticle({ item, feedId, prevItem, nextItem, generateSlug }: ReadingArticleProps) {
  const navigate = useNavigate();
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [dragDirection, setDragDirection] = useState<"left" | "right" | null>(null);

  const handleDrag = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x;
    // Update drag direction based on swipe direction
    if (Math.abs(offset) > 20) { // Small threshold to avoid jitter
      setDragDirection(offset > 0 ? "right" : "left");
    }
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    const velocity = info.velocity.x;
    const offset = info.offset.x;
    
    // Reset drag direction
    setDragDirection(null);
    
    // Check if swipe is strong enough (velocity or distance)
    if (Math.abs(velocity) > 500 || Math.abs(offset) > threshold) {
      if (offset > 0 && prevItem) {
        // Swipe right - go to previous
        setIsTransitioning(true);
        setExitDirection("right");
        // Wait for exit animation to complete (spring animation + opacity fade)
        setTimeout(() => {
          navigate({
            to: "/reading/$feedId/$slug",
            params: { feedId, slug: generateSlug(prevItem.title) },
          });
        }, 600); // Increased to match animation duration
      } else if (offset < 0 && nextItem) {
        // Swipe left - go to next
        setIsTransitioning(true);
        setExitDirection("left");
        // Wait for exit animation to complete (spring animation + opacity fade)
        setTimeout(() => {
          navigate({
            to: "/reading/$feedId/$slug",
            params: { feedId, slug: generateSlug(nextItem.title) },
          });
        }, 600); // Increased to match animation duration
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

  const ArticleCard = ({ articleData, isBackground = false }: { 
    articleData: ArticleItem, 
    isBackground?: boolean
  }) => (
    <article className={`w-full max-w-[660px] justify-center gap-[24px] sm:gap-[32px] lg:gap-[40px] flex flex-col bg-white rounded-2xl ${isBackground ? '' : 'shadow-xl'}`}>
      <div className="p-6 sm:p-8">
        {/* 1. Title */}
        <h1 className="text-2xl sm:text-3xl lg:text-[40px] font-bold leading-tight sm:leading-[40px] lg:leading-[50px] text-center text-[#0A0A0A] font-Inter px-4 sm:px-0 mb-6">
          {articleData.title}
        </h1>

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
              {formatTimeAgo(articleData.date)}
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
              {articleData.author && articleData.author[0] ? articleData.author[0].name : "Unknown"}
            </span>
          </div>
        </div>

        {/* 3. Feed Image - Only show for non-background cards */}
        {!isBackground && getImageUrl(articleData.image) && (
          <div className="mb-6 sm:mb-8 lg:mb-10 px-4 sm:px-0">
            <img
              src={getImageUrl(articleData.image)!}
              alt={articleData.title}
              className="w-full rounded-lg sm:rounded-xl object-cover max-h-[300px] sm:max-h-[400px] lg:max-h-[414px]"
            />
          </div>
        )}

        {/* 4. Content Paragraphs */}
        {parseContent(articleData.content || '').length > 0 && (
          <div className="flex flex-col px-4 sm:px-0">
            {/* First paragraph with special styling */}
            <p className="text-[#737373] font-Inter text-lg sm:text-xl lg:text-2xl font-light leading-[28px] sm:leading-[32px] lg:leading-[39px] mb-6 sm:mb-8">
              {parseContent(articleData.content || '')[0]}
            </p>

            {/* Subsequent paragraphs */}
            {parseContent(articleData.content || '').slice(1).map((paragraph, index) => (
              <p
                key={index}
                className="text-[#0A0A0A] font-Inter text-base sm:text-lg font-normal leading-[24px] sm:leading-[29.25px] mb-4 sm:mb-6"
              >
                {paragraph}
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
              {articleData.author && articleData.author[0] ? articleData.author[0].name : "Unknown"}
            </p>
          </div>
          <Button asChild className="w-full sm:w-auto touch-manipulation">
            <a href={articleData.link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
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
        {!articleData.content && articleData.description && (
          <div className="flex flex-col px-4 sm:px-0">
            <p className="text-[#737373] font-Inter text-lg sm:text-xl lg:text-2xl font-light leading-[28px] sm:leading-[32px] lg:leading-[39px] mb-6 sm:mb-8">
              {articleData.description}
            </p>
          </div>
        )}
      </div>
    </article>
  );

  // Card stack animations
  const variants = {
    enter: {
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 35,
        opacity: { duration: 0.2 },
      }
    },
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 35,
      }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1200 : -1200,
      opacity: 0,
      scale: 0.8,
      rotateY: direction < 0 ? -25 : 25,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30,
        opacity: { duration: 0.4 },
        scale: { duration: 0.5 },
      }
    }),
  };

  // Background card animations during transition
  const backgroundVariants = {
    hidden: { scale: 0.9, y: 20, opacity: 0.8 },
    visible: { 
      scale: isTransitioning ? 1 : 0.9, 
      y: isTransitioning ? 0 : 20, 
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 35,
        duration: 0.4,
      }
    },
  };

  return (
    <div className="relative w-full max-w-[660px] overflow-visible" style={{ perspective: "1000px" }}>
      {/* Card Stack Container */}
      <div className="relative">
        {/* Background card - Show only one at a time based on drag direction */}
        {(() => {
          // Determine which background card to show
          let backgroundCard = null;
          
          if (dragDirection === "right" && prevItem) {
            // Swiping right - show previous card
            backgroundCard = prevItem;
          } else if (dragDirection === "left" && nextItem) {
            // Swiping left - show next card
            backgroundCard = nextItem;
          } else if (!dragDirection && nextItem) {
            // Default state - show next card
            backgroundCard = nextItem;
          }
          
          return backgroundCard ? (
            <motion.div 
              key={backgroundCard.id || backgroundCard.title}
              className="absolute inset-0 pointer-events-none"
              variants={backgroundVariants}
              initial="hidden"
              animate="visible"
              style={{ zIndex: 0 }}
            >
              <ArticleCard articleData={backgroundCard} isBackground={true} />
            </motion.div>
          ) : null;
        })()}

        {/* Main card (current article) with AnimatePresence for smooth transitions */}
        <AnimatePresence mode="wait" custom={exitDirection === "left" ? -1 : 1}>
          <motion.div
            key={item.id}
            custom={exitDirection === "left" ? -1 : 1}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x"
            dragElastic={0.3}
            dragConstraints={{ left: -300, right: 300 }}
            dragMomentum={false}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            whileDrag={{ 
              scale: 0.95,
              rotateY: 0,
              cursor: "grabbing"
            }}
            className="relative cursor-grab active:cursor-grabbing touch-manipulation"
            style={{ 
              zIndex: 10,
              transformStyle: "preserve-3d",
            }}
          >
            <ArticleCard articleData={item} />
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Navigation Section */}
      <motion.div 
        className="flex w-full max-w-[660px] px-4 sm:px-[60px] lg:px-[120px] py-[16px] sm:py-[21px] flex-col items-center gap-[10px] rounded-b-[12px] sm:rounded-b-[16px] mt-6 relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isTransitioning ? 0.5 : 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{ zIndex: 20 }}
      >
        <div className="flex h-auto sm:h-[65px] px-[16px] sm:px-[24px] py-[8px] sm:py-[12px] justify-center items-center gap-[6px] sm:gap-[8px] rounded-[32px] sm:rounded-[45.5px] bg-white/90 shadow-lg">
          <div className="flex items-center gap-[16px] sm:gap-[28px]">
            {/* Previous Button */}
            {prevItem ? (
              <Button asChild variant={"secondary"} className="flex h-[32px] sm:h-[36px] min-w-[60px] sm:min-w-[80px] px-[8px] sm:px-[12px] py-[6px] sm:py-[8px] justify-center items-center gap-1 rounded-2xl sm:rounded-3xl text-black text-sm sm:text-base touch-manipulation">
                <Link
                  to="/reading/$feedId/$slug"
                  params={{ feedId, slug: generateSlug(prevItem.title) }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 17 17"
                    fill="none"
                    className="sm:w-[17px] sm:h-[17px]"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M15.6667 4.78424C15.6667 4.02631 15.3372 3.36602 14.8193 2.98819C14.2878 2.60048 13.5719 2.53052 12.9476 2.96051L12.9418 2.96454L9.66683 5.36036V5.24871C9.66683 4.55819 9.35173 3.95996 8.86398 3.6203C8.36667 3.27399 7.70102 3.21213 7.118 3.59546L2.17304 6.84678C1.59283 7.22827 1.3335 7.88812 1.3335 8.50003C1.3335 9.11194 1.59283 9.77178 2.17304 10.1533L7.118 13.4046C7.70101 13.7879 8.36667 13.7261 8.86398 13.3798C9.35173 13.0401 9.66683 12.4419 9.66683 11.7513V11.6397L12.9418 14.0355L12.9476 14.0395C13.5719 14.4695 14.2878 14.3996 14.8193 14.0119C15.3372 13.634 15.6667 12.9737 15.6667 12.2158L15.6667 4.78424ZM9.66683 10.4007L13.5201 13.2195C13.7625 13.3838 14.0123 13.3628 14.2299 13.204C14.4626 13.0342 14.6667 12.6895 14.6667 12.2158L14.6667 4.78424C14.6667 4.31058 14.4626 3.96584 14.2299 3.79606C14.0123 3.63729 13.7625 3.61622 13.5201 3.78052L9.66683 6.59939L9.66683 10.4007ZM7.66739 4.43103C7.88034 4.29102 8.10175 4.30808 8.29252 4.44093C8.49284 4.58043 8.66683 4.8616 8.66683 5.24871L8.66683 11.7513C8.66683 12.1385 8.49284 12.4196 8.29252 12.5591C8.10175 12.692 7.88034 12.709 7.66739 12.569L2.72243 9.31771C2.48366 9.16071 2.3335 8.85434 2.3335 8.50003C2.3335 8.14572 2.48366 7.83934 2.72243 7.68235L7.66739 4.43103Z"
                      fill="#1C274C"
                    />
                  </svg>
                  <span className="hidden sm:inline">Previous</span>
                </Link>
              </Button>
            ) : (
              <Button disabled variant={"secondary"} className="flex h-[32px] sm:h-[36px] min-w-[60px] sm:min-w-[80px] px-[8px] sm:px-[12px] py-[6px] sm:py-[8px] justify-center items-center gap-1 rounded-2xl sm:rounded-3xl text-gray-400 opacity-50 text-sm sm:text-base">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 17 17"
                  fill="none"
                  className="sm:w-[17px] sm:h-[17px]"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M15.6667 4.78424C15.6667 4.02631 15.3372 3.36602 14.8193 2.98819C14.2878 2.60048 13.5719 2.53052 12.9476 2.96051L12.9418 2.96454L9.66683 5.36036V5.24871C9.66683 4.55819 9.35173 3.95996 8.86398 3.6203C8.36667 3.27399 7.70102 3.21213 7.118 3.59546L2.17304 6.84678C1.59283 7.22827 1.3335 7.88812 1.3335 8.50003C1.3335 9.11194 1.59283 9.77178 2.17304 10.1533L7.118 13.4046C7.70101 13.7879 8.36667 13.7261 8.86398 13.3798C9.35173 13.0401 9.66683 12.4419 9.66683 11.7513V11.6397L12.9418 14.0355L12.9476 14.0395C13.5719 14.4695 14.2878 14.3996 14.8193 14.0119C15.3372 13.634 15.6667 12.9737 15.6667 12.2158L15.6667 4.78424ZM9.66683 10.4007L13.5201 13.2195C13.7625 13.3838 14.0123 13.3628 14.2299 13.204C14.4626 13.0342 14.6667 12.6895 14.6667 12.2158L14.6667 4.78424C14.6667 4.31058 14.4626 3.96584 14.2299 3.79606C14.0123 3.63729 13.7625 3.61622 13.5201 3.78052L9.66683 6.59939L9.66683 10.4007ZM7.66739 4.43103C7.88034 4.29102 8.10175 4.30808 8.29252 4.44093C8.49284 4.58043 8.66683 4.8616 8.66683 5.24871L8.66683 11.7513C8.66683 12.1385 8.49284 12.4196 8.29252 12.5591C8.10175 12.692 7.88034 12.709 7.66739 12.569L2.72243 9.31771C2.48366 9.16071 2.3335 8.85434 2.3335 8.50003C2.3335 8.14572 2.48366 7.83934 2.72243 7.68235L7.66739 4.43103Z"
                    fill="#9CA3AF"
                  />
                </svg>
                <span className="hidden sm:inline">Previous</span>
              </Button>
            )}

            {/* Play Button */}
            <Button className="flex p-[10px] sm:p-[14px] items-center gap-[10px] rounded-full border-[0.667px] border-[#E5E5E5] bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] hover:bg-gray-50 touch-manipulation">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 21 21"
                fill="none"
                className="sm:w-[21px] sm:h-[21px]"
              >
                <path
                  d="M17.5071 8.29384C19.2754 9.25541 19.2754 11.7446 17.5071 12.7062L6.83051 18.5121C5.11196 19.4467 3 18.2303 3 16.3059L3 4.6941C3 2.76976 5.11196 1.55337 6.83051 2.48792L17.5071 8.29384Z"
                  stroke="#1C274C"
                  strokeWidth="1.5"
                />
              </svg>
            </Button>

            {/* Next Button */}
            {nextItem ? (
              <Button asChild className="flex h-[32px] sm:h-[36px] min-w-[60px] sm:min-w-[80px] px-[8px] sm:px-[12px] py-[6px] sm:py-[8px] justify-center items-center gap-1 rounded-2xl sm:rounded-3xl bg-black text-white hover:bg-gray-800 text-sm sm:text-base touch-manipulation">
                <Link
                  to="/reading/$feedId/$slug"
                  params={{ feedId, slug: generateSlug(nextItem.title) }}
                >
                  <span className="hidden sm:inline">Next Article</span>
                  <span className="sm:hidden">Next</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 17 17"
                    fill="none"
                    className="sm:w-[17px] sm:h-[17px]"
                  >
                    <path
                      d="M7.83334 6.34565L3.76891 3.37227C2.90059 2.77417 1.8335 3.55265 1.8335 4.78423L1.8335 12.2158C1.8335 13.4474 2.90059 14.2259 3.76891 13.6278L7.83334 10.6544"
                      stroke="white"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M14.5526 7.26452C15.3716 7.803 15.3716 9.19696 14.5526 9.73544L9.60763 12.9868C8.81167 13.5101 7.8335 12.8289 7.8335 11.7513L7.8335 5.24866C7.8335 4.17103 8.81167 3.48986 9.60763 4.0132L14.5526 7.26452Z"
                      stroke="white"
                      strokeWidth="1.5"
                    />
                  </svg>
                </Link>
              </Button>
            ) : (
              <Button disabled className="flex h-[32px] sm:h-[36px] min-w-[60px] sm:min-w-[80px] px-[8px] sm:px-[12px] py-[6px] sm:py-[8px] justify-center items-center gap-1 rounded-2xl sm:rounded-3xl bg-gray-400 text-gray-300 opacity-50 text-sm sm:text-base">
                <span className="hidden sm:inline">Next Article</span>
                <span className="sm:hidden">Next</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 17 17"
                  fill="none"
                  className="sm:w-[17px] sm:h-[17px]"
                >
                  <path
                    d="M7.83334 6.34565L3.76891 3.37227C2.90059 2.77417 1.8335 3.55265 1.8335 4.78423L1.8335 12.2158C1.8335 13.4474 2.90059 14.2259 3.76891 13.6278L7.83334 10.6544"
                    stroke="#9CA3AF"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M14.5526 7.26452C15.3716 7.803 15.3716 9.19696 14.5526 9.73544L9.60763 12.9868C8.81167 13.5101 7.8335 12.8289 7.8335 11.7513L7.8335 5.24866C7.8335 4.17103 8.81167 3.48986 9.60763 4.0132L14.5526 7.26452Z"
                    stroke="#9CA3AF"
                    strokeWidth="1.5"
                  />
                </svg>
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}