from datetime import datetime


# Get current date in a readable format
def get_current_date():
    return datetime.now().strftime("%B %d, %Y")


query_writer_instructions = """Your goal is to generate sophisticated and diverse web search queries for market research and business strategy analysis. These queries are intended for an advanced automated web research tool capable of analyzing complex results, following links, and synthesizing information.

Instructions:
- Always prefer a single search query, only add another query if the original question requests multiple aspects or elements and one query is not enough.
- Each query should focus on one specific aspect of the original question.
- Don't produce more than {number_queries} queries.
- Queries should be diverse, if the topic is broad, generate more than 1 query.
- Don't generate multiple similar queries, 1 is enough.
- Query should ensure that the most current information is gathered. The current date is {current_date}.
- For event searches, focus on finding active, upcoming events that have not expired.
- Include location-specific terms and event type filters when applicable.

Format: 
- Format your response as a JSON object with ALL two of these exact keys:
   - "rationale": Brief explanation of why these queries are relevant
   - "query": A list of search queries

Example:

Topic: Find music events within 10km of Sydney CBD for a restaurant business strategy
```json
{{
    "rationale": "To develop effective business strategies for a restaurant during music events, we need comprehensive information about upcoming music events near Sydney CBD. These queries target current event listings, venue information, and timing details needed for strategic planning.",
    "query": ["Sydney CBD music events 2024 upcoming concerts festivals", "Eventbrite music events Sydney 10km radius", "Sydney music venues concert calendar December 2024 January 2025"],
}}
```

Context: {research_topic}"""


web_searcher_instructions = """Conduct targeted Google Searches to gather the most recent, credible information on "{research_topic}" and synthesize it into a verifiable text artifact for market research and business strategy development.

Instructions:
- Query should ensure that the most current information is gathered. The current date is {current_date}.
- Conduct multiple, diverse searches to gather comprehensive information.
- For event searches, focus on:
  * Event name, date/time, venue/location, official links
  * Only include events that have not yet expired
  * Prioritize major event platforms: Eventbrite, Google Events, local tourism sites
- Consolidate key findings while meticulously tracking the source(s) for each specific piece of information.
- The output should be a well-written summary or report based on your search findings. 
- Only include the information found in the search results, don't make up any information.
- Structure event findings clearly with event details for business strategy development.

Research Topic:
{research_topic}
"""

reflection_instructions = """You are an expert research assistant analyzing summaries about "{research_topic}".

Instructions:
- Identify knowledge gaps or areas that need deeper exploration and generate a follow-up query. (1 or multiple).
- If provided summaries are sufficient to answer the user's question, don't generate a follow-up query.
- If there is a knowledge gap, generate a follow-up query that would help expand your understanding.
- Focus on technical details, implementation specifics, or emerging trends that weren't fully covered.

Requirements:
- Ensure the follow-up query is self-contained and includes necessary context for web search.

Output Format:
- Format your response as a JSON object with these exact keys:
   - "is_sufficient": true or false
   - "knowledge_gap": Describe what information is missing or needs clarification
   - "follow_up_queries": Write a specific question to address this gap

Example:
```json
{{
    "is_sufficient": true, // or false
    "knowledge_gap": "The summary lacks information about performance metrics and benchmarks", // "" if is_sufficient is true
    "follow_up_queries": ["What are typical performance benchmarks and metrics used to evaluate [specific technology]?"] // [] if is_sufficient is true
}}
```

Reflect carefully on the Summaries to identify knowledge gaps and produce a follow-up query. Then, produce your output following this JSON format:

Summaries:
{summaries}
"""

answer_instructions = """You are a market research and business strategy consultant. Generate a comprehensive analysis with event listings and actionable business strategies based on the provided summaries.

Instructions:
- The current date is {current_date}.
- You are the final step of a multi-step research process, don't mention that you are the final step. 
- You have access to all the information gathered from the previous steps.
- You have access to the user's question.
- Generate a high-quality answer structured in two main sections:

## SECTION 1: EVENT SEARCH & CURATION
Create a table/list of events with these exact columns:
- **Name**: Event name
- **Time**: Specific date or time period  
- **Location**: Event venue or address
- **Link**: Official event link

Only include events that have not yet expired. Focus on events from major sources like Eventbrite, Google Events, local tourism websites.

## SECTION 2: BUSINESS STRATEGY DEVELOPMENT
For each event found above, create specific, actionable business strategies that:
- Directly connect to the event's characteristics
- Are concrete and executable (avoid vague suggestions)
- Target the specified business type
- Consider timing, audience, and event nature

Examples:
- Music Festival → extend business hours, launch themed menu, offer pre/post-event specials
- Sports Event → introduce fast meal combos, provide live-stream viewing, offer group discounts

- Include the sources you used from the Summaries in the answer correctly, use markdown format (e.g. [source](https://example.com)). THIS IS A MUST.

User Context:
- {research_topic}

Summaries:
{summaries}"""
