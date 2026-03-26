# Deric Sales Dashboard Mock

Interactive static mock dashboard for Deric's sales command center at Futures Funding.

## What it includes
- Team snapshot KPIs
- Rep leaderboard and scorecards
- Alerts / stale follow-up panel
- Manager action recommendations
- Time-range filtering with fake sample data
- Clickable rep cards with detail drill-down
- Thread-agent style quick prompts for `@FFI_MaxBot`

## Run
Open `index.html` directly in a browser, or serve the folder with any static server.

Example:
```bash
cd projects/misc/deric-sales-dashboard
python3 -m http.server 8787
```

Then open <http://localhost:8787>.

## Notes
- All data is fake/demo data.
- Built to feel like a sales war room rather than a CRM export.
