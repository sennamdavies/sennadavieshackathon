# SceneSync

SceneSync is a Next.js App Router application that automates the invisible labor of script breakdowns. It helps production teams turn screenplay scenes into structured pre-production data for cast, props, wardrobe, and VFX planning.

## Why SceneSync

Film teams still spend hours reading scripts scene by scene to build the first version of a breakdown. That work is essential, but repetitive and easy to bottleneck. SceneSync gives producers and coordinators a faster starting point by:

- parsing uploaded `.txt` and `.fountain` scripts into scenes
- sending each scene to Claude for structured extraction
- displaying the results in a production-friendly breakdown table
- exporting the final output to CSV for spreadsheet workflows

## Product Workflow

1. Upload a script file
2. Split the script into scenes
3. Analyze each scene with Claude
4. Track progress as the breakdown runs
5. Review the color-coded production elements
6. Download the full breakdown as CSV

## Tech Stack

- Next.js App Router
- React 19
- TypeScript
- Tailwind CSS v4
- `fountain-js`
- `json-2-csv`
- `lucide-react`
- Anthropic Claude API

## Environment Setup

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Add your Anthropic API key:

```bash
ANTHROPIC_API_KEY=your_key_here
```

## Local Development

Install dependencies and run the app:

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Verification

Run these checks once Node and npm are available locally:

```bash
npm install
npm run lint
```

Manual verification checklist:

- upload a `.txt` screenplay
- upload a `.fountain` screenplay
- confirm the progress bar advances scene by scene
- confirm the breakdown table renders cast, props, wardrobe, and VFX tags
- confirm CSV export downloads spreadsheet-friendly output

## Git Safety

- `.env.local` remains ignored by Git
- `.env.local.example` is committed for reproducible setup
- if `fountain-js` cannot provide scene boundaries, the parser falls back to regex-based heading detection
