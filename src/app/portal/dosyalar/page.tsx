"use client";

import { useState, useEffect } from "react";
import { FolderOpen, Download, FileText, Image as ImageIcon, Film, File } from "lucide-react";

interface SharedFile { id: string; file_name: string; drive_file_id: string; drive_url: string; shared_at: string; }

const getFileIcon = (name: string) => {
    const ext = name.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "")) return ImageIcon;
    if (["mp4", "mov", "avi"].includes(ext || "")) return Film;
    if (["pdf", "doc", "docx", "txt"].includes(ext || "")) return FileText;
    return File;
};

export default function PortalDosyalarPage() {
    const [files, setFiles] = useState<SharedFile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/portal?action=files").then(r => r.json()).then(d => { setFiles(d.data || []); setLoading(false); });
    }, []);

    if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-extrabold">Paylaşılan Dosyalar</h1>
                <p className="text-sm text-muted mt-1">Sizinle paylaşılan Google Drive dosyaları</p>
            </div>

            {files.length === 0 ? (
                <div className="text-center py-16 bg-[#111] border border-white/5 rounded-2xl">
                    <FolderOpen className="w-12 h-12 text-muted/20 mx-auto mb-3" />
                    <p className="text-sm text-muted">Henüz paylaşılan dosya yok</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {files.map(f => {
                        const Icon = getFileIcon(f.file_name);
                        return (
                            <div key={f.id} className="bg-[#111] border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                        <Icon className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{f.file_name}</p>
                                        <p className="text-[10px] text-muted">{new Date(f.shared_at).toLocaleDateString("tr-TR")}</p>
                                    </div>
                                    <a href={f.drive_url || `https://drive.google.com/file/d/${f.drive_file_id}/view`} target="_blank" rel="noopener noreferrer"
                                        className="p-2 rounded-lg hover:bg-white/5 text-muted hover:text-foreground">
                                        <Download className="w-4 h-4" />
                                    </a>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
