import type React from "react";
import type { Message } from "@langchain/langgraph-sdk";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Copy, CopyCheck } from "lucide-react";
import { InputForm } from "@/components/InputForm";
import { Button } from "@/components/ui/button";
import { useState, useEffect, ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { EventExplorer } from "@/components/EventExplorer";
import type { EventsPayload, EventItem } from "@/types/events";
import {
  ActivityTimeline,
  ProcessedEvent,
} from "@/components/ActivityTimeline"; // Assuming ActivityTimeline is in the same dir or adjust path

// Markdown component props type from former ReportView
type MdComponentProps = {
  className?: string;
  children?: ReactNode;
  [key: string]: any;
};

// Markdown components (from former ReportView.tsx)
const mdComponents = {
  h1: ({ className, children, ...props }: MdComponentProps) => (
    <h1 className={cn("text-2xl font-bold mt-4 mb-2", className)} {...props}>
      {children}
    </h1>
  ),
  h2: ({ className, children, ...props }: MdComponentProps) => (
    <h2 className={cn("text-xl font-bold mt-3 mb-2", className)} {...props}>
      {children}
    </h2>
  ),
  h3: ({ className, children, ...props }: MdComponentProps) => (
    <h3 className={cn("text-lg font-bold mt-3 mb-1", className)} {...props}>
      {children}
    </h3>
  ),
  p: ({ className, children, ...props }: MdComponentProps) => (
    <p className={cn("mb-3 leading-7", className)} {...props}>
      {children}
    </p>
  ),
  a: ({ className, children, href, ...props }: MdComponentProps) => (
    <Badge className="text-xs mx-0.5">
      <a
        className={cn("text-blue-400 hover:text-blue-300 text-xs", className)}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    </Badge>
  ),
  ul: ({ className, children, ...props }: MdComponentProps) => (
    <ul className={cn("list-disc pl-6 mb-3", className)} {...props}>
      {children}
    </ul>
  ),
  ol: ({ className, children, ...props }: MdComponentProps) => (
    <ol className={cn("list-decimal pl-6 mb-3", className)} {...props}>
      {children}
    </ol>
  ),
  li: ({ className, children, ...props }: MdComponentProps) => (
    <li className={cn("mb-1", className)} {...props}>
      {children}
    </li>
  ),
  blockquote: ({ className, children, ...props }: MdComponentProps) => (
    <blockquote
      className={cn(
        "border-l-4 border-neutral-600 pl-4 italic my-3 text-sm",
        className
      )}
      {...props}
    >
      {children}
    </blockquote>
  ),
  code: ({ className, children, ...props }: MdComponentProps) => (
    <code
      className={cn(
        "bg-neutral-900 rounded px-1 py-0.5 font-mono text-xs",
        className
      )}
      {...props}
    >
      {children}
    </code>
  ),
  pre: ({ className, children, ...props }: MdComponentProps) => (
    <pre
      className={cn(
        "bg-neutral-900 p-3 rounded-lg overflow-x-auto font-mono text-xs my-3",
        className
      )}
      {...props}
    >
      {children}
    </pre>
  ),
  hr: ({ className, ...props }: MdComponentProps) => (
    <hr className={cn("border-neutral-600 my-4", className)} {...props} />
  ),
  table: ({ className, children, ...props }: MdComponentProps) => (
    <div className="my-3 overflow-x-auto">
      <table className={cn("border-collapse w-full", className)} {...props}>
        {children}
      </table>
    </div>
  ),
  th: ({ className, children, ...props }: MdComponentProps) => (
    <th
      className={cn(
        "border border-neutral-600 px-3 py-2 text-left font-bold",
        className
      )}
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ className, children, ...props }: MdComponentProps) => (
    <td
      className={cn("border border-neutral-600 px-3 py-2", className)}
      {...props}
    >
      {children}
    </td>
  ),
};

// Props for HumanMessageBubble
interface HumanMessageBubbleProps {
  message: Message;
  mdComponents: typeof mdComponents;
}

// HumanMessageBubble Component
const HumanMessageBubble: React.FC<HumanMessageBubbleProps> = ({
  message,
  mdComponents,
}) => {
  return (
    <div
      className={`text-white rounded-3xl break-words min-h-7 bg-neutral-700 max-w-[100%] sm:max-w-[90%] px-4 pt-3 rounded-br-lg`}
    >
      {/* Render only the markdown portion before the appended JSON block */}
      <ReactMarkdown components={mdComponents}>
        {(() => {
          const content =
            typeof message.content === "string"
              ? message.content
              : JSON.stringify(message.content);
          const fenceIndex = content.indexOf("```json");
          return fenceIndex >= 0 ? content.slice(0, fenceIndex) : content;
        })()}
      </ReactMarkdown>
    </div>
  );
};

// Props for AiMessageBubble
interface AiMessageBubbleProps {
  message: Message;
  historicalActivity: ProcessedEvent[] | undefined;
  liveActivity: ProcessedEvent[] | undefined;
  isLastMessage: boolean;
  isOverallLoading: boolean;
  mdComponents: typeof mdComponents;
  handleCopy: (text: string, messageId: string) => void;
  copiedMessageId: string | null;
}

// AiMessageBubble Component
const AiMessageBubble: React.FC<AiMessageBubbleProps> = ({
  message,
  historicalActivity,
  liveActivity,
  isLastMessage,
  isOverallLoading,
  mdComponents,
  handleCopy,
  copiedMessageId,
}) => {
  // Determine which activity events to show and if it's for a live loading message
  const activityForThisBubble =
    isLastMessage && isOverallLoading ? liveActivity : historicalActivity;
  const isLiveActivityForThisBubble = isLastMessage && isOverallLoading;

  return (
    <div className={`relative break-words flex flex-col`}>
      {activityForThisBubble && activityForThisBubble.length > 0 && (
        <div className="mb-3 border-b border-neutral-700 pb-3 text-xs">
          <ActivityTimeline
            processedEvents={activityForThisBubble}
            isLoading={isLiveActivityForThisBubble}
          />
        </div>
      )}
      <ReactMarkdown components={mdComponents}>
        {typeof message.content === "string"
          ? message.content
          : JSON.stringify(message.content)}
      </ReactMarkdown>
      <Button
        variant="default"
        className={`cursor-pointer bg-neutral-700 border-neutral-600 text-neutral-300 self-end ${
          message.content.length > 0 ? "visible" : "hidden"
        }`}
        onClick={() =>
          handleCopy(
            typeof message.content === "string"
              ? message.content
              : JSON.stringify(message.content),
            message.id!
          )
        }
      >
        {copiedMessageId === message.id ? "Copied" : "Copy"}
        {copiedMessageId === message.id ? <CopyCheck /> : <Copy />}
      </Button>
    </div>
  );
};

interface ChatMessagesViewProps {
  messages: Message[];
  isLoading: boolean;
  scrollAreaRef: React.RefObject<HTMLDivElement | null>;
  onSubmit: (location: string, distance: string, what: string, filter: string, effort: string, model: string) => void;
  onCancel: () => void;
  liveActivityEvents: ProcessedEvent[];
  historicalActivities: Record<string, ProcessedEvent[]>;
}

export function ChatMessagesView({
  messages,
  isLoading,
  scrollAreaRef,
  onSubmit,
  onCancel,
  liveActivityEvents,
  historicalActivities,
}: ChatMessagesViewProps) {
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [eventsPayload, setEventsPayload] = useState<EventsPayload | null>(null);
  const [searchCenterText, setSearchCenterText] = useState<string | undefined>(undefined);

  const handleCopy = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };
  // Parse the latest AI message content to extract the appended events JSON block
  const lastAiMessage = messages.filter((m) => m.type === "ai").slice(-1)[0];
  useEffect(() => {
    if (!lastAiMessage) return;
    const content =
      typeof lastAiMessage.content === "string"
        ? lastAiMessage.content
        : JSON.stringify(lastAiMessage.content);
    // 1) Try JSON block
    try {
      const fenceRegex = /```json\s*([\s\S]*?)```/i;
      const match = content.match(fenceRegex);
      if (match && match[1]) {
        const parsed = JSON.parse(match[1]);
        if (parsed && parsed.events && Array.isArray(parsed.events)) {
          setEventsPayload(parsed as EventsPayload);
          return;
        }
      }
    } catch (_) {}

    // 2) Call backend extractor (LLM) to structure events
    (async () => {
      try {
        const resp = await fetch("/extract-events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: content }),
        });
        if (resp.ok) {
          const data = (await resp.json()) as EventsPayload;
          if (data?.events?.length) {
            setEventsPayload(data);
            return;
          }
        }
      } catch (_) {}

      // 3) Fallback local parser
      const parsed = parseEventsFromMarkdown(content);
      if (parsed.events.length > 0) {
        setEventsPayload(parsed);
      }
    })();
  }, [lastAiMessage]);

  function parseEventsFromMarkdown(md: string): EventsPayload {
    // Streaming parser tailored to your screenshots
    const text = md.replace(/\r\n?/g, "\n");
    const lines = text.split("\n");
    const events: EventItem[] = [];

    const firstUrl = (s: string): string | null => {
      const m1 = s.match(/\((https?:\/\/[^\s)]+)\)/); // markdown link
      if (m1) return m1[1];
      const m2 = s.match(/(https?:\/\/[^\s)]+)(?:\s|$)/); // plain url
      if (m2) return m2[1];
      return null;
    };

    let current: Partial<EventItem> | null = null;
    const pushIfValid = () => {
      if (current && current.name && current.locationText) {
        events.push({
          name: current.name!,
          timeText: current.timeText || "",
          startTime: null,
          endTime: null,
          locationText: current.locationText!,
          address: current.address || current.locationText!,
          link: current.link || "",
          source: current.source || "",
        });
      }
      current = null;
    };

    for (const raw of lines) {
      const line = raw.trim();
      // Numbered heading like "1. A Sunday Organ Recital"
      const heading = line.match(/^\d+\.\s+(.+)/);
      if (heading) {
        pushIfValid();
        current = { name: heading[1].trim() };
        continue;
      }
      if (!current) continue;

      const timeLine = line.match(/^(?:[-*]\s*)?(?:\*\*)?Time(?::)?(?:\*\*)?\s*:?\s*(.+)$/i);
      if (timeLine) {
        current.timeText = timeLine[1].trim();
        continue;
      }

      const locLine = line.match(/^(?:[-*]\s*)?(?:\*\*)?Location(?::)?(?:\*\*)?\s*:?\s*(.+)$/i);
      if (locLine) {
        let loc = locLine[1];
        loc = loc
          .replace(/\s*\[[^\]]*\]\([^\)]*\)/g, "") // strip markdown links/badges
          .replace(/\s*,\s*(eventbrite|allevents|thefold|visitcanberra|visitgriffith|region|obdm|ticketek)\b/gi, "")
          .replace(/\s*\([^\)]*approx\.[^\)]*\)/gi, "")
          .trim();
        current.locationText = loc;
        current.address = loc;
        continue;
      }

      const linkLine = line.match(/^(?:[-*]\s*)?(?:\*\*)?Link(?::)?(?:\*\*)?\s*:?\s*(.+)$/i);
      if (linkLine) {
        const url = firstUrl(linkLine[1]);
        if (url) {
          current.link = url;
          try {
            current.source = new URL(url).hostname.replace(/^www\./, "");
          } catch {}
        }
        continue;
      }

      // Fallback: any URL line
      if (!current.link) {
        const url = firstUrl(line);
        if (url) {
          current.link = url;
          try {
            current.source = new URL(url).hostname.replace(/^www\./, "");
          } catch {}
        }
      }
    }
    pushIfValid();

    return { events };
  }

  // Derive search center text from the last human message input area (first line before two newlines)
  useEffect(() => {
    const lastHuman = messages.filter((m) => m.type === "human").slice(-1)[0];
    if (!lastHuman) return;
    const text = typeof lastHuman.content === "string" ? lastHuman.content : JSON.stringify(lastHuman.content);
    // The `App.tsx` constructs a phrase like: Find <filter> within <distance>km of <location> and develop...
    const m = text.match(/within\s+\d+\s*km\s+of\s+(.+?)(?:\s+and\s+develop|[\.!\n]|$)/i);
    if (m && m[1]) {
      setSearchCenterText(m[1].trim());
    }
  }, [messages]);
  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 overflow-y-auto" ref={scrollAreaRef}>
        <div className="p-4 md:p-6 space-y-2 max-w-4xl mx-auto pt-16">
          {messages.map((message, index) => {
            const isLast = index === messages.length - 1;
            return (
              <div key={message.id || `msg-${index}`} className="space-y-3">
                <div
                  className={`flex items-start gap-3 ${
                    message.type === "human" ? "justify-end" : ""
                  }`}
                >
                  {message.type === "human" ? (
                    <HumanMessageBubble
                      message={message}
                      mdComponents={mdComponents}
                    />
                  ) : (
                    <AiMessageBubble
                      message={message}
                      historicalActivity={historicalActivities[message.id!]}
                      liveActivity={liveActivityEvents} // Pass global live events
                      isLastMessage={isLast}
                      isOverallLoading={isLoading} // Pass global loading state
                      mdComponents={mdComponents}
                      handleCopy={handleCopy}
                      copiedMessageId={copiedMessageId}
                    />
                  )}
                </div>
              </div>
            );
          })}
          {/* Render map even if parsing returns no events; center on query location if available */}
          {(((eventsPayload?.events?.length ?? 0) > 0) || !!searchCenterText) && (
            <div className="mt-4">
              <EventExplorer events={eventsPayload?.events ?? []} centerLocationText={searchCenterText} />
            </div>
          )}
          {isLoading &&
            (messages.length === 0 ||
              messages[messages.length - 1].type === "human") && (
              <div className="flex items-start gap-3 mt-3">
                {" "}
                {/* AI message row structure */}
                <div className="relative group max-w-[85%] md:max-w-[80%] rounded-xl p-3 shadow-sm break-words bg-neutral-800 text-neutral-100 rounded-bl-none w-full min-h-[56px]">
                  {liveActivityEvents.length > 0 ? (
                    <div className="text-xs">
                      <ActivityTimeline
                        processedEvents={liveActivityEvents}
                        isLoading={true}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-start h-full">
                      <Loader2 className="h-5 w-5 animate-spin text-neutral-400 mr-2" />
                      <span>Processing...</span>
                    </div>
                  )}
                </div>
              </div>
            )}
        </div>
      </ScrollArea>
      <InputForm
        onSubmit={onSubmit}
        isLoading={isLoading}
        onCancel={onCancel}
        hasHistory={messages.length > 0}
      />
    </div>
  );
}
