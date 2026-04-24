import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const PW_KEY = "sg_admin_pw";

interface UploadedBot {
  id: string;
  name: string;
  status: string;
  dir: string;
  createdAt: number;
}

interface LiveSession {
  id: string;
  name: string | null;
  phone: string | null;
  status: "disconnected" | "connecting" | "connected" | "pairing";
  pairingCode: string | null;
  botJid: string | null;
  botName: string | null;
  isPrimary: boolean;
  avatarUrl: string | null;
}

export default function Admin() {
  const [password, setPassword] = useState<string>(() => sessionStorage.getItem(PW_KEY) || "");
  const [authed, setAuthed] = useState<boolean>(false);
  const [bots, setBots] = useState<UploadedBot[]>([]);
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [uploadName, setUploadName] = useState("");
  const [newSessionId, setNewSessionId] = useState("");
  const [newSessionPhone, setNewSessionPhone] = useState("");
  const [pairingBusy, setPairingBusy] = useState(false);
  const [botName, setBotName] = useState("");
  const [botNameSaved, setBotNameSaved] = useState("");
  const [savingBotName, setSavingBotName] = useState(false);
  const eventRef = useRef<EventSource | null>(null);
  const consoleRef = useRef<HTMLDivElement | null>(null);

  async function tryAuth(pw: string) {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    if (res.ok) {
      sessionStorage.setItem(PW_KEY, pw);
      setAuthed(true);
      refreshAll(pw);
    } else {
      toast.error("Wrong admin password.");
      setAuthed(false);
    }
  }

  useEffect(() => { if (password) tryAuth(password); /* eslint-disable-next-line */ }, []);

  async function refreshAll(pw = password) {
    await Promise.all([refreshBots(pw), refreshSessions(pw), refreshBotName(pw)]);
  }

  async function refreshBotName(pw = password) {
    try {
      const res = await fetch("/api/admin/bot-name", { headers: { "x-admin-password": pw } });
      if (res.ok) {
        const j = await res.json();
        setBotName(j.name || "");
        setBotNameSaved(j.name || "");
      }
    } catch { /* ignore */ }
  }

  async function saveBotName() {
    setSavingBotName(true);
    try {
      const res = await fetch("/api/admin/bot-name", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify({ name: botName.trim() }),
      });
      const j = await res.json();
      if (j.success) {
        setBotNameSaved(j.name || "");
        toast.success(j.name ? `Bot name set to "${j.name}"` : "Bot name cleared (will use WhatsApp profile name)");
        await refreshSessions();
      } else {
        toast.error(j.message || "Could not save name");
      }
    } catch (e: any) {
      toast.error(e?.message || "Save failed");
    } finally {
      setSavingBotName(false);
    }
  }

  async function refreshBots(pw = password) {
    const res = await fetch("/api/admin/bots", { headers: { "x-admin-password": pw } });
    if (res.ok) { const j = await res.json(); setBots(j.bots || []); }
  }

  async function refreshSessions(pw = password) {
    const res = await fetch("/api/admin/sessions", { headers: { "x-admin-password": pw } });
    if (res.ok) { const j = await res.json(); setSessions(j.sessions || []); }
  }

  // Auto-poll sessions while authed (so pairing codes / statuses stay fresh)
  useEffect(() => {
    if (!authed) return;
    const t = setInterval(() => refreshSessions(), 3000);
    return () => clearInterval(t);
    // eslint-disable-next-line
  }, [authed]);

  function streamLogs(id: string) {
    if (eventRef.current) { eventRef.current.close(); eventRef.current = null; }
    setLogs([]); setStatus("");
    const es = new EventSource(`/api/admin/bots/${id}/stream?password=${encodeURIComponent(password)}`);
    eventRef.current = es;
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.line) setLogs((l) => [...l, data.line]);
      } catch {}
    };
    es.addEventListener("status", (e: MessageEvent) => {
      try { setStatus(JSON.parse(e.data).status); } catch {}
    });
    es.onerror = () => { /* keep open */ };
  }

  useEffect(() => {
    if (selectedId) streamLogs(selectedId);
    return () => { if (eventRef.current) { eventRef.current.close(); eventRef.current = null; } };
    // eslint-disable-next-line
  }, [selectedId]);

  useEffect(() => {
    if (consoleRef.current) consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
  }, [logs]);

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const name = (uploadName || file.name.replace(/\.zip$/i, "")).slice(0, 40);
      const res = await fetch(`/api/admin/bots/upload?name=${encodeURIComponent(name)}`, {
        method: "POST",
        headers: { "Content-Type": "application/zip", "x-admin-password": password },
        body: file,
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Uploaded ${data.name}. Installing & starting...`);
        await refreshBots();
        setSelectedId(data.id);
      } else {
        toast.error(data.message || "Upload failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Upload error");
    } finally {
      setUploading(false);
    }
  }

  async function action(id: string, what: "restart" | "stop" | "delete") {
    const method = what === "delete" ? "DELETE" : "POST";
    const url = what === "delete" ? `/api/admin/bots/${id}` : `/api/admin/bots/${id}/${what}`;
    const res = await fetch(url, { method, headers: { "x-admin-password": password } });
    const data = await res.json();
    if (data.success) { toast.success(`${what} ok`); if (what === "delete" && selectedId === id) setSelectedId(null); refreshBots(); }
    else toast.error(data.message || "Action failed");
  }

  async function pairNewSession() {
    const phone = newSessionPhone.replace(/\D/g, "");
    if (phone.length < 7) { toast.error("Enter a valid phone (with country code)."); return; }
    setPairingBusy(true);
    try {
      const res = await fetch("/api/admin/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify({ id: newSessionId.trim() || undefined, phone }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.session?.pairingCode ? `Pairing code: ${data.session.pairingCode}` : "Session starting…");
        setNewSessionId(""); setNewSessionPhone("");
        await refreshSessions();
      } else {
        toast.error(data.message || "Pair failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Pair error");
    } finally {
      setPairingBusy(false);
    }
  }

  async function sessionAction(id: string, what: "disconnect" | "logout" | "delete" | "reconnect" | "pair") {
    let url = `/api/admin/sessions/${id}`;
    let method: "POST" | "DELETE" = "POST";
    if (what === "delete") method = "DELETE";
    else if (what === "reconnect") url = `/api/admin/sessions/${id}/connect`;
    else url = `/api/admin/sessions/${id}/${what}`;
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: method === "POST" ? JSON.stringify({}) : undefined,
    });
    const data = await res.json();
    if (data.success) {
      if (what === "reconnect") toast.success("Reconnecting (no pairing code requested)");
      else if (what === "pair") toast.success(data.session?.pairingCode ? `Pairing code: ${data.session.pairingCode}` : "Pairing started…");
      else toast.success(`${what} ok`);
      refreshSessions();
    }
    else toast.error(data.message || "Action failed");
  }

  function copyCode(code: string) {
    navigator.clipboard?.writeText(code).then(() => toast.success("Code copied"));
  }

  async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  async function saveIdentity(id: string, name: string, file: File | null) {
    if (!name.trim() && !file) { toast.error("Set a name or pick an image."); return; }
    let imageBase64: string | undefined;
    if (file) imageBase64 = await fileToBase64(file);
    const res = await fetch(`/api/admin/sessions/${id}/identity`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({ name: name.trim() || undefined, imageBase64 }),
    });
    const data = await res.json();
    if (data.success) { toast.success("Identity updated"); refreshSessions(); }
    else toast.error(data.message || "Update failed");
  }

  function statusColor(s: string) {
    switch (s) {
      case "connected": return "bg-emerald-500/20 border-emerald-400/40 text-emerald-300";
      case "pairing": return "bg-yellow-500/20 border-yellow-400/40 text-yellow-200";
      case "connecting": return "bg-sky-500/20 border-sky-400/40 text-sky-200";
      default: return "bg-white/5 border-white/20 text-muted-foreground";
    }
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <form
          className="w-full max-w-sm space-y-4 p-8 border border-white/10 rounded-2xl bg-card/50 backdrop-blur"
          onSubmit={(e) => { e.preventDefault(); tryAuth(password); }}
        >
          <h1 className="text-2xl font-serif uppercase tracking-widest text-gradient-gold text-center">Admin Panel</h1>
          <div className="space-y-2">
            <Label htmlFor="pw" className="uppercase text-xs tracking-widest text-muted-foreground">Password</Label>
            <Input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12" placeholder="••••••••" />
          </div>
          <Button type="submit" className="w-full h-12 uppercase tracking-widest">Enter</Button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-serif uppercase tracking-widest text-gradient-gold">Admin · Bot Console</h1>
          <Button variant="outline" onClick={() => { sessionStorage.removeItem(PW_KEY); setAuthed(false); setPassword(""); }}>
            Sign out
          </Button>
        </header>

        {/* ─── Bot identity ─────────────────────────────────────────────── */}
        <section className="border border-white/10 rounded-2xl p-5 mb-6 bg-card/40">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg uppercase tracking-widest">Bot Display Name</h2>
            {botNameSaved && (
              <span className="text-xs text-muted-foreground">Currently: <span className="font-mono text-foreground">{botNameSaved}</span></span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            This name appears in <span className="font-mono">.menu</span>, <span className="font-mono">.ping</span>, <span className="font-mono">.info</span>, and the AI assistant's persona. Leave blank to use the WhatsApp profile name.
          </p>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[220px] space-y-2">
              <Label className="uppercase text-xs tracking-widest text-muted-foreground">Name</Label>
              <Input value={botName} onChange={(e) => setBotName(e.target.value.slice(0, 40))} placeholder="e.g. Debbie" maxLength={40} />
            </div>
            <Button onClick={saveBotName} disabled={savingBotName || botName === botNameSaved} className="h-10 uppercase tracking-widest">
              {savingBotName ? "Saving…" : "Save Name"}
            </Button>
          </div>
        </section>

        {/* ─── Live WhatsApp sessions ─────────────────────────────────────── */}
        <section className="border border-white/10 rounded-2xl p-5 mb-6 bg-card/40">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg uppercase tracking-widest">Live WhatsApp Sessions</h2>
            <Button size="sm" variant="ghost" onClick={() => refreshSessions()}>Refresh</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
            <div className="space-y-2">
              <Label className="uppercase text-xs tracking-widest text-muted-foreground">Bot ID (optional)</Label>
              <Input value={newSessionId} onChange={(e) => setNewSessionId(e.target.value)} placeholder="e.g. shadow-2" />
            </div>
            <div className="space-y-2">
              <Label className="uppercase text-xs tracking-widest text-muted-foreground">Phone (with country code)</Label>
              <Input value={newSessionPhone} onChange={(e) => setNewSessionPhone(e.target.value)} placeholder="447466159480" />
            </div>
            <div className="flex items-end">
              <Button className="w-full h-10 uppercase tracking-widest" onClick={pairNewSession} disabled={pairingBusy}>
                {pairingBusy ? "Generating…" : "Pair New Bot"}
              </Button>
            </div>
          </div>

          {sessions.length === 0 ? (
            <p className="text-xs text-muted-foreground">No active sessions yet.</p>
          ) : (
            <ul className="space-y-3">
              {sessions.map((s) => (
                <li key={s.id} className="p-4 rounded-xl border border-white/10 bg-black/30">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-12 w-12 rounded-full bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center text-xs uppercase text-muted-foreground shrink-0">
                        {s.avatarUrl ? (
                          <img src={s.avatarUrl} alt="" className="h-full w-full object-cover" onError={(e) => { (e.currentTarget.style as any).display = "none"; }} />
                        ) : (
                          (s.botName || s.id || "?").slice(0, 2)
                        )}
                      </div>
                      <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium font-mono">{s.id}</span>
                        {s.isPrimary && <span className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-primary/20 border border-primary/30">primary</span>}
                        <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded border ${statusColor(s.status)}`}>{s.status}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {s.phone ? `+${s.phone}` : "no phone"}
                        {s.botName ? ` · ${s.botName}` : ""}
                        {s.botJid ? ` · ${s.botJid.split(":")[0]}` : ""}
                      </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => sessionAction(s.id, "reconnect")}>Reconnect</Button>
                      <Button size="sm" variant="outline" onClick={() => sessionAction(s.id, "disconnect")}>Disconnect</Button>
                      {s.status !== "connected" && s.phone && (
                        <Button size="sm" onClick={() => { if (confirm(`Generate a NEW pairing code for +${s.phone}? This will send a "Link a device" notification to that phone.`)) sessionAction(s.id, "pair"); }}>
                          Generate Pairing Code
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => { if (confirm(`Logout ${s.id}? This clears its WhatsApp pairing.`)) sessionAction(s.id, "logout"); }}>Logout</Button>
                      {!s.isPrimary && (
                        <Button size="sm" variant="destructive" onClick={() => { if (confirm(`Remove session ${s.id}?`)) sessionAction(s.id, "delete"); }}>Remove</Button>
                      )}
                    </div>
                  </div>
                  <IdentityForm
                    sessionId={s.id}
                    initialName={s.botName || ""}
                    onSave={saveIdentity}
                  />
                  {s.pairingCode && (
                    <div className="mt-3 flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-400/30">
                      <div className="text-xs uppercase tracking-widest text-yellow-200">Pairing code</div>
                      <code className="font-mono text-lg tracking-[0.3em] text-yellow-100">{s.pairingCode}</code>
                      <Button size="sm" variant="outline" onClick={() => copyCode(s.pairingCode!)}>Copy</Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-muted-foreground mt-3">
            Open WhatsApp → Settings → Linked Devices → Link a Device → Link with phone number, then enter the pairing code shown above.
          </p>
        </section>

        {/* ─── Upload bot zip ─────────────────────────────────────────────── */}
        <section className="border border-white/10 rounded-2xl p-5 mb-6 bg-card/40">
          <h2 className="text-lg uppercase tracking-widest mb-3">Upload Standalone Bot (.zip)</h2>
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
            <div className="flex-1 space-y-2">
              <Label className="uppercase text-xs tracking-widest text-muted-foreground">Name (optional)</Label>
              <Input value={uploadName} onChange={(e) => setUploadName(e.target.value)} placeholder="my-bot" />
            </div>
            <div className="flex-1 space-y-2">
              <Label className="uppercase text-xs tracking-widest text-muted-foreground">Zip file</Label>
              <input
                type="file"
                accept=".zip,application/zip"
                disabled={uploading}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.currentTarget.value = ""; }}
                className="block w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:bg-primary/30 file:text-primary-foreground file:cursor-pointer"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">After upload we run <code>npm install</code>, then auto-start your bot's <code>npm start</code> / <code>npm run dev</code> / <code>main</code> entry. Logs stream live below.</p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <aside className="border border-white/10 rounded-2xl p-4 bg-card/40 lg:col-span-1">
            <div className="flex items-center justify-between mb-3">
              <h2 className="uppercase tracking-widest text-sm">Uploaded Bots</h2>
              <Button size="sm" variant="ghost" onClick={() => refreshBots()}>Refresh</Button>
            </div>
            {bots.length === 0 && <p className="text-xs text-muted-foreground">No bots uploaded yet.</p>}
            <ul className="space-y-2">
              {bots.map((b) => (
                <li
                  key={b.id}
                  className={`p-3 rounded-lg border cursor-pointer transition ${selectedId === b.id ? "border-primary bg-primary/10" : "border-white/10 hover:border-white/30"}`}
                  onClick={() => setSelectedId(b.id)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{b.name}</div>
                      <div className="text-xs text-muted-foreground">{b.status}</div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); action(b.id, "restart"); }}>↻</Button>
                      <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); action(b.id, "stop"); }}>■</Button>
                      <Button size="sm" variant="destructive" onClick={(e) => { e.stopPropagation(); if (confirm("Delete bot?")) action(b.id, "delete"); }}>✕</Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </aside>

          <section className="lg:col-span-2 border border-white/10 rounded-2xl bg-black/70 p-0 overflow-hidden flex flex-col" style={{ minHeight: "60vh" }}>
            <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between bg-black/80">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">
                Console {selectedId ? `· ${bots.find(b=>b.id===selectedId)?.name || selectedId}` : "· (select a bot)"}
              </div>
              {status && <span className="text-xs px-2 py-0.5 rounded bg-primary/20 border border-primary/40">{status}</span>}
            </div>
            <div ref={consoleRef} className="flex-1 overflow-auto px-4 py-3 font-mono text-xs leading-relaxed text-green-300 whitespace-pre-wrap">
              {logs.length === 0 ? <span className="text-muted-foreground">No logs yet…</span> : logs.join("\n")}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function IdentityForm({
  sessionId,
  initialName,
  onSave,
}: {
  sessionId: string;
  initialName: string;
  onSave: (id: string, name: string, file: File | null) => Promise<void>;
}) {
  const [name, setName] = useState(initialName);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  function pickFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setFile(f);
  }

  async function submit() {
    setBusy(true);
    try { await onSave(sessionId, name, file); setFile(null); }
    finally { setBusy(false); }
  }

  return (
    <div className="mt-3 grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 items-end">
      <div className="space-y-1">
        <Label className="uppercase text-[10px] tracking-widest text-muted-foreground">Display name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Bot name on WhatsApp" />
      </div>
      <div className="space-y-1">
        <Label className="uppercase text-[10px] tracking-widest text-muted-foreground">Profile image</Label>
        <input
          type="file"
          accept="image/*"
          onChange={pickFile}
          className="block w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-primary/30 file:text-primary-foreground file:cursor-pointer"
        />
      </div>
      <Button size="sm" className="h-10 uppercase tracking-widest" onClick={submit} disabled={busy}>
        {busy ? "Saving…" : "Save"}
      </Button>
    </div>
  );
}
