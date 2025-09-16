import type { FeedItem as IFeedItem } from "../../../server/src/schemas/feed";
import { useParams, Link, useNavigate } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { useSearch } from "@/contexts/search-context";
import { useSearch as useSearchFilter } from "@/hooks/use-search";
import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { OnboardingModal } from "@/components/OnboardingModal";
import { GoalCompletionModal } from "@/components/GoalCompletionModal";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/utils/trpc";
import { useGoalCompletion } from "@/hooks/useGoalCompletion";
import { useReadingTimer } from "@/hooks/useReadingTimer";
import { useReadingStreak } from "@/hooks/useReadingStreak";
import { authClient } from "@/lib/auth-client";

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
  const navigate = useNavigate();
  const { searchQuery, isSearchActive } = useSearch();
  const filteredItems = useSearchFilter(items, searchQuery) as IFeedItem[];
  const [selectedCategory, setSelectedCategory] = useState("trending");
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [userAccountId, setUserAccountId] = useState<string | null>(null);

  // Fetch feeds for onboarding modal
  const trpc = useTRPC();
  const { data: feedsData } = useQuery(trpc.getFeeds.queryOptions());

  // Goal completion, reading timer, and streak hooks
  const { shouldShowModal, markModalShown } = useGoalCompletion(userAccountId);
  const { formattedTime } = useReadingTimer(userAccountId);
  const { currentStreak, updateStreak } = useReadingStreak(userAccountId);

  // Get user account ID
  useEffect(() => {
    const getUserAccount = async () => {
      try {
        const { data: session } = await authClient.getSession();
        if (session?.user) {
          try {
            const { data: nearProfile } = await authClient.near.getProfile();
            const accountId =
              (window as any)?.near?.accountId?.() ||
              nearProfile?.accountId ||
              session.user.email ||
              session.user.id;
            setUserAccountId(accountId);
          } catch {
            setUserAccountId(session.user.email || session.user.id);
          }
        } else {
          setUserAccountId("anonymous-user");
        }
      } catch (error) {
        console.warn("Failed to get user account:", error);
        setUserAccountId("anonymous-user");
      }
    };

    getUserAccount();
  }, []);

  // Calculate articles read today for the modal
  const getArticlesReadToday = () => {
    if (!userAccountId) return 0;

    try {
      const historyKey = `reading-history-${userAccountId}`;
      const historyData = localStorage.getItem(historyKey);
      if (historyData) {
        const history = JSON.parse(historyData);
        const today = new Date().toDateString();
        const todayArticles = Object.values(history).filter(
          (article: any) => new Date(article.readAt).toDateString() === today
        );
        return todayArticles.length;
      }
    } catch (error) {
      console.warn("Failed to get articles read today:", error);
    }
    return 0;
  };

  // Handle Start Reading button click
  const handleStartReading = () => {
    const hasCompletedOnboarding = localStorage.getItem("onboarding-completed");
    if (!hasCompletedOnboarding) {
      setIsOnboardingModalOpen(true);
    } else {
      // Navigate directly to reading if onboarding is completed
      if (displayItems.length > 0 && feedId) {
        navigate({
          to: "/reading/$feedId/$slug",
          params: {
            feedId: feedId,
            slug: generateSlug(displayItems[0].title),
          },
        });
      }
    }
  };

  // Handle onboarding completion
  const handleOnboardingComplete = (settings: {
    selectedFeeds: string[];
    dailyGoal: number;
    notificationFrequency: string;
  }) => {
    // Save reading settings to localStorage
    const existingSettings = JSON.parse(
      localStorage.getItem("reading-settings") || "{}"
    );
    const updatedSettings = {
      ...existingSettings,
      dailyGoal: settings.dailyGoal,
      notificationFrequency: settings.notificationFrequency,
      version: 3,
    };
    localStorage.setItem("reading-settings", JSON.stringify(updatedSettings));

    // Navigate to the first selected feed or default feed
    const targetFeedId = settings.selectedFeeds[0] || feedId || "general";
    navigate({ to: `/reading/${targetFeedId}` });
  };

  // Color scheme for cards
  const getCardColor = (itemIndex: number) => {
    const colors = [
      "#2D916B",
      "#336699",
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
      <div className="mx-auto p-2 sm:p-4 lg:p-6 w-full max-w-[1440px]">
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
    <div className="mx-auto w-full max-w-[1440px] h-screen sm:h-[calc(100svh-64px)] overflow-hidden">
      <div className="p-2 sm:p-4 lg:p-6 h-full flex flex-col">
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
            {/* <div className="mt-4 sm:mt-6">
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
            </div> */}
          </div>
        </div>

        {/* Scrollable Feed Grid Container */}
        <div className="overflow-y-auto relative rounded-lg flex-1 min-w-0">
          {/* Responsive Grid: 1 col mobile, 2 col tablet, 3 col desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-[25px] w-full">
            {displayItems.map((item, index) => (
              <Link
                key={item.id || index}
                to="/reading/$feedId/$slug"
                params={{
                  feedId: feedId,
                  slug: generateSlug(item.title),
                }}
                className="py-6 sm:py-8 lg:py-[46px] px-4 sm:px-5 lg:px-6 h-[280px] sm:h-[320px] lg:h-[358px] rounded-lg flex flex-col justify-between hover:opacity-90 transition-opacity cursor-pointer min-w-0"
                style={{ backgroundColor: getCardColor(index) }}
              >
                {/* Content Section */}
                <div className="flex flex-col gap-3 min-w-0">
                  {/* Info Div - Time and Author */}
                  <div className="w-full flex justify-between items-center gap-2">
                    <span className="text-white/70 text-xs sm:text-sm font-inter uppercase truncate">
                      {formatDate(item.date)}
                    </span>
                    {item.author && item.author[0] && (
                      <span className="text-white/70 text-xs sm:text-sm font-inter uppercase truncate">
                        BY {item.author[0].name?.toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-white text-lg sm:text-xl lg:text-2xl font-bold font-inter line-clamp-2 sm:line-clamp-3">
                    {item.title}
                  </h3>

                  {/* Description */}
                  {item.description && (
                    <p className="text-white/70 text-sm sm:text-base leading-5 sm:leading-6 font-inter line-clamp-3 sm:line-clamp-4">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Industry Badges */}
                {item.category && item.category.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      const maxVisibleBadges = 2;
                      const visibleCategories = item.category!.slice(
                        0,
                        maxVisibleBadges
                      );
                      const hiddenCount =
                        item.category!.length - maxVisibleBadges;

                      // Get badge styling based on card background color
                      const getBadgeStyle = () => {
                        const cardColor = getCardColor(index);
                        switch (cardColor) {
                          case "#2D916B":
                          case "#3E9A6D":
                          case "#61B290":
                            return {
                              backgroundColor: "#255459",
                              color: "#3E9A6D",
                            };
                          case "#336699":
                          case "#5B8BBD":
                            return {
                              backgroundColor: "#1D4469",
                              color: "#BBC8D5",
                            };
                          case "#A83C24":
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

                      const badgeStyle = getBadgeStyle();

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

          {/* Sticky Bottom CTA - Fixed on mobile, sticky on desktop */}
          <div className="fixed sm:sticky bottom-0 left-0 right-0 sm:left-auto sm:right-auto h-20 sm:h-24 flex items-center justify-center bg-gradient-to-t from-black to-gray-400/0 rounded-b-lg z-10">
            {displayItems.length > 0 && feedId && (
              <button
                onClick={handleStartReading}
                className="flex items-center backdrop-blur-sm justify-center gap-2 w-[200px] sm:w-[229px] px-4 sm:px-6 py-3 bg-white/10 text-white font-inter text-lg sm:text-xl font-medium leading-6 sm:leading-[37.333px] rounded-[45.5px] hover:bg-white/20 transition-colors border-t border-b border-white touch-manipulation"
              >
                Start Reading
                <ArrowRight size={18} className="sm:w-[21px] sm:h-[21px]" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={isOnboardingModalOpen}
        onOpenChange={setIsOnboardingModalOpen}
        feeds={
          feedsData?.items?.map((feed: any) => ({
            id: feed.id,
            title: feed.title,
            description: feed.description,
          })) || []
        }
        onComplete={handleOnboardingComplete}
        accountId={userAccountId}
      />

      {/* Goal Completion Modal */}
      <GoalCompletionModal
        isOpen={shouldShowModal}
        onOpenChange={(open) => {
          if (!open) {
            markModalShown();
          }
        }}
        articlesReadToday={getArticlesReadToday()}
        timeSpent={formattedTime}
        readingStreak={currentStreak}
      />
    </div>
  );
}
