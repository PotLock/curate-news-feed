import { Switch } from "@/components/ui/switch";
import { NotificationIcon } from "./icons";

interface NotificationSettingsProps {
  readingReminders: boolean;
  onReadingRemindersChange: (value: boolean) => void;
  weeklyDigest: boolean;
  onWeeklyDigestChange: (value: boolean) => void;
}

export function NotificationSettings({
  readingReminders,
  onReadingRemindersChange,
  weeklyDigest,
  onWeeklyDigestChange,
}: NotificationSettingsProps) {
  return (
    <div className="p-6 w-full flex flex-col gap-[24px] rounded-[14px] border-[1px] border-[#E5E5E5] shadow-[0px_1px_3px_0px_#0000/20]">
      <div className="flex gap-1 items-center w-full justify-start">
        <NotificationIcon />
        <p className="text-[#0A0A0A] text-[16px] leading-[16px] font-Inter font-semibold">
          Notifications
        </p>
      </div>
      <div className="flex w-full justify-between items-center">
        <div className="flex flex-col items-start justify-center gap-[6px]">
          <p className="text-[#0a0a0a] text-[14px] leading-[14px] ">
            Reading Reminders
          </p>
          <p className="text-[#737373] text-[14px] leading-[14px]">
            Get notified about your daily reading goal
          </p>
        </div>
        <Switch
          checked={readingReminders}
          onCheckedChange={onReadingRemindersChange}
        />
      </div>
      <div className="flex w-full justify-between items-center">
        <div className="flex flex-col items-start justify-center gap-[6px]">
          <p className="text-[#0a0a0a] text-[14px] leading-[14px] ">
            Weekly Digest
          </p>
          <p className="text-[#737373] text-[14px] leading-[14px]">
            Receive Weekly Reading Summary
          </p>
        </div>
        <Switch checked={weeklyDigest} onCheckedChange={onWeeklyDigestChange} />
      </div>
    </div>
  );
}
