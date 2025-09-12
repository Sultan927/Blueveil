# AI ATS-Friendly Resume Builder

Generate, analyze, and export ATS-safe resumes. Built with Next.js (App Router), TypeScript, and Tailwind.

## Features
- AI resume generation tailored to a target job
- ATS analysis: keyword coverage, formatting risks, and score
- ATS-safe plain text/Markdown exports
- JSON editor to fully control the resume structure

## Quick Start
1. Install deps:
```bash
npm install
```
2. Create `.env.local` from template and set your key:
```bash
cp .env.example .env.local
# Edit .env.local and set OPENAI_API_KEY
```
3. Run dev server:
```bash
npm run dev
```
4. Open http://localhost:3000

## Environment
- `OPENAI_API_KEY`: Required
- `OPENAI_MODEL`: Optional (default `gpt-4o-mini`)

## ATS Best Practices
- Use standard headings: Summary, Experience, Education, Skills, Projects
- Avoid tables, images, columns, headers/footers
- Use YYYY-MM dates and consistent formatting
- Quantify achievements with metrics, start bullets with action verbs
- Include target job keywords naturally

## Export
- Plain text (`.txt`) and Markdown (`.md`) supported directly
- For PDF/DOCX, export content and convert in your editor to preserve ATS-friendliness

## Docker
Build and run:
```bash
docker build -t ai-resume-builder .
docker run -p 3000:3000 --env-file .env.local ai-resume-builder
```

## License
MIT
