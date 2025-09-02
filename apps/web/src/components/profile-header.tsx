import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { UserMenu } from "./user-menu";
import { Button } from "./ui/button";
import { SubmitNewsPopup } from "./SubmitNewsPopup";
import logoImg from "@/assets/Light/Logo.png";

export default function ProfileHeader() {
  const [isSubmitNewsOpen, setIsSubmitNewsOpen] = useState(false);

  return (
    <header className="bg-white">
      <div className="flex h-[69px] items-center justify-between px-4 sm:px-8 py-[10px]">
        {/* Logo - Left Side */}
        <div className="flex items-center">
          <Link
            to="/"
            className="hover:opacity-80 transition-opacity cursor-pointer"
          >
            <img src={logoImg} alt="Curate.fun Logo" className="h-8 w-auto" />
          </Link>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSubmitNewsOpen(true)}
            className="hidden sm:inline-flex"
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
