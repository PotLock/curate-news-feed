import { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { CategoriesIcon, ClockIcon, UserIcon } from "./icons";

interface InfoSectionProps {
  icon: ReactNode;
  children: ReactNode;
}

function InfoSection({ icon, children }: InfoSectionProps) {
  return (
    <div className="flex items-center gap-[10px]">
      {icon}
      {children}
    </div>
  );
}

interface CategoriesSectionProps {
  count: number;
}

export function CategoriesSection({ count }: CategoriesSectionProps) {
  return (
    <InfoSection icon={<CategoriesIcon />}>
      <span className="text-[#27272A] text-center font-inter text-sm font-medium leading-5">
        Categories
      </span>
      <div className="category-count-badge">
        <span className="text-[#27272A] font-inter text-xs font-medium leading-4">
          {count}
        </span>
      </div>
    </InfoSection>
  );
}

interface TimeSectionProps {
  uploadDate: string;
}

export function TimeSection({ uploadDate }: TimeSectionProps) {
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} Days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} Weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} Months ago`;
    return `${Math.floor(diffInDays / 365)} Years ago`;
  };

  return (
    <InfoSection icon={<ClockIcon />}>
      <span className="text-[#27272A] text-center font-inter text-sm font-medium leading-5">
        {getRelativeTime(uploadDate)}
      </span>
    </InfoSection>
  );
}

export function AuthorSection() {
  return (
    <Link
      to="/profile"
      className="hover:opacity-70 transition-opacity"
    >
      <InfoSection icon={<UserIcon />}>
        <span className="sr-only">Go to profile</span>
      </InfoSection>
    </Link>
  );
}

export function Divider() {
  return <div className="w-px h-6 bg-[#E5E5E5]"></div>;
}
