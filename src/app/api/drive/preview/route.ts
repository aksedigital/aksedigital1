import { NextRequest, NextResponse } from "next/server";
import { drive } from "@/lib/gdrive";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const fileId = searchParams.get("fileId");

        if (!fileId) {
            return NextResponse.json({ error: "fileId required" }, { status: 400 });
        }

        // Get file metadata first
        const meta = await drive.files.get({
            fileId,
            fields: "id,name,mimeType,size",
        });

        const mimeType = meta.data.mimeType || "application/octet-stream";

        // For Google Docs/Sheets/Slides, export as PDF
        if (mimeType.startsWith("application/vnd.google-apps.")) {
            let exportMime = "application/pdf";
            if (mimeType === "application/vnd.google-apps.spreadsheet") {
                exportMime = "application/pdf";
            } else if (mimeType === "application/vnd.google-apps.presentation") {
                exportMime = "application/pdf";
            }

            const res = await drive.files.export(
                { fileId, mimeType: exportMime },
                { responseType: "arraybuffer" }
            );

            return new NextResponse(res.data as ArrayBuffer, {
                headers: {
                    "Content-Type": exportMime,
                    "Content-Disposition": `inline; filename="${meta.data.name}.pdf"`,
                },
            });
        }

        // For regular files, stream content
        const res = await drive.files.get(
            { fileId, alt: "media" },
            { responseType: "arraybuffer" }
        );

        return new NextResponse(res.data as ArrayBuffer, {
            headers: {
                "Content-Type": mimeType,
                "Content-Disposition": `inline; filename="${meta.data.name}"`,
            },
        });
    } catch (err: unknown) {
        console.error("Drive preview error:", err);
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
