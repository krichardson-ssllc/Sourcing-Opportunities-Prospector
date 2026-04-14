This package rebuilds the app around the original spreadsheet logic.

Original workbook columns preserved:
- Company Name
- HQ City
- HQ State
- Region
- Country
- Science Focus / Domain
- Approx. Size Band (Employees)
- Website
- Likely Trigger
- Sourcing Likelihood
- Notes
- Information Source Citations

Added derived column:
- Likely Equipment Types

Current live sources:
- Massachusetts WARN
- California WARN
- Public news / press release style signals discovered through public RSS search

Replace these files in your repo:
- app/page.tsx
- app/api/search/route.ts
- lib/server/utils.ts
- lib/server/equipment-mapping.ts
- lib/server/trigger-taxonomy.ts
- lib/server/sources/warn.ts
- lib/server/sources/public-news.ts
- types/opportunity.ts

You can delete these old files if they still exist:
- lib/server/sources/clinicaltrials.ts
- lib/server/sources/openfda.ts
- lib/server/sources/sec.ts
- lib/mock-data.ts
