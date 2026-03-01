import { google } from "googleapis";

export function getDrive() {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        "https://developers.google.com/oauthplayground"
    );
    oauth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });
    return google.drive({ version: "v3", auth: oauth2Client });
}

export interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
    size?: string;
    modifiedTime?: string;
    iconLink?: string;
    webViewLink?: string;
    webContentLink?: string;
    parents?: string[];
    thumbnailLink?: string;
}

export async function listFiles(folderId?: string, query?: string) {
    let q = "trashed = false";
    if (folderId) q += ` and '${folderId}' in parents`;
    if (query) q += ` and name contains '${query}'`;

    const res = await getDrive().files.list({
        q,
        fields: "files(id,name,mimeType,size,modifiedTime,iconLink,webViewLink,webContentLink,parents,thumbnailLink)",
        orderBy: "folder,name",
        pageSize: 100,
    });

    return (res.data.files || []) as DriveFile[];
}

export async function createFolder(name: string, parentId?: string) {
    const res = await getDrive().files.create({
        requestBody: {
            name,
            mimeType: "application/vnd.google-apps.folder",
            parents: parentId ? [parentId] : undefined,
        },
        fields: "id,name,mimeType",
    });
    return res.data;
}

export async function deleteFile(fileId: string) {
    await getDrive().files.delete({ fileId });
}

export async function renameFile(fileId: string, name: string) {
    const res = await getDrive().files.update({
        fileId,
        requestBody: { name },
        fields: "id,name,mimeType",
    });
    return res.data;
}

export async function getUploadUrl(fileName: string, mimeType: string, parentId?: string) {
    const res = await getDrive().files.create({
        requestBody: {
            name: fileName,
            mimeType,
            parents: parentId ? [parentId] : undefined,
        },
        media: {
            mimeType,
            body: "",
        },
        fields: "id,name,webViewLink",
    });
    return res.data;
}

export async function getStorageQuota() {
    const res = await getDrive().about.get({ fields: "storageQuota" });
    return res.data.storageQuota;
}
