export type EventItem = {
  name: string;
  timeText: string;
  startTime: string | null;
  endTime: string | null;
  locationText: string;
  address: string;
  link: string;
  source: string;
  // Filled on client after geocoding
  latitude?: number;
  longitude?: number;
};

export type EventsPayload = {
  events: EventItem[];
};

export interface Event {
  name: string;
  time: string;
  location: string;
  link?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface BusinessStrategy {
  eventName: string;
  strategy: string;
}

export interface MarketResearchData {
  events: Event[];
  strategies: BusinessStrategy[];
}
