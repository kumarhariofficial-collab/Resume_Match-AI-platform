import pdfParse from "pdf-parse";
import mammoth from "mammoth";

export interface ExtractedDocumentText {
  text: string;
  pageCount: number;
  fileType: "pdf" | "docx" | "txt";
}

export async function extractTextFromBuffer(
  buffer: Buffer,
  fileType: "pdf" | "docx" | "txt"
): Promise<ExtractedDocumentText> {
  if (fileType === "txt") {
    const text = buffer.toString("utf-8");
    return {
      text: text.trim(),
      pageCount: Math.ceil(text.length / 3000) || 1,
      fileType: "txt",
    };
  }

  if (fileType === "docx") {
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value || "";
    return {
      text: text.trim(),
      pageCount: Math.ceil(text.length / 3000) || 1,
      fileType: "docx",
    };
  }

  if (fileType === "pdf") {
    try {
      const data = await pdfParse(buffer);
      return {
        text: (data.text || "").trim(),
        pageCount: data.numpages || 1,
        fileType: "pdf",
      };
    } catch (err: any) {
      throw new Error(`Failed to parse PDF file: ${err.message || err}`);
    }
  }

  throw new Error(`Unsupported file type: ${fileType}`);
}
