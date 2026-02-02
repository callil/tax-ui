import Anthropic from "@anthropic-ai/sdk";
import { PDFDocument } from "pdf-lib";

export type FormType =
  | "1040_main"
  | "schedule_1"
  | "schedule_2"
  | "schedule_3"
  | "schedule_a"
  | "schedule_b"
  | "schedule_c"
  | "schedule_d"
  | "schedule_e"
  | "k1_summary"
  | "k1_detail"
  | "state_main"
  | "state_schedule"
  | "worksheet"
  | "supporting_doc"
  | "cover_letter"
  | "direct_deposit"
  | "carryover_summary"
  | "efiling_auth"
  | "crypto_detail"
  | "other";

export interface PageClassification {
  pageNumber: number;
  formType: FormType;
}

// Chunk size for classification (pages per API call)
const CLASSIFICATION_CHUNK_SIZE = 15;

const CLASSIFICATION_PROMPT = `Classify each page of this tax return PDF. For each page, identify the form type.

Classification categories:
- 1040_main: Form 1040 pages 1-2 (the main federal return with income, deductions, tax)
- schedule_1: Schedule 1 - Additional Income and Adjustments
- schedule_2: Schedule 2 - Additional Taxes
- schedule_3: Schedule 3 - Additional Credits and Payments
- schedule_a: Schedule A - Itemized Deductions
- schedule_b: Schedule B - Interest and Dividends
- schedule_c: Schedule C - Business Income
- schedule_d: Schedule D - Capital Gains and Losses
- schedule_e: Schedule E - Supplemental Income (rentals, royalties, partnerships, S corps)
- k1_summary: Schedule K-1 summary/first page (contains income amounts)
- k1_detail: Schedule K-1 supporting pages, instructions, or continuation pages
- state_main: State tax return main pages (Form 540 for CA, IT-201 for NY, etc.)
- state_schedule: State return supporting schedules
- worksheet: Calculation worksheets (tax computation, AMT, etc.)
- supporting_doc: W-2, 1099, or other source document copies
- cover_letter: Preparer transmittal letters, engagement letters, "Dear Client" letters
- direct_deposit: Direct deposit/debit reports showing bank routing and account numbers
- carryover_summary: Tax return carryovers to next year, loss carryforward summaries
- efiling_auth: E-file authorization forms (Form 8879, TR-579-IT, e-file jurat/disclosure)
- crypto_detail: Cryptocurrency transaction details, lot-by-lot disposal reports
- other: Any other pages not fitting above categories

IMPORTANT: Look for these clues to identify preparer documents vs actual tax forms:
- Cover letters often start with "Dear [Name]" and mention "RKO Tax", "H&R Block", etc.
- Direct deposit pages show routing numbers, account numbers in a table format
- Carryover summaries have "Carryovers to [Year]" in the title
- E-file auth pages mention "penalties of perjury", "ERO Declaration", "Taxpayer PIN"
- The actual Form 1040 has "U.S. Individual Income Tax Return" and numbered lines

Respond with a JSON array where each element has:
- "page": page number (1-indexed, relative to the chunk you're seeing)
- "type": one of the classification categories above

Example response format:
[
  {"page": 1, "type": "cover_letter"},
  {"page": 2, "type": "carryover_summary"},
  {"page": 3, "type": "1040_main"}
]

Classify ALL pages in this document chunk.`;

async function extractPagesForClassification(
  pdfDoc: PDFDocument,
  startPage: number,
  endPage: number
): Promise<string> {
  const totalPages = pdfDoc.getPageCount();
  const chunkDoc = await PDFDocument.create();

  // Ensure we don't exceed actual page count (0-indexed)
  const safeEnd = Math.min(endPage, totalPages);
  const safeStart = Math.min(startPage, safeEnd);

  if (safeStart >= safeEnd) {
    throw new Error(`Invalid page range: ${startPage}-${endPage} for PDF with ${totalPages} pages`);
  }

  const pageIndices = Array.from(
    { length: safeEnd - safeStart },
    (_, i) => safeStart + i
  );

  const pages = await chunkDoc.copyPages(pdfDoc, pageIndices);
  pages.forEach((page) => chunkDoc.addPage(page));
  const chunkBytes = await chunkDoc.save();
  return Buffer.from(chunkBytes).toString("base64");
}

async function classifyChunk(
  chunkBase64: string,
  startPageNumber: number,
  client: Anthropic
): Promise<PageClassification[]> {
  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: chunkBase64,
            },
          },
          {
            type: "text",
            text: CLASSIFICATION_PROMPT,
          },
        ],
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No classification response from Claude");
  }

  // Parse the JSON response
  const jsonMatch = textBlock.text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("Could not parse classification response");
  }

  const parsed = JSON.parse(jsonMatch[0]) as Array<{
    page: number;
    type: string;
  }>;

  // Adjust page numbers to be absolute (relative to full PDF)
  return parsed.map((item) => ({
    pageNumber: startPageNumber + item.page - 1,
    formType: item.type as FormType,
  }));
}

export async function classifyPages(
  pdfBase64: string,
  client: Anthropic
): Promise<PageClassification[]> {
  const pdfBytes = Buffer.from(pdfBase64, "base64");
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const totalPages = pdfDoc.getPageCount();

  // For small PDFs, skip classification entirely and process all pages
  if (totalPages <= 20) {
    return Array.from({ length: totalPages }, (_, i) => ({
      pageNumber: i + 1,
      formType: "other" as FormType,
    }));
  }

  // Split into chunks and classify each
  const chunks: { start: number; end: number }[] = [];
  for (let start = 0; start < totalPages; start += CLASSIFICATION_CHUNK_SIZE) {
    const end = Math.min(start + CLASSIFICATION_CHUNK_SIZE, totalPages);
    chunks.push({ start, end });
  }

  // Classify chunks in parallel
  const chunkPromises = chunks.map(async ({ start, end }) => {
    const chunkBase64 = await extractPagesForClassification(pdfDoc, start, end);
    // startPageNumber is 1-indexed for the full PDF
    return classifyChunk(chunkBase64, start + 1, client);
  });

  const results = await Promise.all(chunkPromises);

  // Flatten and sort by page number
  const allClassifications = results.flat();
  allClassifications.sort((a, b) => a.pageNumber - b.pageNumber);

  return allClassifications;
}
