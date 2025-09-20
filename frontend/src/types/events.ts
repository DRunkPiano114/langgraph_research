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
