import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import caughtUpImg from "@/assets/Light/caught-up.png";
import newsPaperImg from "@/assets/Light/news-paper.png";
import statIconImg from "@/assets/Light/stat-icon.png";

interface GoalCompletionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  articlesReadToday: number;
  timeSpent: string;
  readingStreak: number;
}

export function GoalCompletionModal({
  isOpen,
  onOpenChange,
  articlesReadToday,
  timeSpent,
  readingStreak,
}: GoalCompletionModalProps) {
  // Ensure streak is at least 1 when modal is shown (since modal only shows on goal completion)
  const displayStreak = Math.max(readingStreak, 1);
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-none flex w-[555px] p-8 flex-col items-center gap-6 shrink-0">
        <DialogHeader className="flex flex-col items-center gap-0">
          {/* Caught Up Image */}
          <img
            src={caughtUpImg}
            alt="All Caught Up"
            className="w-[127px] h-[127px] aspect-square"
          />

          {/* Title */}
          <h2 className="text-black text-center font-inter text-2xl font-semibold leading-[50px]">
            All Caught Up
          </h2>

          {/* Subtitle */}
          <p className="text-neutral-500 text-center font-inter text-base font-medium leading-[50px]">
            Great job staying informed today
          </p>
        </DialogHeader>

        {/* Statistics Cards */}
        <div className="flex flex-row gap-6">
          {/* Articles Read Card */}
          <div className="flex w-48 px-[52px] py-4 flex-col items-center gap-1 rounded-md border border-neutral-600 bg-slate-50">
            {/* News Paper Icon */}
            <img
              src={newsPaperImg}
              alt="Articles"
              className="w-[41px] h-[41px] aspect-square mb-2"
            />

            {/* Article Count */}
            <div className="text-black text-center font-inter text-2xl font-bold leading-8">
              {articlesReadToday}
            </div>

            {/* Label */}
            <div className="text-neutral-500 text-center font-inter text-sm font-medium leading-5">
              Articles Read
            </div>
          </div>

          {/* Time Spent Card */}
          <div className="flex w-48 px-[52px] py-4 flex-col items-center gap-1 rounded-md border border-orange-500 bg-orange-50">
            {/* Stat Icon */}
            <img
              src={statIconImg}
              alt="Time"
              className="w-[41px] h-[41px] aspect-square mb-2"
            />

            {/* Time Display */}
            <div className="text-orange-600 text-center font-inter text-2xl font-bold leading-8">
              {timeSpent}
            </div>

            {/* Label */}
            <div className="text-neutral-500 text-center font-inter text-sm font-medium leading-5">
              Time Spent
            </div>
          </div>
        </div>
        <div className="bg-[#F0FDF4] rounded-[14px] w-full flex items-center justify-between p-4">
          <div className="flex items-center gap-4 justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="25"
              viewBox="0 0 24 25"
              fill="none"
            >
              <path
                d="M8.5 14.665C9.16304 14.665 9.79893 14.4016 10.2678 13.9327C10.7366 13.4639 11 12.828 11 12.165C11 10.785 10.5 10.165 10 9.16498C8.928 7.02198 9.776 5.11098 12 3.16498C12.5 5.66498 14 8.06498 16 9.66498C18 11.265 19 13.165 19 15.165C19 16.0842 18.8189 16.9945 18.4672 17.8438C18.1154 18.693 17.5998 19.4647 16.9497 20.1147C16.2997 20.7647 15.5281 21.2804 14.6788 21.6321C13.8295 21.9839 12.9193 22.165 12 22.165C11.0807 22.165 10.1705 21.9839 9.32122 21.6321C8.47194 21.2804 7.70026 20.7647 7.05025 20.1147C6.40024 19.4647 5.88463 18.693 5.53284 17.8438C5.18106 16.9945 5 16.0842 5 15.165C5 14.012 5.433 12.871 6 12.165C6 12.828 6.26339 13.4639 6.73223 13.9327C7.20107 14.4016 7.83696 14.665 8.5 14.665Z"
                stroke="#16A34A"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <div className="flex flex-col items-start justify-center">
              <p className="text-[#101828] text-base font-semibold leading-[26px]">
                Reading Streak
              </p>
              <p className="text-[#4A5565] text-sm font-normal leading-5">
                Keep it going!
              </p>
            </div>
          </div>
          <div>
            <p className="text-[#16A34A] text-2xl font-bold leading-[26px]">
              {displayStreak} {displayStreak === 1 ? 'day' : 'days'}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
