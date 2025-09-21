# mypy: disable - error - code = "no-untyped-def,misc"
import pathlib
from fastapi import FastAPI, Response
from pydantic import BaseModel, Field
from typing import List, Optional
import os
from langchain_google_genai import ChatGoogleGenerativeAI
from fastapi.staticfiles import StaticFiles

# Define the FastAPI app
app = FastAPI()


def create_frontend_router(build_dir="../frontend/dist"):
    """Creates a router to serve the React frontend.

    Args:
        build_dir: Path to the React build directory relative to this file.

    Returns:
        A Starlette application serving the frontend.
    """
    build_path = pathlib.Path(__file__).parent.parent.parent / build_dir

    if not build_path.is_dir() or not (build_path / "index.html").is_file():
        print(
            f"WARN: Frontend build directory not found or incomplete at {build_path}. Serving frontend will likely fail."
        )
        # Return a dummy router if build isn't ready
        from starlette.routing import Route

        async def dummy_frontend(request):
            return Response(
                "Frontend not built. Run 'npm run build' in the frontend directory.",
                media_type="text/plain",
                status_code=503,
            )

        return Route("/{path:path}", endpoint=dummy_frontend)

    return StaticFiles(directory=build_path, html=True)


# Mount the frontend under /app to not conflict with the LangGraph API routes
app.mount(
    "/app",
    create_frontend_router(),
    name="frontend",
)


# ====== LLM-powered event extraction endpoint ======

class EventItem(BaseModel):
    name: str
    timeText: str
    startTime: Optional[str] = None
    endTime: Optional[str] = None
    locationText: str
    address: str
    link: str
    source: str


class EventsPayload(BaseModel):
    events: List[EventItem]


class ExtractRequest(BaseModel):
    text: str = Field(..., description="Raw markdown/text of the agent's answer")


@app.post("/extract-events", response_model=EventsPayload)
def extract_events(req: ExtractRequest) -> EventsPayload:
    """Use an LLM to extract structured events from markdown text.

    Returns only fields required by the frontend mapping UI.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        # Return empty payload if key missing rather than crashing demo
        return EventsPayload(events=[])

    llm = ChatGoogleGenerativeAI(
        model=os.getenv("EVENT_EXTRACTOR_MODEL", "gemini-2.5-flash"),
        temperature=0,
        api_key=api_key,
        max_retries=2,
    )
    structured_llm = llm.with_structured_output(EventsPayload)

    prompt = f"""
You are an information extraction assistant. From the provided text (markdown), identify event entries and output STRICT JSON matching the schema. If some fields are missing, fill best-effort from context; if unknown, set to empty string. Never invent non-existent events.

Schema:
{{
  "events": [
    {{
      "name": string,
      "timeText": string,
      "startTime": string|null,
      "endTime": string|null,
      "locationText": string,
      "address": string,
      "link": string,
      "source": string
    }}
  ]
}}

Extraction rules:
- Event blocks often start with a numbered heading like "1. Event Name".
- Under each, lines like "Time:", "Location:", and "Link:" provide details. Links may be markdown links.
- Strip badges or footnotes (e.g., [thefold], [visitcanberra]) from locations, keep a clean venue/address string in both locationText and address if a fuller address isn't available.
- Prefer the explicit "Link:" line; otherwise take the first valid https URL near the event.
- Do not include strategies text in the fields.

Text:
---
{req.text}
---
"""

    try:
        result = structured_llm.invoke(prompt)
        # Ensure list exists
        if not result or not isinstance(result, EventsPayload):
            return EventsPayload(events=[])
        return result
    except Exception:
        return EventsPayload(events=[])
