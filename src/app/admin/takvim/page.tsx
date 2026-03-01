"use client";

import { useState, useEffect, useCallback } from "react";
import {
    CalendarDays, Plus, ChevronLeft, ChevronRight, X, Clock, MapPin,
    User, Camera, Users, Briefcase, Flag, Circle, Trash2, Pencil,
    CheckCircle2, AlertCircle, XCircle
} from "lucide-react";

interface CalendarEvent {
    id: string; title: string; type: string; description?: string;
    start_time: string; end_time?: string; all_day: boolean;
    customer_name?: string; location?: string; color: string;
    status: string; google_event_id?: string; reminder_minutes: number; notes?: string;
}

const TYPE_CONFIG: Record<string, { label: string; icon: typeof Camera; color: string; bg: string }> = {
    shoot: { label: "Fotoğraf Çekimi", icon: Camera, color: "text-purple-400", bg: "bg-purple-500/10" },
    meeting: { label: "Toplantı", icon: Briefcase, color: "text-blue-400", bg: "bg-blue-500/10" },
    visit: { label: "Müşteri Ziyareti", icon: Users, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    deadline: { label: "Teslim Tarihi", icon: Flag, color: "text-red-400", bg: "bg-red-500/10" },
    other: { label: "Diğer", icon: Circle, color: "text-gray-400", bg: "bg-gray-500/10" },
};

const STATUS_CONFIG: Record<string, { label: string; icon: typeof CheckCircle2; css: string }> = {
    confirmed: { label: "Onaylı", icon: CheckCircle2, css: "text-emerald-400" },
    tentative: { label: "Belirsiz", icon: AlertCircle, css: "text-yellow-400" },
    cancelled: { label: "İptal", icon: XCircle, css: "text-red-400" },
};

const MONTHS_TR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
const DAYS_TR = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

function formatTime(d: string) {
    return new Date(d).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

export default function TakvimPage() {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<"month" | "week">("month");
    const [showModal, setShowModal] = useState(false);
    const [editEvent, setEditEvent] = useState<CalendarEvent | null>(null);
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const [customers, setCustomers] = useState<string[]>([]);
    const [customerSearch, setCustomerSearch] = useState("");
    const [showCustDrop, setShowCustDrop] = useState(false);

    const [form, setForm] = useState({
        title: "", type: "meeting", description: "", date: "", start_hour: "09:00",
        end_hour: "10:00", all_day: false, customer_name: "", location: "",
        status: "confirmed", reminder_minutes: "30", notes: "", sync_google: true,
    });

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        const from = new Date(year, month, 1).toISOString();
        const to = new Date(year, month + 1, 7).toISOString();
        const [evRes, custRes] = await Promise.all([
            fetch(`/api/calendar?from=${from}&to=${to}`).then(r => r.json()),
            fetch("/api/calendar?action=customers").then(r => r.json()),
        ]);
        if (evRes.success) setEvents(evRes.data || []);
        if (custRes.success) setCustomers(custRes.data || []);
        setLoading(false);
    }, [year, month]);

    useEffect(() => { fetchEvents(); }, [fetchEvents]);

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const goToday = () => setCurrentDate(new Date());

    const openNew = (dateStr?: string) => {
        setEditEvent(null);
        const d = dateStr || new Date().toISOString().split("T")[0];
        setForm({
            title: "", type: "meeting", description: "", date: d, start_hour: "09:00",
            end_hour: "10:00", all_day: false, customer_name: "", location: "",
            status: "confirmed", reminder_minutes: "30", notes: "", sync_google: true,
        });
        setCustomerSearch("");
        setShowModal(true);
    };

    const openEdit = (ev: CalendarEvent) => {
        setEditEvent(ev);
        const startD = new Date(ev.start_time);
        const endD = ev.end_time ? new Date(ev.end_time) : startD;
        setForm({
            title: ev.title, type: ev.type, description: ev.description || "",
            date: startD.toISOString().split("T")[0],
            start_hour: `${startD.getHours().toString().padStart(2, "0")}:${startD.getMinutes().toString().padStart(2, "0")}`,
            end_hour: `${endD.getHours().toString().padStart(2, "0")}:${endD.getMinutes().toString().padStart(2, "0")}`,
            all_day: ev.all_day, customer_name: ev.customer_name || "",
            location: ev.location || "", status: ev.status,
            reminder_minutes: ev.reminder_minutes.toString(), notes: ev.notes || "",
            sync_google: !!ev.google_event_id,
        });
        setCustomerSearch(ev.customer_name || "");
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.title.trim()) return alert("Başlık giriniz");
        const start_time = form.all_day
            ? `${form.date}T00:00:00`
            : `${form.date}T${form.start_hour}:00`;
        const end_time = form.all_day
            ? `${form.date}T23:59:59`
            : `${form.date}T${form.end_hour}:00`;

        const payload = {
            action: editEvent ? "update" : "create",
            ...(editEvent ? { id: editEvent.id } : {}),
            title: form.title.trim(), type: form.type, description: form.description,
            start_time, end_time, all_day: form.all_day,
            customer_name: form.customer_name, location: form.location,
            status: form.status, reminder_minutes: parseInt(form.reminder_minutes),
            notes: form.notes, sync_google: form.sync_google,
        };

        setShowModal(false);
        await fetch("/api/calendar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        fetchEvents();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bu etkinliği silmek istediğinize emin misiniz?")) return;
        await fetch("/api/calendar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete", id }) });
        setSelectedDay(null);
        fetchEvents();
    };

    // Calendar grid logic
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDow = (firstDay.getDay() + 6) % 7; // Monday = 0
    const daysInMonth = lastDay.getDate();

    const calendarDays: { day: number; dateStr: string; isToday: boolean; isCurrentMonth: boolean }[] = [];

    // Previous month padding
    const prevLastDay = new Date(year, month, 0).getDate();
    for (let i = startDow - 1; i >= 0; i--) {
        const d = prevLastDay - i;
        const dt = new Date(year, month - 1, d);
        calendarDays.push({ day: d, dateStr: dt.toISOString().split("T")[0], isToday: false, isCurrentMonth: false });
    }

    // Current month
    const today = new Date().toISOString().split("T")[0];
    for (let d = 1; d <= daysInMonth; d++) {
        const dt = new Date(year, month, d);
        const ds = dt.toISOString().split("T")[0];
        calendarDays.push({ day: d, dateStr: ds, isToday: ds === today, isCurrentMonth: true });
    }

    // Next month padding
    const remaining = 42 - calendarDays.length;
    for (let d = 1; d <= remaining; d++) {
        const dt = new Date(year, month + 1, d);
        calendarDays.push({ day: d, dateStr: dt.toISOString().split("T")[0], isToday: false, isCurrentMonth: false });
    }

    const getEventsForDay = (dateStr: string) =>
        events.filter(e => e.start_time.startsWith(dateStr));

    const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : [];

    // Upcoming events (next 7 days)
    const nowStr = new Date().toISOString();
    const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString();
    const upcoming = events
        .filter(e => e.start_time >= nowStr && e.start_time <= nextWeek && e.status !== "cancelled")
        .slice(0, 5);

    const filteredCust = customers.filter(c => c.toLowerCase().includes(customerSearch.toLowerCase())).slice(0, 6);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center">
                        <CalendarDays className="w-5 h-5 text-violet-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-extrabold">Takvim</h1>
                        <p className="text-xs text-muted">Randevu ve etkinlik yönetimi</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex bg-white/5 rounded-xl p-0.5">
                        <button onClick={() => setView("month")} className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${view === "month" ? "bg-white/10 font-medium" : "text-muted hover:text-foreground"}`}>Ay</button>
                        <button onClick={() => setView("week")} className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${view === "week" ? "bg-white/10 font-medium" : "text-muted hover:text-foreground"}`}>Hafta</button>
                    </div>
                    <button onClick={() => openNew()} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500 hover:bg-violet-600 text-white text-sm font-medium transition-colors">
                        <Plus className="w-4 h-4" /> Yeni Etkinlik
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Calendar */}
                <div className="lg:col-span-3 bg-[#111] border border-white/5 rounded-2xl p-4">
                    {/* Month nav */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-white/5"><ChevronLeft className="w-4 h-4" /></button>
                            <h2 className="text-sm font-bold">{MONTHS_TR[month]} {year}</h2>
                            <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-white/5"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                        <button onClick={goToday} className="text-xs text-primary hover:underline">Bugün</button>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-32">
                            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
                        </div>
                    ) : (
                        <>
                            {/* Day headers */}
                            <div className="grid grid-cols-7 mb-1">
                                {DAYS_TR.map(d => <div key={d} className="text-center text-[10px] text-muted font-medium py-1">{d}</div>)}
                            </div>

                            {/* Day cells */}
                            <div className="grid grid-cols-7 gap-px bg-white/[0.03] rounded-xl overflow-hidden">
                                {calendarDays.map((cd, i) => {
                                    const dayEvents = getEventsForDay(cd.dateStr);
                                    const isSelected = selectedDay === cd.dateStr;
                                    return (
                                        <div key={i}
                                            onClick={() => { setSelectedDay(cd.dateStr); }}
                                            onDoubleClick={() => openNew(cd.dateStr)}
                                            className={`min-h-[80px] p-1.5 cursor-pointer transition-all
                        ${cd.isCurrentMonth ? "bg-[#0d0d0d]" : "bg-[#080808]"}
                        ${cd.isToday ? "ring-1 ring-violet-500/50" : ""}
                        ${isSelected ? "ring-1 ring-white/20 bg-white/[0.03]" : ""}
                        hover:bg-white/[0.03]`}
                                        >
                                            <span className={`text-[11px] font-medium inline-flex items-center justify-center w-6 h-6 rounded-full
                        ${cd.isToday ? "bg-violet-500 text-white" : cd.isCurrentMonth ? "" : "text-muted/40"}`}>
                                                {cd.day}
                                            </span>
                                            <div className="mt-0.5 space-y-0.5">
                                                {dayEvents.slice(0, 3).map(ev => (
                                                    <div key={ev.id} onClick={(e) => { e.stopPropagation(); openEdit(ev); }}
                                                        className="text-[9px] px-1 py-0.5 rounded truncate cursor-pointer hover:opacity-80"
                                                        style={{ background: `${ev.color}20`, color: ev.color }}>
                                                        {!ev.all_day && <span className="opacity-60">{formatTime(ev.start_time)} </span>}
                                                        {ev.title}
                                                    </div>
                                                ))}
                                                {dayEvents.length > 3 && (
                                                    <div className="text-[9px] text-muted px-1">+{dayEvents.length - 3} daha</div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>

                {/* Right Sidebar */}
                <div className="space-y-4">
                    {/* Selected Day Events */}
                    <div className="bg-[#111] border border-white/5 rounded-2xl p-4">
                        <h3 className="text-sm font-bold mb-3">
                            {selectedDay
                                ? new Date(selectedDay + "T12:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "long", weekday: "long" })
                                : "Bir gün seçin"}
                        </h3>
                        {selectedDay && (
                            <>
                                {selectedDayEvents.length === 0 ? (
                                    <div className="text-center py-6">
                                        <CalendarDays className="w-8 h-8 text-muted/20 mx-auto mb-2" />
                                        <p className="text-xs text-muted">Etkinlik yok</p>
                                        <button onClick={() => openNew(selectedDay)} className="text-[10px] text-primary mt-2 hover:underline">+ Ekle</button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {selectedDayEvents.map(ev => {
                                            const tc = TYPE_CONFIG[ev.type] || TYPE_CONFIG.other;
                                            const sc = STATUS_CONFIG[ev.status] || STATUS_CONFIG.confirmed;
                                            return (
                                                <div key={ev.id} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 cursor-pointer transition-all"
                                                    onClick={() => openEdit(ev)}>
                                                    <div className="flex items-start gap-2">
                                                        <div className={`w-6 h-6 rounded-md ${tc.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                                            <tc.icon className={`w-3 h-3 ${tc.color}`} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-medium truncate">{ev.title}</p>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                {!ev.all_day && (
                                                                    <span className="text-[10px] text-muted flex items-center gap-0.5">
                                                                        <Clock className="w-2.5 h-2.5" /> {formatTime(ev.start_time)}
                                                                        {ev.end_time && ` - ${formatTime(ev.end_time)}`}
                                                                    </span>
                                                                )}
                                                                <sc.icon className={`w-2.5 h-2.5 ${sc.css}`} />
                                                            </div>
                                                            {ev.customer_name && <p className="text-[10px] text-muted mt-0.5"><User className="w-2.5 h-2.5 inline" /> {ev.customer_name}</p>}
                                                            {ev.location && <p className="text-[10px] text-muted mt-0.5"><MapPin className="w-2.5 h-2.5 inline" /> {ev.location}</p>}
                                                        </div>
                                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(ev.id); }}
                                                            className="p-1 rounded hover:bg-red-500/10 text-muted hover:text-red-400 opacity-0 group-hover:opacity-100">
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Upcoming */}
                    <div className="bg-[#111] border border-white/5 rounded-2xl p-4">
                        <h3 className="text-sm font-bold mb-3">Yaklaşan Etkinlikler</h3>
                        {upcoming.length === 0 ? (
                            <p className="text-xs text-muted text-center py-4">Yaklaşan etkinlik yok</p>
                        ) : (
                            <div className="space-y-2">
                                {upcoming.map(ev => {
                                    const tc = TYPE_CONFIG[ev.type] || TYPE_CONFIG.other;
                                    return (
                                        <div key={ev.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.02] cursor-pointer" onClick={() => openEdit(ev)}>
                                            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: ev.color }} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[11px] font-medium truncate">{ev.title}</p>
                                                <p className="text-[9px] text-muted">
                                                    {new Date(ev.start_time).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                                                    {!ev.all_day && ` • ${formatTime(ev.start_time)}`}
                                                </p>
                                            </div>
                                            <tc.icon className={`w-3 h-3 ${tc.color} flex-shrink-0`} />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Legend */}
                    <div className="bg-[#111] border border-white/5 rounded-2xl p-4">
                        <h3 className="text-xs font-bold mb-2 text-muted">Etkinlik Türleri</h3>
                        <div className="space-y-1.5">
                            {Object.entries(TYPE_CONFIG).map(([key, val]) => (
                                <div key={key} className="flex items-center gap-2 text-[11px]">
                                    <val.icon className={`w-3 h-3 ${val.color}`} />
                                    <span className="text-muted">{val.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-bold">{editEvent ? "Etkinliği Düzenle" : "Yeni Etkinlik"}</h3>
                            <div className="flex items-center gap-1">
                                {editEvent && (
                                    <button onClick={() => { handleDelete(editEvent.id); setShowModal(false); }}
                                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-400">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                                <button onClick={() => setShowModal(false)}><X className="w-4 h-4 text-muted" /></button>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="text-[11px] text-muted mb-1 block">Başlık *</label>
                                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    autoFocus className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/30" placeholder="Etkinlik başlığı..." />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[11px] text-muted mb-1 block">Tür</label>
                                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none">
                                        {Object.entries(TYPE_CONFIG).map(([k, v]) => <option key={k} value={k} className="bg-[#111]">{v.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[11px] text-muted mb-1 block">Durum</label>
                                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none">
                                        {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k} className="bg-[#111]">{v.label}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-[11px] text-muted mb-1 block">Tarih *</label>
                                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/30" />
                            </div>

                            <div className="flex items-center gap-3">
                                <label className="flex items-center gap-2 text-xs cursor-pointer">
                                    <input type="checkbox" checked={form.all_day} onChange={(e) => setForm({ ...form, all_day: e.target.checked })}
                                        className="accent-violet-500 w-3.5 h-3.5" />
                                    Tüm gün
                                </label>
                            </div>

                            {!form.all_day && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[11px] text-muted mb-1 block">Başlangıç</label>
                                        <input type="time" value={form.start_hour} onChange={(e) => setForm({ ...form, start_hour: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/30" />
                                    </div>
                                    <div>
                                        <label className="text-[11px] text-muted mb-1 block">Bitiş</label>
                                        <input type="time" value={form.end_hour} onChange={(e) => setForm({ ...form, end_hour: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/30" />
                                    </div>
                                </div>
                            )}

                            {/* Customer */}
                            <div className="relative">
                                <label className="text-[11px] text-muted mb-1 block">Müşteri</label>
                                <input value={customerSearch} onChange={(e) => { setCustomerSearch(e.target.value); setForm({ ...form, customer_name: e.target.value }); setShowCustDrop(true); }}
                                    onFocus={() => setShowCustDrop(true)} onBlur={() => setTimeout(() => setShowCustDrop(false), 200)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/30" placeholder="Müşteri adı..." />
                                {showCustDrop && customerSearch.trim() && (
                                    <div className="absolute left-0 right-0 top-full mt-1 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-10 max-h-36 overflow-y-auto">
                                        {filteredCust.map(c => (
                                            <button key={c} onMouseDown={(e) => { e.preventDefault(); setCustomerSearch(c); setForm({ ...form, customer_name: c }); setShowCustDrop(false); }}
                                                className="w-full text-left px-3 py-2 text-xs hover:bg-white/5 text-muted hover:text-foreground">{c}</button>
                                        ))}
                                        {!filteredCust.includes(customerSearch.trim()) && (
                                            <button onMouseDown={(e) => { e.preventDefault(); setForm({ ...form, customer_name: customerSearch.trim() }); setShowCustDrop(false); }}
                                                className="w-full text-left px-3 py-2 text-xs text-primary hover:bg-white/5 border-t border-white/5">
                                                <Plus className="w-3 h-3 inline mr-1" /> &quot;{customerSearch.trim()}&quot; olarak ekle
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="text-[11px] text-muted mb-1 block">Konum</label>
                                <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/30" placeholder="Adres veya konum..." />
                            </div>

                            <div>
                                <label className="text-[11px] text-muted mb-1 block">Hatırlatma</label>
                                <select value={form.reminder_minutes} onChange={(e) => setForm({ ...form, reminder_minutes: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none">
                                    {[["5", "5 dk"], ["15", "15 dk"], ["30", "30 dk"], ["60", "1 saat"], ["1440", "1 gün"]].map(([v, l]) =>
                                        <option key={v} value={v} className="bg-[#111]">{l} önce</option>
                                    )}
                                </select>
                            </div>

                            <div>
                                <label className="text-[11px] text-muted mb-1 block">Notlar</label>
                                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/30 resize-none" placeholder="Ek notlar..." />
                            </div>

                            <label className="flex items-center gap-2 text-xs cursor-pointer px-3 py-2.5 bg-white/[0.02] rounded-xl border border-white/5">
                                <input type="checkbox" checked={form.sync_google} onChange={(e) => setForm({ ...form, sync_google: e.target.checked })}
                                    className="accent-violet-500 w-3.5 h-3.5" />
                                <span>Google Calendar ile senkronize et</span>
                            </label>
                        </div>

                        <div className="flex gap-2 justify-end mt-5">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-sm text-muted hover:bg-white/5">İptal</button>
                            <button onClick={handleSave} className="px-5 py-2 rounded-xl bg-violet-500 hover:bg-violet-600 text-white text-sm font-medium">
                                {editEvent ? "Güncelle" : "Kaydet"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
