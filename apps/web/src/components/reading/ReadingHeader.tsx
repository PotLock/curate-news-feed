import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { CloseIcon } from "./icons";
import { ReadingSettingsDialog } from "./ReadingSettingsDialog";
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
  const [readingSpeed, setReadingSpeed] = useState([8]);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [textToSpeech, setTextToSpeech] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState(false);

  return (
    <div className="w-full flex max-w-[785px] items-center justify-between mb-8">
      {/* Close Button */}
      <Link
        to="/$feedId"
        params={{ feedId }}
        className="hover:opacity-70 transition-opacity"
      >
        <CloseIcon />
      </Link>

      {/* Center Header Container */}
      <div className="reading-header-container">
        <div className="flex items-center px-[10px] py-[6px] gap-[10px]">
          <CategoriesSection count={categoryCount} />
          <Divider />
          <TimeSection uploadDate={uploadDate} />
          <Divider />
          <AuthorSection authorName={authorName} />
          <Divider />
          <ReadingSettingsDialog
            isOpen={isSettingsOpen}
            onOpenChange={setIsSettingsOpen}
            readingSpeed={readingSpeed}
            onReadingSpeedChange={setReadingSpeed}
            autoAdvance={autoAdvance}
            onAutoAdvanceChange={setAutoAdvance}
            textToSpeech={textToSpeech}
            onTextToSpeechChange={setTextToSpeech}
            voiceSettings={voiceSettings}
            onVoiceSettingsChange={setVoiceSettings}
          />
        </div>
      </div>

      {/* Empty div for layout balance */}
      <div className="w-[37px]"></div>
    </div>
  );
}
