import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/")({
  component: HomeComponent,
  loader: async ({ context }) => {
    const queryOptions = context.trpc.getFeeds.queryOptions();
    const feedsData = await context.queryClient.ensureQueryData(queryOptions);
    
    // Redirect to the first available feed
    if (feedsData?.items && feedsData.items.length > 0) {
      const firstFeedId = feedsData.items[0].id;
      if (firstFeedId) {
        throw redirect({
          to: "/$feedId",
          params: { feedId: firstFeedId }
        });
      }
    }
    
    return feedsData;
  },
});

function HomeComponent() {
  const { trpc } = Route.useRouteContext();

  const initialData = Route.useLoaderData();

  const queryOptions = trpc.getFeeds.queryOptions();

  const { data: feedsData, error } = useQuery({
    ...queryOptions,
    initialData: initialData,
  });

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-red-600">
          Error loading feeds: {error.message}
        </div>
      </div>
    );
  }

  if (!feedsData) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">No feeds available</div>
      </div>
    );
  }

  // This should rarely be seen since we redirect in the loader
  return (
    <div className="container mx-auto p-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Welcome to Curate News</h1>
        <p className="text-muted-foreground">Select a feed from the sidebar to get started.</p>
      </div>
    </div>
  );
}
