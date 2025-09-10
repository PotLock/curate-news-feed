import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { CloseIcon } from "./icons";
import { ReadingSettingsDialog } from "./ReadingSettingsDialog";
import { useReadingSettings } from "@/contexts/reading-settings-context";
import {
  CategoriesSection,
  TimeSection,
  AuthorSection,
  Divider,
} from "./InfoSection";

interface ReadingHeaderProps {
  feedId: string;
  categoryCount: number;
  uploadDate: string;
  authorName?: string;
  onFeedSelectionChange?: (selectedFeedIds: string[]) => void;
  onPeriodChange?: (period: string) => void;
  selectedPeriod?: string;
}

export function ReadingHeader({
  feedId,
  categoryCount,
  uploadDate,
  authorName,
  onFeedSelectionChange,
  onPeriodChange,
  selectedPeriod,
}: ReadingHeaderProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const {
    readingSpeed,
    autoAdvance,
    dailyGoal,
    textToSpeech,
    selectedVoice,
    showImages,
    analytics,
    personalizedRecommendations,
    updateSettings,
  } = useReadingSettings();

  return (
    <div className="w-full flex flex-col md:flex-row items-center justify-between mb-4 sm:mb-6 lg:mb-8">
      {/* Mobile Layout */}
      <div className="flex sm:hidden w-full items-center justify-between">
        {/* Close Button */}
        <Link
          to="/$feedId"
          params={{ feedId }}
          className="hover:opacity-70 transition-opacity touch-manipulation p-2 -m-2"
        >
          <CloseIcon />
        </Link>

        {/* Mobile Info Sections */}
        <div className="flex items-center px-[10px] py-[6px] gap-[10px]">
          <TimeSection
            uploadDate={uploadDate}
            onPeriodChange={onPeriodChange}
            selectedPeriod={selectedPeriod}
          />
          <Divider />
          <AuthorSection />
        </div>

        {/* Settings */}
        <div className="p-2 -m-2">
          <ReadingSettingsDialog
            isOpen={isSettingsOpen}
            onOpenChange={setIsSettingsOpen}
            readingSpeed={[readingSpeed]}
            onReadingSpeedChange={(value) =>
              updateSettings({ readingSpeed: value[0] })
            }
            autoAdvance={autoAdvance}
            onAutoAdvanceChange={(value) =>
              updateSettings({ autoAdvance: value })
            }
            dailyGoal={dailyGoal}
            onDailyGoalChange={(value) =>
              updateSettings({ dailyGoal: value })
            }
            textToSpeech={textToSpeech}
            onTextToSpeechChange={(value) =>
              updateSettings({ textToSpeech: value })
            }
            voiceSettings={!!selectedVoice}
            onVoiceSettingsChange={(value) =>
              updateSettings({ selectedVoice: value ? "default" : "" })
            }
            showImages={showImages}
            onShowImagesChange={(value) =>
              updateSettings({ showImages: value })
            }
            readingReminders={false}
            onReadingRemindersChange={() => {}}
            weeklyDigest={false}
            onWeeklyDigestChange={() => {}}
            analytics={analytics}
            onAnalyticsChange={(value) => updateSettings({ analytics: value })}
            personalizedRecommendations={personalizedRecommendations}
            onPersonalizedRecommendationsChange={(value) =>
              updateSettings({ personalizedRecommendations: value })
            }
          />
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden sm:flex w-full items-center justify-between">
        {/* Close Button */}
        <Link
          to="/$feedId"
          params={{ feedId }}
          className="hover:opacity-70 transition-opacity touch-manipulation p-2 -m-2"
        >
          <CloseIcon />
        </Link>

        {/* Center Header Container */}
        <div className="flex items-center px-[10px] border-[1px] border-[#e8e8e8] rounded-full py-[6px] gap-[10px]">
          <TimeSection
            uploadDate={uploadDate}
            onPeriodChange={onPeriodChange}
            selectedPeriod={selectedPeriod}
          />
          <Divider />
          <AuthorSection />
          <Divider />
          <ReadingSettingsDialog
            isOpen={isSettingsOpen}
            onOpenChange={setIsSettingsOpen}
            readingSpeed={[readingSpeed]}
            onReadingSpeedChange={(value) =>
              updateSettings({ readingSpeed: value[0] })
            }
            autoAdvance={autoAdvance}
            onAutoAdvanceChange={(value) =>
              updateSettings({ autoAdvance: value })
            }
            dailyGoal={dailyGoal}
            onDailyGoalChange={(value) =>
              updateSettings({ dailyGoal: value })
            }
            textToSpeech={textToSpeech}
            onTextToSpeechChange={(value) =>
              updateSettings({ textToSpeech: value })
            }
            voiceSettings={!!selectedVoice}
            onVoiceSettingsChange={(value) =>
              updateSettings({ selectedVoice: value ? "default" : "" })
            }
            showImages={showImages}
            onShowImagesChange={(value) =>
              updateSettings({ showImages: value })
            }
            readingReminders={false}
            onReadingRemindersChange={() => {}}
            weeklyDigest={false}
            onWeeklyDigestChange={() => {}}
            analytics={analytics}
            onAnalyticsChange={(value) => updateSettings({ analytics: value })}
            personalizedRecommendations={personalizedRecommendations}
            onPersonalizedRecommendationsChange={(value) =>
              updateSettings({ personalizedRecommendations: value })
            }
          />
        </div>

        {/* Empty div for layout balance */}
        <div className="w-[37px]"></div>
      </div>
    </div>
  );
}
