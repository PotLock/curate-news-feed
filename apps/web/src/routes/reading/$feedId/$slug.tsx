import { createFileRoute, redirect } from "@tanstack/react-router";

// Function to generate slug from title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .trim();
};

// Function to find item index by slug in feed items
const findItemIndexBySlug = (items: any[], slug: string) => {
  return items.findIndex((item) => generateSlug(item.title) === slug);
};

export const Route = createFileRoute("/reading/$feedId/$slug")({
  loader: async ({ context, params }) => {
    try {
      if (!params.feedId || !params.slug) {
        throw redirect({
          to: "/",
        });
      }

      // Load the entire feed to find the article index
      const feedData = await context.queryClient.ensureQueryData(
        context.trpc.getFeed.queryOptions({
          feedId: params.feedId,
        }),
      );

      // Find the article index by slug
      const articleIndex = findItemIndexBySlug(feedData.items || [], params.slug);
      
      // Redirect to the main reading page with the article index as a search param
      throw redirect({
        to: "/reading/$feedId",
        params: { feedId: params.feedId },
        search: { article: articleIndex >= 0 ? articleIndex : 0 },
      });
    } catch (error) {
      if (error instanceof Response) {
        throw error; // Re-throw redirect responses
      }
      console.error("Reading slug redirect error:", error);
      // Redirect to main reading page on error
      throw redirect({
        to: "/reading/$feedId",
        params: { feedId: params.feedId || "" },
        search: { article: 0 },
      });
    }
  },
});

// This route now just redirects to the main reading layout
// The component is not needed since we redirect in the loader

// Export the generateSlug function for use in other components
export { generateSlug };
