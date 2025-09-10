import { useQuery, useQueries } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ReadingHeader } from "@/components/reading/ReadingHeader";
import { ReadingArticle } from "@/components/reading/ReadingArticle";
import { ReadingCardStack } from "@/components/reading/ReadingCardStack";
import { ReadingActions } from "@/components/reading/ReadingActions";
import { Button } from "@/components/ui/button";
import { ReadingSettingsProvider, useReadingSettings } from "@/contexts/reading-settings-context";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// Function to generate slug from title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .trim();
};

export const Route = createFileRoute("/reading/$feedId/")({
  component: ReadingLayoutPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      article: Number(search?.article) || 0,
    };
  },
  loader: async ({ context, params }) => {
    try {
      if (!params.feedId) {
        throw new Error("Feed ID is required");
      }

      // Load the entire feed
      const feedData = await context.queryClient.ensureQueryData(
        (context.trpc.getFeed as any).queryOptions({
          feedId: params.feedId,
        })
      );

      return { feedData };
    } catch (error) {
      console.error("Reading layout loader error:", error);
      throw error;
    }
  },
});

function ReadingLayoutPage() {
  return (
    <ReadingSettingsProvider>
      <ReadingLayoutContent />
    </ReadingSettingsProvider>
  );
}

function ReadingLayoutContent() {
  const { feedId } = Route.useParams();
  const { trpc } = Route.useRouteContext();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { textToSpeech } = useReadingSettings();
  
  // State for view mode (card stack vs traditional)
  const [useCardStack, setUseCardStack] = useState(true);

  const loaderData = Route.useLoaderData();

  // State for current article index, initialized with search param if available
  const [currentArticleIndex, setCurrentArticleIndex] = useState(
    search.article || 0
  );

  // State for selected feeds (for multi-feed support)
  const [selectedFeedIds, setSelectedFeedIds] = useState<string[]>([feedId]);
  
  // State for time period filter
  const [selectedPeriod, setSelectedPeriod] = useState<string>("All Time");
  
  // Stable article count to prevent progress bar jumps
  const stableArticleCountRef = useRef<number>(0);

  // Load saved feed selections on component mount
  useEffect(() => {
    const loadFeedSelections = () => {
      try {
        const accountId = "anonymous-user";
        const savedKey = `selected-feeds-${accountId}`;
        const savedSelections = localStorage.getItem(savedKey);
        
        if (savedSelections) {
          const selectedIds = JSON.parse(savedSelections);
          if (Array.isArray(selectedIds) && selectedIds.length > 0) {
            // Always ensure the URL feedId is included and comes first
            const uniqueFeeds = [feedId, ...selectedIds.filter(id => id !== feedId)];
            setSelectedFeedIds(uniqueFeeds);
            return;
          }
        }
      } catch (error) {
        console.warn("Failed to load saved feed selections:", error);
      }
      
      // Default to current feedId if no saved selections
      setSelectedFeedIds([feedId]);
    };

    loadFeedSelections();
  }, [feedId]);

  // Handle feed selection changes from the Categories popup
  const handleFeedSelectionChange = (newSelectedFeedIds: string[]) => {
    setSelectedFeedIds(newSelectedFeedIds);
    // Reset stable count when feeds change
    stableArticleCountRef.current = 0;
    // Reset to first article when feed selection changes
    navigate({
      to: "/reading/$feedId",
      params: { feedId },
      search: { article: 0 },
    });
  };

  // Handle period filter changes
  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    // Reset stable count when filter changes
    stableArticleCountRef.current = 0;
    // Reset to first article when period changes
    navigate({
      to: "/reading/$feedId",
      params: { feedId },
      search: { article: 0 },
    });
  };

  // TTS state and handlers
  const [isTTSPlaying, setIsTTSPlaying] = useState(false);
  const [isTTSPaused, setIsTTSPaused] = useState(false);
  const ttsHandlersRef = useRef<{
    startTTS: () => void;
    pauseTTS: () => void;
    resumeTTS: () => void;
    stopTTS: () => void;
  } | null>(null);

  // Update current article index when search param changes
  useEffect(() => {
    if (search.article !== undefined) {
      setCurrentArticleIndex(search.article);
    }
  }, [search.article]);

  // Filter articles based on selected time period
  const filterArticlesByPeriod = useCallback((articles: any[], period: string) => {
    if (period === "All Time") return articles;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return articles.filter((article) => {
      const articleDate = new Date(article.item.date);
      const diffInMs = now.getTime() - articleDate.getTime();
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

      switch (period) {
        case "Today":
          return articleDate >= today;
        case "This Week":
          return diffInDays <= 7;
        case "This Month":
          return diffInDays <= 30;
        case "Older":
          return diffInDays > 30;
        default:
          return true;
      }
    });
  }, []);

  // Validate that we have the required data
  if (!feedId) {
    return (
      <div className="px-3 sm:px-6 md:px-8 lg:px-[258px] py-3 sm:py-6 md:py-8 lg:py-[58px] flex items-center justify-center">
        <div className="text-center text-red-600">
          Missing required parameter: feedId
        </div>
      </div>
    );
  }

  if (!loaderData) {
    return (
      <div className="px-3 sm:px-6 md:px-8 lg:px-[258px] py-3 sm:py-6 md:py-8 lg:py-[58px] flex items-center justify-center">
        <div className="text-center text-red-600">Failed to load data</div>
      </div>
    );
  }

  // Multi-feed data fetching
  const feedQueries = useQueries({
    queries: selectedFeedIds.map((id) => {
      const queryOptions = (trpc.getFeed as any).queryOptions({ feedId: id });
      return {
        ...queryOptions,
        // Use loader data as initial data only for the primary feed
        ...(id === feedId && loaderData?.feedData && {
          initialData: loaderData.feedData,
        }),
        // Prevent refetching on navigation
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        refetchOnWindowFocus: false,
        refetchOnMount: false,
      };
    }),
  });

  // Aggregate articles from all selected feeds
  const aggregatedArticles = useMemo(() => {
    const urlFeedArticles: Array<{
      item: any;
      sourceFeed: { id: string; title: string };
    }> = [];
    const otherFeedArticles: Array<{
      item: any;
      sourceFeed: { id: string; title: string };
    }> = [];

    feedQueries.forEach((query: any, index: number) => {
      const currentFeedId = selectedFeedIds[index];
      const feedData = query.data;
      
      if (feedData?.items) {
        const articles = feedData.items.map((item: any) => ({
          item,
          sourceFeed: {
            id: currentFeedId,
            title: feedData.options?.title || `Feed ${currentFeedId}`,
          },
        }));

        // Separate URL feed articles from other feeds
        if (currentFeedId === feedId) {
          urlFeedArticles.push(...articles);
        } else {
          otherFeedArticles.push(...articles);
        }
      }
    });

    // Sort each group by date (newest first)
    const sortByDate = (a: any, b: any) => {
      const dateA = new Date(a.item.date);
      const dateB = new Date(b.item.date);
      return dateB.getTime() - dateA.getTime();
    };

    urlFeedArticles.sort(sortByDate);
    otherFeedArticles.sort(sortByDate);

    // Combine with URL feed articles first, then other feeds
    const allArticles = [...urlFeedArticles, ...otherFeedArticles];
    
    // Apply time period filter
    return filterArticlesByPeriod(allArticles, selectedPeriod);
  }, [feedQueries, selectedFeedIds, feedId, selectedPeriod, filterArticlesByPeriod]);

  // Check for errors in any feed query
  const hasErrors = feedQueries.some((query: any) => query.error);
  const isLoading = feedQueries.some((query: any) => query.isLoading);
  const firstError = feedQueries.find((query: any) => query.error)?.error;

  // Use aggregated articles
  const feedItems = aggregatedArticles.map((article) => article.item);
  
  // Update stable article count - only allow it to increase or stay the same, never decrease
  useEffect(() => {
    if (aggregatedArticles.length > 0) {
      // Only update if the new count is greater than the current stable count
      // This prevents the progress bar from jumping when feeds are temporarily loading
      if (aggregatedArticles.length > stableArticleCountRef.current || stableArticleCountRef.current === 0) {
        stableArticleCountRef.current = aggregatedArticles.length;
      }
    }
  }, [aggregatedArticles.length]);
  
  // Validate and fix article index if out of bounds
  useEffect(() => {
    if (aggregatedArticles.length > 0 && currentArticleIndex >= aggregatedArticles.length) {
      // Current index is out of bounds, reset to 0
      navigate({
        to: "/reading/$feedId",
        params: { feedId },
        search: { article: 0 },
      });
    }
  }, [aggregatedArticles.length, currentArticleIndex, navigate, feedId]);
  
  const currentArticleData = aggregatedArticles[currentArticleIndex];
  const currentItem = currentArticleData?.item;

  const getCategoryCount = () => {
    return currentItem?.category?.length || 0;
  };

  // Get previous and next items for navigation
  const getNavigationItems = () => {
    if (!feedItems || feedItems.length === 0) {
      return { prevItem: null, nextItem: null };
    }

    const prevItem =
      currentArticleIndex > 0 ? feedItems[currentArticleIndex - 1] : null;
    const nextItem =
      currentArticleIndex < feedItems.length - 1
        ? feedItems[currentArticleIndex + 1]
        : null;

    return { prevItem, nextItem };
  };

  const { prevItem, nextItem } = getNavigationItems();

  // Calculate progress with memoization to prevent jumps
  const { currentIndex, totalCount, progressPercentage } = useMemo(() => {
    const index = currentArticleIndex + 1;
    // Use the stable count if available, otherwise fall back to current length
    const total = stableArticleCountRef.current > 0 ? stableArticleCountRef.current : feedItems.length;
    const percentage = total > 0 ? (index / total) * 100 : 0;
    return {
      currentIndex: index,
      totalCount: total,
      progressPercentage: Math.min(100, Math.max(0, percentage))
    };
  }, [currentArticleIndex, feedItems.length]);

  // Navigation handlers for swipe actions
  const handleNavigateToNext = () => {
    if (currentArticleIndex < feedItems.length - 1) {
      const newIndex = currentArticleIndex + 1;
      navigate({
        to: "/reading/$feedId",
        params: { feedId },
        search: { article: newIndex },
      });
    }
  };

  const handleNavigateToPrev = () => {
    if (currentArticleIndex > 0) {
      const newIndex = currentArticleIndex - 1;
      navigate({
        to: "/reading/$feedId",
        params: { feedId },
        search: { article: newIndex },
      });
    }
  };

  // Reset function to go back to first article
  const handleReset = () => {
    navigate({
      to: "/reading/$feedId",
      params: { feedId },
      search: { article: 0 },
    });
  };

  // TTS handlers
  const handleTTSStateChange = (isPlaying: boolean, isPaused: boolean) => {
    setIsTTSPlaying(isPlaying);
    setIsTTSPaused(isPaused);
  };

  const handleTTSHandlersReady = useCallback((handlers: {
    startTTS: () => void;
    pauseTTS: () => void;
    resumeTTS: () => void;
    stopTTS: () => void;
  }) => {
    ttsHandlersRef.current = handlers;
  }, []);

  const handleTTSToggle = () => {
    if (!ttsHandlersRef.current) return;

    if (!isTTSPlaying) {
      ttsHandlersRef.current.startTTS();
    } else if (isTTSPaused) {
      ttsHandlersRef.current.resumeTTS();
    } else {
      ttsHandlersRef.current.pauseTTS();
    }
  };


  if (hasErrors && !aggregatedArticles.length) {
    return (
      <div className="px-3 sm:px-6 md:px-8 lg:px-[258px] py-3 sm:py-6 md:py-8 lg:py-[58px] flex items-center justify-center">
        <div className="text-center text-red-600">
          Error loading feeds: {firstError?.message || "Unknown error"}
        </div>
      </div>
    );
  }

  // Check if this is due to time filtering (moved out of currentItem check)
  const isFilteringActive = selectedPeriod !== "All Time";
  const noArticlesContent = !currentItem && (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-black mb-4">
          {isFilteringActive ? "No Articles Found" : "No Articles Available"}
        </h1>
        <p className="text-gray-600 mb-6">
          {isFilteringActive 
            ? `No articles found for the selected time period: ${selectedPeriod}`
            : "This feed appears to be empty."
          }
        </p>
        {isFilteringActive ? (
          <Button
            onClick={() => handlePeriodChange("All Time")}
            variant="default"
            className="inline-flex items-center gap-2"
          >
            Reset Filters
          </Button>
        ) : (
          <Link
            to="/$feedId"
            params={{ feedId }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Back to Feed
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-screen overflow-hidden flex flex-col px-3 max-w-screen sm:px-6 md:px-8 lg:px-[258px] py-3 sm:py-6 md:py-8 lg:py-[58px] items-center">
        {/* Fixed Header */}
        <div className="flex-shrink-0 w-full">
          <ReadingHeader
            feedId={feedId}
            categoryCount={getCategoryCount()}
            uploadDate={currentItem?.date || new Date().toISOString()}
            authorName={currentItem?.author?.[0]?.name}
            onFeedSelectionChange={handleFeedSelectionChange}
            onPeriodChange={handlePeriodChange}
            selectedPeriod={selectedPeriod}
          />
        </div>

        {/* Mobile Layout */}
        <div className="flex flex-col lg:hidden w-full max-w-4xl flex-1 min-h-0">
          {/* Mobile Progress Bar - Fixed */}
          <div className="flex-shrink-0 mb-4">
            <div className="flex items-center justify-between px-4 py-3 bg-[#FFFFFFF2] border-[0.667px] border-[#E5E5E5] rounded-[12px] shadow-[0_4px_6px_-4px_rgba(0,0,0,0.10),0_10px_15px_-3px_rgba(0,0,0,0.10)]">
              <div className="flex flex-col items-start">
                <span className="text-sm font-bold leading-[20px] font-Inter">
                  {currentIndex}/{totalCount}
                </span>
                {selectedFeedIds.length > 1 && (
                  <span className="text-xs text-gray-500 font-Inter">
                    from {selectedFeedIds.length} feeds
                  </span>
                )}
              </div>
              <div className="flex-1 mx-4 h-2 bg-gray-200 rounded-full relative overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full bg-black rounded-full transition-[width] duration-300 ease-in-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <Button
                variant={"outline"}
                size="sm"
                className="bg-[#FFFFFFF2] border-[0.667px] p-2 border-[#E5E5E5] rounded-[6px] shadow-[0_4px_6px_-4px_rgba(0,0,0,0.10),0_10px_15px_-3px_rgba(0,0,0,0.10)] h-auto"
                onClick={handleReset}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M2.5 10C2.5 8.01088 3.29018 6.10322 4.6967 4.6967C6.10322 3.29018 8.01088 2.5 10 2.5C12.0967 2.50789 14.1092 3.32602 15.6167 4.78333L17.5 6.66667M17.5 6.66667V2.5M17.5 6.66667H13.3333M17.5 10C17.5 11.9891 16.7098 13.8968 15.3033 15.3033C13.8968 16.7098 11.9891 17.5 10 17.5C7.90329 17.4921 5.89081 16.674 4.38333 15.2167L2.5 13.3333M2.5 13.3333H6.66667M2.5 13.3333V17.5"
                    stroke="#020617"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Button>
            </div>
          </div>

          {/* Mobile Actions - Below Progress Bar */}
          <div className="flex-shrink-0 mb-6">
            <div className="flex justify-center items-center">
              <ReadingActions
                articleTitle={currentItem?.title || "No Article"}
                articleUrl={`${window.location.origin}/reading/${feedId}/${generateSlug(currentItem?.title || "no-article")}`}
                articleId={currentItem?.id || currentItem?.title || "no-article"}
                feedId={feedId}
              />
            </div>
          </div>

          {/* Scrollable Article Container */}
          <div className="flex-1 min-h-0 flex items-center justify-center">
            {currentItem ? (
              <ReadingCardStack
                articles={aggregatedArticles.map(a => a.item)}
                feedId={feedId}
                currentIndex={currentArticleIndex}
                onNavigateToNext={handleNavigateToNext}
                onNavigateToPrev={handleNavigateToPrev}
                generateSlug={generateSlug}
                sourceFeed={currentArticleData?.sourceFeed}
                showMultiFeedIndicator={selectedFeedIds.length > 1}
              />
            ) : (
              noArticlesContent
            )}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex gap-[20px] flex-1 min-h-0 w-full">
          {/* Left Progress Panel - Fixed */}
          <div className="flex-shrink-0 flex flex-col gap-4 items-center">
            <div className="bg-[#FFFFFFF2] border-[0.667px] px-[6px] py-2 border-[#E5E5E5] rounded-[6px] shadow-[0_4px_6px_-4px_rgba(0,0,0,0.10),0_10px_15px_-3px_rgba(0,0,0,0.10)]">
              <p className="text-sm font-bold leading-[20px] font-Inter">
                {currentIndex}/{totalCount}
              </p>
            </div>
            <div className="h-[400px] w-2 bg-gray-200 rounded-full relative overflow-hidden">
              <div
                className="absolute bottom-0 w-full bg-black rounded-full transition-[height] duration-300 ease-in-out"
                style={{ height: `${progressPercentage}%` }}
              />
            </div>
            <Button
              variant={"outline"}
              className="bg-[#FFFFFFF2] border-[0.667px] px-[6px] items-center flex justify-center py-2 border-[#E5E5E5] rounded-[6px] shadow-[0_4px_6px_-4px_rgba(0,0,0,0.10),0_10px_15px_-3px_rgba(0,0,0,0.10)]"
              onClick={handleReset}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M2.5 10C2.5 8.01088 3.29018 6.10322 4.6967 4.6967C6.10322 3.29018 8.01088 2.5 10 2.5C12.0967 2.50789 14.1092 3.32602 15.6167 4.78333L17.5 6.66667M17.5 6.66667V2.5M17.5 6.66667H13.3333M17.5 10C17.5 11.9891 16.7098 13.8968 15.3033 15.3033C13.8968 16.7098 11.9891 17.5 10 17.5C7.90329 17.4921 5.89081 16.674 4.38333 15.2167L2.5 13.3333M2.5 13.3333H6.66667M2.5 13.3333V17.5"
                  stroke="#020617"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Button>
          </div>

          {/* Scrollable Article Container */}
          <div className="flex-1 min-h-0 flex items-center justify-center">
            {currentItem ? (
              useCardStack ? (
                <ReadingCardStack
                  articles={aggregatedArticles.map(a => a.item)}
                  feedId={feedId}
                  currentIndex={currentArticleIndex}
                  onNavigateToNext={handleNavigateToNext}
                  onNavigateToPrev={handleNavigateToPrev}
                  generateSlug={generateSlug}
                  sourceFeed={currentArticleData?.sourceFeed}
                  showMultiFeedIndicator={selectedFeedIds.length > 1}
                />
              ) : (
                <ReadingArticle
                  item={currentItem}
                  feedId={feedId}
                  prevItem={prevItem}
                  nextItem={nextItem}
                  generateSlug={generateSlug}
                  onNavigateToNext={handleNavigateToNext}
                  onNavigateToPrev={handleNavigateToPrev}
                  onTTSStateChange={handleTTSStateChange}
                  onTTSHandlersReady={handleTTSHandlersReady}
                  sourceFeed={currentArticleData?.sourceFeed}
                  showMultiFeedIndicator={selectedFeedIds.length > 1}
                />
              )
            ) : (
              noArticlesContent
            )}
          </div>

          {/* Right Actions Panel - Fixed */}
          <div className="flex-shrink-0">
            <ReadingActions
              articleTitle={currentItem?.title || "No Article"}
              articleUrl={`${window.location.origin}/reading/${feedId}/${generateSlug(currentItem?.title || "no-article")}`}
              articleId={currentItem?.id || currentItem?.title || "no-article"}
              feedId={feedId}
            />
          </div>
        </div>

        {/* Fixed Bottom Navigation */}
        <div className="fixed bottom-[30px] left-1/2 transform -translate-x-1/2 z-50">
          <div className="flex h-auto sm:h-[65px] px-[16px] sm:px-[24px] py-[8px] sm:py-[12px] justify-center items-center gap-[6px] sm:gap-[8px] rounded-[32px] sm:rounded-[45.5px] bg-white/90 shadow-lg">
            <div className="flex items-center gap-[16px] sm:gap-[28px]">
              {/* Previous Button */}
              {prevItem ? (
                <Button
                  onClick={handleNavigateToPrev}
                  variant={"secondary"}
                  className="flex h-[32px] sm:h-[36px] min-w-[60px] sm:min-w-[80px] px-[8px] sm:px-[12px] py-[6px] sm:py-[8px] justify-center items-center gap-1 rounded-2xl sm:rounded-3xl text-black text-sm sm:text-base touch-manipulation"
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
                </Button>
              ) : (
                <Button
                  disabled
                  variant={"secondary"}
                  className="flex h-[32px] sm:h-[36px] min-w-[60px] sm:min-w-[80px] px-[8px] sm:px-[12px] py-[6px] sm:py-[8px] justify-center items-center gap-1 rounded-2xl sm:rounded-3xl text-gray-400 opacity-50 text-sm sm:text-base"
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
                      fill="#9CA3AF"
                    />
                  </svg>
                  <span className="hidden sm:inline">Previous</span>
                </Button>
              )}

              {/* TTS Play/Pause Button - Only show if textToSpeech is enabled in settings */}
              {textToSpeech && (
                <Button
                  onClick={handleTTSToggle}
                  variant={"outline"}
                  className="flex h-[32px] sm:h-[36px] min-w-[32px] sm:min-w-[36px] px-[8px] sm:px-[10px] py-[6px] sm:py-[8px] justify-center items-center rounded-2xl sm:rounded-3xl text-black text-sm sm:text-base touch-manipulation"
                >
                  {!isTTSPlaying || isTTSPaused ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="21"
                      height="21"
                      viewBox="0 0 21 21"
                      fill="none"
                      className="w-[14px] h-[14px] sm:w-[16px] sm:h-[16px]"
                    >
                      <path
                        d="M17.5071 8.29384C19.2754 9.25541 19.2754 11.7446 17.5071 12.7062L6.83051 18.5121C5.11196 19.4467 3 18.2303 3 16.3059L3 4.6941C3 2.76976 5.11196 1.55337 6.83051 2.48792L17.5071 8.29384Z"
                        stroke="#1C274C"
                        strokeWidth="1.5"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="sm:w-[16px] sm:h-[16px]"
                    >
                      <path
                        d="M6 19H10V5H6V19ZM14 5V19H18V5H14Z"
                        fill="currentColor"
                      />
                    </svg>
                  )}
                </Button>
              )}

              {/* Next Button */}
              {nextItem ? (
                <Button
                  onClick={handleNavigateToNext}
                  className="flex h-[32px] sm:h-[36px] min-w-[60px] sm:min-w-[80px] px-[8px] sm:px-[12px] py-[6px] sm:py-[8px] justify-center items-center gap-1 rounded-2xl sm:rounded-3xl bg-black text-white hover:bg-gray-800 text-sm sm:text-base touch-manipulation"
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
                </Button>
              ) : (
                <Button
                  disabled
                  className="flex h-[32px] sm:h-[36px] min-w-[60px] sm:min-w-[80px] px-[8px] sm:px-[12px] py-[6px] sm:py-[8px] justify-center items-center gap-1 rounded-2xl sm:rounded-3xl bg-gray-400 text-gray-300 opacity-50 text-sm sm:text-base"
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
        </div>
      </div>
  );
}

// Export the generateSlug function for use in other components
export { generateSlug };
