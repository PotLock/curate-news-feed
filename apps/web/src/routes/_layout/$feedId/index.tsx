import { FeedGrid } from "@/components/feed-grid";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_layout/$feedId/")({
  component: FeedPage,
  loader: async ({ context, params }) => {
    try {
      const queryOptions = context.trpc.getFeed.queryOptions(params);
      return await context.queryClient.ensureQueryData(queryOptions);
    } catch (error) {
      // Return null if loading fails, component will handle it
      return null;
    }
  },
});

function FeedPage() {
  const { feedId } = Route.useParams();
  const { trpc } = Route.useRouteContext();

  const initialData = Route.useLoaderData();

  const queryOptions = trpc.getFeed.queryOptions({ feedId });

  const { data, error, isLoading, isFetching } = useQuery({
    ...queryOptions,
    initialData: initialData,
    retry: 3,
    retryDelay: 1000,
  });

  if (isLoading || isFetching) {
    return (
      <div className="mx-auto max-w-[1440px] p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Loading Header */}
        <div className="space-y-2">
          <Skeleton className="h-6 sm:h-8 w-48 sm:w-64" />
          <Skeleton className="h-4 w-32" />
        </div>

        {/* Loading Categories */}
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full flex-shrink-0" />
          ))}
        </div>

        {/* Mobile Loading: Single Column */}
        <div className="block sm:hidden space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg p-4 space-y-3">
              <Skeleton className="h-[200px] w-full rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded-md" />
                <Skeleton className="h-6 w-20 rounded-md" />
              </div>
            </div>
          ))}
        </div>

        {/* Tablet Loading: Two Columns */}
        <div className="hidden sm:block lg:hidden">
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-lg p-4 space-y-3">
                <Skeleton className="h-[240px] w-full rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-md" />
                  <Skeleton className="h-6 w-20 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Loading: Three Columns */}
        <div className="hidden lg:block">
          <div className="space-y-6">
            {Array.from({ length: 2 }).map((rowIndex) => (
              <div key={rowIndex} className="flex gap-3">
                <Skeleton className="h-[358px] max-w-[500px] flex-1 rounded-lg" />
                <Skeleton className="h-[358px] flex-1 rounded-lg" />
                <Skeleton className="h-[358px] flex-1 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-[1440px] p-4 sm:p-6">
        <div className="text-center space-y-4 py-12">
          <h1 className="text-xl sm:text-2xl font-bold text-red-600">
            Error Loading Feed
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
            {error.message ||
              "Failed to load the RSS feed. Please try again later."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors touch-manipulation"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data || !data.items || data.items.length === 0) {
    return (
      <div className="mx-auto max-w-[1440px] p-4 sm:p-6">
        <div className="text-center space-y-4 py-12">
          <h1 className="text-xl sm:text-2xl font-bold">
            No Feed Data Available
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
            This feed appears to be empty or is still loading. Please try
            refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <FeedGrid
      items={data.items}
      feedTitle={data.options.title}
      feedDescription={data.options.description}
    />
  );
}
