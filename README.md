# ResQLink – Tamil Nadu Statewide Disaster Response Prototype

## GitHub / Vercel deployment
1. Extract this ZIP.
2. Upload the files and folders inside `ResQLink` to the root of your GitHub repository.
3. Import the repository into Vercel using Framework Preset `Other`, Build Command blank, Output Directory `.`.

## Statewide synthetic demonstration
- The dashboard now generates 10 clearly labelled synthetic incident scenarios for each of Tamil Nadu’s 38 districts.
- Selecting a district filters its incidents, categories, counters and plotted incident markers. `All Tamil Nadu` shows the statewide demo queue.
- The field responder screen automatically ranks unresolved incidents by priority score, then waiting time; after resolving one, the next eligible incident appears.
- Field status changes are saved in the current browser using local storage. This is local prototype persistence, not shared multi-user synchronization.
- The statewide map is a schematic plot using approximate district-centre coordinates. It is not an official boundary map or verified door-level navigation data.
- Existing Chennai incident examples and workflows are retained.

## Important data distinction
All preloaded and generated incident scenarios are synthetic demonstration data. They are not reports of actual emergencies, official government records, or live dispatch assignments. Do not use this prototype to dispatch real responders. A production system needs authenticated responders, a shared persistent database, validated GIS/geocoding, verified agency integrations, and security/privacy review.

## Voice and AI features
- Tamil / English browser speech input and read-aloud support.
- `/api/extract` performs district-aware matching against the 38-district gazetteer and rule-based urgency extraction.
- Optional `ANTHROPIC_API_KEY` can be configured in Vercel if supported by the existing API workflow.

## Prototype notice
This is a demonstration system, not an official emergency dispatch service. Location pins and sample cases must be validated before operational use. In a real emergency, contact official emergency services.
