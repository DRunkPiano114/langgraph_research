import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SquarePen, Brain, Send, StopCircle, Zap, Cpu, MapPin, Ruler, Store, Filter } from "lucide-react";
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
  const [effort, setEffort] = useState("medium");
  const [model, setModel] = useState("gemini-2.5-flash");

  const handleInternalSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!location.trim() || !what.trim()) return;
    onSubmit(location, distance, what, filter, effort, model);
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
            placeholder="e.g., restaurant, café, bookstore, hotel"
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
              <SelectItem value="5">5 km</SelectItem>
              <SelectItem value="10">10 km</SelectItem>
              <SelectItem value="15">15 km</SelectItem>
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

      {/* Advanced Settings */}
      <div className="flex items-center justify-between pt-2 border-t border-neutral-600">
        <div className="flex flex-row gap-2">
          <div className="flex flex-row gap-2 bg-neutral-700 border-neutral-600 text-neutral-300 focus:ring-neutral-500 rounded-lg pl-2">
            <div className="flex flex-row items-center text-sm">
              <Brain className="h-4 w-4 mr-2" />
              Research Effort
            </div>
            <Select value={effort} onValueChange={setEffort}>
              <SelectTrigger className="w-[120px] bg-transparent border-none cursor-pointer">
                <SelectValue placeholder="Effort" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-700 border-neutral-600 text-neutral-300 cursor-pointer">
                <SelectItem
                  value="low"
                  className="hover:bg-neutral-600 focus:bg-neutral-600 cursor-pointer"
                >
                  Low
                </SelectItem>
                <SelectItem
                  value="medium"
                  className="hover:bg-neutral-600 focus:bg-neutral-600 cursor-pointer"
                >
                  Medium
                </SelectItem>
                <SelectItem
                  value="high"
                  className="hover:bg-neutral-600 focus:bg-neutral-600 cursor-pointer"
                >
                  High
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-row gap-2 bg-neutral-700 border-neutral-600 text-neutral-300 focus:ring-neutral-500 rounded-lg pl-2">
            <div className="flex flex-row items-center text-sm ml-2">
              <Cpu className="h-4 w-4 mr-2" />
              Model
            </div>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger className="w-[150px] bg-transparent border-none cursor-pointer">
                <SelectValue placeholder="Model" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-700 border-neutral-600 text-neutral-300 cursor-pointer">
                <SelectItem
                  value="gemini-2.5-flash"
                  className="hover:bg-neutral-600 focus:bg-neutral-600 cursor-pointer"
                >
                  <div className="flex items-center">
                    <Zap className="h-4 w-4 mr-2 text-orange-400" /> Gemini 2.5 Flash
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
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
