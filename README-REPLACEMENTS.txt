Replace these files in your repo for the latest update:
- types/opportunity.ts
- lib/server/trigger-taxonomy.ts
- lib/server/sources/public-news.ts
- lib/server/geocode.ts
- app/api/search/route.ts
- app/page.tsx

What changed:
- Company Name no longer falls back to mirroring the headline
- Headline is preserved in its own column
- Website is kept in its own column
- Optional miles-radius filtering added via geocoding
- Distance (Miles) column added to the table
