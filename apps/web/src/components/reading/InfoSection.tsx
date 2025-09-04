import { ReactNode, useState, useEffect } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { CategoriesIcon, ClockIcon, UserIcon } from "./icons";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/utils/trpc";

interface InfoSectionProps {
  icon: ReactNode;
  children: ReactNode;
}

function InfoSection({ icon, children }: InfoSectionProps) {
  return (
    <div className="flex items-center gap-[10px]">
      {icon}
      {children}
    </div>
  );
}

interface CategoriesSectionProps {
  count: number;
  currentFeedId?: string;
  onFeedSelectionChange?: (selectedFeedIds: string[]) => void;
}

export function CategoriesSection({ count, currentFeedId, onFeedSelectionChange }: CategoriesSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const trpc = useTRPC();
  
  // Fetch all feeds
  const queryOptions = trpc.getFeeds.queryOptions();
  const { data: feedsData, isLoading } = useQuery(queryOptions);
  
  // Initialize feed states when feeds are loaded
  const [feedStates, setFeedStates] = useState<Array<{
    id: string;
    name: string;
    description: string;
    checked: boolean;
  }>>([]);

  // Load saved feed selections from localStorage
  const loadSavedFeedSelections = () => {
    try {
      const accountId = "anonymous-user"; // This matches the pattern used in ReadingActions
      const savedKey = `selected-feeds-${accountId}`;
      const savedSelections = localStorage.getItem(savedKey);
      
      if (savedSelections) {
        const selectedFeedIds = JSON.parse(savedSelections);
        return selectedFeedIds;
      }
    } catch (error) {
      console.warn("Failed to load saved feed selections:", error);
    }
    return [currentFeedId]; // Default to current feed if no saved selections
  };

  // Save feed selections to localStorage
  const saveFeedSelections = (selectedFeedIds: string[]) => {
    try {
      const accountId = "anonymous-user";
      const savedKey = `selected-feeds-${accountId}`;
      localStorage.setItem(savedKey, JSON.stringify(selectedFeedIds));
    } catch (error) {
      console.warn("Failed to save feed selections:", error);
    }
  };

  // Update feed states when feedsData changes
  useEffect(() => {
    if (feedsData?.items) {
      const savedSelections = loadSavedFeedSelections();
      
      setFeedStates(
        feedsData.items.map((feed: any) => ({
          id: feed.id,
          name: feed.title || 'Untitled Feed',
          description: feed.description || `Feed containing ${feed.items?.length || 0} articles`,
          checked: savedSelections.includes(feed.id),
        }))
      );
    }
  }, [feedsData, currentFeedId]);
  
  const selectedFeeds = feedStates.filter(feed => feed.checked).length;
  const totalFeeds = feedStates.length;
  const unselectedFeeds = totalFeeds - selectedFeeds;

  const handleSelectAll = () => {
    setFeedStates(feeds => feeds.map(feed => ({ ...feed, checked: true })));
  };

  const handleFeedToggle = (feedId: string, checked: boolean) => {
    setFeedStates(feeds => 
      feeds.map(feed => 
        feed.id === feedId ? { ...feed, checked } : feed
      )
    );
  };

  const handleSaveSettings = () => {
    const selectedFeedIds = feedStates
      .filter(feed => feed.checked)
      .map(feed => feed.id);
    
    // Ensure at least one feed is selected
    if (selectedFeedIds.length === 0) {
      // Re-select current feed if nothing is selected
      const fallbackFeedId = currentFeedId || feedStates[0]?.id || "";
      const updatedStates = feedStates.map(feed => ({
        ...feed,
        checked: feed.id === fallbackFeedId
      }));
      setFeedStates(updatedStates);
      saveFeedSelections([fallbackFeedId]);
      onFeedSelectionChange?.([fallbackFeedId]);
      
      // Show user feedback that at least one feed must remain selected
      console.warn("At least one feed must remain selected");
    } else {
      // Save the current selections
      saveFeedSelections(selectedFeedIds);
      onFeedSelectionChange?.(selectedFeedIds);
    }
    
    setIsOpen(false);
  };

  const handleCancel = () => {
    // Reset to saved state without making changes
    const savedSelections = loadSavedFeedSelections();
    setFeedStates(prevStates => 
      prevStates.map(feed => ({
        ...feed,
        checked: savedSelections.includes(feed.id)
      }))
    );
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-[10px] hover:opacity-70 transition-opacity cursor-pointer">
          <CategoriesIcon />
          <span className="text-[#27272A] text-center font-inter text-sm font-medium leading-5">
            Categories
          </span>
          <div className="category-count-badge">
            <span className="text-[#27272A] font-inter text-xs font-medium leading-4">
              {selectedFeeds}
            </span>
          </div>
        </button>
      </DialogTrigger>
      <DialogContent className="p-2.5 gap-3 rounded-lg max-w-sm" showCloseButton={false}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-black font-inter text-sm font-medium">Select Feed</h3>
          <Button
            variant="secondary" 
            size="sm"
            onClick={handleSelectAll}
            className="text-black font-inter text-sm font-medium"
          >
            Select All
          </Button>
        </div>
        
        {/* Feed Statistics */}
        <div className="flex flex-row gap-3">
          {/* Active Feeds */}
          <div className="flex-1 rounded-lg border border-gray-200 bg-white px-3.5 py-3 flex flex-col justify-center items-center gap-2.5">
            <span className="text-black text-center font-inter text-xl font-bold leading-6">
              {selectedFeeds}
            </span>
            <span className="text-black font-inter text-xs font-normal leading-6">
              Active Feeds
            </span>
          </div>
          
          {/* Hidden Feeds */}
          <div className="flex-1 rounded-lg border border-gray-200 bg-white px-3.5 py-3 flex flex-col justify-center items-center gap-2.5">
            <span className="text-black text-center font-inter text-xl font-bold leading-6">
              {unselectedFeeds}
            </span>
            <span className="text-black font-inter text-xs font-normal leading-6">
              Hidden Feeds
            </span>
          </div>
        </div>

        {/* Feed Selection */}
        <div className="flex flex-col gap-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <span className="text-muted-foreground text-sm">Loading feeds...</span>
            </div>
          ) : feedStates.length === 0 ? (
            <div className="flex items-center justify-center py-4">
              <span className="text-muted-foreground text-sm">No feeds available</span>
            </div>
          ) : (
            feedStates.map((feed) => (
              <div key={feed.id} className="flex items-start w-full gap-2">
                <Checkbox
                  checked={feed.checked}
                  onCheckedChange={(checked) => handleFeedToggle(feed.id, !!checked)}
                />
                <div className="flex flex-col">
                  <span className="text-foreground font-inter text-sm font-bold leading-[100%]">
                    {feed.name}
                  </span>
                  <span className="text-muted-foreground font-inter text-xs font-normal leading-4">
                    {feed.description}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center">
          <Button
            variant="default"
            size="sm"
            onClick={handleSaveSettings}
          >
            Save Settings
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCancel}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface TimeSectionProps {
  uploadDate: string;
}

export function TimeSection({ uploadDate }: TimeSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} Days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} Weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} Months ago`;
    return `${Math.floor(diffInDays / 365)} Years ago`;
  };

  const getFormattedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getFormattedTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-[10px] hover:opacity-70 transition-opacity cursor-pointer">
          <ClockIcon />
          <span className="text-[#27272A] text-center font-inter text-sm font-medium leading-5">
            {getRelativeTime(uploadDate)}
          </span>
        </button>
      </DialogTrigger>
      <DialogContent className="p-2.5 gap-3 rounded-lg max-w-sm" showCloseButton={false}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-black font-inter text-sm font-medium">Published</h3>
        </div>
        
        {/* Date and Time Details */}
        <div className="flex flex-col gap-2">
          <div className="text-black font-inter text-base font-medium">
            {getFormattedDate(uploadDate)}
          </div>
          <div className="text-gray-600 font-inter text-sm">
            at {getFormattedTime(uploadDate)}
          </div>
          <div className="text-gray-500 font-inter text-xs mt-2">
            {getRelativeTime(uploadDate)}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AuthorSection() {
  return (
    <Link
      to="/profile"
      className="hover:opacity-70 transition-opacity"
    >
      <InfoSection icon={<UserIcon />}>
        <span className="sr-only">Go to profile</span>
      </InfoSection>
    </Link>
  );
}

export function Divider() {
  return <div className="w-px h-6 bg-[#E5E5E5]"></div>;
}
