import { useState } from "react";
import { X, Search } from "lucide-react";

import { UserMenu } from "./user-menu";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useSearch } from "@/contexts/search-context";
import { SubmitNewsPopup } from "./SubmitNewsPopup";
import { SidebarTrigger } from "./ui/sidebar";
import { Link } from "@tanstack/react-router";
import logoImg from "@/assets/Light/Logo.png";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSubmitNewsOpen, setIsSubmitNewsOpen] = useState(false);
  const { searchQuery, setSearchQuery } = useSearch();

  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Mobile Layout */}
        <div className="flex md:hidden w-full items-center justify-between">
          {/* Left - Sidebar Trigger + Search */}
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Search className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Center - Logo */}
          <div className="flex-1 flex justify-center">
            <Link
              to="/"
              className="hover:opacity-80 transition-opacity cursor-pointer"
            >
              <img src={logoImg} alt="Curate.fun Logo" className="h-6 w-auto" />
            </Link>
          </div>

          {/* Right - User Menu */}
          <div className="flex items-center">
            <UserMenu />
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex w-full items-center justify-between">
          {/* Desktop Search Bar - Left Side */}
          <div className="flex flex-1 max-w-md mr-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search feeds and articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
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
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur">
          <div className="px-4 py-4 space-y-4">
            {/* Mobile Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search feeds and articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>

            {/* Mobile Actions */}
            <div className="flex flex-col space-y-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  setIsSubmitNewsOpen(true);
                  setIsMobileMenuOpen(false);
                }}
              >
                Submit News
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Submit News Popup */}
      <SubmitNewsPopup
        isOpen={isSubmitNewsOpen}
        onOpenChange={setIsSubmitNewsOpen}
      />
    </header>
  );
}
