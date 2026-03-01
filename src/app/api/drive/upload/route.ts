import { NextRequest, NextResponse } from "next/server";
import { drive } from "@/lib/gdrive";
import { Readable } from "stream";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const parentId = formData.get("parentId") as string | null;

        if (!file) {
            return NextResponse.json({ success: false, error: "Dosya bulunamadı" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const stream = Readable.from(buffer);

        const res = await drive.files.create({
            requestBody: {
                name: file.name,
                mimeType: file.type,
                parents: parentId ? [parentId] : undefined,
            },
            media: {
                mimeType: file.type,
                body: stream,
            },
            fields: "id,name,mimeType,size,webViewLink,webContentLink",
        });

        return NextResponse.json({ success: true, file: res.data });
    } catch (err: unknown) {
        console.error("Drive upload error:", err);
        return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
    }
}
