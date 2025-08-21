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
      <div className="container mx-auto p-6 space-y-6">
        {/* Loading Header */}
        <div className="text-center space-y-2">
          <Skeleton className="h-8 w-64 mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>

        {/* Loading Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-4">
              <Skeleton className="aspect-video w-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">
            Error Loading Feed
          </h1>
          <p className="text-muted-foreground">
            {error.message || "Failed to load the RSS feed. Please try again later."}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data || !data.items || data.items.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">No Feed Data Available</h1>
          <p className="text-muted-foreground">
            This feed appears to be empty or is still loading. Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  return <FeedGrid 
    items={data.items} 
    feedTitle={data.options.title} 
    feedDescription={data.options.description} 
  />;
}
