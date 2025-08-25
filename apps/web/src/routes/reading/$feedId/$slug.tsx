import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ReadingHeader } from "@/components/reading/ReadingHeader";
import { ReadingArticle } from "@/components/reading/ReadingArticle";
import { ReadingNavigation } from "@/components/reading/ReadingNavigation";

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

  const loaderData = Route.useLoaderData();

  // Validate that we have the required data
  if (!feedId || !slug) {
    return (
      <div className="px-[258px] py-[58px] flex items-center justify-center">
        <div className="text-center text-red-600">
          Missing required parameters: feedId or slug
        </div>
      </div>
    );
  }

  if (!loaderData) {
    return (
      <div className="px-[258px] py-[58px] flex items-center justify-center">
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
  const { data: itemQueryData, error } = useQuery({
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

  if (error) {
    return (
      <div className="px-[258px] py-[58px] flex items-center justify-center">
        <div className="text-center text-red-600">
          Error loading article: {error.message}
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="px-[258px] py-[58px] flex items-center justify-center">
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
    <div className="px-[258px] py-[58px] flex flex-col items-center justify-center">
      <ReadingHeader 
        feedId={feedId}
        categoryCount={getCategoryCount()}
        uploadDate={item.date}
        authorName={item.author?.[0]?.name}
      />
      
      <ReadingArticle item={item} />
      
      <ReadingNavigation 
        feedId={feedId}
        prevItem={prevItem}
        nextItem={nextItem}
      />
    </div>
  );
}

// Export the generateSlug function for use in other components
export { generateSlug };
