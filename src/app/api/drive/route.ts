import { NextRequest, NextResponse } from "next/server";
import { listFiles, createFolder, deleteFile, renameFile, getStorageQuota } from "@/lib/gdrive";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const action = searchParams.get("action") || "list";
        const folderId = searchParams.get("folderId") || undefined;
        const query = searchParams.get("q") || undefined;

        if (action === "quota") {
            const quota = await getStorageQuota();
            return NextResponse.json({ success: true, quota });
        }

        const files = await listFiles(folderId, query);
        return NextResponse.json({ success: true, files });
    } catch (err: unknown) {
        console.error("Drive GET error:", err);
        return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { action, name, parentId, fileId, newName } = body;

        if (action === "createFolder") {
            const folder = await createFolder(name, parentId);
            return NextResponse.json({ success: true, folder });
        }

        if (action === "rename") {
            const file = await renameFile(fileId, newName);
            return NextResponse.json({ success: true, file });
        }

        if (action === "delete") {
            await deleteFile(fileId);
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
    } catch (err: unknown) {
        console.error("Drive POST error:", err);
        return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
    }
}
