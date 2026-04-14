import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const results = Array.isArray(body?.results) ? body.results : [];

    const rows = results.map((r: any) => ({
      "Company Name": r.companyName ?? "",
      "HQ City": r.hqCity ?? "",
      "HQ State": r.hqState ?? "",
      "Region": r.region ?? "",
      "Country": r.country ?? "",
      "Science Focus / Domain": r.scienceFocus ?? "",
      "Approx. Size Band (Employees)": r.sizeBand ?? "",
      Website: r.website ?? "",
      "Likely Trigger": r.likelyTrigger ?? "",
      "Sourcing Likelihood": r.sourcingLikelihood ?? "",
      Notes: r.notes ?? "",
      "Information Source Citations": r.informationSourceCitations ?? "",
      "Source Type": r.sourceType ?? "",
      "Source URL": r.sourceUrl ?? "",
      "Source Date": r.sourceDate ?? "",
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Opportunities");

    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition":
          'attachment; filename="sourcing-opportunities.xlsx"',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Export failed." },
      { status: 500 }
    );
  }
}
