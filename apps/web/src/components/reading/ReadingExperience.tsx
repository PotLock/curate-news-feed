import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { ReadingIcon } from "./icons";

interface ReadingExperienceProps {
  readingSpeed: number[];
  onReadingSpeedChange: (value: number[]) => void;
  autoAdvance: boolean;
  onAutoAdvanceChange: (value: boolean) => void;
  dailyGoal: number;
  onDailyGoalChange: (value: number) => void;
}

export function ReadingExperience({
  readingSpeed,
  onReadingSpeedChange,
  autoAdvance,
  onAutoAdvanceChange,
  dailyGoal,
  onDailyGoalChange,
}: ReadingExperienceProps) {
  return (
    <div className="p-6 w-full flex flex-col gap-[24px] rounded-[14px] border-[1px] border-[#E5E5E5] shadow-[0px_1px_3px_0px_#0000/20]">
      <div className="flex gap-1 items-center w-full justify-start">
        <ReadingIcon />
        <p className="text-[#0A0A0A] text-[16px] leading-[16px] font-Inter font-semibold">
          Reading Experience
        </p>
      </div>
      <div className="flex flex-col gap-[12px] w-full">
        <div className="w-full flex items-center justify-between">
          <p className="text-[#0a0a0a] text-[14px] leading-[14px] ">
            Reading Speed (seconds per article)
          </p>
          <p className="text-[#0a0a0a] text-[14px] leading-[14px] font-semibold">
            {readingSpeed[0]}s
          </p>
        </div>
        <div className="px-0">
          <Slider
            value={readingSpeed}
            onValueChange={onReadingSpeedChange}
            max={20}
            min={3}
            step={1}
            className="w-full"
          />
        </div>
        <div className="flex items-center justify-between w-full">
          <p className="text-[#737373] text-[12px] font-Inter">Fast(3s)</p>
          <p className="text-[#737373] text-[12px] font-Inter">Medium(10s)</p>
          <p className="text-[#737373] text-[12px] font-Inter">Slow(20s)</p>
        </div>
      </div>
      <div className="flex w-full justify-between items-center">
        <div className="flex flex-col items-start justify-center gap-[6px]">
          <p className="text-[#0a0a0a] text-[14px] leading-[14px] ">
            Daily Reading Goal
          </p>
          <p className="text-[#737373] text-[14px] leading-[14px]">
            Number of articles to read per day
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={dailyGoal}
            onChange={(e) => onDailyGoalChange(Math.max(1, parseInt(e.target.value) || 1))}
            min="1"
            max="20"
            className="w-16 h-8"
          />
          <span className="text-[#737373] text-[12px]">articles</span>
        </div>
      </div>
      <div className="flex w-full justify-between items-center">
        <div className="flex flex-col items-start justify-center gap-[6px]">
          <p className="text-[#0a0a0a] text-[14px] leading-[14px] ">
            Auto-advance articles
          </p>
          <p className="text-[#737373] text-[14px] leading-[14px]">
            Automatically move to next article
          </p>
        </div>
        <Switch checked={autoAdvance} onCheckedChange={onAutoAdvanceChange} />
      </div>
    </div>
  );
}
