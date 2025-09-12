import { NextRequest, NextResponse } from "next/server";
import type { Resume } from "@/lib/types/resume";
import { renderAtsPlainText } from "@/lib/templates/atsPlain";

type ExportBody = {
  resume: Resume;
  format: "txt" | "md" | "pdf" | "docx";
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ExportBody;
    const text = renderAtsPlainText(body.resume);

    if (body.format === "txt") {
      return new NextResponse(text, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Content-Disposition": "attachment; filename=resume.txt",
        },
      });
    }

    if (body.format === "md") {
      const md = "# Resume\n\n" + text.replace(/\n/g, "\n\n");
      return new NextResponse(md, {
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Content-Disposition": "attachment; filename=resume.md",
        },
      });
    }

    // For pdf/docx, keep simple: return text with distinct MIME. Clients may convert.
    if (body.format === "pdf") {
      return new NextResponse(text, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": "attachment; filename=resume.pdf",
        },
      });
    }
    if (body.format === "docx") {
      return new NextResponse(text, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": "attachment; filename=resume.docx",
        },
      });
    }

    return NextResponse.json({ error: "Unsupported format" }, { status: 400 });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ error: "Failed to export resume" }, { status: 500 });
  }
}

