import { useState } from "react";
import { UserMenu } from "./user-menu";
import { Button } from "./ui/button";
import { SubmitNewsPopup } from "./SubmitNewsPopup";
import logoImg from "@/assets/Light/Logo.png";

export default function ProfileHeader() {
  const [isSubmitNewsOpen, setIsSubmitNewsOpen] = useState(false);

  return (
    <header className="bg-white">
      <div className="flex h-[69px] items-center justify-between px-8 py-[10px]">
        {/* Logo - Left Side */}
        <div className="flex items-center">
          <img src={logoImg} alt="Curate.fun Logo" className="h-8 w-auto" />
        </div>
        
        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsSubmitNewsOpen(true)}
          >
            Submit News
          </Button>
          <UserMenu />
        </div>
      </div>
      
      {/* Submit News Popup */}
      <SubmitNewsPopup 
        isOpen={isSubmitNewsOpen} 
        onOpenChange={setIsSubmitNewsOpen}
      />
    </header>
  );
}