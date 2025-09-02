import { Switch } from "@/components/ui/switch";
import { AppearanceIcon } from "./icons";

interface AppearanceSettingsProps {
  showImages: boolean;
  onShowImagesChange: (value: boolean) => void;
}

export function AppearanceSettings({
  showImages,
  onShowImagesChange,
}: AppearanceSettingsProps) {
  return (
    <div className="p-6 w-full flex flex-col gap-[24px] rounded-[14px] border-[1px] border-[#E5E5E5] shadow-[0px_1px_3px_0px_#0000/20]">
      <div className="flex gap-1 items-center w-full justify-start">
        <AppearanceIcon />
        <p className="text-[#0A0A0A] text-[16px] leading-[16px] font-Inter font-semibold">
          Appearance
        </p>
      </div>
      <div className="flex w-full justify-between items-center">
        <div className="flex flex-col items-start justify-center gap-[6px]">
          <p className="text-[#0a0a0a] text-[14px] leading-[14px] ">
            Show article images
          </p>
          <p className="text-[#737373] text-[14px] leading-[14px]">
            Show featured images
          </p>
        </div>
        <Switch checked={showImages} onCheckedChange={onShowImagesChange} />
      </div>
    </div>
  );
}
