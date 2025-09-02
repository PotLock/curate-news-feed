import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

interface ReadingActionsProps {
  articleTitle: string;
  articleUrl: string;
  articleId: string;
  feedId: string;
}

export function ReadingActions({ articleTitle, articleUrl, articleId, feedId }: ReadingActionsProps) {
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState<boolean | null>(null); // null = no preference, true = liked, false = disliked
  const [userAccountId, setUserAccountId] = useState<string | null>(null);

  // Get user account ID
  useEffect(() => {
    const getUserAccount = async () => {
      try {
        const { data: session } = await authClient.getSession();
        if (session?.user) {
          // Try to get NEAR account ID
          try {
            const { data: nearProfile } = await authClient.near.getProfile();
            // Use NEAR account ID if available, otherwise fallback to user email or ID
            const accountId = (window as any)?.near?.accountId?.() || 
                             nearProfile?.accountId ||
                             session.user.email ||
                             session.user.id;
            setUserAccountId(accountId);
          } catch {
            // Fallback to user email or ID if NEAR profile not available
            setUserAccountId(session.user.email || session.user.id);
          }
        }
      } catch (error) {
        console.warn('Failed to get user account:', error);
      }
    };
    
    getUserAccount();
  }, []);

  // Load saved state from user-specific localStorage
  useEffect(() => {
    if (!userAccountId) return;
    
    const storageKey = `saved-articles-${userAccountId}`;
    const savedArticles = JSON.parse(localStorage.getItem(storageKey) || '{}');
    setIsSaved(!!savedArticles[articleId]);
  }, [articleId, userAccountId]);

  // Load like/dislike preference from user-specific localStorage
  useEffect(() => {
    if (!userAccountId) return;
    
    const preferencesKey = `article-preferences-${userAccountId}`;
    const preferences = JSON.parse(localStorage.getItem(preferencesKey) || '{}');
    const preference = preferences[articleId];
    setIsLiked(preference?.liked ?? null); // null if no preference set
  }, [articleId, userAccountId]);

  // Track article in reading history
  useEffect(() => {
    if (!userAccountId) return;

    const addToHistory = () => {
      const historyKey = `reading-history-${userAccountId}`;
      const readingHistory = JSON.parse(localStorage.getItem(historyKey) || '{}');
      
      // Add/update article in history
      readingHistory[articleId] = {
        id: articleId,
        title: articleTitle,
        url: articleUrl,
        feedId: feedId,
        readAt: new Date().toISOString(),
        // Update readAt if article is read again
        firstReadAt: readingHistory[articleId]?.firstReadAt || new Date().toISOString()
      };
      
      localStorage.setItem(historyKey, JSON.stringify(readingHistory));
    };

    // Add to history when component mounts (user opened the article)
    addToHistory();
  }, [articleId, articleTitle, articleUrl, feedId, userAccountId]);

  // Save/unsave article with user-specific storage
  const handleSave = () => {
    if (!userAccountId) {
      toast.error("Please log in to save articles");
      return;
    }

    const storageKey = `saved-articles-${userAccountId}`;
    const savedArticles = JSON.parse(localStorage.getItem(storageKey) || '{}');
    
    if (isSaved) {
      // Remove from saved
      delete savedArticles[articleId];
      localStorage.setItem(storageKey, JSON.stringify(savedArticles));
      setIsSaved(false);
      toast.success("Article removed from saved");
    } else {
      // Add to saved with metadata
      savedArticles[articleId] = {
        id: articleId,
        title: articleTitle,
        url: articleUrl,
        feedId: feedId,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(storageKey, JSON.stringify(savedArticles));
      setIsSaved(true);
      toast.success("Article saved for later");
    }
  };

  // Handle like/dislike article
  const handleLikeDislike = (liked: boolean) => {
    if (!userAccountId) {
      toast.error("Please log in to like/dislike articles");
      return;
    }

    const preferencesKey = `article-preferences-${userAccountId}`;
    const preferences = JSON.parse(localStorage.getItem(preferencesKey) || '{}');
    
    if (isLiked === liked) {
      // User is clicking the same preference - remove it (toggle off)
      delete preferences[articleId];
      setIsLiked(null);
      toast.success(liked ? "Like removed" : "Dislike removed");
    } else {
      // Set new preference
      preferences[articleId] = {
        id: articleId,
        title: articleTitle,
        url: articleUrl,
        feedId: feedId,
        liked: liked,
        preferenceAt: new Date().toISOString()
      };
      setIsLiked(liked);
      toast.success(liked ? "Article liked!" : "Article disliked");
    }
    
    localStorage.setItem(preferencesKey, JSON.stringify(preferences));
  };

  // Share article
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: articleTitle,
          text: `Check out this article: ${articleTitle}`,
          url: articleUrl
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(articleUrl);
        toast.success("Article link copied to clipboard!");
      }
    } catch (err) {
      console.error('Share failed:', err);
      toast.error("Failed to share article");
    }
  };

  // Navigate to home
  const handleHome = () => {
    navigate({ to: "/" });
  };
  return (
    <div className="flex flex-row lg:flex-col gap-3 lg:gap-4 justify-center lg:justify-start">
      {/* Save Button */}
      <Button
        onClick={handleSave}
        variant="outline"
        className={`border-[0.66px] p-[8px] lg:p-[10px] border-[#e5e5e5] rounded-[8px] shadow-[0_4px_6px_-4px_rgba(0,0,0,0.10),0_10px_15px_-3px_rgba(0,0,0,0.10)] h-auto touch-manipulation transition-colors ${
          isSaved ? 'bg-blue-50 border-blue-200' : 'bg-[#FFFFFFF2]'
        }`}
        title={isSaved ? "Remove from saved" : "Save article"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          className="lg:w-5 lg:h-5"
          viewBox="0 0 20 20"
          fill="none"
        >
          <path
            d="M7.5 4.37496C7.15482 4.37496 6.875 4.65478 6.875 4.99996C6.875 5.34514 7.15482 5.62496 7.5 5.62496H12.5C12.8452 5.62496 13.125 5.34514 13.125 4.99996C13.125 4.65478 12.8452 4.37496 12.5 4.37496H7.5Z"
            fill={isSaved ? "#2563EB" : "#1C274D"}
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M9.95209 1.04163C8.22495 1.04161 6.8643 1.0416 5.80107 1.1861C4.70935 1.33447 3.83841 1.64553 3.15403 2.33732C2.47058 3.02818 2.1641 3.90581 2.01775 5.00614C1.87498 6.07955 1.87499 7.45381 1.875 9.20085V13.4491C1.87499 14.7054 1.87498 15.7001 1.95501 16.449C2.03409 17.189 2.20373 17.8567 2.6882 18.3031C3.07688 18.6613 3.56842 18.8872 4.09304 18.9472C4.74927 19.0223 5.36199 18.7089 5.96557 18.2814C6.57636 17.8487 7.3173 17.1934 8.25212 16.3665L8.28254 16.3396C8.71593 15.9563 9.00935 15.6976 9.25416 15.5186C9.49076 15.3456 9.63522 15.2831 9.75698 15.2585C9.91743 15.2262 10.0826 15.2262 10.243 15.2585C10.3648 15.2831 10.5092 15.3456 10.7458 15.5186C10.9906 15.6976 11.2841 15.9563 11.7175 16.3396L11.7479 16.3666C12.6827 17.1934 13.4237 17.8488 14.0344 18.2814C14.638 18.7089 15.2507 19.0223 15.907 18.9472C16.4316 18.8872 16.9231 18.6613 17.3118 18.3031C17.7963 17.8567 17.9659 17.189 18.045 16.449C18.125 15.7001 18.125 14.7054 18.125 13.4492V9.20083C18.125 7.45381 18.125 6.07954 17.9823 5.00614C17.8359 3.90581 17.5294 3.02818 16.846 2.33732C16.1616 1.64553 15.2907 1.33447 14.1989 1.1861C13.1357 1.0416 11.7751 1.04161 10.0479 1.04163H9.95209ZM4.04267 3.21643C4.45664 2.79797 5.01876 2.55391 5.9694 2.42471C6.93871 2.29298 8.21438 2.29163 10 2.29163C11.7856 2.29163 13.0613 2.29298 14.0306 2.42471C14.9812 2.55391 15.5434 2.79797 15.9573 3.21643C16.3722 3.63582 16.6149 4.20678 16.7432 5.17094C16.8737 6.15239 16.875 7.44349 16.875 9.24789V13.409C16.875 14.7143 16.8741 15.6418 16.8021 16.3161C16.7282 17.0073 16.592 17.2667 16.4647 17.384C16.2699 17.5635 16.0248 17.6755 15.7649 17.7053C15.5985 17.7243 15.3196 17.6599 14.757 17.2614C14.2081 16.8726 13.5176 16.263 12.5456 15.4033L12.5238 15.384C12.1177 15.0249 11.781 14.727 11.4837 14.5096C11.1728 14.2823 10.8594 14.1076 10.4899 14.0332C10.1665 13.968 9.83352 13.968 9.51015 14.0332C9.14064 14.1076 8.82715 14.2823 8.51633 14.5096C8.21902 14.727 7.88226 15.0249 7.47621 15.384L7.45439 15.4033C6.48239 16.263 5.79189 16.8726 5.24304 17.2614C4.68038 17.6599 4.40151 17.7243 4.23515 17.7053C3.97516 17.6755 3.73014 17.5635 3.53531 17.384C3.40803 17.2667 3.27179 17.0073 3.19793 16.3161C3.12587 15.6418 3.125 14.7143 3.125 13.409V9.24789C3.125 7.44349 3.1263 6.15239 3.25684 5.17094C3.38508 4.20678 3.62777 3.63582 4.04267 3.21643Z"
            fill={isSaved ? "#2563EB" : "#1C274D"}
          />
        </svg>
      </Button>

      {/* Like Button */}
      <Button
        onClick={() => handleLikeDislike(true)}
        variant="outline"
        className={`border-[0.66px] p-[8px] lg:p-[10px] border-[#e5e5e5] rounded-[8px] shadow-[0_4px_6px_-4px_rgba(0,0,0,0.10),0_10px_15px_-3px_rgba(0,0,0,0.10)] h-auto touch-manipulation transition-colors ${
          isLiked === true ? 'bg-green-50 border-green-200' : 'bg-[#FFFFFFF2]'
        }`}
        title={isLiked === true ? "Remove like" : "Like article"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          className="lg:w-5 lg:h-5"
          viewBox="0 0 24 24"
          fill={isLiked === true ? "#16A34A" : "none"}
          stroke={isLiked === true ? "#16A34A" : "#1C274D"}
          strokeWidth="2"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </Button>

      {/* Dislike Button */}
      <Button
        onClick={() => handleLikeDislike(false)}
        variant="outline"
        className={`border-[0.66px] p-[8px] lg:p-[10px] border-[#e5e5e5] rounded-[8px] shadow-[0_4px_6px_-4px_rgba(0,0,0,0.10),0_10px_15px_-3px_rgba(0,0,0,0.10)] h-auto touch-manipulation transition-colors ${
          isLiked === false ? 'bg-red-50 border-red-200' : 'bg-[#FFFFFFF2]'
        }`}
        title={isLiked === false ? "Remove dislike" : "Dislike article"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          className="lg:w-5 lg:h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke={isLiked === false ? "#DC2626" : "#1C274D"}
          strokeWidth="2"
        >
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </Button>
      
      {/* Community Notes - HIDDEN (requires backend) */}
      
      {/* Home Button */}
      <Button
        onClick={handleHome}
        variant="outline"
        className="bg-[#FFFFFFF2] border-[0.66px] p-[8px] lg:p-[10px] border-[#e5e5e5] rounded-[8px] shadow-[0_4px_6px_-4px_rgba(0,0,0,0.10),0_10px_15px_-3px_rgba(0,0,0,0.10)] h-auto touch-manipulation hover:bg-gray-50"
        title="Go to home"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          className="lg:w-5 lg:h-5"
          viewBox="0 0 20 20"
          fill="none"
        >
          <g clipPath="url(#clip0_3960_1273)">
            <path
              d="M1.6665 10.1699C1.6665 8.26287 1.6665 7.30936 2.09917 6.51891C2.53184 5.72847 3.32229 5.23789 4.9032 4.25673L6.56986 3.22235C8.24099 2.1852 9.07656 1.66663 9.99984 1.66663C10.9231 1.66663 11.7587 2.1852 13.4298 3.22235L15.0965 4.25673C16.6774 5.23789 17.4678 5.72847 17.9005 6.51891C18.3332 7.30936 18.3332 8.26287 18.3332 10.1699V11.4374C18.3332 14.6882 18.3332 16.3135 17.3569 17.3234C16.3805 18.3333 14.8092 18.3333 11.6665 18.3333H8.33317C5.19047 18.3333 3.61913 18.3333 2.64281 17.3234C1.6665 16.3135 1.6665 14.6882 1.6665 11.4374V10.1699Z"
              stroke="#1C274D"
              strokeWidth="1.5"
            />
            <path
              d="M12.5 15H7.5"
              stroke="#1C274D"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </g>
          <defs>
            <clipPath id="clip0_3960_1273">
              <rect width="20" height="20" fill="white" />
            </clipPath>
          </defs>
        </svg>
      </Button>
      
      {/* Share Button */}
      <Button
        onClick={handleShare}
        variant="outline"
        className="bg-[#FFFFFFF2] border-[0.66px] p-[8px] lg:p-[10px] border-[#e5e5e5] rounded-[8px] shadow-[0_4px_6px_-4px_rgba(0,0,0,0.10),0_10px_15px_-3px_rgba(0,0,0,0.10)] h-auto touch-manipulation hover:bg-gray-50"
        title="Share article"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          className="lg:w-5 lg:h-5"
          viewBox="0 0 20 20"
          fill="none"
        >
          <path
            d="M7.50016 9.58333C7.50016 10.7339 6.56742 11.6667 5.41683 11.6667C4.26624 11.6667 3.3335 10.7339 3.3335 9.58333C3.3335 8.43274 4.26624 7.5 5.41683 7.5C6.56742 7.5 7.50016 8.43274 7.50016 9.58333Z"
            stroke="#1C274C"
            strokeWidth="1.5"
          />
          <path
            opacity="0.5"
            d="M11.9339 14.0012L7.5 11.0748"
            stroke="#1C274C"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            opacity="0.5"
            d="M12.0174 5.69971L7.5835 8.62606"
            stroke="#1C274C"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M15.8332 15.4167C15.8332 16.5673 14.9004 17.5 13.7498 17.5C12.5992 17.5 11.6665 16.5673 11.6665 15.4167C11.6665 14.2661 12.5992 13.3334 13.7498 13.3334C14.9004 13.3334 15.8332 14.2661 15.8332 15.4167Z"
            stroke="#1C274C"
            strokeWidth="1.5"
          />
          <path
            d="M15.8332 4.58333C15.8332 5.73393 14.9004 6.66667 13.7498 6.66667C12.5992 6.66667 11.6665 5.73393 11.6665 4.58333C11.6665 3.43274 12.5992 2.5 13.7498 2.5C14.9004 2.5 15.8332 3.43274 15.8332 4.58333Z"
            stroke="#1C274C"
            strokeWidth="1.5"
          />
        </svg>
      </Button>
    </div>
  );
}