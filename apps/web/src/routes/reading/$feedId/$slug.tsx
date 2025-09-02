import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ReadingHeader } from "@/components/reading/ReadingHeader";
import { ReadingArticle } from "@/components/reading/ReadingArticle";
import { ReadingNavigation } from "@/components/reading/ReadingNavigation";
import { ReadingActions } from "@/components/reading/ReadingActions";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { ReadingSettingsProvider } from "@/contexts/reading-settings-context";

// Function to generate slug from title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .trim();
};

// Function to find item by slug in feed items
const findItemBySlug = (items: any[], slug: string) => {
  return items.find((item) => generateSlug(item.title) === slug);
};

export const Route = createFileRoute("/reading/$feedId/$slug")({
  component: ReadingPage,
  loader: async ({ context, params }) => {
    try {
      if (!params.feedId) {
        throw new Error("Feed ID is required");
      }

      // Load the entire feed first to find the item by slug
      const feedData = await context.queryClient.ensureQueryData(
        context.trpc.getFeed.queryOptions({
          feedId: params.feedId,
        })
      );

      // Find the item by slug from the feed items
      const item = findItemBySlug(feedData.items || [], params.slug);
      if (!item) {
        throw new Error("Article not found");
      }

      // Now load the specific item data using the correct itemId
      const itemData = await context.queryClient.ensureQueryData(
        context.trpc.getFeedItem.queryOptions({
          feedId: params.feedId,
          itemId: item.id, // Use the ID from the feed items
        })
      );

      return { itemData, feedData, currentItem: item };
    } catch (error) {
      console.error("Reading page loader error:", error);
      throw error;
    }
  },
});

function ReadingPage() {
  const { feedId, slug } = Route.useParams();
  const { trpc } = Route.useRouteContext();
  const navigate = useNavigate();

  const loaderData = Route.useLoaderData();

  // Validate that we have the required data
  if (!feedId || !slug) {
    return (
      <div className="px-3 sm:px-6 md:px-8 lg:px-[258px] py-3 sm:py-6 md:py-8 lg:py-[58px] flex items-center justify-center">
        <div className="text-center text-red-600">
          Missing required parameters: feedId or slug
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

  const currentItem = loaderData.currentItem;

  // Query for the specific item
  const itemQueryOptions = trpc.getFeedItem.queryOptions({
    feedId,
    itemId: currentItem.id,
  });
  const { error } = useQuery({
    ...itemQueryOptions,
    initialData: loaderData.itemData,
  });

  // Query for the feed data
  const feedQueryOptions = trpc.getFeed.queryOptions({ feedId });
  const { data: feedData } = useQuery({
    ...feedQueryOptions,
    initialData: loaderData.feedData,
  });

  // Use the feed items directly since they contain all the necessary data
  const feedItems = feedData?.items || [];
  const item = currentItem; // Use the current item from feed for display

  const getCategoryCount = () => {
    return item?.category?.length || 0;
  };

  // Get previous and next items for navigation
  const getNavigationItems = () => {
    if (!feedItems || !currentItem?.id)
      return { prevItem: null, nextItem: null };

    const currentIndex = feedItems.findIndex(
      (feedItem) => feedItem.id === currentItem.id
    );
    if (currentIndex === -1) return { prevItem: null, nextItem: null };

    const prevItem = currentIndex > 0 ? feedItems[currentIndex - 1] : null;
    const nextItem =
      currentIndex < feedItems.length - 1 ? feedItems[currentIndex + 1] : null;

    return { prevItem, nextItem };
  };

  const { prevItem, nextItem } = getNavigationItems();

  // Calculate current article position
  const getCurrentArticleIndex = () => {
    if (!feedItems || !currentItem?.id)
      return { currentIndex: 0, totalCount: 0 };

    const currentIndex = feedItems.findIndex(
      (feedItem) => feedItem.id === currentItem.id
    );
    return {
      currentIndex: currentIndex >= 0 ? currentIndex + 1 : 1,
      totalCount: feedItems.length,
    };
  };

  const { currentIndex, totalCount } = getCurrentArticleIndex();
  const progressPercentage =
    totalCount > 0 ? (currentIndex / totalCount) * 100 : 0;

  // Reset function to go back to first feed
  const handleReset = () => {
    if (feedItems && feedItems.length > 0) {
      const firstItem = feedItems[0];
      const firstItemSlug = generateSlug(firstItem.title);
      navigate({
        to: "/reading/$feedId/$slug",
        params: { feedId, slug: firstItemSlug },
      });
    }
  };

  if (error) {
    return (
      <div className="px-3 sm:px-6 md:px-8 lg:px-[258px] py-3 sm:py-6 md:py-8 lg:py-[58px] flex items-center justify-center">
        <div className="text-center text-red-600">
          Error loading article: {error.message}
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="px-3 sm:px-6 md:px-8 lg:px-[258px] py-3 sm:py-6 md:py-8 lg:py-[58px] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black mb-4">
            Article Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The article you're looking for could not be found.
          </p>
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
      <div className="px-3 max-w-screen sm:px-6 md:px-8 lg:px-[258px] py-3 sm:py-6 md:py-8 lg:py-[58px] flex flex-col items-center justify-center">
        <ReadingHeader
          feedId={feedId}
          categoryCount={getCategoryCount()}
          uploadDate={item.date}
          authorName={item.author?.[0]?.name}
        />

        {/* Mobile Layout */}
        <div className="flex flex-col lg:hidden w-full max-w-4xl gap-6">
          {/* Mobile Progress Bar - Horizontal */}
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

          <ReadingArticle
            item={item}
            feedId={feedId}
            prevItem={prevItem}
            nextItem={nextItem}
            generateSlug={generateSlug}
          />

          {/* Mobile Actions */}
          <div className="flex justify-center">
            <ReadingActions />
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex gap-[20px]">
          <div className="flex flex-col gap-4 items-center h-auto">
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
          <ReadingArticle
            item={item}
            feedId={feedId}
            prevItem={prevItem}
            nextItem={nextItem}
            generateSlug={generateSlug}
          />
          <ReadingActions />
        </div>

        {/* <ReadingNavigation
          feedId={feedId}
          prevItem={prevItem}
          nextItem={nextItem}
        /> */}
      </div>
    </ReadingSettingsProvider>
  );
}

// Export the generateSlug function for use in other components
export { generateSlug };
