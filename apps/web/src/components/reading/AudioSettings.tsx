import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { SpeakerIcon } from "./icons";

interface AudioSettingsProps {
  textToSpeech: boolean;
  onTextToSpeechChange: (value: boolean) => void;
  voiceSettings: boolean;
  onVoiceSettingsChange: (value: boolean) => void;
}

export function AudioSettings({
  textToSpeech,
  onTextToSpeechChange,
  voiceSettings,
  onVoiceSettingsChange,
}: AudioSettingsProps) {
  return (
    <div className="p-6 w-full flex flex-col gap-[24px] rounded-[14px] border-[1px] border-[#E5E5E5] shadow-[0px_1px_3px_0px_#0000/20]">
      <div className="flex gap-1 items-center w-full justify-start">
        <SpeakerIcon />
        <p className="text-[#0A0A0A] text-[16px] leading-[16px] font-Inter font-semibold">
          Audio & Voices
        </p>
      </div>
      <div className="flex w-full justify-between items-center">
        <div className="flex flex-col items-start justify-center gap-[6px]">
          <p className="text-[#0a0a0a] text-[14px] leading-[14px] ">
            Text-to-speech
          </p>
          <p className="text-[#737373] text-[14px] leading-[14px]">
            read articles aloud
          </p>
        </div>
        <Switch checked={textToSpeech} onCheckedChange={onTextToSpeechChange} />
      </div>
      <div className="flex w-full justify-between items-center">
        <div className="flex flex-col items-start justify-center gap-[6px]">
          <p className="text-[#0a0a0a] text-[14px] leading-[14px] ">
            Voice Settings
          </p>
          <p className="text-[#737373] text-[14px] leading-[14px]">
            Choose voice for audio reading
          </p>
        </div>
        <Switch
          checked={voiceSettings}
          onCheckedChange={onVoiceSettingsChange}
        />
      </div>
      <Collapsible open={voiceSettings}>
        <CollapsibleContent>
          <div className="w-full flex flex-col gap-[16px]">
            <div className="flex flex-col gap-[12px]">
              <select className="w-full px-3 py-2 border border-[#E5E5E5] rounded-md text-[14px] bg-white">
                <option value="alloy">
                  Microsoft George - English (United Kingdom)
                </option>
              </select>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}