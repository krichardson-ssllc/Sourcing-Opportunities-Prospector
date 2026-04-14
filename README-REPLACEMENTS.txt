This package redoes the app to work like the original spreadsheet logic.

What changed:
- Output is returned in the same shape as the original sheet:
  - Likely Trigger
  - Sourcing Likelihood
  - Notes
  - Information Source Citations
- Raw source signals are classified into a trigger taxonomy
- Current live sources:
  - Massachusetts WARN
  - California WARN
  - ClinicalTrials.gov status changes

Replace these files in your repo:
- app/page.tsx
- app/api/search/route.ts
- lib/server/utils.ts
- lib/server/trigger-taxonomy.ts
- lib/server/sources/warn.ts
- lib/server/sources/clinicaltrials.ts
- types/opportunity.ts

Also update package.json with xlsx and zod, and add the WARN environment variables in Vercel.
