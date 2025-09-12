"use client";
import { useMemo, useState } from "react";
import type { Resume, TargetJob } from "@/lib/types/resume";

type ResponseError = { error: string };

const emptyResume: Resume = {
  contact: { fullName: "", email: "" },
  summary: "",
  work: [],
  education: [],
  projects: [],
  skills: [],
};

export default function Home() {
  const [resume, setResume] = useState<Resume>(emptyResume);
  const [target, setTarget] = useState<TargetJob>({ title: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<{
    score: number;
    issues?: { missingKeywords?: string[]; riskyFormatting?: string[] };
    notes?: string[];
  } | null>(null);

  const jsonPreview = useMemo(() => JSON.stringify(resume, null, 2), [resume]);

  const callGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, target }),
      });
      const data = (await res.json()) as { resume: Resume } | ResponseError;
      if ("error" in data) throw new Error(data.error);
      setResume(data.resume);
    } catch (e) {
      console.error(e);
      alert("Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const callAnalyze = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, target }),
      });
      const data = (await res.json()) as {
        analysis: { score: number; issues?: { missingKeywords?: string[]; riskyFormatting?: string[] }; notes?: string[] };
      } | ResponseError;
      if ("error" in data) throw new Error(data.error);
      setAnalysis(data.analysis);
    } catch (e) {
      console.error(e);
      alert("Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const callExport = async (format: "txt" | "md") => {
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, format }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `resume.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Export failed");
    }
  };

  return (
    <main className="mx-auto max-w-6xl p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <h1 className="text-2xl font-semibold">AI ATS-Friendly Resume Builder</h1>
        <section className="space-y-3">
          <h2 className="font-medium">Contact</h2>
          <div className="grid grid-cols-2 gap-3">
            <input className="border p-2 rounded" placeholder="Full name" value={resume.contact.fullName} onChange={(e) => setResume({ ...resume, contact: { ...resume.contact, fullName: e.target.value } })} />
            <input className="border p-2 rounded" placeholder="Email" value={resume.contact.email} onChange={(e) => setResume({ ...resume, contact: { ...resume.contact, email: e.target.value } })} />
            <input className="border p-2 rounded" placeholder="Phone" value={resume.contact.phone ?? ""} onChange={(e) => setResume({ ...resume, contact: { ...resume.contact, phone: e.target.value } })} />
            <input className="border p-2 rounded" placeholder="Location" value={resume.contact.location ?? ""} onChange={(e) => setResume({ ...resume, contact: { ...resume.contact, location: e.target.value } })} />
            <input className="border p-2 rounded" placeholder="LinkedIn" value={resume.contact.linkedin ?? ""} onChange={(e) => setResume({ ...resume, contact: { ...resume.contact, linkedin: e.target.value } })} />
            <input className="border p-2 rounded" placeholder="GitHub" value={resume.contact.github ?? ""} onChange={(e) => setResume({ ...resume, contact: { ...resume.contact, github: e.target.value } })} />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-medium">Target Job</h2>
          <input className="border p-2 rounded w-full" placeholder="Target job title" value={target.title} onChange={(e) => setTarget({ ...target, title: e.target.value })} />
          <textarea className="border p-2 rounded w-full min-h-24" placeholder="Paste job description" value={target.description ?? ""} onChange={(e) => setTarget({ ...target, description: e.target.value })} />
        </section>

        <div className="flex gap-3">
          <button className="px-4 py-2 bg-black text-white rounded disabled:opacity-50" onClick={callGenerate} disabled={loading}>Generate</button>
          <button className="px-4 py-2 border rounded disabled:opacity-50" onClick={callAnalyze} disabled={loading}>Analyze ATS</button>
          <button className="px-4 py-2 border rounded" onClick={() => callExport("txt")}>Export .txt</button>
          <button className="px-4 py-2 border rounded" onClick={() => callExport("md")}>Export .md</button>
        </div>

        <section className="space-y-3">
          <h2 className="font-medium">Summary</h2>
          <textarea className="border p-2 rounded w-full min-h-24" value={resume.summary ?? ""} onChange={(e) => setResume({ ...resume, summary: e.target.value })} />
        </section>

        <section className="space-y-3">
          <h2 className="font-medium">JSON Editor</h2>
          <textarea className="border p-2 rounded w-full min-h-64 font-mono" value={jsonPreview} onChange={(e) => {
            try {
              const r = JSON.parse(e.target.value) as Resume;
              setResume(r);
            } catch {}
          }} />
        </section>
      </div>

      <aside className="space-y-4">
        <div className="border rounded p-4">
          <h3 className="font-medium mb-2">ATS Score</h3>
          {analysis ? (
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Score</span>
                <span className="font-semibold">{analysis.score}</span>
              </div>
              <div>
                <div className="font-medium">Missing Keywords</div>
                <div className="text-xs text-gray-600">{analysis.issues?.missingKeywords?.join(", ") || "None"}</div>
              </div>
              <div>
                <div className="font-medium">Formatting Risks</div>
                <div className="text-xs text-gray-600">{analysis.issues?.riskyFormatting?.join(", ") || "None"}</div>
              </div>
              <div className="text-xs text-gray-600">Notes: {(analysis.notes || []).join("; ")}</div>
            </div>
          ) : (
            <div className="text-sm text-gray-600">Run Analyze ATS to see insights.</div>
          )}
        </div>
        <div className="border rounded p-4">
          <h3 className="font-medium mb-2">Tips for ATS</h3>
          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
            <li>Use standard section headings</li>
            <li>Avoid tables, images, and columns</li>
            <li>Use YYYY-MM dates</li>
            <li>Quantify achievements with metrics</li>
            <li>Include job-related keywords</li>
          </ul>
        </div>
      </aside>
    </main>
  );
}
