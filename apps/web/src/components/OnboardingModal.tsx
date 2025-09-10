import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface Feed {
  id: string;
  title: string;
  description?: string;
}

interface OnboardingModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  feeds: Feed[];
  onComplete: (settings: {
    selectedFeeds: string[];
    dailyGoal: number;
    notificationFrequency: string;
  }) => void;
}

export function OnboardingModal({ 
  isOpen, 
  onOpenChange, 
  feeds, 
  onComplete 
}: OnboardingModalProps) {
  const [selectedFeeds, setSelectedFeeds] = useState<string[]>([]);
  const [dailyGoal, setDailyGoal] = useState<number>(3);
  const [notificationFrequency, setNotificationFrequency] = useState<string>("daily");

  const handleFeedToggle = (feedId: string, checked: boolean) => {
    if (checked) {
      setSelectedFeeds(prev => [...prev, feedId]);
    } else {
      setSelectedFeeds(prev => prev.filter(id => id !== feedId));
    }
  };

  const handleGetStarted = () => {
    // Save to localStorage for persistence
    localStorage.setItem('onboarding-completed', 'true');
    localStorage.setItem('selected-feeds', JSON.stringify(selectedFeeds));
    
    // Call completion callback
    onComplete({
      selectedFeeds,
      dailyGoal,
      notificationFrequency,
    });
    
    onOpenChange(false);
  };

  const isFormValid = selectedFeeds.length > 0 && dailyGoal > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-4">
            Welcome to Your Reading Journey!
          </DialogTitle>
          <p className="text-gray-600 text-center mb-6">
            Let's personalize your reading experience to help you stay informed and engaged.
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* 1. Feed Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              1. Select the feeds you're interested in
            </Label>
            <p className="text-sm text-gray-600 mb-3">
              Choose the topics and sources you'd like to read about
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto border rounded-lg p-3">
              {feeds.map((feed) => (
                <div key={feed.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={feed.id}
                    checked={selectedFeeds.includes(feed.id)}
                    onCheckedChange={(checked) => 
                      handleFeedToggle(feed.id, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={feed.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {feed.title}
                  </Label>
                </div>
              ))}
            </div>
            {selectedFeeds.length > 0 && (
              <p className="text-sm text-green-600">
                {selectedFeeds.length} feed{selectedFeeds.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>

          {/* 2. Daily Goal */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              2. Your Daily Reading Goal
            </Label>
            <p className="text-sm text-gray-600 mb-3">
              How many articles would you like to read each day?
            </p>
            <div className="flex items-center space-x-3">
              <Input
                type="number"
                value={dailyGoal}
                onChange={(e) => setDailyGoal(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max="20"
                className="w-20"
              />
              <Label className="text-sm text-gray-600">
                articles per day
              </Label>
            </div>
          </div>

          {/* 3. Notification Frequency */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              3. Notification Frequency
            </Label>
            <p className="text-sm text-gray-600 mb-3">
              How often would you like to be notified about new articles?
            </p>
            <Select
              value={notificationFrequency}
              onValueChange={setNotificationFrequency}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Get Started Button */}
        <div className="flex justify-center pt-6">
          <Button
            onClick={handleGetStarted}
            disabled={!isFormValid}
            className="px-8 py-2 text-lg font-semibold"
            size="lg"
          >
            Get Started
          </Button>
        </div>

        {!isFormValid && (
          <p className="text-sm text-red-600 text-center mt-2">
            Please select at least one feed and set a daily goal to continue.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}