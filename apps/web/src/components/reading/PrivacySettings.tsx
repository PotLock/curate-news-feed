import { Switch } from "@/components/ui/switch";
import { PrivacyIcon } from "./icons";

interface PrivacySettingsProps {
  analytics: boolean;
  onAnalyticsChange: (value: boolean) => void;
  personalizedRecommendations: boolean;
  onPersonalizedRecommendationsChange: (value: boolean) => void;
}

export function PrivacySettings({
  analytics,
  onAnalyticsChange,
  personalizedRecommendations,
  onPersonalizedRecommendationsChange,
}: PrivacySettingsProps) {
  return (
    <div className="p-6 w-full flex flex-col gap-[24px] rounded-[14px] border-[1px] border-[#E5E5E5] shadow-[0px_1px_3px_0px_#0000/20]">
      <div className="flex gap-1 items-center w-full justify-start">
        <PrivacyIcon />
        <p className="text-[#0A0A0A] text-[16px] leading-[16px] font-Inter font-semibold">
          Privacy & Data
        </p>
      </div>
      <div className="flex w-full justify-between items-center">
        <div className="flex flex-col items-start justify-center gap-[6px]">
          <p className="text-[#0a0a0a] text-[14px] leading-[14px] ">
            Analytics
          </p>
          <p className="text-[#737373] text-[14px] leading-[14px]">
            Help improve the app with usage data
          </p>
        </div>
        <Switch checked={analytics} onCheckedChange={onAnalyticsChange} />
      </div>
      <div className="flex w-full justify-between items-center">
        <div className="flex flex-col items-start justify-center gap-[6px]">
          <p className="text-[#0a0a0a] text-[14px] leading-[14px] ">
            Personalized Recommendations
          </p>
          <p className="text-[#737373] text-[14px] leading-[14px]">
            Show articles based on reading history
          </p>
        </div>
        <Switch
          checked={personalizedRecommendations}
          onCheckedChange={onPersonalizedRecommendationsChange}
        />
      </div>
    </div>
  );
}