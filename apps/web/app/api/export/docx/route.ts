import { NextResponse } from "next/server";
import { generateValidatedDOCX } from "@resumematch/export-engine";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { profile } = body;

    if (!profile) {
      return NextResponse.json({ error: "Candidate profile required." }, { status: 400 });
    }

    // Generate DOCX with Re-Parser Validation Loop
    const exportResult = await generateValidatedDOCX(profile);

    return new Response(new Uint8Array(exportResult.buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${profile.candidate.name || "Resume"}_Tailored.docx"`,
      },
    });
  } catch (err: any) {
    console.error("Export error:", err);
    return NextResponse.json({ error: err.message || "Export failed." }, { status: 500 });
  }
}
