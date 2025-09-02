import { Link } from "@tanstack/react-router";

// Function to generate slug from title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .trim();
};

interface ReadingNavigationProps {
  feedId: string;
  prevItem?: { id?: string; title: string } | null;
  nextItem?: { id?: string; title: string } | null;
}

export function ReadingNavigation({
  feedId,
  prevItem,
  nextItem,
}: ReadingNavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 flex items-center justify-center bg-gradient-to-t from-black to-gray-400/0">
      <div className="flex items-center gap-4">
        {prevItem ? (
          <Link
            to="/reading/$feedId/$slug"
            params={{
              feedId: feedId,
              slug: generateSlug(prevItem.title),
            }}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white font-inter text-lg font-medium rounded-[45.5px] hover:bg-white/20 transition-colors"
          >
            Previous
          </Link>
        ) : (
          <div className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 text-white/50 font-inter text-lg font-medium rounded-[45.5px] cursor-not-allowed">
            Previous
          </div>
        )}
        {nextItem ? (
          <Link
            to="/reading/$feedId/$slug"
            params={{
              feedId: feedId,
              slug: generateSlug(nextItem.title),
            }}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white font-inter text-lg font-medium rounded-[45.5px] hover:bg-white/20 transition-colors"
          >
            Next Article
          </Link>
        ) : (
          <div className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 text-white/50 font-inter text-lg font-medium rounded-[45.5px] cursor-not-allowed">
            Next Article
          </div>
        )}
      </div>
    </div>
  );
}

export { generateSlug };
