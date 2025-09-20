import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SquarePen, Send, StopCircle, MapPin, Ruler, Store, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Updated InputFormProps for Market Research
interface InputFormProps {
  onSubmit: (location: string, distance: string, what: string, filter: string, effort: string, model: string) => void;
  onCancel: () => void;
  isLoading: boolean;
  hasHistory: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({
  onSubmit,
  onCancel,
  isLoading,
  hasHistory,
}) => {
  const [location, setLocation] = useState("");
  const [distance, setDistance] = useState("10");
  const [what, setWhat] = useState("");
  const [filter, setFilter] = useState("all");
  // Effort is fixed to "low" and model to a default constant; selectors removed

  const handleInternalSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!location.trim() || !what.trim()) return;
    onSubmit(location, distance, what, filter, "low", "gemini-2.5-flash");
    // Keep form values for potential reuse
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Submit with Ctrl+Enter (Windows/Linux) or Cmd+Enter (Mac)
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleInternalSubmit();
    }
  };

  const isSubmitDisabled = !location.trim() || !what.trim() || isLoading;

  return (
    <form
      onSubmit={handleInternalSubmit}
      className={`flex flex-col gap-3 p-4 pb-4`}
    >
      {/* Main Input Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Location Field */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-neutral-300 flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            Location
          </label>
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., Sydney CBD, New York, London"
            className="bg-neutral-700 border-neutral-600 text-neutral-100 placeholder-neutral-500 focus:ring-neutral-500"
          />
        </div>

        {/* Business Type Field */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-neutral-300 flex items-center">
            <Store className="h-4 w-4 mr-2" />
            Business Type
          </label>
          <Input
            value={what}
            onChange={(e) => setWhat(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., chinese restaurant, café, bookstore, hotel"
            className="bg-neutral-700 border-neutral-600 text-neutral-100 placeholder-neutral-500 focus:ring-neutral-500"
          />
        </div>

        {/* Distance Field */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-neutral-300 flex items-center">
            <Ruler className="h-4 w-4 mr-2" />
            Distance (km)
          </label>
          <Select value={distance} onValueChange={setDistance}>
            <SelectTrigger className="bg-neutral-700 border-neutral-600 text-neutral-100">
              <SelectValue placeholder="Distance" />
            </SelectTrigger>
            <SelectContent className="bg-neutral-700 border-neutral-600 text-neutral-300">
              <SelectItem value="1">1 km</SelectItem>
              <SelectItem value="3">3 km</SelectItem>
              <SelectItem value="5">5 km</SelectItem>
              <SelectItem value="10">10 km</SelectItem>
              <SelectItem value="25">25 km</SelectItem>
              <SelectItem value="50">50 km</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Event Filter Field */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-neutral-300 flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Event Type
          </label>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="bg-neutral-700 border-neutral-600 text-neutral-100">
              <SelectValue placeholder="Event Filter" />
            </SelectTrigger>
            <SelectContent className="bg-neutral-700 border-neutral-600 text-neutral-300">
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="music">Music & Concerts</SelectItem>
              <SelectItem value="sports">Sports</SelectItem>
              <SelectItem value="food">Food & Dining</SelectItem>
              <SelectItem value="arts">Arts & Culture</SelectItem>
              <SelectItem value="business">Business & Networking</SelectItem>
              <SelectItem value="festivals">Festivals</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end mt-2">
        {isLoading ? (
          <Button
            type="button"
            variant="destructive"
            className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
            onClick={onCancel}
          >
            <StopCircle className="h-4 w-4 mr-2" />
            Cancel Research
          </Button>
        ) : (
          <Button
            type="submit"
            className={`${
              isSubmitDisabled
                ? "bg-neutral-600 text-neutral-400"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            } transition-all duration-200`}
            disabled={isSubmitDisabled}
          >
            <Send className="h-4 w-4 mr-2" />
            Generate Business Strategy
          </Button>
        )}
      </div>

      {/* Advanced Settings (simplified): Only show New Research when history exists */}
      <div className="flex items-center justify-end pt-2 border-t border-neutral-600">
        {hasHistory && (
          <Button
            className="bg-neutral-700 border-neutral-600 text-neutral-300 hover:bg-neutral-600 cursor-pointer rounded-lg"
            variant="outline"
            onClick={() => window.location.reload()}
          >
            <SquarePen size={16} className="mr-2" />
            New Research
          </Button>
        )}
      </div>
    </form>
  );
};
