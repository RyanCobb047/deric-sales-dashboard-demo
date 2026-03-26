# Deric Sales Dashboard Mock

Interactive static mock dashboard for Deric's sales command center at Futures Funding.

## What it includes
- Live GHL-backed conversation ownership / unread pressure snapshot
- Integrated Retell manager module with a 36-hour lookback
- Rep action cards focused on who needs attention first
- Alerts / stale follow-up panel
- Manager action recommendations
- Clickable rep cards with detail drill-down
- Thread-agent style quick prompts for `@FFI_MaxBot`
- Scheduled GitHub Actions sync for `data/live-dashboard.json`

## Run
Open `index.html` directly in a browser, or serve the folder with any static server.

Example:
```bash
cd projects/misc/deric-sales-dashboard
python3 -m http.server 8787
```

Then open <http://localhost:8787>.

## Notes
- The original mock used fake/demo data; the live MVP now reads from a generated `data/live-dashboard.json` file built from GHL + Retell API pulls.
- GitHub Pages serves the site; GitHub Actions refreshes the data file on a morning schedule.
- Built to feel like a sales war room rather than a CRM export.
