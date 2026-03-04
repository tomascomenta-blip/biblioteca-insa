import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ============================================================
// SUPABASE CONFIG
// ============================================================
const SUPABASE_URL = "https://elxuvibylfhxhxkdlrig.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVseHV2aWJ5bGZoeGh4a2RscmlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NzE2NjgsImV4cCI6MjA4ODE0NzY2OH0.A8rZale4-P1KRuCU3CyrvmAOXEzFQSXm_EReHWTdJO8";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================================
// CONSTANTS
// ============================================================
const GRADES = ["Grado 6","Grado 7","Grado 8","Grado 9","Grado 10","Grado 11"];
const SUBJECTS_BASE = ["Matemáticas","Sistemas","Inglés","Ciencias","Vida Cristiana","Español","Arte","Música","Sociales","Italiano","Francés","Educación Física"];

function getSubjects(grade) {
  if (grade === "Grado 10" || grade === "Grado 11") {
    return SUBJECTS_BASE.map(s => s === "Sociales" ? "Filosofía" : s);
  }
  return SUBJECTS_BASE;
}

const SUBJECT_ICONS = {
  "Matemáticas":"∑","Sistemas":"⌨","Inglés":"🔤","Ciencias":"⚗",
  "Vida Cristiana":"✝","Español":"📖","Arte":"🎨","Música":"♪",
  "Sociales":"🌍","Filosofía":"🧠","Italiano":"🇮🇹","Francés":"🇫🇷","Educación Física":"⚽"
};

const SUBJECT_COLORS = {
  "Matemáticas":"#3B82F6","Sistemas":"#10B981","Inglés":"#F59E0B",
  "Ciencias":"#8B5CF6","Vida Cristiana":"#EC4899","Español":"#EF4444",
  "Arte":"#F97316","Música":"#06B6D4","Sociales":"#84CC16",
  "Filosofía":"#A78BFA","Italiano":"#22D3EE","Francés":"#FB7185","Educación Física":"#4ADE80"
};

function formatSize(bytes) {
  if (!bytes) return "—";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-CO", { day:"2-digit", month:"short", year:"numeric" });
}

function getFileIcon(type) {
  const icons = { pdf:"📄", image:"🖼", docx:"📝", zip:"📦", pptx:"📊", xlsx:"📊", txt:"📃" };
  return icons[type] || "📁";
}

function getFileType(filename) {
  const ext = filename.split(".").pop().toLowerCase();
  const map = { pdf:"pdf", png:"image", jpg:"image", jpeg:"image", gif:"image", webp:"image",
    docx:"docx", doc:"docx", zip:"zip", pptx:"pptx", ppt:"pptx", xlsx:"xlsx", xls:"xlsx", txt:"txt" };
  return map[ext] || "file";
}

// ============================================================
// UPLOAD MODAL
// ============================================================
function UploadModal({ grade, subject, user, onClose, onUpload }) {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [student, setStudent] = useState(user?.user_metadata?.full_name || "");
  const [description, setDescription] = useState("");
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileRef = useRef();

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) { setFile(dropped); setFileName(dropped.name); }
  }, []);

  const handleSubmit = async () => {
    if (!file || !fileName.trim()) return;
    setUploading(true); setError("");
    try {
      const ext = file.name.split(".").pop();
      const filePath = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("files").upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("files").getPublicUrl(filePath);

      const { data, error: dbError } = await supabase.from("files").insert({
        name: fileName, grade, subject,
        student: student || "Anónimo",
        description,
        file_path: filePath,
        file_url: urlData.publicUrl,
        file_size: file.size,
        file_type: getFileType(file.name),
        user_id: user?.id || null,
        user_email: user?.email || null,
      }).select().single();
      if (dbError) throw dbError;

      setSuccess(true);
      onUpload(data);
      setTimeout(onClose, 1000);
    } catch (err) {
      setError(err.message || "Error al subir el archivo");
      setUploading(false);
    }
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", backdropFilter:"blur(8px)",
      display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:"1rem" }}>
      <div style={{ background:"#0F0F0F", border:"1px solid #2A2A2A", borderRadius:"20px",
        width:"100%", maxWidth:"500px", padding:"2rem", position:"relative" }}>
        <button onClick={onClose} style={{ position:"absolute", top:"1rem", right:"1rem",
          background:"none", border:"none", color:"#666", fontSize:"1.5rem", cursor:"pointer" }}>×</button>
        <h2 style={{ color:"#fff", fontSize:"1.3rem", fontWeight:700, marginBottom:"0.25rem",
          fontFamily:"'Playfair Display', serif" }}>Subir Archivo</h2>
        <p style={{ color:"#666", fontSize:"0.85rem", marginBottom:"1.5rem" }}>{grade} · {subject}</p>

        <div onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)} onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          style={{ border:`2px dashed ${dragging ? "#3B82F6" : file ? "#10B981" : "#333"}`,
            borderRadius:"12px", padding:"2rem", textAlign:"center", cursor:"pointer",
            background: dragging ? "rgba(59,130,246,0.05)" : file ? "rgba(16,185,129,0.05)" : "transparent",
            marginBottom:"1.25rem", transition:"all 0.2s" }}>
          <input ref={fileRef} type="file" style={{display:"none"}} onChange={e => {
            const f = e.target.files[0]; if (f) { setFile(f); setFileName(f.name); }
          }} accept=".pdf,.png,.jpg,.jpeg,.gif,.docx,.doc,.pptx,.ppt,.xlsx,.xls,.txt,.zip" />
          {file ? (
            <>
              <div style={{ fontSize:"2rem", marginBottom:"0.5rem" }}>{getFileIcon(getFileType(file.name))}</div>
              <div style={{ color:"#10B981", fontWeight:600, fontSize:"0.9rem" }}>{file.name}</div>
              <div style={{ color:"#666", fontSize:"0.75rem" }}>{formatSize(file.size)}</div>
            </>
          ) : (
            <>
              <div style={{ fontSize:"2.5rem", marginBottom:"0.5rem" }}>☁</div>
              <div style={{ color:"#888", fontSize:"0.9rem" }}>Arrastra tu archivo aquí</div>
              <div style={{ color:"#555", fontSize:"0.8rem", marginTop:"0.25rem" }}>o haz clic para buscar</div>
            </>
          )}
        </div>

        {[
          { label:"Nombre del archivo *", val:fileName, set:setFileName, placeholder:"Ej: Álgebra - Ecuaciones" },
          { label:"Tu nombre (opcional)", val:student, set:setStudent, placeholder:"Ej: María García" },
          { label:"Descripción (opcional)", val:description, set:setDescription, placeholder:"Breve descripción..." },
        ].map(({ label, val, set, placeholder }) => (
          <div key={label} style={{ marginBottom:"1rem" }}>
            <label style={{ color:"#888", fontSize:"0.8rem", display:"block", marginBottom:"0.35rem" }}>{label}</label>
            <input value={val} onChange={e => set(e.target.value)} placeholder={placeholder}
              style={{ width:"100%", background:"#1A1A1A", border:"1px solid #2A2A2A", borderRadius:"8px",
                color:"#fff", padding:"0.65rem 0.85rem", fontSize:"0.9rem", outline:"none", boxSizing:"border-box" }}
              onFocus={e => e.target.style.borderColor="#3B82F6"}
              onBlur={e => e.target.style.borderColor="#2A2A2A"} />
          </div>
        ))}

        {error && <div style={{ color:"#EF4444", fontSize:"0.82rem", marginBottom:"0.75rem" }}>⚠ {error}</div>}

        <button onClick={handleSubmit} disabled={!file || !fileName.trim() || uploading} style={{
          width:"100%", padding:"0.85rem", borderRadius:"10px", border:"none",
          background: success ? "#10B981" : (!file || !fileName.trim()) ? "#1A1A1A" : "linear-gradient(135deg,#3B82F6,#6366F1)",
          color:(!file||!fileName.trim()) ? "#555" : "#fff",
          fontWeight:700, fontSize:"1rem", cursor:(!file||!fileName.trim())?"not-allowed":"pointer" }}>
          {success ? "✓ Subido correctamente" : uploading ? "Subiendo..." : "Subir Archivo"}
        </button>
      </div>
    </div>
  );
}

// ============================================================
// FILE CARD
// ============================================================
function FileCard({ file, color, currentUser, onDelete }) {
  const isOwner = currentUser && file.user_id === currentUser.id;
  const [deleting, setDeleting] = useState(false);

  const handleDownload = async () => {
    const { data, error } = await supabase.storage.from("files").download(file.file_path);
    if (error) { alert("Error al descargar: " + error.message); return; }
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url; a.download = file.name; a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async () => {
    if (!window.confirm("¿Eliminar este archivo?")) return;
    setDeleting(true);
    await supabase.storage.from("files").remove([file.file_path]);
    const { error } = await supabase.from("files").delete().eq("id", file.id);
    if (error) { alert("Error al eliminar"); setDeleting(false); return; }
    onDelete(file.id);
  };

  return (
    <div style={{ background:"#0F0F0F", border:"1px solid #1E1E1E", borderRadius:"14px",
      padding:"1.25rem", display:"flex", gap:"1rem", alignItems:"flex-start", transition:"all 0.2s" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor=color; e.currentTarget.style.background="#141414"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor="#1E1E1E"; e.currentTarget.style.background="#0F0F0F"; }}>
      <div style={{ width:"44px", height:"44px", borderRadius:"10px", background:`${color}18`,
        display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.4rem", flexShrink:0 }}>
        {getFileIcon(file.file_type)}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ color:"#F0F0F0", fontWeight:600, fontSize:"0.92rem", marginBottom:"0.2rem",
          whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{file.name}</div>
        {file.description && (
          <div style={{ color:"#666", fontSize:"0.8rem", marginBottom:"0.4rem",
            overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{file.description}</div>
        )}
        <div style={{ display:"flex", gap:"0.75rem", flexWrap:"wrap" }}>
          <span style={{ color:"#555", fontSize:"0.75rem" }}>👤 {file.student}</span>
          <span style={{ color:"#555", fontSize:"0.75rem" }}>📅 {formatDate(file.uploaded_at)}</span>
          <span style={{ color:"#555", fontSize:"0.75rem" }}>💾 {formatSize(file.file_size)}</span>
        </div>
      </div>
      <div style={{ display:"flex", gap:"0.5rem", flexShrink:0 }}>
        <button onClick={handleDownload} style={{
          background:`${color}22`, border:`1px solid ${color}44`, color:color,
          borderRadius:"8px", padding:"0.4rem 0.8rem", fontSize:"0.78rem", fontWeight:600, cursor:"pointer" }}
          onMouseEnter={e => e.currentTarget.style.background=`${color}44`}
          onMouseLeave={e => e.currentTarget.style.background=`${color}22`}>
          ↓ Descargar
        </button>
        {isOwner && (
          <button onClick={handleDelete} disabled={deleting} style={{
            background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", color:"#EF4444",
            borderRadius:"8px", padding:"0.4rem 0.6rem", fontSize:"0.78rem", cursor:"pointer" }}
            onMouseEnter={e => e.currentTarget.style.background="rgba(239,68,68,0.25)"}
            onMouseLeave={e => e.currentTarget.style.background="rgba(239,68,68,0.1)"}>
            {deleting ? "..." : "🗑"}
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function BibliotecaINSA() {
  const [screen, setScreen] = useState("home");
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [files, setFiles] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("date");
  const [showUpload, setShowUpload] = useState(false);
  const [user, setUser] = useState(null);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [newFileFlash, setNewFileFlash] = useState(false);

  const subjects = selectedGrade ? getSubjects(selectedGrade) : [];
  const color = selectedSubject ? SUBJECT_COLORS[selectedSubject] || "#3B82F6" : "#3B82F6";

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user || null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!selectedGrade || !selectedSubject) return;
    setLoadingFiles(true);
    supabase.from("files").select("*")
      .eq("grade", selectedGrade).eq("subject", selectedSubject)
      .order("uploaded_at", { ascending: false })
      .then(({ data }) => { setFiles(data || []); setLoadingFiles(false); });
  }, [selectedGrade, selectedSubject]);

  useEffect(() => {
    if (!selectedGrade || !selectedSubject) return;
    const channel = supabase.channel("files-realtime")
      .on("postgres_changes", { event:"INSERT", schema:"public", table:"files" }, payload => {
        if (payload.new.grade === selectedGrade && payload.new.subject === selectedSubject) {
          setFiles(prev => [payload.new, ...prev]);
          setNewFileFlash(true);
          setTimeout(() => setNewFileFlash(false), 3000);
        }
      })
      .on("postgres_changes", { event:"DELETE", schema:"public", table:"files" }, payload => {
        setFiles(prev => prev.filter(f => f.id !== payload.old.id));
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [selectedGrade, selectedSubject]);

  const handleLogin = () => supabase.auth.signInWithOAuth({
    provider:"google", options:{ redirectTo: window.location.origin }
  });
  const handleLogout = () => supabase.auth.signOut();

  const filteredFiles = files
    .filter(f => f.name?.toLowerCase().includes(search.toLowerCase()) ||
                 f.description?.toLowerCase().includes(search.toLowerCase()) ||
                 f.student?.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b) => sort==="date"
      ? new Date(b.uploaded_at) - new Date(a.uploaded_at)
      : a.name?.localeCompare(b.name));

  return (
    <div style={{ minHeight:"100vh", background:"#080808", color:"#fff",
      fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700;900&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:6px; }
        ::-webkit-scrollbar-track { background:#0F0F0F; }
        ::-webkit-scrollbar-thumb { background:#2A2A2A; border-radius:3px; }
        input::placeholder, select { color:#555; }
        @keyframes slideIn { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        .grade-card:hover { background:#141414 !important; border-color:#3B82F6 !important; transform:translateY(-2px); }
        .subj-card:hover { transform:translateY(-3px); }
      `}</style>

      {/* NAV */}
      <nav style={{ borderBottom:"1px solid #1A1A1A", padding:"0 2rem",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        height:"60px", position:"sticky", top:0, background:"rgba(8,8,8,0.95)",
        backdropFilter:"blur(12px)", zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", cursor:"pointer" }}
          onClick={() => { setScreen("home"); setSelectedGrade(null); setSelectedSubject(null); }}>
          <div style={{ width:"32px", height:"32px", borderRadius:"8px",
            background:"linear-gradient(135deg,#3B82F6,#6366F1)",
            display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900 }}>B</div>
          <span style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:"1.1rem" }}>
            Biblioteca INSA
          </span>
        </div>

        {screen !== "home" && (
          <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", fontSize:"0.85rem" }}>
            <span style={{ color:"#555", cursor:"pointer" }}
              onClick={() => { setScreen("home"); setSelectedGrade(null); setSelectedSubject(null); }}>Inicio</span>
            {selectedGrade && (<>
              <span style={{ color:"#333" }}>›</span>
              <span style={{ color:screen==="files"?"#555":"#fff", cursor:screen==="files"?"pointer":"default" }}
                onClick={() => screen==="files" && setScreen("subjects")}>{selectedGrade}</span>
            </>)}
            {selectedSubject && (<>
              <span style={{ color:"#333" }}>›</span>
              <span style={{ color }}>{selectedSubject}</span>
            </>)}
          </div>
        )}

        <div style={{ display:"flex", alignItems:"center", gap:"0.75rem" }}>
          {user ? (
            <>
              <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
                {user.user_metadata?.avatar_url && (
                  <img src={user.user_metadata.avatar_url} alt="" style={{ width:"28px", height:"28px", borderRadius:"50%" }} />
                )}
                <span style={{ color:"#888", fontSize:"0.82rem" }}>{user.user_metadata?.full_name || user.email}</span>
              </div>
              <button onClick={handleLogout} style={{ background:"#1A1A1A", border:"1px solid #2A2A2A",
                color:"#666", borderRadius:"8px", padding:"0.4rem 0.8rem", fontSize:"0.8rem", cursor:"pointer" }}>
                Salir
              </button>
            </>
          ) : (
            <button onClick={handleLogin} style={{ background:"linear-gradient(135deg,#3B82F6,#6366F1)",
              border:"none", color:"#fff", borderRadius:"8px", padding:"0.45rem 1rem",
              fontSize:"0.85rem", fontWeight:600, cursor:"pointer" }}>
              G · Iniciar sesión
            </button>
          )}
        </div>
      </nav>

      {/* HOME */}
      {screen === "home" && (
        <div style={{ maxWidth:"900px", margin:"0 auto", padding:"4rem 2rem" }}>
          <div style={{ textAlign:"center", marginBottom:"4rem" }}>
            <div style={{ display:"inline-block", padding:"0.35rem 0.85rem", borderRadius:"99px",
              background:"rgba(59,130,246,0.1)", border:"1px solid rgba(59,130,246,0.2)",
              color:"#3B82F6", fontSize:"0.8rem", fontWeight:600, marginBottom:"1.5rem" }}>
              📚 Material de estudio colaborativo
            </div>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(2.5rem,6vw,4rem)",
              fontWeight:900, lineHeight:1.1, marginBottom:"1rem",
              background:"linear-gradient(135deg,#fff 40%,#555)",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              Biblioteca INSA
            </h1>
            <p style={{ color:"#555", fontSize:"1.05rem", maxWidth:"480px", margin:"0 auto 1.5rem" }}>
              Comparte y accede al material de estudio. Selecciona tu grado para comenzar.
            </p>
            {!user && (
              <div style={{ padding:"0.75rem 1.25rem", background:"rgba(59,130,246,0.07)",
                border:"1px solid rgba(59,130,246,0.15)", borderRadius:"10px", display:"inline-block" }}>
                <span style={{ color:"#888", fontSize:"0.85rem" }}>
                  💡 Inicia sesión con Google para subir y eliminar tus archivos
                </span>
              </div>
            )}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:"1rem" }}>
            {GRADES.map((grade, i) => (
              <div key={grade} className="grade-card"
                onClick={() => { setSelectedGrade(grade); setScreen("subjects"); }}
                style={{ background:"#0C0C0C", border:"1px solid #1E1E1E", borderRadius:"16px",
                  padding:"1.5rem", cursor:"pointer", transition:"all 0.2s",
                  display:"flex", flexDirection:"column", gap:"0.75rem" }}>
                <div style={{ width:"48px", height:"48px", borderRadius:"12px",
                  background:"linear-gradient(135deg,#3B82F620,#6366F120)", border:"1px solid #3B82F630",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:"1.4rem", fontWeight:900, color:"#3B82F6" }}>{i + 6}</div>
                <div>
                  <div style={{ fontWeight:700, fontSize:"1.05rem", color:"#F0F0F0" }}>{grade}</div>
                  <div style={{ color:"#555", fontSize:"0.8rem", marginTop:"0.2rem" }}>{getSubjects(grade).length} materias</div>
                </div>
                <div style={{ color:"#333", fontSize:"0.8rem" }}>Ver materias →</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBJECTS */}
      {screen === "subjects" && selectedGrade && (
        <div style={{ maxWidth:"1000px", margin:"0 auto", padding:"2.5rem 2rem" }}>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"2rem",
            fontWeight:900, color:"#fff", marginBottom:"0.5rem" }}>{selectedGrade}</h2>
          <p style={{ color:"#555", fontSize:"0.9rem", marginBottom:"2rem" }}>Selecciona una materia</p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:"0.85rem" }}>
            {subjects.map(sub => {
              const c = SUBJECT_COLORS[sub] || "#3B82F6";
              return (
                <div key={sub} className="subj-card"
                  onClick={() => { setSelectedSubject(sub); setScreen("files"); setSearch(""); setFiles([]); }}
                  style={{ background:`${c}0A`, border:`1px solid ${c}25`, borderRadius:"14px",
                    padding:"1.25rem", cursor:"pointer", transition:"all 0.2s",
                    display:"flex", flexDirection:"column", gap:"0.85rem" }}>
                  <div style={{ width:"42px", height:"42px", borderRadius:"10px",
                    background:`${c}20`, border:`1px solid ${c}30`,
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.4rem" }}>
                    {SUBJECT_ICONS[sub] || "📂"}
                  </div>
                  <div style={{ fontWeight:600, fontSize:"0.92rem", color:"#E8E8E8" }}>{sub}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FILES */}
      {screen === "files" && selectedGrade && selectedSubject && (
        <div style={{ maxWidth:"900px", margin:"0 auto", padding:"2rem" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
            marginBottom:"1.75rem", gap:"1rem", flexWrap:"wrap" }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", marginBottom:"0.35rem" }}>
                <div style={{ width:"38px", height:"38px", borderRadius:"10px",
                  background:`${color}20`, border:`1px solid ${color}30`,
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.3rem" }}>
                  {SUBJECT_ICONS[selectedSubject] || "📂"}
                </div>
                <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.6rem", fontWeight:900 }}>
                  {selectedSubject}
                </h2>
              </div>
              <p style={{ color:"#555", fontSize:"0.83rem" }}>
                {selectedGrade} · {filteredFiles.length} archivos
              </p>
            </div>
            {user ? (
              <button onClick={() => setShowUpload(true)} style={{
                background:`linear-gradient(135deg,${color},${color}99)`,
                border:"none", borderRadius:"10px", color:"#fff",
                padding:"0.7rem 1.25rem", fontWeight:700, fontSize:"0.9rem", cursor:"pointer" }}>
                + Subir Archivo
              </button>
            ) : (
              <button onClick={handleLogin} style={{ background:"#1A1A1A", border:"1px solid #2A2A2A",
                borderRadius:"10px", color:"#888", padding:"0.7rem 1.25rem",
                fontWeight:600, fontSize:"0.85rem", cursor:"pointer" }}>
                🔒 Inicia sesión para subir
              </button>
            )}
          </div>

          <div style={{ display:"flex", gap:"0.75rem", marginBottom:"1.5rem", flexWrap:"wrap" }}>
            <div style={{ flex:1, minWidth:"200px", position:"relative" }}>
              <span style={{ position:"absolute", left:"0.85rem", top:"50%", transform:"translateY(-50%)", color:"#444" }}>🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar archivos..."
                style={{ width:"100%", background:"#0F0F0F", border:"1px solid #2A2A2A",
                  borderRadius:"10px", color:"#fff", padding:"0.65rem 0.85rem 0.65rem 2.25rem",
                  fontSize:"0.9rem", outline:"none" }} />
            </div>
            <select value={sort} onChange={e => setSort(e.target.value)}
              style={{ background:"#0F0F0F", border:"1px solid #2A2A2A", borderRadius:"10px",
                color:"#888", padding:"0.65rem 0.85rem", fontSize:"0.85rem", cursor:"pointer" }}>
              <option value="date">📅 Más reciente</option>
              <option value="name">🔤 Nombre A-Z</option>
            </select>
          </div>

          {newFileFlash && (
            <div style={{ background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.3)",
              borderRadius:"10px", padding:"0.75rem 1rem", marginBottom:"1rem",
              color:"#10B981", fontSize:"0.85rem", fontWeight:600, animation:"slideIn 0.3s ease" }}>
              🟢 Nuevo archivo subido en tiempo real
            </div>
          )}

          {loadingFiles ? (
            <div style={{ textAlign:"center", padding:"4rem", color:"#444" }}>Cargando archivos...</div>
          ) : filteredFiles.length === 0 ? (
            <div style={{ textAlign:"center", padding:"4rem 2rem",
              background:"#0C0C0C", border:"1px solid #1A1A1A", borderRadius:"16px" }}>
              <div style={{ fontSize:"3rem", marginBottom:"1rem" }}>📭</div>
              <div style={{ color:"#444" }}>{search ? "No se encontraron archivos" : "Aún no hay archivos aquí"}</div>
              {!search && user && <div style={{ color:"#333", fontSize:"0.85rem", marginTop:"0.5rem" }}>¡Sé el primero en subir material!</div>}
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
              {filteredFiles.map(file => (
                <FileCard key={file.id} file={file} color={color} currentUser={user}
                  onDelete={id => setFiles(prev => prev.filter(f => f.id !== id))} />
              ))}
            </div>
          )}
        </div>
      )}

      {showUpload && (
        <UploadModal grade={selectedGrade} subject={selectedSubject} user={user}
          onClose={() => setShowUpload(false)}
          onUpload={f => setFiles(prev => [f, ...prev])} />
      )}

      <footer style={{ borderTop:"1px solid #1A1A1A", padding:"1.5rem 2rem", marginTop:"4rem",
        textAlign:"center", color:"#333", fontSize:"0.8rem" }}>
        Biblioteca INSA · Plataforma educativa colaborativa
      </footer>
    </div>
  );
}
