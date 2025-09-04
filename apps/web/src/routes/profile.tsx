import { createFileRoute, Link } from "@tanstack/react-router";
import ProfileHeader from "@/components/profile-header";
import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/profile")({
  component: RouteComponent,
});

interface Profile {
  name?: string;
  description?: string;
  image?: {
    url?: string;
    ipfs_cid?: string;
  };
  backgroundImage?: {
    url?: string;
    ipfs_cid?: string;
  };
  linktree?: Record<string, string>;
}

function RouteComponent() {
  const [session, setSession] = useState<any>(null);
  const [nearProfile, setNearProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Try to get session data, but don't require it
        const { data: sessionData } = await authClient.getSession();
        setSession(sessionData);

        if (sessionData) {
          // Try to get the NEAR account ID from the session or accounts
          const { data: response } = await authClient.near.getProfile();
          setNearProfile(response);
        }
      } catch (err) {
        console.log("No session or NEAR profile found", err);
        setSession(null);
        setNearProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Get real user data
  const avatarUrl =
    nearProfile?.image?.url || nearProfile?.image?.ipfs_cid
      ? `https://ipfs.near.social/ipfs/${nearProfile.image.ipfs_cid}`
      : null;

  // @ts-ignore window.near - for fallback display name like in NearProfile component
  const displayName =
    nearProfile?.name ||
    session?.user?.name ||
    window?.near?.accountId?.() ||
    "Your Profile";

  const profileData = {
    name: displayName,
    description:
      nearProfile?.description ||
      "Your Reading Journey",
    joinedDate: new Date(session?.user?.createdAt || "2024-01-15"), // Use actual creation date from session
    profileImage:
      avatarUrl || session?.user?.image || "https://via.placeholder.com/80x80",
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <ProfileHeader />

        {/* Gap between header and content */}
        <div className="pt-[77px] px-4 sm:px-6 lg:px-8 max-w-[1072px] mx-auto">
          {/* Profile Card Loading State */}
          <div className="flex p-4 sm:p-6 flex-col items-center self-stretch rounded-[14px] border border-[#E5E5E5] bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 w-full">
              {/* Profile Image Skeleton */}
              <div className="flex-shrink-0">
                <Skeleton className="w-20 h-20 rounded-full" />
              </div>

              {/* Profile Info Skeleton */}
              <div className="flex flex-col items-center sm:items-start gap-[11px] w-full sm:w-[568px]">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-5 w-32" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <ProfileHeader />

      {/* Gap between header and content */}
      <div className="pt-[77px] px-4 sm:px-6 lg:px-8 max-w-[1072px] mx-auto">
        {/* Profile Card */}
        <div className="flex p-4 sm:p-6 flex-col items-center self-stretch rounded-[14px] border border-[#E5E5E5] bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 w-full">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              {profileData.profileImage ? (
                <img
                  src={profileData.profileImage}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://via.placeholder.com/80x80";
                  }}
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-medium text-gray-600">
                  {profileData.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex flex-col items-center sm:items-start gap-[11px] w-full sm:w-[568px] text-center sm:text-left">
              {/* Profile Name */}
              <h1 className="text-[#0A0A0A] font-inter text-2xl font-bold leading-8">
                {profileData.name}
              </h1>

              {/* Profile Description */}
              <p className="text-[#737373] font-inter text-base font-normal leading-6">
                {profileData.description}
              </p>

              {/* Joined Date */}
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="17"
                  viewBox="0 0 16 17"
                  fill="none"
                >
                  <path
                    d="M5.3335 1.66333V4.33"
                    stroke="#737373"
                    strokeWidth="1.33333"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10.6665 1.66333V4.33"
                    stroke="#737373"
                    strokeWidth="1.33333"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12.6667 2.99658H3.33333C2.59695 2.99658 2 3.59354 2 4.32992V13.6632C2 14.3996 2.59695 14.9966 3.33333 14.9966H12.6667C13.403 14.9966 14 14.3996 14 13.6632V4.32992C14 3.59354 13.403 2.99658 12.6667 2.99658Z"
                    stroke="#737373"
                    strokeWidth="1.33333"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 6.99658H14"
                    stroke="#737373"
                    strokeWidth="1.33333"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-[#737373] font-inter text-sm font-normal leading-5">
                  Joined {formatDate(profileData.joinedDate)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-8">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="saved">Saved</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <OverviewTab session={session} />
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <ReadingHistoryTab session={session} />
            </TabsContent>

            <TabsContent value="saved" className="mt-6">
              <SavedArticlesTab session={session} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

interface SavedArticle {
  id: string;
  title: string;
  url: string;
  feedId: string;
  savedAt: string;
}

interface ReadingHistoryArticle {
  id: string;
  title: string;
  url: string;
  feedId: string;
  readAt: string;
  firstReadAt: string;
}

function OverviewTab({ session }: { session: any }) {
  const [historyArticles, setHistoryArticles] = useState<
    ReadingHistoryArticle[]
  >([]);
  const [savedArticles, setSavedArticles] = useState<SavedArticle[]>([]);
  const [likedArticles, setLikedArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userAccountId, setUserAccountId] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Try to get account ID, use generic fallback if no session
        let accountId: string;
        if (session?.user) {
          try {
            const { data: nearProfile } = await authClient.near.getProfile();
            accountId =
              (window as any)?.near?.accountId?.() ||
              session.user.email ||
              session.user.id;
          } catch {
            accountId = session.user.email || session.user.id;
          }
        } else {
          // Use a generic account ID for anonymous users
          accountId = "anonymous-user";
        }

        setUserAccountId(accountId);

        // Load reading history from localStorage (same as ReadingHistoryTab)
        const historyKey = `reading-history-${accountId}`;
        const historyData = localStorage.getItem(historyKey);

        if (historyData) {
          const historyObj = JSON.parse(historyData);
          const historyArray = Object.values(
            historyObj,
          ) as ReadingHistoryArticle[];
          // Sort by last read date (newest first) - same as ReadingHistoryTab
          historyArray.sort(
            (a, b) =>
              new Date(b.readAt).getTime() - new Date(a.readAt).getTime(),
          );
          setHistoryArticles(historyArray);
        }

        // Load saved articles from localStorage (same as SavedArticlesTab)
        const storageKey = `saved-articles-${accountId}`;
        const savedData = localStorage.getItem(storageKey);

        if (savedData) {
          const articlesObj = JSON.parse(savedData);
          const articlesArray = Object.values(articlesObj) as SavedArticle[];
          // Sort by saved date (newest first) - same as SavedArticlesTab
          articlesArray.sort(
            (a, b) =>
              new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
          );
          setSavedArticles(articlesArray);
        }

        // Load article preferences (likes/dislikes) from localStorage
        const preferencesKey = `article-preferences-${accountId}`;
        const preferencesData = localStorage.getItem(preferencesKey);

        if (preferencesData) {
          const preferencesObj = JSON.parse(preferencesData);
          const preferencesArray = Object.values(preferencesObj) as any[];
          // Filter only liked articles and sort by preference date (newest first)
          const likedArray = preferencesArray
            .filter((pref: any) => pref.liked === true)
            .sort(
              (a, b) =>
                new Date(b.preferenceAt).getTime() -
                new Date(a.preferenceAt).getTime(),
            );
          setLikedArticles(likedArray);
        }
      } catch (error) {
        console.warn("Failed to load stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [session]);

  // Calculate stats from the loaded arrays (same approach as history tabs)
  const totalArticlesRead = historyArticles.length;
  const totalArticlesLiked = likedArticles.length;

  // Count articles read today
  const today = new Date().toDateString();
  const articlesReadToday = historyArticles.filter(
    (article) => new Date(article.readAt).toDateString() === today,
  ).length;

  if (isLoading) {
    return (
      <div className="flex flex-col lg:flex-row gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-full lg:w-[357px] h-48 rounded-xl bg-gray-200 animate-pulse p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="w-16 h-16 bg-gray-300 rounded-2xl"></div>
              <div className="flex flex-col items-end space-y-2">
                <div className="w-12 h-8 bg-gray-300 rounded"></div>
                <div className="w-20 h-4 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Articles Read Card */}
      <div className="w-full lg:w-[357px] h-48 rounded-xl bg-gradient-to-br from-[#2B7FFF] to-[#155DFC] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex p-3 items-center gap-[10px] rounded-[14px] bg-white/20 backdrop-blur-[4px]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="33"
              viewBox="0 0 32 33"
              fill="none"
            >
              <path
                d="M26.7758 4.67902L26.8019 5.42856L26.7758 4.67902ZM21.9998 5.30528L21.7847 4.58679V4.58679L21.9998 5.30528ZM18.2316 7.05902L17.8559 6.4099V6.4099L18.2316 7.05902ZM5.30971 4.75521L5.2637 5.50379L5.30971 4.75521ZM9.33317 5.30528L9.52453 4.5801V4.5801L9.33317 5.30528ZM13.7095 7.15597L13.3589 7.81898H13.3589L13.7095 7.15597ZM18.1699 27.4143L18.5227 28.0762H18.5227L18.1699 27.4143ZM22.6665 25.4998L22.4751 24.7747H22.4751L22.6665 25.4998ZM26.6467 24.9524L26.6935 25.701L26.6467 24.9524ZM13.8297 27.4143L13.4769 28.0762L13.8297 27.4143ZM9.33317 25.4998L9.52453 24.7747L9.33317 25.4998ZM5.35298 24.9524L5.30616 25.701L5.35298 24.9524ZM2.6665 22.1801H3.4165V7.31909H2.6665H1.9165V22.1801H2.6665ZM29.3332 22.1801H30.0832V7.23295H29.3332H28.5832V22.1801H29.3332ZM26.7758 4.67902L26.7497 3.92947C25.2352 3.98223 23.2784 4.13963 21.7847 4.58679L21.9998 5.30528L22.2149 6.02377C23.5131 5.63515 25.3069 5.48064 26.8019 5.42856L26.7758 4.67902ZM21.9998 5.30528L21.7847 4.58679C20.4872 4.97525 19.0156 5.73876 17.8559 6.4099L18.2316 7.05902L18.6073 7.70815C19.7449 7.04977 21.0922 6.3599 22.2149 6.02377L21.9998 5.30528ZM5.30971 4.75521L5.2637 5.50379C6.55514 5.58317 8.0341 5.73815 9.14181 6.03046L9.33317 5.30528L9.52453 4.5801C8.26822 4.24859 6.66793 4.08727 5.35572 4.00662L5.30971 4.75521ZM9.33317 5.30528L9.14181 6.03046C10.4537 6.37663 12.0534 7.12865 13.3589 7.81898L13.7095 7.15597L14.0601 6.49295C12.7359 5.79275 11.0106 4.97224 9.52453 4.5801L9.33317 5.30528ZM18.1699 27.4143L18.5227 28.0762C19.8469 27.3703 21.5048 26.5821 22.8579 26.225L22.6665 25.4998L22.4751 24.7747C20.9443 25.1786 19.1583 26.0376 17.8172 26.7525L18.1699 27.4143ZM22.6665 25.4998L22.8579 26.225C23.9531 25.936 25.4116 25.7812 26.6935 25.701L26.6467 24.9524L26.5999 24.2039C25.2967 24.2854 23.7178 24.4467 22.4751 24.7747L22.6665 25.4998ZM13.8297 27.4143L14.1825 26.7525C12.8414 26.0376 11.0554 25.1786 9.52453 24.7747L9.33317 25.4998L9.14181 26.225C10.4949 26.5821 12.1528 27.3703 13.4769 28.0762L13.8297 27.4143ZM9.33317 25.4998L9.52453 24.7747C8.28186 24.4467 6.70302 24.2854 5.3998 24.2039L5.35298 24.9524L5.30616 25.701C6.58806 25.7812 8.0466 25.936 9.14181 26.225L9.33317 25.4998ZM29.3332 22.1801H28.5832C28.5832 23.2362 27.7128 24.1343 26.5999 24.2039L26.6467 24.9524L26.6935 25.701C28.5374 25.5857 30.0832 24.0867 30.0832 22.1801H29.3332ZM29.3332 7.23295H30.0832C30.0832 5.41216 28.6358 3.86377 26.7497 3.92947L26.7758 4.67902L26.8019 5.42856C27.774 5.3947 28.5832 6.19388 28.5832 7.23295H29.3332ZM2.6665 22.1801H1.9165C1.9165 24.0867 3.4623 25.5857 5.30616 25.701L5.35298 24.9524L5.3998 24.2039C4.28683 24.1343 3.4165 23.2362 3.4165 22.1801H2.6665ZM18.1699 27.4143L17.8172 26.7525C16.6873 27.3548 15.3124 27.3548 14.1825 26.7525L13.8297 27.4143L13.4769 28.0762C15.0478 28.9136 16.9518 28.9136 18.5227 28.0762L18.1699 27.4143ZM18.2316 7.05902L17.8559 6.4099C16.6918 7.08366 15.2424 7.11814 14.0601 6.49295L13.7095 7.15597L13.3589 7.81898C15.0047 8.68921 17.0027 8.63682 18.6073 7.70815L18.2316 7.05902ZM2.6665 7.31909H3.4165C3.4165 6.25585 4.26437 5.44237 5.2637 5.50379L5.30971 4.75521L5.35572 4.00662C3.43211 3.88839 1.9165 5.45388 1.9165 7.31909H2.6665Z"
                fill="white"
              />
              <path
                opacity="0.5"
                d="M16 8.46057V28.6551"
                stroke="white"
                strokeWidth="1.5"
              />
              <path
                opacity="0.5"
                d="M6.6665 12.6553L11.9998 13.9886"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                opacity="0.5"
                d="M25.3335 12.6553L20.0002 13.9886"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                opacity="0.5"
                d="M6.6665 17.9886L11.9998 19.322"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                opacity="0.5"
                d="M25.3335 17.9886L20.0002 19.322"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="flex flex-col items-end">
            <p className="text-white text-right font-inter text-[30px] font-bold leading-9">
              {totalArticlesRead}
            </p>
            <p className="text-[#DBEAFE] text-right font-inter text-base font-normal leading-6">
              Articles Read
            </p>
          </div>
        </div>
      </div>

      {/* Articles Saved Card */}
      <div className="w-full lg:w-[357px] h-48 rounded-xl bg-gradient-to-br from-[#00C950] to-[#096] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex p-3 items-center gap-[10px] rounded-[14px] bg-white/20 backdrop-blur-[4px]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="33"
              viewBox="0 0 32 33"
              fill="none"
            >
              <path
                opacity="0.5"
                d="M2.66699 12.8381C2.66699 19.322 8.02623 22.7772 11.9493 25.8698C13.3337 26.9611 14.667 27.9886 16.0003 27.9886C17.3337 27.9886 18.667 26.9611 20.0513 25.8698C23.9744 22.7772 29.3337 19.322 29.3337 12.8381C29.3337 6.35416 22.0001 1.75589 16.0003 7.98945C10.0005 1.75589 2.66699 6.35416 2.66699 12.8381Z"
                fill="white"
              />
              <path
                d="M22.0003 18.3714C18.7004 14.7504 14.667 17.4215 14.667 21.1879C14.667 24.6317 17.1312 26.6046 19.2028 28.2906C19.3968 28.4485 19.5874 28.6039 19.7723 28.7578C20.5337 29.3917 21.267 29.9886 22.0003 29.9886C22.7337 29.9886 23.467 29.3917 24.2284 28.7578C26.3861 26.9613 29.3337 24.9543 29.3337 21.1879C29.3337 19.9506 28.8984 18.8315 28.1968 18.0148C26.7628 16.3455 24.2162 15.9399 22.0003 18.3714Z"
                fill="white"
              />
            </svg>
          </div>
          <div className="flex flex-col items-end">
            <p className="text-white text-right font-inter text-[30px] font-bold leading-9">
              {totalArticlesLiked}
            </p>
            <p className="text-[#DBEAFE] text-right font-inter text-base font-normal leading-6">
              Articles Liked
            </p>
          </div>
        </div>
      </div>

      {/* News Today Card */}
      <div className="w-full lg:w-[357px] h-48 rounded-xl bg-gradient-to-br from-[#AD46FF] to-[#9810FA] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex p-3 items-center gap-[10px] rounded-[14px] bg-white/20 backdrop-blur-[4px]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="33"
              viewBox="0 0 32 33"
              fill="none"
            >
              <path
                d="M12.3337 16.6552C12.3337 16.1029 12.7814 15.6552 13.3337 15.6552H15.0003V13.9886C15.0003 13.4363 15.448 12.9886 16.0003 12.9886C16.5526 12.9886 17.0003 13.4363 17.0003 13.9886V15.6552H18.667C19.2193 15.6552 19.667 16.1029 19.667 16.6552C19.667 17.2075 19.2193 17.6552 18.667 17.6552H17.0003V19.3219C17.0003 19.8742 16.5526 20.3219 16.0003 20.3219C15.448 20.3219 15.0003 19.8742 15.0003 19.3219V17.6552H13.3337C12.7814 17.6552 12.3337 17.2075 12.3337 16.6552Z"
                fill="white"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M16.0003 2.3219C8.08424 2.3219 1.66699 8.73915 1.66699 16.6552C1.66699 24.5713 8.08424 30.9886 16.0003 30.9886C23.9164 30.9886 30.3337 24.5713 30.3337 16.6552C30.3337 8.73915 23.9164 2.3219 16.0003 2.3219ZM15.0003 4.36185C8.98632 4.84441 4.1895 9.64123 3.70695 15.6552H6.66699C7.21928 15.6552 7.66699 16.1029 7.66699 16.6552C7.66699 17.2075 7.21928 17.6552 6.66699 17.6552H3.70695C4.1895 23.6692 8.98632 28.4661 15.0003 28.9486V25.9886C15.0003 25.4363 15.448 24.9886 16.0003 24.9886C16.5526 24.9886 17.0003 25.4363 17.0003 25.9886V28.9486C23.0143 28.4661 27.8111 23.6692 28.2937 17.6552H25.3337C24.7814 17.6552 24.3337 17.2075 24.3337 16.6552C24.3337 16.1029 24.7814 15.6552 25.3337 15.6552H28.2937C27.8111 9.64123 23.0143 4.84441 17.0003 4.36185V7.3219C17.0003 7.87418 16.5526 8.3219 16.0003 8.3219C15.448 8.3219 15.0003 7.87418 15.0003 7.3219V4.36185Z"
                fill="white"
              />
            </svg>
          </div>
          <div className="flex flex-col items-end">
            <p className="text-white text-right font-inter text-[30px] font-bold leading-9">
              {articlesReadToday}/3
            </p>
            <p className="text-[#DBEAFE] text-right font-inter text-base font-normal leading-6">
              Read Today
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReadingHistoryTab({ session }: { session: any }) {
  const [historyArticles, setHistoryArticles] = useState<
    ReadingHistoryArticle[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userAccountId, setUserAccountId] = useState<string | null>(null);

  // Get user account ID and load reading history
  useEffect(() => {
    const loadReadingHistory = async () => {
      try {
        // Try to get account ID, use generic fallback if no session
        let accountId: string;
        if (session?.user) {
          try {
            const { data: nearProfile } = await authClient.near.getProfile();
            accountId =
              (window as any)?.near?.accountId?.() ||
              session.user.email ||
              session.user.id;
          } catch {
            accountId = session.user.email || session.user.id;
          }
        } else {
          // Use a generic account ID for anonymous users
          accountId = "anonymous-user";
        }

        setUserAccountId(accountId);

        // Load reading history from localStorage
        const historyKey = `reading-history-${accountId}`;
        const historyData = localStorage.getItem(historyKey);

        if (historyData) {
          const historyObj = JSON.parse(historyData);
          const historyArray = Object.values(
            historyObj,
          ) as ReadingHistoryArticle[];
          // Sort by last read date (newest first)
          historyArray.sort(
            (a, b) =>
              new Date(b.readAt).getTime() - new Date(a.readAt).getTime(),
          );
          setHistoryArticles(historyArray);
        }
      } catch (error) {
        console.warn("Failed to load reading history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadReadingHistory();
  }, [session]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-4 border border-gray-200 rounded-lg">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (historyArticles.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          No reading history
        </h3>
        <p className="text-gray-500 mb-4">Articles you read will appear here</p>
        <Link to="/">
          <Button variant="outline">Start Reading</Button>
        </Link>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleClearHistory = () => {
    if (!userAccountId) return;

    if (confirm("Are you sure you want to clear all reading history?")) {
      const historyKey = `reading-history-${userAccountId}`;
      localStorage.removeItem(historyKey);
      setHistoryArticles([]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Clear history button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          Reading History ({historyArticles.length})
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearHistory}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          Clear History
        </Button>
      </div>

      {historyArticles.map((article) => (
        <div
          key={article.id}
          className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {article.title}
              </h4>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                <span>Feed: {article.feedId}</span>
                <span>
                  Last read: {formatDate(article.readAt)} at{" "}
                  {formatTime(article.readAt)}
                </span>
                {article.firstReadAt !== article.readAt && (
                  <span className="text-blue-600">• Re-read</span>
                )}
              </div>
              <div className="flex gap-2">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  Read Again
                  <svg
                    className="ml-1 h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SavedArticlesTab({ session }: { session: any }) {
  const [savedArticles, setSavedArticles] = useState<SavedArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userAccountId, setUserAccountId] = useState<string | null>(null);

  // Get user account ID and load saved articles
  useEffect(() => {
    const loadSavedArticles = async () => {
      try {
        // Try to get account ID, use generic fallback if no session
        let accountId: string;
        if (session?.user) {
          try {
            const { data: nearProfile } = await authClient.near.getProfile();
            accountId =
              (window as any)?.near?.accountId?.() ||
              session.user.email ||
              session.user.id;
          } catch {
            accountId = session.user.email || session.user.id;
          }
        } else {
          // Use a generic account ID for anonymous users
          accountId = "anonymous-user";
        }

        setUserAccountId(accountId);

        // Load saved articles from localStorage
        const storageKey = `saved-articles-${accountId}`;
        const savedData = localStorage.getItem(storageKey);

        if (savedData) {
          const articlesObj = JSON.parse(savedData);
          const articlesArray = Object.values(articlesObj) as SavedArticle[];
          // Sort by saved date (newest first)
          articlesArray.sort(
            (a, b) =>
              new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
          );
          setSavedArticles(articlesArray);
        }
      } catch (error) {
        console.warn("Failed to load saved articles:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedArticles();
  }, [session]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 border border-gray-200 rounded-lg">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (savedArticles.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          No saved articles
        </h3>
        <p className="text-gray-500 mb-4">Articles you save will appear here</p>
        <Link to="/">
          <Button variant="outline">Explore Articles</Button>
        </Link>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleRemoveArticle = (articleId: string) => {
    if (!userAccountId) return;

    const storageKey = `saved-articles-${userAccountId}`;
    const savedData = localStorage.getItem(storageKey);

    if (savedData) {
      const articlesObj = JSON.parse(savedData);
      delete articlesObj[articleId];
      localStorage.setItem(storageKey, JSON.stringify(articlesObj));

      // Update state
      setSavedArticles((prev) =>
        prev.filter((article) => article.id !== articleId),
      );
    }
  };

  return (
    <div className="space-y-4">
      {savedArticles.map((article) => (
        <div
          key={article.id}
          className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {article.title}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                <span>Feed: {article.feedId}</span>
                <span>Saved: {formatDate(article.savedAt)}</span>
              </div>
              <div className="flex gap-2">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  Read Article
                  <svg
                    className="ml-1 h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
                <button
                  onClick={() => handleRemoveArticle(article.id)}
                  className="inline-flex items-center px-3 py-1 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
