"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import submtImg from "@/assets/Light/submit.png";

interface SubmitNewsPopupProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
}

interface EcosystemTag {
  id: string;
  label: string;
}

export function SubmitNewsPopup({
  isOpen,
  onOpenChange,
  trigger,
}: SubmitNewsPopupProps) {
  const [title, setTitle] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Public Goods");
  const [ecosystemTags, setEcosystemTags] = useState<EcosystemTag[]>([]);
  const [ecosystemInput, setEcosystemInput] = useState("");

  const handleEcosystemKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === " " && ecosystemInput.trim()) {
      e.preventDefault();
      const newTag: EcosystemTag = {
        id: Date.now().toString(),
        label: ecosystemInput.trim(),
      };
      setEcosystemTags([...ecosystemTags, newTag]);
      setEcosystemInput("");
    }
  };

  const removeTag = (tagId: string) => {
    setEcosystemTags(ecosystemTags.filter((tag) => tag.id !== tagId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log({
      title,
      twitterUrl,
      content,
      category,
      ecosystemTags: ecosystemTags.map((tag) => tag.label),
    });
    onOpenChange(false);
  };

  const handleCancel = () => {
    setTitle("");
    setTwitterUrl("");
    setContent("");
    setCategory("Public Goods");
    setEcosystemTags([]);
    setEcosystemInput("");
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        className="flex w-[555px] max-h-[650px] overflow-scroll p-0 flex-col items-center gap-[21px] rounded-3xl bg-white border-none shadow-lg"
        showCloseButton={false}
      >
        {/* Header */}
        <div className="flex flex-col items-center justify-center pt-8">
          <img src={submtImg} alt="Submit News" className="mb-0" />
          <h2 className="text-black text-center font-inter text-2xl font-semibold leading-[50px] mb-0">
            Submit News
          </h2>
          <p className="text-neutral-500 text-center font-inter text-base font-medium leading-[50px] mb-0">
            Submit what's trending
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full px-[50px] pb-8">
          <div className="flex flex-col gap-5">
            {/* Title Input */}
            <div className="flex flex-col gap-2 w-full">
              <label className="text-foreground font-geist text-sm font-medium leading-5">
                Title
              </label>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="flex p-[10px_12px] items-center flex-1 rounded-md border border-input bg-background"
                required
              />
            </div>

            {/* Twitter/X Post URL Input */}
            <div className="flex flex-col gap-2 w-full">
              <label className="text-foreground font-geist text-sm font-medium leading-5">
                Twitter/X Post Url
              </label>
              <Input
                type="url"
                value={twitterUrl}
                onChange={(e) => setTwitterUrl(e.target.value)}
                className="flex p-[10px_12px] items-center flex-1 rounded-md border border-input bg-background"
                required
              />
            </div>

            {/* Full Article Content */}
            <div className="flex flex-col gap-2 w-full">
              <label className="text-foreground font-geist text-sm font-medium leading-5">
                Full Article Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex p-[10px_12px] items-start flex-1 rounded-md border border-input bg-background min-h-[100px] resize-vertical text-sm"
                required
              />
            </div>

            {/* Category Dropdown */}
            <div className="flex flex-col gap-2 w-full">
              <label className="text-foreground font-geist text-sm font-medium leading-5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex p-[10px_12px] items-center flex-1 rounded-md border border-input bg-background"
              >
                <option value="Public Goods">Public Goods</option>
              </select>
            </div>

            {/* Ecosystem Tags */}
            <div className="flex flex-col gap-2 w-full">
              <label className="text-foreground font-geist text-sm font-medium leading-5">
                Ecosystem
              </label>
              <div className="flex flex-col gap-2">
                <Input
                  type="text"
                  value={ecosystemInput}
                  onChange={(e) => setEcosystemInput(e.target.value)}
                  onKeyDown={handleEcosystemKeyDown}
                  placeholder="Type and press space to add tags"
                  className="flex p-[10px_12px] items-center flex-1 rounded-md border border-input bg-background"
                />
                {ecosystemTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {ecosystemTags.map((tag) => (
                      <div
                        key={tag.id}
                        className="flex h-[24.312px] min-w-[54.027px] px-3 py-2 justify-center items-center gap-1 rounded-[16.667px] border-[0.675px] border-border bg-secondary cursor-pointer"
                        onClick={() => removeTag(tag.id)}
                      >
                        <span className="text-primary font-geist text-[9.455px] font-medium leading-[16.208px]">
                          {tag.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-between items-center mt-8">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              className="flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M15.1667 4.28424C15.1667 3.52631 14.8372 2.86602 14.3193 2.48819C13.7878 2.10048 13.0719 2.03052 12.4476 2.46051L12.4418 2.46454L9.16683 4.86036V4.74871C9.16683 4.05819 8.85173 3.45996 8.36398 3.1203C7.86667 2.77399 7.20102 2.71213 6.618 3.09546L1.67304 6.34678C1.09283 6.72827 0.833496 7.38812 0.833496 8.00003C0.833496 8.61194 1.09283 9.27178 1.67304 9.65327L6.618 12.9046C7.20101 13.2879 7.86667 13.2261 8.36398 12.8798C8.85173 12.5401 9.16683 11.9419 9.16683 11.2513V11.1397L12.4418 13.5355L12.4476 13.5395C13.0719 13.9695 13.7878 13.8996 14.3193 13.5119C14.8372 13.134 15.1667 12.4737 15.1667 11.7158L15.1667 4.28424ZM9.16683 9.90067L13.0201 12.7195C13.2625 12.8838 13.5123 12.8628 13.7299 12.704C13.9626 12.5342 14.1667 12.1895 14.1667 11.7158L14.1667 4.28424C14.1667 3.81058 13.9626 3.46584 13.7299 3.29606C13.5123 3.13729 13.2625 3.11622 13.0201 3.28052L9.16683 6.09939L9.16683 9.90067ZM7.16739 3.93103C7.38034 3.79102 7.60175 3.80808 7.79252 3.94093C7.99284 4.08043 8.16683 4.3616 8.16683 4.74871L8.16683 11.2513C8.16683 11.6385 7.99284 11.9196 7.79252 12.0591C7.60175 12.192 7.38034 12.209 7.16739 12.069L2.22243 8.81771C1.98366 8.66071 1.8335 8.35434 1.8335 8.00003C1.8335 7.64572 1.98366 7.33934 2.22243 7.18235L7.16739 3.93103Z"
                  fill="#1C274C"
                />
              </svg>
              Cancel
            </Button>
            <Button type="submit" variant="default">
              Submit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
