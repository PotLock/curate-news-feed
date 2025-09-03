import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ReadingHeader } from "@/components/reading/ReadingHeader";
import { ReadingArticle } from "@/components/reading/ReadingArticle";
import { ReadingActions } from "@/components/reading/ReadingActions";
import { Button } from "@/components/ui/button";
import { ReadingSettingsProvider } from "@/contexts/reading-settings-context";
import { useState, useEffect } from "react";

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
        context.trpc.getFeed.queryOptions({
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
  const { feedId } = Route.useParams();
  const { trpc } = Route.useRouteContext();
  const search = Route.useSearch();

  const loaderData = Route.useLoaderData();

  // State for current article index, initialized with search param if available
  const [currentArticleIndex, setCurrentArticleIndex] = useState(
    search.article || 0
  );

  // Update current article index when search param changes
  useEffect(() => {
    if (search.article !== undefined) {
      setCurrentArticleIndex(search.article);
    }
  }, [search.article]);

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

  // Query for the feed data
  const feedQueryOptions = trpc.getFeed.queryOptions({ feedId });
  const { data: feedData, error } = useQuery({
    ...feedQueryOptions,
    initialData: loaderData.feedData,
  });

  // Use the feed items directly
  const feedItems = feedData?.items || [];
  const currentItem = feedItems[currentArticleIndex];

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

  // Calculate progress
  const currentIndex = currentArticleIndex + 1;
  const totalCount = feedItems.length;
  const progressPercentage =
    totalCount > 0 ? (currentIndex / totalCount) * 100 : 0;

  // Navigation handlers for swipe actions
  const handleNavigateToNext = () => {
    if (currentArticleIndex < feedItems.length - 1) {
      setCurrentArticleIndex(currentArticleIndex + 1);
    }
  };

  const handleNavigateToPrev = () => {
    if (currentArticleIndex > 0) {
      setCurrentArticleIndex(currentArticleIndex - 1);
    }
  };

  // Reset function to go back to first article
  const handleReset = () => {
    setCurrentArticleIndex(0);
  };

  if (error) {
    return (
      <div className="px-3 sm:px-6 md:px-8 lg:px-[258px] py-3 sm:py-6 md:py-8 lg:py-[58px] flex items-center justify-center">
        <div className="text-center text-red-600">
          Error loading feed: {error.message}
        </div>
      </div>
    );
  }

  if (!currentItem) {
    return (
      <div className="px-3 sm:px-6 md:px-8 lg:px-[258px] py-3 sm:py-6 md:py-8 lg:py-[58px] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black mb-4">
            No Articles Available
          </h1>
          <p className="text-gray-600 mb-6">This feed appears to be empty.</p>
          <Link
            to="/$feedId"
            params={{ feedId }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Back to Feed
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ReadingSettingsProvider>
      <div className="h-screen overflow-hidden flex flex-col px-3 max-w-screen sm:px-6 md:px-8 lg:px-[258px] py-3 sm:py-6 md:py-8 lg:py-[58px] items-center">
        {/* Fixed Header */}
        <div className="flex-shrink-0 w-full">
          <ReadingHeader
            feedId={feedId}
            categoryCount={getCategoryCount()}
            uploadDate={currentItem.date}
            authorName={currentItem.author?.[0]?.name}
          />
        </div>

        {/* Mobile Layout */}
        <div className="flex flex-col lg:hidden w-full max-w-4xl flex-1 min-h-0">
          {/* Mobile Progress Bar - Fixed */}
          <div className="flex-shrink-0 mb-6">
            <div className="flex items-center justify-between px-4 py-3 bg-[#FFFFFFF2] border-[0.667px] border-[#E5E5E5] rounded-[12px] shadow-[0_4px_6px_-4px_rgba(0,0,0,0.10),0_10px_15px_-3px_rgba(0,0,0,0.10)]">
              <span className="text-sm font-bold leading-[20px] font-Inter">
                {currentIndex}/{totalCount}
              </span>
              <div className="flex-1 mx-4 h-2 bg-gray-200 rounded-full relative overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full bg-black rounded-full transition-all duration-300"
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

          {/* Scrollable Article Container */}
          <div className="flex-1 min-h-0 flex items-center justify-center">
            <ReadingArticle
              item={currentItem}
              feedId={feedId}
              prevItem={prevItem}
              nextItem={nextItem}
              generateSlug={generateSlug}
              onNavigateToNext={handleNavigateToNext}
              onNavigateToPrev={handleNavigateToPrev}
            />
          </div>

          {/* Mobile Actions - Fixed */}
          <div className="flex-shrink-0 mt-6">
            <div className="flex justify-center">
              <ReadingActions
                articleTitle={currentItem.title}
                articleUrl={`${window.location.origin}/reading/${feedId}/${generateSlug(currentItem.title)}`}
                articleId={currentItem.id || currentItem.title}
                feedId={feedId}
              />
            </div>
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
                className="absolute bottom-0 w-full bg-black rounded-full transition-all duration-300"
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
            <ReadingArticle
              item={currentItem}
              feedId={feedId}
              prevItem={prevItem}
              nextItem={nextItem}
              generateSlug={generateSlug}
              onNavigateToNext={handleNavigateToNext}
              onNavigateToPrev={handleNavigateToPrev}
            />
          </div>

          {/* Right Actions Panel - Fixed */}
          <div className="flex-shrink-0">
            <ReadingActions
              articleTitle={currentItem.title}
              articleUrl={`${window.location.origin}/reading/${feedId}/${generateSlug(currentItem.title)}`}
              articleId={currentItem.id || currentItem.title}
              feedId={feedId}
            />
          </div>
        </div>
      </div>
    </ReadingSettingsProvider>
  );
}

// Export the generateSlug function for use in other components
export { generateSlug };
