import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SettingsIcon, SettingsLargeIcon, PlusIcon } from "./icons";
import { ReadingExperience } from "./ReadingExperience";
import { AudioSettings } from "./AudioSettings";
import { AppearanceSettings } from "./AppearanceSettings";
import { NotificationSettings } from "./NotificationSettings";
import { PrivacySettings } from "./PrivacySettings";

interface ReadingSettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  readingSpeed: number[];
  onReadingSpeedChange: (value: number[]) => void;
  autoAdvance: boolean;
  onAutoAdvanceChange: (value: boolean) => void;
  textToSpeech: boolean;
  onTextToSpeechChange: (value: boolean) => void;
  voiceSettings: boolean;
  onVoiceSettingsChange: (value: boolean) => void;
  showImages: boolean;
  onShowImagesChange: (value: boolean) => void;
  readingReminders: boolean;
  onReadingRemindersChange: (value: boolean) => void;
  weeklyDigest: boolean;
  onWeeklyDigestChange: (value: boolean) => void;
  analytics: boolean;
  onAnalyticsChange: (value: boolean) => void;
  personalizedRecommendations: boolean;
  onPersonalizedRecommendationsChange: (value: boolean) => void;
}

export function ReadingSettingsDialog({
  isOpen,
  onOpenChange,
  readingSpeed,
  onReadingSpeedChange,
  autoAdvance,
  onAutoAdvanceChange,
  textToSpeech,
  onTextToSpeechChange,
  voiceSettings,
  onVoiceSettingsChange,
  showImages,
  onShowImagesChange,
  readingReminders,
  onReadingRemindersChange,
  weeklyDigest,
  onWeeklyDigestChange,
  analytics,
  onAnalyticsChange,
  personalizedRecommendations,
  onPersonalizedRecommendationsChange,
}: ReadingSettingsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center rounded-full touch-manipulation p-2 -m-2"
        >
          <SettingsIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-[425px] max-h-[85vh] sm:max-h-[710px] overflow-y-auto gap-0 rounded-[10px] p-0">
        <DialogHeader className="border-b-[0.667px] border-b-[#E5E5E5] px-[20px] sm:px-[30px] py-[16px] sm:py-[20px]">
          <DialogTitle className="flex items-center gap-3">
            <SettingsLargeIcon />
            <p className="font-Inter text-[20px] sm:text-[24px] leading-[26px] sm:leading-[30px] font-bold">
              Settings
            </p>
          </DialogTitle>
        </DialogHeader>
        <div className="px-[20px] sm:px-[30px] py-[16px] sm:py-[20px]">
          <Tabs
            defaultValue="reading-audio"
            className="w-full flex flex-col gap-[16px] sm:gap-[20px]"
          >
            <TabsList className="grid w-full grid-cols-2 h-auto">
              <TabsTrigger
                value="reading-audio"
                className="text-sm sm:text-base py-2 sm:py-2.5"
              >
                Reading & Audio
              </TabsTrigger>
              <TabsTrigger
                value="general"
                className="text-sm sm:text-base py-2 sm:py-2.5"
              >
                General
              </TabsTrigger>
            </TabsList>
            <TabsContent value="reading-audio">
              <div className="flex flex-col gap-4">
                <ReadingExperience
                  readingSpeed={readingSpeed}
                  onReadingSpeedChange={onReadingSpeedChange}
                  autoAdvance={autoAdvance}
                  onAutoAdvanceChange={onAutoAdvanceChange}
                />
                <AudioSettings
                  textToSpeech={textToSpeech}
                  onTextToSpeechChange={onTextToSpeechChange}
                  voiceSettings={voiceSettings}
                  onVoiceSettingsChange={onVoiceSettingsChange}
                />
              </div>
            </TabsContent>
            <TabsContent value="general">
              <div className="flex flex-col gap-4">
                <AppearanceSettings
                  showImages={showImages}
                  onShowImagesChange={onShowImagesChange}
                />
                <NotificationSettings
                  readingReminders={readingReminders}
                  onReadingRemindersChange={onReadingRemindersChange}
                  weeklyDigest={weeklyDigest}
                  onWeeklyDigestChange={onWeeklyDigestChange}
                />
                <PrivacySettings
                  analytics={analytics}
                  onAnalyticsChange={onAnalyticsChange}
                  personalizedRecommendations={personalizedRecommendations}
                  onPersonalizedRecommendationsChange={
                    onPersonalizedRecommendationsChange
                  }
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
        <DialogFooter className="px-[20px] sm:px-[26px] py-[18px] sm:py-[22px] flex flex-col sm:flex-row w-full justify-between! items-center gap-3 sm:gap-0">
          <p className="text-[#737373] text-sm leading-[20px] order-2 sm:order-1">
            Settings are automatically saved
          </p>
          <Button 
            className="w-full sm:w-auto order-1 sm:order-2 touch-manipulation"
            onClick={() => onOpenChange(false)}
          >
            <PlusIcon />
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
