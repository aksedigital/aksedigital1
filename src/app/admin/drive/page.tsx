"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
    FolderOpen, File, Upload, FolderPlus, Trash2, Pencil, Search,
    ArrowLeft, MoreVertical, X, Download, ExternalLink, HardDrive,
    Image, FileText, Film, Music, Archive, ChevronRight, RefreshCw, Eye
} from "lucide-react";

interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
    size?: string;
    modifiedTime?: string;
    webViewLink?: string;
    webContentLink?: string;
    thumbnailLink?: string;
}

const FILE_ICONS: Record<string, { icon: typeof File; color: string; bg: string }> = {
    "application/vnd.google-apps.folder": { icon: FolderOpen, color: "text-yellow-400", bg: "bg-yellow-500/10" },
    "image/": { icon: Image, color: "text-pink-400", bg: "bg-pink-500/10" },
    "video/": { icon: Film, color: "text-purple-400", bg: "bg-purple-500/10" },
    "audio/": { icon: Music, color: "text-green-400", bg: "bg-green-500/10" },
    "application/pdf": { icon: FileText, color: "text-red-400", bg: "bg-red-500/10" },
    "application/zip": { icon: Archive, color: "text-orange-400", bg: "bg-orange-500/10" },
    "default": { icon: File, color: "text-blue-400", bg: "bg-blue-500/10" },
};

function getFileIcon(mimeType: string) {
    if (FILE_ICONS[mimeType]) return FILE_ICONS[mimeType];
    for (const key of Object.keys(FILE_ICONS)) {
        if (mimeType.startsWith(key)) return FILE_ICONS[key];
    }
    return FILE_ICONS["default"];
}

function formatSize(bytes?: string) {
    if (!bytes) return "—";
    const b = parseInt(bytes);
    if (b < 1024) return `${b} B`;
    if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
    if (b < 1073741824) return `${(b / 1048576).toFixed(1)} MB`;
    return `${(b / 1073741824).toFixed(1)} GB`;
}

function formatDate(d?: string) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function DrivePage() {
    const [files, setFiles] = useState<DriveFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [folderStack, setFolderStack] = useState<{ id: string; name: string }[]>([]);
    const [search, setSearch] = useState("");
    const [uploading, setUploading] = useState(false);
    const [contextMenu, setContextMenu] = useState<{ file: DriveFile; x: number; y: number } | null>(null);
    const [renameModal, setRenameModal] = useState<DriveFile | null>(null);
    const [newFolderModal, setNewFolderModal] = useState(false);
    const [newName, setNewName] = useState("");
    const [quota, setQuota] = useState<{ usage?: string; limit?: string } | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [previewFile, setPreviewFile] = useState<DriveFile | null>(null);
    const uploadRef = useRef<HTMLInputElement>(null);

    const currentFolder = folderStack.length > 0 ? folderStack[folderStack.length - 1].id : undefined;

    const fetchFiles = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (currentFolder) params.set("folderId", currentFolder);
            if (search) params.set("q", search);
            const r = await fetch(`/api/drive?${params}`);
            const d = await r.json();
            if (d.success) {
                const sorted = (d.files as DriveFile[]).sort((a, b) => {
                    const aFolder = a.mimeType === "application/vnd.google-apps.folder" ? 0 : 1;
                    const bFolder = b.mimeType === "application/vnd.google-apps.folder" ? 0 : 1;
                    if (aFolder !== bFolder) return aFolder - bFolder;
                    return a.name.localeCompare(b.name);
                });
                setFiles(sorted);
            }
        } catch { /* empty */ }
        setLoading(false);
    }, [currentFolder, search]);

    const fetchQuota = async () => {
        try {
            const r = await fetch("/api/drive?action=quota");
            const d = await r.json();
            if (d.success) setQuota(d.quota);
        } catch { /* empty */ }
    };

    useEffect(() => { fetchFiles(); }, [fetchFiles]);
    useEffect(() => { fetchQuota(); }, []);

    const canPreview = (mime: string) => {
        return mime.startsWith("image/") || mime === "application/pdf" ||
            mime.startsWith("video/") || mime.startsWith("audio/") ||
            mime.startsWith("application/vnd.google-apps.");
    };

    const openFolder = (file: DriveFile) => {
        if (file.mimeType === "application/vnd.google-apps.folder") {
            setFolderStack([...folderStack, { id: file.id, name: file.name }]);
            setSearch("");
        } else {
            setPreviewFile(file);
        }
    };

    const goBack = () => {
        setFolderStack(folderStack.slice(0, -1));
        setSearch("");
    };

    const goToFolder = (index: number) => {
        setFolderStack(folderStack.slice(0, index + 1));
        setSearch("");
    };

    const handleUpload = async (fileList: FileList) => {
        setUploading(true);
        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i];
            const fd = new FormData();
            fd.append("file", file);
            if (currentFolder) fd.append("parentId", currentFolder);
            try {
                await fetch("/api/drive/upload", { method: "POST", body: fd });
            } catch { /* empty */ }
        }
        setUploading(false);
        fetchFiles();
    };

    const handleDelete = async (fileId: string) => {
        if (!confirm("Bu dosyayı silmek istediğinize emin misiniz?")) return;
        await fetch("/api/drive", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "delete", fileId }),
        });
        setContextMenu(null);
        fetchFiles();
    };

    const handleRename = async () => {
        if (!renameModal || !newName.trim()) return;
        await fetch("/api/drive", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "rename", fileId: renameModal.id, newName: newName.trim() }),
        });
        setRenameModal(null);
        setNewName("");
        fetchFiles();
    };

    const handleCreateFolder = async () => {
        if (!newName.trim()) return;
        const folderName = newName.trim();
        setNewFolderModal(false);
        setNewName("");
        await fetch("/api/drive", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "createFolder", name: folderName, parentId: currentFolder }),
        });
        fetchFiles();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files.length > 0) handleUpload(e.dataTransfer.files);
    };

    const usedGB = quota?.usage ? (parseInt(quota.usage) / 1073741824).toFixed(2) : "0";
    const totalGB = quota?.limit ? (parseInt(quota.limit) / 1073741824).toFixed(0) : "15";
    const usedPercent = quota?.usage && quota?.limit ? (parseInt(quota.usage) / parseInt(quota.limit)) * 100 : 0;

    return (
        <div
            className="space-y-6"
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                        <HardDrive className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-extrabold">Google Drive</h1>
                        <p className="text-xs text-muted">Dosyalarınızı yönetin</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => fetchFiles()} className="p-2 rounded-lg hover:bg-white/5 text-muted hover:text-foreground transition-colors">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <button onClick={() => { setNewFolderModal(true); setNewName(""); }}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm transition-colors">
                        <FolderPlus className="w-4 h-4" /> Yeni Klasör
                    </button>
                    <button onClick={() => uploadRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-medium transition-colors">
                        <Upload className="w-4 h-4" /> {uploading ? "Yükleniyor..." : "Yükle"}
                    </button>
                    <input ref={uploadRef} type="file" multiple className="hidden" onChange={(e) => e.target.files && handleUpload(e.target.files)} />
                </div>
            </div>

            {/* Breadcrumb + Search */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-sm flex-1 min-w-0">
                    {folderStack.length > 0 && (
                        <button onClick={goBack} className="p-1 rounded hover:bg-white/5 text-muted hover:text-foreground">
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                    )}
                    <button onClick={() => setFolderStack([])} className="text-muted hover:text-foreground px-1 truncate">
                        Drive
                    </button>
                    {folderStack.map((f, i) => (
                        <span key={f.id} className="flex items-center gap-1 min-w-0">
                            <ChevronRight className="w-3 h-3 text-muted flex-shrink-0" />
                            <button onClick={() => goToFolder(i)} className="text-muted hover:text-foreground truncate max-w-32">
                                {f.name}
                            </button>
                        </span>
                    ))}
                </div>
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)}
                        placeholder="Dosya ara..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-primary/30" />
                </div>
            </div>

            {/* Storage Bar */}
            {quota && (
                <div className="bg-[#111] border border-white/5 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted">Depolama Alanı</span>
                        <span className="text-xs font-medium">{usedGB} GB / {totalGB} GB</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2">
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all" style={{ width: `${Math.min(usedPercent, 100)}%` }} />
                    </div>
                </div>
            )}

            {/* Drag overlay */}
            {dragOver && (
                <div className="fixed inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-xl z-50 flex items-center justify-center">
                    <div className="text-center">
                        <Upload className="w-12 h-12 text-primary mx-auto mb-3" />
                        <p className="text-lg font-bold">Dosyaları buraya bırakın</p>
                    </div>
                </div>
            )}

            {/* File Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
                </div>
            ) : files.length === 0 ? (
                <div className="text-center py-20">
                    <FolderOpen className="w-16 h-16 text-muted/30 mx-auto mb-4" />
                    <p className="text-muted text-sm">Bu klasör boş</p>
                    <p className="text-muted/50 text-xs mt-1">Dosya yükleyin veya yeni klasör oluşturun</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    {files.map((file) => {
                        const { icon: Icon, color, bg } = getFileIcon(file.mimeType);
                        const isFolder = file.mimeType === "application/vnd.google-apps.folder";
                        return (
                            <div key={file.id}
                                onDoubleClick={() => openFolder(file)}
                                onClick={() => { setContextMenu(null); if (!file.mimeType.startsWith("application/vnd.google-apps.folder")) setPreviewFile(file); }}
                                className="group relative bg-[#111] border border-white/5 rounded-xl p-4 hover:border-white/10 hover:bg-white/[0.02] transition-all cursor-pointer">
                                {/* Context button */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); setContextMenu({ file, x: e.clientX, y: e.clientY }); }}
                                    className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all">
                                    <MoreVertical className="w-3.5 h-3.5 text-muted" />
                                </button>

                                {/* Icon / Thumbnail */}
                                <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mx-auto mb-3`}>
                                    {file.thumbnailLink && !isFolder ? (
                                        <img src={file.thumbnailLink} alt="" className="w-10 h-10 object-cover rounded-lg" />
                                    ) : (
                                        <Icon className={`w-6 h-6 ${color}`} />
                                    )}
                                </div>

                                {/* Name */}
                                <p className="text-xs font-medium text-center truncate" title={file.name}>
                                    {file.name}
                                </p>

                                {/* Meta */}
                                <p className="text-[10px] text-muted text-center mt-1">
                                    {isFolder ? "Klasör" : formatSize(file.size)}
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Context Menu */}
            {contextMenu && (
                <>
                    <div className="fixed inset-0 z-50" onClick={() => setContextMenu(null)} />
                    <div className="fixed z-50 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl py-1 w-48"
                        style={{ left: contextMenu.x, top: contextMenu.y }}>
                        {contextMenu.file.mimeType !== "application/vnd.google-apps.folder" && (
                            <>
                                <button onClick={() => { setPreviewFile(contextMenu.file); setContextMenu(null); }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-white/5 text-muted hover:text-foreground">
                                    <Eye className="w-3.5 h-3.5" /> Ön İzleme
                                </button>
                                {contextMenu.file.webViewLink && (
                                    <button onClick={() => { window.open(contextMenu.file.webViewLink!, "_blank"); setContextMenu(null); }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-white/5 text-muted hover:text-foreground">
                                        <ExternalLink className="w-3.5 h-3.5" /> Drive&apos;da Aç
                                    </button>
                                )}
                                {contextMenu.file.webContentLink && (
                                    <button onClick={() => { window.open(contextMenu.file.webContentLink!, "_blank"); setContextMenu(null); }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-white/5 text-muted hover:text-foreground">
                                        <Download className="w-3.5 h-3.5" /> İndir
                                    </button>
                                )}
                            </>
                        )}
                        <button onClick={() => { setRenameModal(contextMenu.file); setNewName(contextMenu.file.name); setContextMenu(null); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-white/5 text-muted hover:text-foreground">
                            <Pencil className="w-3.5 h-3.5" /> Yeniden Adlandır
                        </button>
                        <button onClick={() => handleDelete(contextMenu.file.id)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-white/5 text-red-400 hover:text-red-300">
                            <Trash2 className="w-3.5 h-3.5" /> Sil
                        </button>
                    </div>
                </>
            )}

            {/* Rename Modal */}
            {renameModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setRenameModal(null)}>
                    <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-96" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold">Yeniden Adlandır</h3>
                            <button onClick={() => setRenameModal(null)}><X className="w-4 h-4 text-muted" /></button>
                        </div>
                        <input value={newName} onChange={(e) => setNewName(e.target.value)}
                            autoFocus onKeyDown={(e) => e.key === "Enter" && handleRename()}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/30 mb-4" />
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setRenameModal(null)} className="px-4 py-2 rounded-xl text-sm text-muted hover:bg-white/5">İptal</button>
                            <button onClick={handleRename} className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90">Kaydet</button>
                        </div>
                    </div>
                </div>
            )}

            {/* New Folder Modal */}
            {newFolderModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setNewFolderModal(false)}>
                    <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-96" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold">Yeni Klasör</h3>
                            <button onClick={() => setNewFolderModal(false)}><X className="w-4 h-4 text-muted" /></button>
                        </div>
                        <input value={newName} onChange={(e) => setNewName(e.target.value)}
                            autoFocus onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                            placeholder="Klasör adı..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/30 mb-4" />
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setNewFolderModal(false)} className="px-4 py-2 rounded-xl text-sm text-muted hover:bg-white/5">İptal</button>
                            <button onClick={handleCreateFolder} className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90">Oluştur</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {previewFile && (
                <div className="fixed inset-0 bg-black/80 z-50 flex flex-col" onClick={() => setPreviewFile(null)}>
                    {/* Preview Header */}
                    <div className="flex items-center justify-between px-6 py-4 bg-black/50" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-8 h-8 rounded-lg ${getFileIcon(previewFile.mimeType).bg} flex items-center justify-center`}>
                                {(() => { const { icon: Icon, color } = getFileIcon(previewFile.mimeType); return <Icon className={`w-4 h-4 ${color}`} />; })()}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{previewFile.name}</p>
                                <p className="text-[10px] text-muted">{formatSize(previewFile.size)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {previewFile.webViewLink && (
                                <button onClick={() => window.open(previewFile.webViewLink!, "_blank")}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted hover:text-foreground hover:bg-white/10">
                                    <ExternalLink className="w-3.5 h-3.5" /> Drive'da Aç
                                </button>
                            )}
                            {previewFile.webContentLink && (
                                <button onClick={() => window.open(previewFile.webContentLink!, "_blank")}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted hover:text-foreground hover:bg-white/10">
                                    <Download className="w-3.5 h-3.5" /> İndir
                                </button>
                            )}
                            <button onClick={() => setPreviewFile(null)} className="p-2 rounded-lg hover:bg-white/10">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Preview Content */}
                    <div className="flex-1 flex items-center justify-center p-4 overflow-auto" onClick={(e) => e.stopPropagation()}>
                        {previewFile.mimeType.startsWith("image/") ? (
                            <img src={`/api/drive/preview?fileId=${previewFile.id}`}
                                alt={previewFile.name}
                                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
                        ) : previewFile.mimeType === "application/pdf" || previewFile.mimeType.startsWith("application/vnd.google-apps.") ? (
                            <iframe src={`/api/drive/preview?fileId=${previewFile.id}`}
                                className="w-full max-w-4xl h-full rounded-lg bg-white" title={previewFile.name} />
                        ) : previewFile.mimeType.startsWith("video/") ? (
                            <video src={`/api/drive/preview?fileId=${previewFile.id}`}
                                controls className="max-w-full max-h-full rounded-lg shadow-2xl" />
                        ) : previewFile.mimeType.startsWith("audio/") ? (
                            <div className="bg-[#111] rounded-2xl p-8 text-center">
                                <Music className="w-16 h-16 text-green-400 mx-auto mb-4" />
                                <p className="text-sm font-medium mb-4">{previewFile.name}</p>
                                <audio src={`/api/drive/preview?fileId=${previewFile.id}`} controls className="w-80" />
                            </div>
                        ) : (
                            <div className="text-center bg-[#111] rounded-2xl p-8">
                                <File className="w-16 h-16 text-muted/30 mx-auto mb-4" />
                                <p className="text-sm font-medium">{previewFile.name}</p>
                                <p className="text-xs text-muted mt-1 mb-4">{formatSize(previewFile.size)}</p>
                                <p className="text-xs text-muted mb-4">Bu dosya türü ön izlenemiyor</p>
                                <div className="flex gap-2 justify-center">
                                    {previewFile.webContentLink && (
                                        <button onClick={() => window.open(previewFile.webContentLink!, "_blank")}
                                            className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90">
                                            <Download className="w-4 h-4 inline mr-1.5" />İndir
                                        </button>
                                    )}
                                    {previewFile.webViewLink && (
                                        <button onClick={() => window.open(previewFile.webViewLink!, "_blank")}
                                            className="px-4 py-2 rounded-xl bg-white/10 text-sm hover:bg-white/20">
                                            <ExternalLink className="w-4 h-4 inline mr-1.5" />Drive'da Aç
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
