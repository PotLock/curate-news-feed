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
}

export function ReadingHeader({
  feedId,
  categoryCount,
  uploadDate,
  authorName,
}: ReadingHeaderProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const {
    readingSpeed,
    autoAdvance,
    textToSpeech,
    selectedVoice,
    showImages,
    analytics,
    personalizedRecommendations,
    updateSettings,
  } = useReadingSettings();

  return (
    <div className="w-full flex max-w-[785px] items-center justify-between mb-4 sm:mb-6 lg:mb-8">
      {/* Close Button */}
      <Link
        to="/$feedId"
        params={{ feedId }}
        className="hover:opacity-70 transition-opacity touch-manipulation p-2 -m-2"
      >
        <CloseIcon />
      </Link>

      {/* Center Header Container */}
      <div className="reading-header-container">
        {/* Mobile Layout - Simplified */}
        <div className="flex sm:hidden items-center px-[8px] py-[6px] gap-[8px]">
          <CategoriesSection count={categoryCount} />
          <Divider />
          <TimeSection uploadDate={uploadDate} />
          <Divider />
          <AuthorSection authorName={authorName} />
        </div>

        {/* Desktop Layout - Full */}
        <div className="hidden sm:flex items-center px-[10px] py-[6px] gap-[10px]">
          <CategoriesSection count={categoryCount} />
          <Divider />
          <TimeSection uploadDate={uploadDate} />
          <Divider />
          <AuthorSection authorName={authorName} />
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

      {/* Empty div for layout balance - hidden on mobile */}
      <div className="w-[37px] hidden sm:block"></div>
      {/* Mobile settings access */}
      <div className="sm:hidden">
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
          textToSpeech={textToSpeech}
          onTextToSpeechChange={(value) =>
            updateSettings({ textToSpeech: value })
          }
          voiceSettings={!!selectedVoice}
          onVoiceSettingsChange={(value) =>
            updateSettings({ selectedVoice: value ? "default" : "" })
          }
          showImages={showImages}
          onShowImagesChange={(value) => updateSettings({ showImages: value })}
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
  );
}
