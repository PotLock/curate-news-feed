import type { FeedItem as IFeedItem } from "../../../server/src/schemas/feed";
import { useParams, Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { useSearch } from "@/contexts/search-context";
import { useSearch as useSearchFilter } from "@/hooks/use-search";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

// Function to generate slug from title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .trim();
};

interface FeedGridProps {
  items: IFeedItem[];
  feedTitle: string;
  feedDescription?: string;
}

export function FeedGrid({ items, feedTitle, feedDescription }: FeedGridProps) {
  const params = useParams({ strict: false });
  const feedId = (params as any)?.feedId;
  const { searchQuery, isSearchActive } = useSearch();
  const filteredItems = useSearchFilter(items, searchQuery) as IFeedItem[];
  const [selectedCategory, setSelectedCategory] = useState("trending");

  // Bento grid layout patterns - always 3 columns, first column largest
  const getRowPattern = (rowIndex: number) => {
    const patterns = [
      [3, 2, 1], // Row 0: Large, Medium, Small
      [2, 3, 1], // Row 1: Medium, Large, Small
      [2, 1, 3], // Row 2: Medium, Small, Large
      [3, 1, 2], // Row 3: Large, Small, Medium
      [1, 3, 2], // Row 4: Small, Large, Medium
      [1, 2, 3], // Row 5: Small, Medium, Large
    ];
    return patterns[rowIndex % patterns.length];
  };

  // Color scheme for bento layout
  const getCardColor = (itemIndex: number) => {
    const colors = [
      "#2D916B",
      "#336699", // Updated from #1D4469 to #336699
      "#A83C24",
      "#3E9A6D",
      "#5B8BBD",
      "#61B290",
    ];
    return colors[itemIndex % colors.length];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  // Extract unique categories from all items
  const uniqueCategories = Array.from(
    new Set(
      items
        .flatMap((item) => item.category || [])
        .map((cat) => cat.name)
        .filter(Boolean)
    )
  ).sort();

  // Filter items by selected category
  const categoryFilteredItems =
    selectedCategory === "trending"
      ? filteredItems
      : filteredItems.filter((item) =>
          item.category?.some((cat) => cat.name === selectedCategory)
        );

  const displayItems = categoryFilteredItems;
  const displayTitle = isSearchActive
    ? `Search Results for "${searchQuery}"`
    : feedTitle;

  if (!displayItems.length) {
    return (
      <div className="mx-auto p-4 sm:p-6 max-w-[1440px]">
        <div className="flex items-center justify-start">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-black font-inter leading-6 sm:leading-8 m-0">
              {displayTitle}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">
              {isSearchActive
                ? `No articles found matching "${searchQuery}".`
                : "No articles available in this feed."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] h-screen sm:h-[calc(100svh-64px)] overflow-hidden">
      <div className="p-4 sm:p-6 h-full flex flex-col">
        {/* Feed Header */}
        <div className="flex items-center justify-start mb-4 sm:mb-6 flex-shrink-0">
          <div className="w-full">
            <h1 className="text-xl sm:text-2xl font-bold text-black font-inter leading-6 sm:leading-8 m-0">
              {displayTitle}
            </h1>
            {feedDescription && (
              <p className="text-sm sm:text-base text-black font-inter leading-5 sm:leading-6 mt-2">
                {feedDescription}
              </p>
            )}

            {/* Categories Section */}
            <div className="mt-4 sm:mt-6">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide w-full pb-2">
                <Badge
                  variant={
                    selectedCategory === "trending" ? "default" : "secondary"
                  }
                  className={
                    selectedCategory === "trending"
                      ? "bg-black text-white border border-black font-inter text-sm sm:text-base font-bold min-h-[32px] sm:min-h-[35px] max-h-[32px] sm:max-h-[35px] rounded-full py-2 sm:py-[8.5px] px-3 sm:px-4 cursor-pointer whitespace-nowrap flex-shrink-0 touch-manipulation"
                      : "bg-white text-[#737373] border border-[#E2E8F0] font-inter text-sm sm:text-base min-h-[32px] sm:min-h-[35px] max-h-[32px] sm:max-h-[35px] rounded-full py-2 sm:py-[8.5px] px-3 sm:px-4 cursor-pointer whitespace-nowrap flex-shrink-0 touch-manipulation"
                  }
                  onClick={() => setSelectedCategory("trending")}
                >
                  Trending
                </Badge>
                {uniqueCategories.map((category) => (
                  <Badge
                    key={category}
                    variant={
                      selectedCategory === category ? "default" : "secondary"
                    }
                    className={
                      selectedCategory === category
                        ? "bg-black text-white border border-black font-inter text-sm sm:text-base font-bold min-h-[32px] sm:min-h-[35px] max-h-[32px] sm:max-h-[35px] rounded-full py-2 sm:py-[8.5px] px-3 sm:px-4 cursor-pointer whitespace-nowrap flex-shrink-0 touch-manipulation"
                        : "bg-white text-[#737373] border border-[#E2E8F0] font-inter text-sm sm:text-base min-h-[32px] sm:min-h-[35px] max-h-[32px] sm:max-h-[35px] rounded-full py-2 sm:py-[8.5px] px-3 sm:px-4 cursor-pointer whitespace-nowrap flex-shrink-0 touch-manipulation"
                    }
                    onClick={() => setSelectedCategory(category || "")}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Feed Grid Container */}
        <div className="overflow-y-auto relative rounded-lg">
          {/* Feed Items Responsive Grid */}
          <div className="space-y-4 sm:space-y-6 max-w-[1170px] pb-24">
            {/* Mobile: Single Column */}
            <div className="block sm:hidden space-y-4">
              {displayItems.map((item, index) => (
                <Link
                  key={item.id || index}
                  to="/reading/$feedId/$slug"
                  params={{
                    feedId: feedId,
                    slug: generateSlug(item.title),
                  }}
                  className="block p-6 h-[280px] rounded-lg w-full hover:opacity-90 transition-opacity cursor-pointer touch-manipulation"
                  style={{ backgroundColor: getCardColor(index) }}
                >
                  <div className="flex flex-col justify-between h-full">
                    {/* Content Section */}
                    <div className="flex flex-col gap-3">
                      {/* Info Div - Time and Author */}
                      <div className="w-full flex justify-between items-center">
                        <span className="text-white/70 text-xs font-inter uppercase">
                          {formatDate(item.date)}
                        </span>
                        {item.author && item.author[0] && (
                          <span className="text-white/70 text-xs font-inter uppercase">
                            BY {item.author[0].name?.toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-white text-lg font-bold font-inter line-clamp-3">
                        {item.title}
                      </h3>

                      {/* Description */}
                      {item.description && (
                        <p className="text-white/70 text-sm leading-5 font-inter line-clamp-3">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* Industry Badges */}
                    {item.category && item.category.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {item.category.slice(0, 2).map((cat, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 text-xs font-medium rounded-md"
                            style={{
                              backgroundColor: "#255459",
                              color: "#3E9A6D",
                            }}
                          >
                            {cat.name}
                          </span>
                        ))}
                        {item.category.length > 2 && (
                          <span
                            className="px-2 py-1 text-xs font-medium rounded-md"
                            style={{
                              backgroundColor: "#255459",
                              color: "#3E9A6D",
                            }}
                          >
                            +{item.category.length - 2} More
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* Tablet: Two Columns */}
            <div className="hidden sm:block lg:hidden">
              <div className="grid grid-cols-2 gap-4">
                {displayItems.map((item, index) => (
                  <Link
                    key={item.id || index}
                    to="/reading/$feedId/$slug"
                    params={{
                      feedId: feedId,
                      slug: generateSlug(item.title),
                    }}
                    className="p-6 h-[320px] rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                    style={{ backgroundColor: getCardColor(index) }}
                  >
                    <div className="flex flex-col justify-between h-full">
                      {/* Content Section */}
                      <div className="flex flex-col gap-3">
                        {/* Info Div - Time and Author */}
                        <div className="w-full flex justify-between items-center">
                          <span className="text-white/70 text-sm font-inter uppercase">
                            {formatDate(item.date)}
                          </span>
                          {item.author && item.author[0] && (
                            <span className="text-white/70 text-sm font-inter uppercase">
                              BY {item.author[0].name?.toUpperCase()}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-white text-xl font-bold font-inter line-clamp-3">
                          {item.title}
                        </h3>

                        {/* Description */}
                        {item.description && (
                          <p className="text-white/70 text-base leading-6 font-inter line-clamp-3">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* Industry Badges */}
                      {item.category && item.category.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {item.category.slice(0, 2).map((cat, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 text-xs font-medium rounded-md"
                              style={{
                                backgroundColor: "#1D4469",
                                color: "#BBC8D5",
                              }}
                            >
                              {cat.name}
                            </span>
                          ))}
                          {item.category.length > 2 && (
                            <span
                              className="px-2 py-1 text-xs font-medium rounded-md"
                              style={{
                                backgroundColor: "#1D4469",
                                color: "#BBC8D5",
                              }}
                            >
                              +{item.category.length - 2} More
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Desktop: Original Bento Layout */}
            <div className="hidden lg:flex lg:flex-col lg:gap-3">
              {(() => {
                const rows = [];
                let itemIndex = 0;
                let rowIndex = 0;

                while (itemIndex < displayItems.length) {
                  const pattern = getRowPattern(rowIndex);
                  const rowItems = [];

                  // Always take exactly 3 items per row
                  for (
                    let i = 0;
                    i < 3 && itemIndex < displayItems.length;
                    i++
                  ) {
                    rowItems.push({
                      item: displayItems[itemIndex],
                      size: pattern[i],
                      globalIndex: itemIndex,
                    });
                    itemIndex++;
                  }

                  rows.push(
                    <div key={rowIndex} className="flex w-full gap-3 gap-y-3">
                      {rowItems.map(({ item, globalIndex }, cardIndex) => (
                        <Link
                          key={item.id || globalIndex}
                          to="/reading/$feedId/$slug"
                          params={{
                            feedId: feedId,
                            slug: generateSlug(item.title),
                          }}
                          className={`py-[46px] px-[24px] h-[358px] rounded-lg min-w-[282px] flex flex-col justify-between ${cardIndex === 0 ? "max-w-[500px]" : "flex-1"} hover:opacity-90 transition-opacity cursor-pointer`}
                          style={{ backgroundColor: getCardColor(globalIndex) }}
                        >
                          {/* Content Section */}
                          <div className="flex flex-col gap-3">
                            {/* Info Div - Time and Author */}
                            <div className="w-full flex justify-between items-center">
                              <span className="text-white/70 text-sm font-inter uppercase">
                                {formatDate(item.date)}
                              </span>
                              {item.author && item.author[0] && (
                                <span className="text-white/70 text-sm font-inter uppercase">
                                  BY {item.author[0].name?.toUpperCase()}
                                </span>
                              )}
                            </div>

                            {/* Title */}
                            <h3 className="text-white text-2xl font-bold font-inter line-clamp-3">
                              {item.title}
                            </h3>

                            {/* Description */}
                            {item.description && (
                              <p className="text-white/70 text-base leading-6 font-inter line-clamp-4">
                                {item.description}
                              </p>
                            )}
                          </div>

                          {/* Industry Badges */}
                          {item.category && item.category.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {(() => {
                                const maxVisibleBadges = 2; // Show max 2 badges before overflow
                                const visibleCategories = item.category!.slice(
                                  0,
                                  maxVisibleBadges
                                );
                                const hiddenCount =
                                  item.category!.length - maxVisibleBadges;

                                // Get badge styling based on column position
                                const getBadgeStyle = (columnIndex: number) => {
                                  switch (columnIndex) {
                                    case 0:
                                      return {
                                        backgroundColor: "#255459",
                                        color: "#3E9A6D",
                                      };
                                    case 1:
                                      return {
                                        backgroundColor: "#1D4469",
                                        color: "#BBC8D5",
                                      };
                                    case 2:
                                      return {
                                        backgroundColor: "#8C474B",
                                        color: "#BBC8D5",
                                      };
                                    default:
                                      return {
                                        backgroundColor: "#255459",
                                        color: "#3E9A6D",
                                      };
                                  }
                                };

                                const badgeStyle = getBadgeStyle(cardIndex);

                                return (
                                  <>
                                    {visibleCategories.map((cat, idx) => (
                                      <span
                                        key={idx}
                                        className="px-2 py-1 text-xs font-medium rounded-md"
                                        style={badgeStyle}
                                      >
                                        {cat.name}
                                      </span>
                                    ))}
                                    {hiddenCount > 0 && (
                                      <span
                                        className="px-2 py-1 text-xs font-medium rounded-md"
                                        style={badgeStyle}
                                      >
                                        +{hiddenCount} More
                                      </span>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          )}
                        </Link>
                      ))}
                    </div>
                  );

                  rowIndex++;
                }

                return rows;
              })()}
            </div>
          </div>

          {/* Sticky Bottom CTA */}
          <div className="sticky bottom-0 h-20 sm:h-24 flex items-center justify-center bg-gradient-to-t from-black to-gray-400/0 rounded-b-lg z-10">
            {displayItems.length > 0 && feedId && (
              <Link
                to="/reading/$feedId/$slug"
                params={{
                  feedId: feedId,
                  slug: generateSlug(displayItems[0].title),
                }}
                className="flex items-center justify-center gap-2 w-[200px] sm:w-[229px] px-4 sm:px-6 py-3 bg-white/10 text-white font-inter text-lg sm:text-xl font-medium leading-6 sm:leading-[37.333px] rounded-[45.5px] hover:bg-white/20 transition-colors border-t border-b border-white touch-manipulation"
              >
                Start Reading
                <ArrowRight size={18} className="sm:w-[21px] sm:h-[21px]" />
              </Link>
            )}
            {displayItems.length > 0 && !feedId && (
              <div className="flex items-center justify-center gap-2 w-[200px] sm:w-[229px] px-4 sm:px-6 py-3 bg-white/5 text-white/50 font-inter text-lg sm:text-xl font-medium leading-6 sm:leading-[37.333px] rounded-[45.5px] cursor-not-allowed">
                Start Reading
                <ArrowRight size={18} className="sm:w-[21px] sm:h-[21px]" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
