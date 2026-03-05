import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://elxuvibylfhxhxkdlrig.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVseHV2aWJ5bGZoeGh4a2RscmlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NzE2NjgsImV4cCI6MjA4ODE0NzY2OH0.A8rZale4-P1KRuCU3CyrvmAOXEzFQSXm_EReHWTdJO8";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const ADMIN_EMAIL = "tomascomenta@gmail.com";

const ROLES = {
  lector:      { label:"Lector",             emoji:"📖", color:"#6B7280", min:0,  max:0  },
  participante:{ label:"Participante",        emoji:"✏️",  color:"#34D399", min:1,  max:3  },
  activo:      { label:"Participante Activo", emoji:"🔥", color:"#FBBF24", min:4,  max:9  },
  maestro:     { label:"Maestro",             emoji:"🎓", color:"#A78BFA", min:null, max:null },
};

function getRoleFromCount(count) {
  if (count === 0) return "lector";
  if (count <= 3)  return "participante";
  return "activo";
}

const LOGO_INSA = "data:image/png;base64,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";

const GRADES = ["Grado 6","Grado 7","Grado 8","Grado 9","Grado 10","Grado 11"];
const SUBJECTS_BASE = ["Matemáticas","Sistemas","Inglés","Ciencias","Vida Cristiana","Español","Arte","Música","Sociales","Italiano","Francés","Educación Física"];

function getSubjects(grade) {
  let subjects = [...SUBJECTS_BASE];
  if (grade === "Grado 6") {
    subjects = subjects.filter(s => s !== "Italiano" && s !== "Francés");
  }
  if (grade === "Grado 10" || grade === "Grado 11") {
    subjects = subjects.map(s => s === "Sociales" ? "Filosofía" : s);
    subjects.push("Investigación");
  }
  return subjects;
}

const SUBJECT_ICONS = {
  "Matemáticas":"∑","Sistemas":"⌨","Inglés":"🔤","Ciencias":"⚗",
  "Vida Cristiana":"✝","Español":"📖","Arte":"🎨","Música":"♪",
  "Sociales":"🌍","Filosofía":"🧠","Italiano":"🇮🇹","Francés":"🇫🇷",
  "Educación Física":"⚽","Investigación":"🔬"
};

const SUBJECT_COLORS = {
  "Matemáticas":"#4F8EF7","Sistemas":"#34D399","Inglés":"#FBBF24",
  "Ciencias":"#A78BFA","Vida Cristiana":"#F472B6","Español":"#F87171",
  "Arte":"#FB923C","Música":"#38BDF8","Sociales":"#A3E635",
  "Filosofía":"#C084FC","Italiano":"#22D3EE","Francés":"#FB7185",
  "Educación Física":"#4ADE80","Investigación":"#F59E0B"
};

function formatSize(bytes) {
  if (!bytes) return "—";
  if (bytes < 1048576) return (bytes/1024).toFixed(1)+" KB";
  return (bytes/1048576).toFixed(1)+" MB";
}
function formatDate(iso) {
  return new Date(iso).toLocaleDateString("es-CO",{day:"2-digit",month:"short",year:"numeric"});
}
function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("es-CO",{hour:"2-digit",minute:"2-digit"});
}
function getFileIcon(type) {
  const icons={pdf:"📄",image:"🖼",docx:"📝",zip:"📦",pptx:"📊",xlsx:"📊",txt:"📃"};
  return icons[type]||"📁";
}
function getFileType(filename) {
  const ext=filename.split(".").pop().toLowerCase();
  const map={pdf:"pdf",png:"image",jpg:"image",jpeg:"image",gif:"image",webp:"image",
    docx:"docx",doc:"docx",zip:"zip",pptx:"pptx",ppt:"pptx",xlsx:"xlsx",xls:"xlsx",txt:"txt"};
  return map[ext]||"file";
}

// ============================================================
// COMMENTS MODAL
// ============================================================
function CommentsModal({ file, user, onClose }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    supabase.from("comments").select("*").eq("file_id", file.id)
      .order("created_at", { ascending: true })
      .then(({ data }) => { setComments(data || []); setLoading(false); });

    const channel = supabase.channel("comments-" + file.id)
      .on("postgres_changes", { event:"INSERT", schema:"public", table:"comments",
        filter:`file_id=eq.${file.id}` }, payload => {
        setComments(prev => [...prev, payload.new]);
      })
      .on("postgres_changes", { event:"DELETE", schema:"public", table:"comments" }, payload => {
        setComments(prev => prev.filter(c => c.id !== payload.old.id));
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [file.id]);

  const handlePost = async () => {
    if (!newComment.trim() || !user) return;
    setPosting(true);
    await supabase.from("comments").insert({
      file_id: file.id,
      user_id: user.id,
      user_email: user.email,
      user_name: user.user_metadata?.full_name || user.email,
      content: newComment.trim()
    });
    setNewComment("");
    setPosting(false);
  };

  const handleDelete = async (commentId) => {
    if (!isAdmin) return;
    await supabase.from("comments").delete().eq("id", commentId);
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.88)", backdropFilter:"blur(10px)",
      display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:"1rem" }}>
      <div style={{ background:"#111", border:"1px solid #222", borderRadius:"20px",
        width:"100%", maxWidth:"540px", maxHeight:"85vh", display:"flex", flexDirection:"column",
        overflow:"hidden", position:"relative" }}>
        <div style={{ padding:"1.5rem", borderBottom:"1px solid #1E1E1E", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <h3 style={{ color:"#fff", fontWeight:700, fontSize:"1.1rem", marginBottom:"0.25rem", fontFamily:"'Playfair Display',serif" }}>
              Comentarios
            </h3>
            <p style={{ color:"#555", fontSize:"0.8rem", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:"380px" }}>
              {file.name}
            </p>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#555", fontSize:"1.5rem", cursor:"pointer" }}>×</button>
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:"1rem" }}>
          {loading ? (
            <div style={{ textAlign:"center", color:"#444", padding:"2rem" }}>Cargando...</div>
          ) : comments.length === 0 ? (
            <div style={{ textAlign:"center", padding:"2.5rem", color:"#444" }}>
              <div style={{ fontSize:"2rem", marginBottom:"0.5rem" }}>💬</div>
              <div>Sin comentarios aún</div>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
              {comments.map(c => (
                <div key={c.id} style={{ background:"#1A1A1A", borderRadius:"12px", padding:"0.85rem", position:"relative" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", marginBottom:"0.4rem" }}>
                    <div style={{ width:"28px", height:"28px", borderRadius:"50%", background:"linear-gradient(135deg,#3B82F6,#6366F1)",
                      display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.75rem", fontWeight:700, color:"#fff", flexShrink:0 }}>
                      {(c.user_name||c.user_email||"?")[0].toUpperCase()}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ color:"#ddd", fontSize:"0.82rem", fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {c.user_name || "Anónimo"}
                      </div>
                      <div style={{ color:"#444", fontSize:"0.72rem" }}>{c.user_email} · {formatDate(c.created_at)} {formatTime(c.created_at)}</div>
                    </div>
                    {isAdmin && (
                      <button onClick={() => handleDelete(c.id)} style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)",
                        color:"#EF4444", borderRadius:"6px", padding:"0.2rem 0.5rem", fontSize:"0.72rem", cursor:"pointer" }}>
                        🗑
                      </button>
                    )}
                  </div>
                  <p style={{ color:"#ccc", fontSize:"0.88rem", lineHeight:1.5, margin:0 }}>{c.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding:"1rem", borderTop:"1px solid #1E1E1E" }}>
          {user ? (
            <div style={{ display:"flex", gap:"0.5rem" }}>
              <input value={newComment} onChange={e => setNewComment(e.target.value)}
                placeholder="Escribe un comentario..." onKeyDown={e => e.key==="Enter" && handlePost()}
                style={{ flex:1, background:"#1A1A1A", border:"1px solid #2A2A2A", borderRadius:"10px",
                  color:"#fff", padding:"0.65rem 0.85rem", fontSize:"0.88rem", outline:"none" }}
                onFocus={e => e.target.style.borderColor="#3B82F6"}
                onBlur={e => e.target.style.borderColor="#2A2A2A"} />
              <button onClick={handlePost} disabled={!newComment.trim() || posting}
                style={{ background:"linear-gradient(135deg,#3B82F6,#6366F1)", border:"none", color:"#fff",
                  borderRadius:"10px", padding:"0.65rem 1rem", fontWeight:700, cursor:"pointer",
                  opacity: !newComment.trim() ? 0.5 : 1 }}>
                {posting ? "..." : "Enviar"}
              </button>
            </div>
          ) : (
            <div style={{ textAlign:"center", color:"#555", fontSize:"0.85rem" }}>
              Inicia sesión para comentar
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// UPLOAD MODAL
// ============================================================
const ALL_TAGS = ["Parcial","Taller","Resumen","Guía","Tarea","Examen","Apuntes","Proyecto"];

function UploadModal({ grade, subject, user, onClose, onUpload }) {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [student, setStudent] = useState(user?.user_metadata?.full_name || "");
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileRef = useRef();

  const toggleTag = (tag) => setSelectedTags(prev =>
    prev.includes(tag) ? prev.filter(t=>t!==tag) : [...prev, tag]);

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
      const { error: uploadError } = await supabase.storage.from("files").upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("files").getPublicUrl(filePath);
      const { data, error: dbError } = await supabase.from("files").insert({
        name: fileName, grade, subject,
        student: student || "Anónimo",
        description,
        tags: selectedTags,
        file_path: filePath,
        file_url: urlData.publicUrl,
        file_size: file.size,
        file_type: getFileType(file.name),
        user_id: user?.id || null,
        user_email: user?.email || null,
      }).select().single();
      if (dbError) throw dbError;

      // Send notifications to subscribers of this grade
      const { data: subs } = await supabase.from("notifications")
        .select("user_id").eq("grade", grade).limit(1);
      // Notify all users who have uploaded to this grade (as a proxy for "subscribed")
      const { data: gradeUsers } = await supabase.from("files")
        .select("user_id").eq("grade", grade).not("user_id","is",null);
      if (gradeUsers) {
        const uniqueUsers = [...new Set(gradeUsers.map(u=>u.user_id))].filter(id=>id!==user?.id);
        for (const uid of uniqueUsers.slice(0,50)) {
          await supabase.from("notifications").insert({
            user_id: uid,
            message: `Nuevo archivo en ${grade} · ${subject}: "${fileName}"`,
            file_id: data.id, grade, subject
          });
        }
      }

      setSuccess(true);
      onUpload(data);
      setTimeout(onClose, 1000);
    } catch (err) {
      setError(err.message || "Error al subir el archivo");
      setUploading(false);
    }
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.88)", backdropFilter:"blur(10px)",
      display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:"1rem" }}>
      <div style={{ background:"#111", border:"1px solid #222", borderRadius:"20px",
        width:"100%", maxWidth:"480px", padding:"2rem", position:"relative", maxHeight:"90vh", overflowY:"auto" }}>
        <button onClick={onClose} style={{ position:"absolute", top:"1rem", right:"1rem",
          background:"none", border:"none", color:"#555", fontSize:"1.5rem", cursor:"pointer" }}>×</button>
        <h2 style={{ color:"#fff", fontSize:"1.25rem", fontWeight:700, marginBottom:"0.25rem", fontFamily:"'Playfair Display',serif" }}>
          Subir Archivo
        </h2>
        <p style={{ color:"#555", fontSize:"0.82rem", marginBottom:"1.5rem" }}>{grade} · {subject}</p>

        <div onDragOver={e=>{e.preventDefault();setDragging(true);}} onDragLeave={()=>setDragging(false)}
          onDrop={handleDrop} onClick={()=>fileRef.current?.click()}
          style={{ border:`2px dashed ${dragging?"#4F8EF7":file?"#34D399":"#2A2A2A"}`, borderRadius:"12px",
            padding:"1.75rem", textAlign:"center", cursor:"pointer", marginBottom:"1.25rem",
            background:dragging?"rgba(79,142,247,0.04)":file?"rgba(52,211,153,0.04)":"transparent", transition:"all 0.2s" }}>
          <input ref={fileRef} type="file" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(f){setFile(f);setFileName(f.name);}}}
            accept=".pdf,.png,.jpg,.jpeg,.gif,.docx,.doc,.pptx,.ppt,.xlsx,.xls,.txt,.zip" />
          {file ? (
            <>
              <div style={{ fontSize:"2rem", marginBottom:"0.4rem" }}>{getFileIcon(getFileType(file.name))}</div>
              <div style={{ color:"#34D399", fontWeight:600, fontSize:"0.88rem" }}>{file.name}</div>
              <div style={{ color:"#555", fontSize:"0.75rem" }}>{formatSize(file.size)}</div>
            </>
          ) : (
            <>
              <div style={{ fontSize:"2.2rem", marginBottom:"0.4rem", opacity:0.5 }}>☁</div>
              <div style={{ color:"#666", fontSize:"0.88rem" }}>Arrastra tu archivo aquí</div>
              <div style={{ color:"#444", fontSize:"0.78rem", marginTop:"0.2rem" }}>o haz clic para buscar</div>
            </>
          )}
        </div>

        {[
          {label:"Nombre del archivo *", val:fileName, set:setFileName, placeholder:"Ej: Álgebra - Ecuaciones"},
          {label:"Tu nombre (opcional)", val:student, set:setStudent, placeholder:"Ej: María García"},
          {label:"Descripción (opcional)", val:description, set:setDescription, placeholder:"Breve descripción..."},
        ].map(({label,val,set,placeholder})=>(
          <div key={label} style={{ marginBottom:"0.85rem" }}>
            <label style={{ color:"#666", fontSize:"0.78rem", display:"block", marginBottom:"0.3rem" }}>{label}</label>
            <input value={val} onChange={e=>set(e.target.value)} placeholder={placeholder}
              style={{ width:"100%", background:"#1A1A1A", border:"1px solid #252525", borderRadius:"8px",
                color:"#fff", padding:"0.6rem 0.8rem", fontSize:"0.88rem", outline:"none", boxSizing:"border-box" }}
              onFocus={e=>e.target.style.borderColor="#4F8EF7"}
              onBlur={e=>e.target.style.borderColor="#252525"} />
          </div>
        ))}

        {/* Tags */}
        <div style={{ marginBottom:"1rem" }}>
          <label style={{ color:"#666", fontSize:"0.78rem", display:"block", marginBottom:"0.5rem" }}>Etiquetas (opcional)</label>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"0.4rem" }}>
            {ALL_TAGS.map(tag => (
              <button key={tag} onClick={()=>toggleTag(tag)} style={{
                background:selectedTags.includes(tag)?"rgba(79,142,247,0.2)":"#1A1A1A",
                border:`1px solid ${selectedTags.includes(tag)?"#4F8EF7":"#2A2A2A"}`,
                color:selectedTags.includes(tag)?"#4F8EF7":"#666",
                borderRadius:"20px", padding:"0.25rem 0.7rem", fontSize:"0.76rem",
                cursor:"pointer", transition:"all 0.15s" }}>
                {tag}
              </button>
            ))}
          </div>
        </div>

        {error && <div style={{ color:"#F87171", fontSize:"0.8rem", marginBottom:"0.75rem" }}>⚠ {error}</div>}

        <button onClick={handleSubmit} disabled={!file||!fileName.trim()||uploading} style={{
          width:"100%", padding:"0.8rem", borderRadius:"10px", border:"none",
          background:success?"#34D399":(!file||!fileName.trim())?"#1A1A1A":"linear-gradient(135deg,#4F8EF7,#6366F1)",
          color:(!file||!fileName.trim())?"#444":"#fff",
          fontWeight:700, fontSize:"0.95rem", cursor:(!file||!fileName.trim())?"not-allowed":"pointer" }}>
          {success?"✓ Subido correctamente":uploading?"Subiendo...":"Subir Archivo"}
        </button>
      </div>
    </div>
  );
}

// ============================================================
// FILE PREVIEW MODAL
// ============================================================
function PreviewModal({ file, onClose }) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    supabase.storage.from("files").createSignedUrl(file.file_path, 3600)
      .then(({data}) => data && setUrl(data.signedUrl));
  }, [file.file_path]);

  const isImage = file.file_type === "image";
  const isPdf = file.file_type === "pdf";

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.94)", backdropFilter:"blur(12px)",
      zIndex:1100, display:"flex", flexDirection:"column" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"0.85rem 1.5rem", borderBottom:"1px solid #1E1E1E", flexShrink:0 }}>
        <div style={{ color:"#E0E0E0", fontWeight:600, fontSize:"0.9rem", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:"70%" }}>
          {file.name}
        </div>
        <button onClick={onClose} style={{ background:"#1A1A1A", border:"1px solid #2A2A2A",
          color:"#888", borderRadius:"8px", padding:"0.35rem 0.8rem", fontSize:"0.82rem", cursor:"pointer" }}>
          Cerrar ×
        </button>
      </div>
      <div style={{ flex:1, overflow:"auto", display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" }}>
        {!url ? (
          <div style={{ color:"#444" }}>Cargando vista previa...</div>
        ) : isImage ? (
          <img src={url} alt={file.name} style={{ maxWidth:"100%", maxHeight:"100%", borderRadius:"8px", objectFit:"contain" }} />
        ) : isPdf ? (
          <iframe src={url} style={{ width:"100%", height:"100%", minHeight:"70vh", border:"none", borderRadius:"8px" }} title={file.name} />
        ) : (
          <div style={{ textAlign:"center", color:"#555" }}>
            <div style={{ fontSize:"4rem", marginBottom:"1rem" }}>{getFileIcon(file.file_type)}</div>
            <div>Vista previa no disponible para este tipo de archivo</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// FILE CARD
// ============================================================
function FileCard({ file, color, currentUser, onDelete, onComment, onDownload, onView, darkMode, allUserRoles }) {
  const isOwner = currentUser && file.user_id === currentUser.id;
  const [deleting, setDeleting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  const card = darkMode ? "#0E0E0E" : "#FFFFFF";
  const border = darkMode ? "#1A1A1A" : "#E5E5E0";
  const textColor = darkMode ? "#EFEFEF" : "#111";
  const mutedColor = darkMode ? "#4A4A4A" : "#888";

  useEffect(() => {
    supabase.from("likes").select("id", {count:"exact"}).eq("file_id", file.id)
      .then(({count}) => setLikeCount(count||0));
    if (currentUser) {
      supabase.from("likes").select("id").eq("file_id", file.id).eq("user_id", currentUser.id).single()
        .then(({data}) => setLiked(!!data));
    }
  }, [file.id, currentUser]);

  const handleLike = async () => {
    if (!currentUser) return;
    if (liked) {
      await supabase.from("likes").delete().eq("file_id", file.id).eq("user_id", currentUser.id);
      setLiked(false); setLikeCount(p=>p-1);
    } else {
      await supabase.from("likes").insert({ file_id: file.id, user_id: currentUser.id, user_email: currentUser.email });
      setLiked(true); setLikeCount(p=>p+1);
    }
  };

  const handleDownload = async () => {
    const { data, error } = await supabase.storage.from("files").download(file.file_path);
    if (error) { alert("Error al descargar: " + error.message); return; }
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url; a.download = file.name; a.click();
    URL.revokeObjectURL(url);
    await supabase.rpc("increment_downloads", { file_id: file.id });
    onDownload && onDownload(file.id);
    onView && onView(file);
  };

  const handleDelete = async () => {
    if (!window.confirm("¿Eliminar este archivo?")) return;
    setDeleting(true);
    await supabase.storage.from("files").remove([file.file_path]);
    const { error } = await supabase.from("files").delete().eq("id", file.id);
    if (error) { alert("Error al eliminar"); setDeleting(false); return; }
    onDelete(file.id);
  };

  const canPreview = file.file_type === "image" || file.file_type === "pdf";

  return (
    <>
      {showPreview && <PreviewModal file={file} onClose={()=>setShowPreview(false)} />}
      <div style={{ background:card, border:`1px solid ${border}`, borderRadius:"14px",
        padding:"1.1rem 1.25rem", display:"flex", gap:"1rem", alignItems:"flex-start", transition:"border-color 0.2s, background 0.2s" }}
        onMouseEnter={e=>{e.currentTarget.style.borderColor=color+"66";}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor=border;}}>
        <div style={{ width:"42px", height:"42px", borderRadius:"10px", background:`${color}15`,
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.3rem", flexShrink:0,
          cursor:canPreview?"pointer":"default" }}
          onClick={canPreview?()=>{setShowPreview(true);onView&&onView(file);}:undefined}
          title={canPreview?"Ver vista previa":undefined}>
          {getFileIcon(file.file_type)}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ color:textColor, fontWeight:600, fontSize:"0.9rem", marginBottom:"0.15rem",
            whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
            cursor:canPreview?"pointer":"default" }}
            onClick={canPreview?()=>{setShowPreview(true);onView&&onView(file);}:undefined}>
            {file.name}
            {canPreview && <span style={{ color:mutedColor, fontSize:"0.7rem", marginLeft:"0.4rem" }}>👁</span>}
          </div>
          {file.description && (
            <div style={{ color:mutedColor, fontSize:"0.78rem", marginBottom:"0.35rem",
              overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{file.description}</div>
          )}
          {/* Tags */}
          {file.tags && file.tags.length > 0 && (
            <div style={{ display:"flex", gap:"0.3rem", flexWrap:"wrap", marginBottom:"0.35rem" }}>
              {file.tags.map(tag => (
                <span key={tag} style={{ background:`${color}15`, border:`1px solid ${color}30`,
                  color:color, borderRadius:"20px", padding:"0.1rem 0.5rem", fontSize:"0.68rem", fontWeight:600 }}>
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div style={{ display:"flex", gap:"0.65rem", flexWrap:"wrap" }}>
            <span style={{ color:mutedColor, fontSize:"0.72rem" }}>👤 {file.student}</span>
            {file.user_email && <span style={{ color:mutedColor, fontSize:"0.72rem" }}>✉ {file.user_email}</span>}
            {(() => {
              const roleInfo = allUserRoles[file.user_email];
              const roleKey = roleInfo?.role || (file.user_email ? getRoleFromCount(0) : "lector");
              const role = ROLES[roleKey];
              return role ? (
                <span style={{ background:`${role.color}15`, border:`1px solid ${role.color}33`,
                  color:role.color, borderRadius:"4px", padding:"0.05rem 0.35rem", fontSize:"0.65rem", fontWeight:700 }}>
                  {role.emoji} {role.label}
                </span>
              ) : null;
            })()}
            <span style={{ color:mutedColor, fontSize:"0.72rem" }}>📅 {formatDate(file.uploaded_at)}</span>
            <span style={{ color:mutedColor, fontSize:"0.72rem" }}>💾 {formatSize(file.file_size)}</span>
            <span style={{ color:mutedColor, fontSize:"0.72rem" }}>⬇ {file.download_count||0}</span>
          </div>
        </div>
        <div style={{ display:"flex", gap:"0.4rem", flexShrink:0, flexWrap:"wrap", justifyContent:"flex-end" }}>
          {/* Like */}
          <button onClick={handleLike} title={currentUser?"Me gusta":"Inicia sesión para dar like"}
            style={{ background:liked?"rgba(239,68,68,0.12)":"#1A1A1A",
              border:`1px solid ${liked?"rgba(239,68,68,0.4)":"#2A2A2A"}`,
              color:liked?"#F87171":mutedColor,
              borderRadius:"8px", padding:"0.4rem 0.6rem", fontSize:"0.76rem", cursor:"pointer",
              display:"flex", alignItems:"center", gap:"0.25rem" }}>
            {liked?"❤️":"🤍"} {likeCount>0&&likeCount}
          </button>
          {/* Comment */}
          <button onClick={()=>onComment(file)} style={{ background:darkMode?"#1A1A1A":"#F5F5F0",
            border:`1px solid ${border}`, color:mutedColor,
            borderRadius:"8px", padding:"0.4rem 0.65rem", fontSize:"0.76rem", cursor:"pointer" }}>
            💬
          </button>
          {/* Download */}
          <button onClick={handleDownload} style={{ background:`${color}18`, border:`1px solid ${color}33`, color:color,
            borderRadius:"8px", padding:"0.4rem 0.8rem", fontSize:"0.76rem", fontWeight:600, cursor:"pointer" }}
            onMouseEnter={e=>e.currentTarget.style.background=`${color}33`}
            onMouseLeave={e=>e.currentTarget.style.background=`${color}18`}>
            ↓ Descargar
          </button>
          {isOwner && (
            <button onClick={handleDelete} disabled={deleting} style={{ background:"rgba(239,68,68,0.08)",
              border:"1px solid rgba(239,68,68,0.2)", color:"#F87171",
              borderRadius:"8px", padding:"0.4rem 0.6rem", fontSize:"0.76rem", cursor:"pointer" }}>
              {deleting?"...":"🗑"}
            </button>
          )}
        </div>
      </div>
    </>
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
  const [commentFile, setCommentFile] = useState(null);
  const [user, setUser] = useState(null);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [newFileFlash, setNewFileFlash] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [globalSearch, setGlobalSearch] = useState("");
  const [globalResults, setGlobalResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [ranking, setRanking] = useState([]);
  const [topFiles, setTopFiles] = useState([]);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [profileFiles, setProfileFiles] = useState([]);
  const [announcement, setAnnouncement] = useState(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("biblioteca_history")||"[]"); } catch { return []; }
  });
  const [activeTag, setActiveTag] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [allUserRoles, setAllUserRoles] = useState({});
  const [roleFilter, setRoleFilter] = useState(null);
  const [showRoleAdmin, setShowRoleAdmin] = useState(false);
  const [roleUsers, setRoleUsers] = useState([]);

  const bg = darkMode ? "#080808" : "#F5F5F0";
  const card = darkMode ? "#0E0E0E" : "#FFFFFF";
  const border = darkMode ? "#1A1A1A" : "#E5E5E0";
  const text = darkMode ? "#EFEFEF" : "#111";
  const muted = darkMode ? "#4A4A4A" : "#888";
  const subtle = darkMode ? "#1A1A1A" : "#EEEEEA";

  const subjects = selectedGrade ? getSubjects(selectedGrade) : [];
  const color = selectedSubject ? SUBJECT_COLORS[selectedSubject] || "#4F8EF7" : "#4F8EF7";

  useEffect(() => {
    supabase.auth.getSession().then(({data}) => setUser(data.session?.user||null));
    const {data:{subscription}} = supabase.auth.onAuthStateChange((_,session) => setUser(session?.user||null));
    return () => subscription.unsubscribe();
  }, []);

  // Load ranking and top files for home screen
  useEffect(() => {
    supabase.from("files").select("user_email, student")
      .not("user_email", "is", null)
      .then(({data}) => {
        if (!data) return;
        const counts = {};
        data.forEach(f => {
          const key = f.user_email;
          if (!counts[key]) counts[key] = { email: f.user_email, name: f.student, count: 0 };
          counts[key].count++;
        });
        const sorted = Object.values(counts).sort((a,b) => b.count - a.count).slice(0, 5);
        setRanking(sorted);
      });

    supabase.from("files").select("*")
      .order("download_count", {ascending: false})
      .limit(3)
      .then(({data}) => setTopFiles(data||[]));

    // Load announcement
    supabase.from("announcements").select("*").eq("active", true)
      .order("created_at", {ascending:false}).limit(1).single()
      .then(({data}) => data && setAnnouncement(data));
  }, []);

  // Load notifications when user logs in
  useEffect(() => {
    if (!user) return;
    supabase.from("notifications").select("*").eq("user_id", user.id)
      .order("created_at", {ascending:false}).limit(20)
      .then(({data}) => setNotifications(data||[]));

    const channel = supabase.channel("notifs-"+user.id)
      .on("postgres_changes", {event:"INSERT", schema:"public", table:"notifications",
        filter:`user_id=eq.${user.id}`}, payload => {
        setNotifications(prev=>[payload.new,...prev]);
      }).subscribe();
    return () => supabase.removeChannel(channel);
  }, [user]);

  // Load and sync user role
  useEffect(() => {
    if (!user) return;
    // Fetch all roles for display
    supabase.from("user_roles").select("*")
      .then(({data}) => {
        if (!data) return;
        const map = {};
        data.forEach(r => { map[r.user_email] = r; });
        setAllUserRoles(map);
        if (map[user.email]) setUserRole(map[user.email]);
      });

    // Upsert own role based on upload count (only if not manually set)
    supabase.from("files").select("id", {count:"exact"}).eq("user_id", user.id)
      .then(async ({count}) => {
        const autoRole = getRoleFromCount(count||0);
        const {data: existing} = await supabase.from("user_roles").select("*")
          .eq("user_id", user.id).single();
        if (!existing) {
          const {data} = await supabase.from("user_roles").insert({
            user_id: user.id, user_email: user.email,
            user_name: user.user_metadata?.full_name || user.email,
            role: autoRole, manually_set: false
          }).select().single();
          data && setUserRole(data);
        } else if (!existing.manually_set) {
          const {data} = await supabase.from("user_roles").update({
            role: autoRole,
            user_name: user.user_metadata?.full_name || user.email,
            updated_at: new Date().toISOString()
          }).eq("user_id", user.id).select().single();
          data && setUserRole(data);
        } else {
          setUserRole(existing);
        }
      });
  }, [user]);

  const loadRoleAdmin = async () => {
    const {data} = await supabase.from("user_roles").select("*").order("role");
    setRoleUsers(data||[]);
    setShowRoleAdmin(true);
  };

  const setUserRoleAdmin = async (targetUserId, newRole) => {
    const {data} = await supabase.from("user_roles").update({
      role: newRole, manually_set: true, updated_at: new Date().toISOString()
    }).eq("user_id", targetUserId).select().single();
    if (data) {
      setRoleUsers(prev => prev.map(u => u.user_id===targetUserId ? data : u));
      setAllUserRoles(prev => ({...prev, [data.user_email]: data}));
    }
  };

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from("notifications").update({read:true}).eq("user_id", user.id).eq("read", false);
    setNotifications(prev=>prev.map(n=>({...n,read:true})));
  };

  const loadProfile = async () => {
    if (!user) return;
    const {data} = await supabase.from("files").select("*").eq("user_id", user.id)
      .order("uploaded_at", {ascending:false});
    setProfileFiles(data||[]);
    setShowProfile(true);
  };

  const addToHistory = (file) => {
    setHistory(prev => {
      const filtered = prev.filter(f=>f.id!==file.id);
      const next = [{id:file.id,name:file.name,grade:file.grade,subject:file.subject,
        file_type:file.file_type,visited:new Date().toISOString()},...filtered].slice(0,10);
      try { sessionStorage.setItem("biblioteca_history", JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const saveAnnouncement = async () => {
    if (!newAnnouncement.trim()) return;
    if (announcement) {
      await supabase.from("announcements").update({content:newAnnouncement,active:true}).eq("id",announcement.id);
      setAnnouncement({...announcement,content:newAnnouncement});
    } else {
      const {data} = await supabase.from("announcements").insert({content:newAnnouncement,created_by:user.email,active:true}).select().single();
      data && setAnnouncement(data);
    }
    setEditingAnnouncement(false);
  };

  useEffect(() => {
    if (!selectedGrade || !selectedSubject) return;
    setLoadingFiles(true);
    supabase.from("files").select("*")
      .eq("grade", selectedGrade).eq("subject", selectedSubject)
      .order("uploaded_at", {ascending:false})
      .then(({data}) => { setFiles(data||[]); setLoadingFiles(false); });
  }, [selectedGrade, selectedSubject]);

  useEffect(() => {
    if (!selectedGrade || !selectedSubject) return;
    const channel = supabase.channel("files-rt")
      .on("postgres_changes", {event:"INSERT",schema:"public",table:"files"}, payload => {
        if (payload.new.grade===selectedGrade && payload.new.subject===selectedSubject) {
          setFiles(prev=>[payload.new,...prev]);
          setNewFileFlash(true);
          setTimeout(()=>setNewFileFlash(false),3000);
        }
      })
      .on("postgres_changes", {event:"DELETE",schema:"public",table:"files"}, payload => {
        setFiles(prev=>prev.filter(f=>f.id!==payload.old.id));
      }).subscribe();
    return () => supabase.removeChannel(channel);
  }, [selectedGrade, selectedSubject]);

  const handleGlobalSearch = async (q) => {
    setGlobalSearch(q);
    if (!q.trim()) { setGlobalResults([]); return; }
    setSearching(true);
    const { data } = await supabase.from("files").select("*")
      .or(`name.ilike.%${q}%,description.ilike.%${q}%,student.ilike.%${q}%`)
      .order("uploaded_at", {ascending:false})
      .limit(20);
    setGlobalResults(data||[]);
    setSearching(false);
  };

  const handleLogin = () => supabase.auth.signInWithOAuth({provider:"google", options:{redirectTo:window.location.origin}});
  const handleLogout = () => supabase.auth.signOut();

  const filteredFiles = files
    .filter(f=>f.name?.toLowerCase().includes(search.toLowerCase())||
               f.description?.toLowerCase().includes(search.toLowerCase())||
               f.student?.toLowerCase().includes(search.toLowerCase()))
    .filter(f=>!activeTag || (f.tags && f.tags.includes(activeTag)))
    .filter(f=>{
      if (!roleFilter) return true;
      const role = allUserRoles[f.user_email];
      const effectiveRole = role?.role || (f.user_email ? getRoleFromCount(0) : "lector");
      return effectiveRole === roleFilter;
    })
    .sort((a,b)=>sort==="date"?new Date(b.uploaded_at)-new Date(a.uploaded_at):
      sort==="downloads"?b.download_count-a.download_count:a.name?.localeCompare(b.name));


  const goHome = () => { setScreen("home"); setSelectedGrade(null); setSelectedSubject(null); };

  return (
    <div style={{ minHeight:"100vh", background:bg, color:text, fontFamily:"'DM Sans','Segoe UI',sans-serif", transition:"background 0.3s, color 0.3s" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Playfair+Display:wght@700;900&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-track { background:${darkMode?"#0A0A0A":"#F0F0EC"}; }
        ::-webkit-scrollbar-thumb { background:${darkMode?"#222":"#CCC"}; border-radius:3px; }
        input::placeholder { color:${darkMode?"#444":"#AAA"}; }
        select option { background:${darkMode?"#111":"#FFF"}; color:${darkMode?"#ccc":"#111"}; }
        @keyframes slideIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .grade-card { transition: all 0.2s; }
        .grade-card:hover { transform:translateY(-3px); }
        .subj-card { transition: all 0.18s; }
        .subj-card:hover { transform:translateY(-4px); filter:brightness(1.1); }
      `}</style>

      {/* GLOBAL SEARCH MODAL */}
      {showGlobalSearch && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", backdropFilter:"blur(12px)",
          zIndex:200, display:"flex", flexDirection:"column", alignItems:"center", padding:"5rem 1rem 1rem" }}
          onClick={e=>e.target===e.currentTarget&&setShowGlobalSearch(false)}>
          <div style={{ width:"100%", maxWidth:"600px", background:darkMode?"#111":"#FFF",
            border:`1px solid ${border}`, borderRadius:"16px", overflow:"hidden" }}>
            <div style={{ padding:"1rem", borderBottom:`1px solid ${border}`, display:"flex", gap:"0.75rem", alignItems:"center" }}>
              <span style={{ color:muted }}>🔍</span>
              <input autoFocus value={globalSearch} onChange={e=>handleGlobalSearch(e.target.value)}
                placeholder="Buscar en toda la biblioteca..." style={{ flex:1, background:"transparent",
                  border:"none", outline:"none", color:text, fontSize:"1rem" }} />
              <button onClick={()=>setShowGlobalSearch(false)} style={{ background:"none", border:"none", color:muted, cursor:"pointer", fontSize:"1.2rem" }}>×</button>
            </div>
            <div style={{ maxHeight:"60vh", overflowY:"auto", padding:"0.5rem" }}>
              {searching && <div style={{ textAlign:"center", padding:"2rem", color:muted }}>Buscando...</div>}
              {!searching && globalSearch && globalResults.length === 0 && (
                <div style={{ textAlign:"center", padding:"2rem", color:muted }}>Sin resultados para "{globalSearch}"</div>
              )}
              {!searching && !globalSearch && (
                <div style={{ textAlign:"center", padding:"2rem", color:muted, fontSize:"0.88rem" }}>Escribe para buscar en todos los grados y materias</div>
              )}
              {globalResults.map(f => (
                <div key={f.id} onClick={()=>{setSelectedGrade(f.grade);setSelectedSubject(f.subject);setScreen("files");setShowGlobalSearch(false);setGlobalSearch("");setGlobalResults([]);}}
                  style={{ padding:"0.85rem 1rem", borderRadius:"10px", cursor:"pointer", display:"flex", gap:"0.75rem", alignItems:"center",
                    transition:"background 0.15s" }}
                  onMouseEnter={e=>e.currentTarget.style.background=darkMode?"#1A1A1A":"#F5F5F0"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <span style={{ fontSize:"1.2rem" }}>{getFileIcon(f.file_type)}</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ color:text, fontWeight:600, fontSize:"0.88rem", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{f.name}</div>
                    <div style={{ color:muted, fontSize:"0.75rem" }}>{f.grade} · {f.subject} · {f.student}</div>
                  </div>
                  <span style={{ color:muted, fontSize:"0.72rem" }}>⬇ {f.download_count||0}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* NAV */}
      <nav style={{ borderBottom:`1px solid ${border}`, padding:"0 2rem",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        height:"58px", position:"sticky", top:0,
        background:darkMode?"rgba(8,8,8,0.97)":"rgba(245,245,240,0.97)",
        backdropFilter:"blur(16px)", zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:"0.65rem", cursor:"pointer" }} onClick={goHome}>
          <img src={LOGO_INSA} alt="INSA" style={{ width:"34px", height:"34px", objectFit:"contain", borderRadius:"6px" }} />
          <span style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:"1.05rem", letterSpacing:"-0.01em" }}>
            Biblioteca INSA
          </span>
        </div>

        {screen !== "home" && (
          <div style={{ display:"flex", alignItems:"center", gap:"0.4rem", fontSize:"0.82rem" }}>
            <span style={{ color:muted, cursor:"pointer" }} onClick={goHome}>Inicio</span>
            {selectedGrade && (<>
              <span style={{ color:border }}>›</span>
              <span style={{ color:screen==="files"?muted:text, cursor:screen==="files"?"pointer":"default" }}
                onClick={()=>screen==="files"&&setScreen("subjects")}>{selectedGrade}</span>
            </>)}
            {selectedSubject && (<>
              <span style={{ color:border }}>›</span>
              <span style={{ color }}>{selectedSubject}</span>
            </>)}
          </div>
        )}

        <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
          {/* Global search button */}
          <button onClick={()=>setShowGlobalSearch(true)} style={{ background:subtle, border:`1px solid ${border}`,
            color:muted, borderRadius:"8px", padding:"0.35rem 0.75rem", fontSize:"0.78rem", cursor:"pointer",
            display:"flex", alignItems:"center", gap:"0.4rem" }}>
            🔍
          </button>
          {/* Dark mode toggle */}
          <button onClick={()=>setDarkMode(!darkMode)} style={{ background:subtle, border:`1px solid ${border}`,
            color:muted, borderRadius:"8px", padding:"0.35rem 0.6rem", fontSize:"0.88rem", cursor:"pointer" }}>
            {darkMode?"☀️":"🌙"}
          </button>
          {user ? (
            <>
              {/* Notifications */}
              <div style={{ position:"relative" }}>
                <button onClick={()=>{setShowNotifs(!showNotifs);if(!showNotifs)markAllRead();}}
                  style={{ background:subtle, border:`1px solid ${border}`, color:muted,
                    borderRadius:"8px", padding:"0.35rem 0.6rem", fontSize:"0.88rem", cursor:"pointer", position:"relative" }}>
                  🔔
                  {notifications.filter(n=>!n.read).length > 0 && (
                    <span style={{ position:"absolute", top:"-4px", right:"-4px", background:"#EF4444",
                      color:"#fff", borderRadius:"50%", width:"16px", height:"16px",
                      display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.6rem", fontWeight:700 }}>
                      {notifications.filter(n=>!n.read).length}
                    </span>
                  )}
                </button>
                {showNotifs && (
                  <div style={{ position:"absolute", right:0, top:"calc(100% + 8px)", width:"300px",
                    background:darkMode?"#111":"#FFF", border:`1px solid ${border}`, borderRadius:"12px",
                    boxShadow:"0 8px 32px rgba(0,0,0,0.4)", zIndex:200, overflow:"hidden" }}>
                    <div style={{ padding:"0.75rem 1rem", borderBottom:`1px solid ${border}`,
                      display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <span style={{ color:text, fontWeight:600, fontSize:"0.88rem" }}>Notificaciones</span>
                      <button onClick={()=>setShowNotifs(false)} style={{ background:"none", border:"none", color:muted, cursor:"pointer" }}>×</button>
                    </div>
                    <div style={{ maxHeight:"300px", overflowY:"auto" }}>
                      {notifications.length===0 ? (
                        <div style={{ padding:"1.5rem", textAlign:"center", color:muted, fontSize:"0.82rem" }}>Sin notificaciones</div>
                      ) : notifications.map(n=>(
                        <div key={n.id} onClick={()=>{if(n.grade&&n.subject){setSelectedGrade(n.grade);setSelectedSubject(n.subject);setScreen("files");setShowNotifs(false);}}}
                          style={{ padding:"0.75rem 1rem", borderBottom:`1px solid ${border}`,
                            background:n.read?"transparent":darkMode?"rgba(79,142,247,0.06)":"rgba(79,142,247,0.04)",
                            cursor:n.grade?"pointer":"default", transition:"background 0.15s" }}
                          onMouseEnter={e=>n.grade&&(e.currentTarget.style.background=darkMode?"#1A1A1A":"#F5F5F0")}
                          onMouseLeave={e=>e.currentTarget.style.background=n.read?"transparent":darkMode?"rgba(79,142,247,0.06)":"rgba(79,142,247,0.04)"}>
                          <div style={{ color:text, fontSize:"0.82rem", lineHeight:1.4 }}>{n.message}</div>
                          <div style={{ color:muted, fontSize:"0.7rem", marginTop:"0.2rem" }}>{formatDate(n.created_at)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
                <div onClick={loadProfile} style={{ cursor:"pointer", display:"flex", alignItems:"center", gap:"0.4rem" }}>
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="" style={{ width:"26px", height:"26px", borderRadius:"50%", border:`1px solid ${border}` }} />
                  ) : (
                    <div style={{ width:"26px", height:"26px", borderRadius:"50%", background:"linear-gradient(135deg,#4F8EF7,#6366F1)",
                      display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:"0.7rem", fontWeight:700 }}>
                      {(user.user_metadata?.full_name||user.email||"?")[0].toUpperCase()}
                    </div>
                  )}
                  <span style={{ color:muted, fontSize:"0.78rem", maxWidth:"120px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {user.user_metadata?.full_name || user.email}
                  </span>
                </div>
                {/* Role badge */}
                {userRole && (
                  <span style={{ background:`${ROLES[userRole.role]?.color}18`,
                    border:`1px solid ${ROLES[userRole.role]?.color}44`,
                    color:ROLES[userRole.role]?.color,
                    fontSize:"0.65rem", fontWeight:700, borderRadius:"4px", padding:"0.15rem 0.4rem",
                    whiteSpace:"nowrap" }}>
                    {ROLES[userRole.role]?.emoji} {ROLES[userRole.role]?.label}
                  </span>
                )}
                {user.email === ADMIN_EMAIL && (
                  <span style={{ background:"rgba(79,142,247,0.15)", border:"1px solid rgba(79,142,247,0.3)",
                    color:"#4F8EF7", fontSize:"0.65rem", fontWeight:700, borderRadius:"4px", padding:"0.15rem 0.4rem" }}>
                    ADMIN
                  </span>
                )}
              </div>
              <button onClick={handleLogout} style={{ background:"transparent", border:`1px solid ${border}`,
                color:muted, borderRadius:"7px", padding:"0.35rem 0.75rem", fontSize:"0.78rem", cursor:"pointer" }}>
                Salir
              </button>
            </>
          ) : (
            <button onClick={handleLogin} style={{ background:"linear-gradient(135deg,#4F8EF7,#6366F1)",
              border:"none", color:"#fff", borderRadius:"8px", padding:"0.42rem 0.9rem",
              fontSize:"0.82rem", fontWeight:600, cursor:"pointer" }}>
              Iniciar sesión
            </button>
          )}
        </div>
      </nav>

      {/* HOME */}
      {screen === "home" && (
        <div style={{ maxWidth:"960px", margin:"0 auto", padding:"3rem 2rem", animation:"fadeIn 0.4s ease" }}>
          {/* Hero */}
          <div style={{ textAlign:"center", marginBottom:"3rem" }}>
            <img src={LOGO_INSA} alt="INSA" style={{ width:"72px", height:"72px", objectFit:"contain", marginBottom:"1rem", filter:"drop-shadow(0 0 20px rgba(79,142,247,0.25))" }} />
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(2rem,5vw,3.2rem)",
              fontWeight:900, lineHeight:1.1, marginBottom:"0.75rem",
              background:darkMode?"linear-gradient(135deg,#fff 50%,#3A3A3A)":"linear-gradient(135deg,#111 50%,#666)",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              Biblioteca INSA
            </h1>
            <p style={{ color:muted, fontSize:"0.95rem", maxWidth:"400px", margin:"0 auto 1.25rem", lineHeight:1.6 }}>
              Material educativo colaborativo del Instituto Nuestra Señora de la Asunción
            </p>
            {!user && (
              <button onClick={handleLogin} style={{ background:"linear-gradient(135deg,#4F8EF7,#6366F1)",
                border:"none", color:"#fff", borderRadius:"10px", padding:"0.65rem 1.35rem",
                fontSize:"0.85rem", fontWeight:600, cursor:"pointer" }}>
                Iniciar sesión con Google →
              </button>
            )}
          </div>

          {/* Announcement banner */}
          {(announcement || (user?.email === ADMIN_EMAIL)) && (
            <div style={{ background:darkMode?"rgba(79,142,247,0.07)":"rgba(79,142,247,0.05)",
              border:"1px solid rgba(79,142,247,0.25)", borderRadius:"12px",
              padding:"0.9rem 1.1rem", marginBottom:"1.5rem",
              display:"flex", alignItems:"flex-start", gap:"0.75rem" }}>
              <span style={{ fontSize:"1.1rem", flexShrink:0 }}>📢</span>
              <div style={{ flex:1 }}>
                {editingAnnouncement ? (
                  <div style={{ display:"flex", gap:"0.5rem", alignItems:"center" }}>
                    <input value={newAnnouncement} onChange={e=>setNewAnnouncement(e.target.value)}
                      placeholder="Escribe el anuncio del día..."
                      style={{ flex:1, background:darkMode?"#1A1A1A":"#F0F0F0", border:`1px solid ${border}`,
                        borderRadius:"8px", color:text, padding:"0.45rem 0.75rem", fontSize:"0.85rem", outline:"none" }} />
                    <button onClick={saveAnnouncement} style={{ background:"linear-gradient(135deg,#4F8EF7,#6366F1)",
                      border:"none", color:"#fff", borderRadius:"8px", padding:"0.45rem 0.9rem",
                      fontSize:"0.82rem", fontWeight:600, cursor:"pointer" }}>Guardar</button>
                    <button onClick={()=>setEditingAnnouncement(false)} style={{ background:"none", border:"none", color:muted, cursor:"pointer" }}>×</button>
                  </div>
                ) : (
                  <div style={{ display:"flex", alignItems:"center", gap:"0.75rem" }}>
                    <span style={{ color:text, fontSize:"0.88rem", flex:1 }}>
                      {announcement?.content || <span style={{ color:muted, fontStyle:"italic" }}>Sin anuncio activo</span>}
                    </span>
                    {user?.email === ADMIN_EMAIL && (
                      <button onClick={()=>{setEditingAnnouncement(true);setNewAnnouncement(announcement?.content||"");}}
                        style={{ background:"none", border:`1px solid ${border}`, color:muted,
                          borderRadius:"6px", padding:"0.2rem 0.6rem", fontSize:"0.72rem", cursor:"pointer" }}>
                        ✏️ Editar
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Grades grid + sidebar */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:"1.5rem", alignItems:"start" }}>
            <div>
              {/* History */}
              {history.length > 0 && (
                <div style={{ marginBottom:"1.5rem" }}>
                  <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.05rem", fontWeight:700,
                    color:text, marginBottom:"0.75rem" }}>🕐 Visto Recientemente</h3>
                  <div style={{ display:"flex", gap:"0.5rem", overflowX:"auto", paddingBottom:"0.25rem" }}>
                    {history.slice(0,6).map(h => (
                      <div key={h.id} onClick={()=>{setSelectedGrade(h.grade);setSelectedSubject(h.subject);setScreen("files");}}
                        style={{ background:card, border:`1px solid ${border}`, borderRadius:"10px",
                          padding:"0.65rem 0.85rem", cursor:"pointer", flexShrink:0, minWidth:"140px", maxWidth:"170px",
                          transition:"border-color 0.15s" }}
                        onMouseEnter={e=>e.currentTarget.style.borderColor="#4F8EF766"}
                        onMouseLeave={e=>e.currentTarget.style.borderColor=border}>
                        <div style={{ fontSize:"1.1rem", marginBottom:"0.25rem" }}>{getFileIcon(h.file_type)}</div>
                        <div style={{ color:text, fontSize:"0.78rem", fontWeight:600, overflow:"hidden",
                          textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{h.name}</div>
                        <div style={{ color:muted, fontSize:"0.68rem", marginTop:"0.15rem" }}>{h.grade} · {h.subject}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.1rem", fontWeight:700,
                color:text, marginBottom:"1rem" }}>Grados</h3>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:"0.7rem" }}>
                {GRADES.map((grade, i) => (
                  <div key={grade} className="grade-card"
                    onClick={()=>{setSelectedGrade(grade);setScreen("subjects");}}
                    style={{ background:card, border:`1px solid ${border}`, borderRadius:"13px",
                      padding:"1.15rem", cursor:"pointer", display:"flex", flexDirection:"column", gap:"0.6rem" }}>
                    <div style={{ width:"40px", height:"40px", borderRadius:"9px",
                      background:"linear-gradient(135deg,#4F8EF712,#6366F112)", border:"1px solid #4F8EF722",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:"1.1rem", fontWeight:900, color:"#4F8EF7", fontFamily:"'Playfair Display',serif" }}>
                      {i+6}
                    </div>
                    <div>
                      <div style={{ fontWeight:600, fontSize:"0.95rem", color:text }}>{grade}</div>
                      <div style={{ color:muted, fontSize:"0.75rem", marginTop:"0.1rem" }}>
                        {getSubjects(grade).length} materias
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Top files */}
              {topFiles.length > 0 && (
                <div style={{ marginTop:"1.5rem" }}>
                  <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.1rem", fontWeight:700,
                    color:text, marginBottom:"0.85rem" }}>🔥 Más Descargados</h3>
                  <div style={{ display:"flex", flexDirection:"column", gap:"0.5rem" }}>
                    {topFiles.map((f,i) => (
                      <div key={f.id} onClick={()=>{setSelectedGrade(f.grade);setSelectedSubject(f.subject);setScreen("files");}}
                        style={{ background:card, border:`1px solid ${border}`, borderRadius:"11px",
                          padding:"0.85rem 1rem", cursor:"pointer", display:"flex", alignItems:"center", gap:"0.75rem",
                          transition:"border-color 0.2s" }}
                        onMouseEnter={e=>e.currentTarget.style.borderColor="#4F8EF766"}
                        onMouseLeave={e=>e.currentTarget.style.borderColor=border}>
                        <div style={{ width:"28px", height:"28px", borderRadius:"6px",
                          background:`${["#FFD700","#C0C0C0","#CD7F32"][i]}18`,
                          display:"flex", alignItems:"center", justifyContent:"center",
                          fontSize:"0.85rem", fontWeight:800, color:["#FFD700","#C0C0C0","#CD7F32"][i] }}>
                          {i+1}
                        </div>
                        <span style={{ fontSize:"1.1rem" }}>{getFileIcon(f.file_type)}</span>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ color:text, fontWeight:600, fontSize:"0.85rem", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{f.name}</div>
                          <div style={{ color:muted, fontSize:"0.72rem" }}>{f.grade} · {f.subject}</div>
                        </div>
                        <span style={{ color:"#4F8EF7", fontSize:"0.78rem", fontWeight:600 }}>⬇ {f.download_count||0}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar: Ranking */}
            <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
              <div style={{ background:card, border:`1px solid ${border}`, borderRadius:"14px", padding:"1.25rem" }}>
                <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1rem", fontWeight:700,
                  color:text, marginBottom:"1rem", display:"flex", alignItems:"center", gap:"0.5rem" }}>
                  🏆 Top Colaboradores
                </h3>
                {ranking.length === 0 ? (
                  <div style={{ color:muted, fontSize:"0.82rem", textAlign:"center", padding:"1rem 0" }}>Aún sin datos</div>
                ) : ranking.map((r, i) => {
                  const medals = ["🥇","🥈","🥉","4️⃣","5️⃣"];
                  const roleInfo = allUserRoles[r.email];
                  const role = ROLES[roleInfo?.role || "lector"];
                  return (
                    <div key={r.email} style={{ display:"flex", alignItems:"center", gap:"0.65rem",
                      padding:"0.6rem 0", borderBottom:i<ranking.length-1?`1px solid ${border}`:"none" }}>
                      <span style={{ fontSize:"1.1rem" }}>{medals[i]}</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ color:text, fontWeight:600, fontSize:"0.85rem",
                          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:"0.35rem" }}>
                          {r.name||"Anónimo"}
                          <span style={{ background:`${role.color}18`, border:`1px solid ${role.color}44`,
                            color:role.color, fontSize:"0.6rem", fontWeight:700, borderRadius:"4px",
                            padding:"0.1rem 0.35rem", flexShrink:0 }}>
                            {role.emoji} {role.label}
                          </span>
                        </div>
                        <div style={{ color:muted, fontSize:"0.7rem", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {r.email}
                        </div>
                      </div>
                      <div style={{ background:"rgba(79,142,247,0.12)", border:"1px solid rgba(79,142,247,0.25)",
                        color:"#4F8EF7", borderRadius:"6px", padding:"0.15rem 0.5rem",
                        fontSize:"0.75rem", fontWeight:700, flexShrink:0 }}>
                        {r.count} {r.count===1?"archivo":"archivos"}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Role filter card */}
              <div style={{ background:card, border:`1px solid ${border}`, borderRadius:"14px", padding:"1.1rem" }}>
                <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"0.95rem", fontWeight:700,
                  color:text, marginBottom:"0.75rem" }}>👥 Filtrar por Rol</h3>
                <div style={{ display:"flex", flexDirection:"column", gap:"0.35rem" }}>
                  <button onClick={()=>setRoleFilter(null)} style={{
                    background:roleFilter===null?`rgba(79,142,247,0.12)`:"transparent",
                    border:`1px solid ${roleFilter===null?"#4F8EF7":border}`,
                    color:roleFilter===null?"#4F8EF7":muted,
                    borderRadius:"8px", padding:"0.4rem 0.75rem", fontSize:"0.78rem",
                    cursor:"pointer", textAlign:"left", fontWeight:roleFilter===null?600:400 }}>
                    Todos los roles
                  </button>
                  {Object.entries(ROLES).map(([key, r]) => (
                    <button key={key} onClick={()=>setRoleFilter(roleFilter===key?null:key)} style={{
                      background:roleFilter===key?`${r.color}15`:"transparent",
                      border:`1px solid ${roleFilter===key?r.color:border}`,
                      color:roleFilter===key?r.color:muted,
                      borderRadius:"8px", padding:"0.4rem 0.75rem", fontSize:"0.78rem",
                      cursor:"pointer", textAlign:"left", fontWeight:roleFilter===key?600:400,
                      display:"flex", alignItems:"center", gap:"0.4rem" }}>
                      <span>{r.emoji}</span> {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Admin role management */}
              {user?.email === ADMIN_EMAIL && (
                <button onClick={loadRoleAdmin} style={{ background:"linear-gradient(135deg,#A78BFA15,#6366F115)",
                  border:"1px solid #A78BFA44", borderRadius:"14px", padding:"1.1rem",
                  cursor:"pointer", width:"100%", textAlign:"left" }}>
                  <div style={{ fontSize:"1.3rem", marginBottom:"0.35rem" }}>🛡️</div>
                  <div style={{ color:text, fontWeight:600, fontSize:"0.88rem", marginBottom:"0.2rem" }}>Panel de Roles</div>
                  <div style={{ color:muted, fontSize:"0.75rem" }}>Asignar roles manualmente</div>
                </button>
              )}

              {/* Search shortcut card */}
              <div onClick={()=>setShowGlobalSearch(true)} style={{ background:"linear-gradient(135deg,#4F8EF710,#6366F110)",
                border:"1px solid #4F8EF730", borderRadius:"14px", padding:"1.25rem",
                cursor:"pointer", transition:"all 0.2s" }}
                onMouseEnter={e=>e.currentTarget.style.borderColor="#4F8EF766"}
                onMouseLeave={e=>e.currentTarget.style.borderColor="#4F8EF730"}>
                <div style={{ fontSize:"1.5rem", marginBottom:"0.5rem" }}>🔍</div>
                <div style={{ color:text, fontWeight:600, fontSize:"0.9rem", marginBottom:"0.25rem" }}>Búsqueda Global</div>
                <div style={{ color:muted, fontSize:"0.78rem" }}>Busca en todos los grados y materias a la vez</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBJECTS */}
      {screen === "subjects" && selectedGrade && (
        <div style={{ maxWidth:"960px", margin:"0 auto", padding:"2.5rem 2rem", animation:"fadeIn 0.3s ease" }}>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.8rem",
            fontWeight:900, color:text, marginBottom:"0.4rem" }}>{selectedGrade}</h2>
          <p style={{ color:muted, fontSize:"0.85rem", marginBottom:"2rem" }}>Selecciona una materia para acceder al material</p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))", gap:"0.75rem" }}>
            {subjects.map(sub => {
              const c = SUBJECT_COLORS[sub] || "#4F8EF7";
              return (
                <div key={sub} className="subj-card"
                  onClick={()=>{setSelectedSubject(sub);setScreen("files");setSearch("");setFiles([]);}}
                  style={{ background:`${c}08`, border:`1px solid ${c}20`, borderRadius:"13px",
                    padding:"1.1rem", cursor:"pointer", display:"flex", flexDirection:"column", gap:"0.7rem" }}>
                  <div style={{ width:"40px", height:"40px", borderRadius:"9px",
                    background:`${c}18`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.25rem" }}>
                    {SUBJECT_ICONS[sub]||"📂"}
                  </div>
                  <div style={{ fontWeight:600, fontSize:"0.88rem", color:text }}>{sub}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FILES */}
      {screen === "files" && selectedGrade && selectedSubject && (
        <div style={{ maxWidth:"860px", margin:"0 auto", padding:"2rem", animation:"fadeIn 0.3s ease" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
            marginBottom:"1.5rem", gap:"1rem", flexWrap:"wrap" }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:"0.65rem", marginBottom:"0.3rem" }}>
                <div style={{ width:"36px", height:"36px", borderRadius:"9px",
                  background:`${color}18`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.2rem" }}>
                  {SUBJECT_ICONS[selectedSubject]||"📂"}
                </div>
                <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.5rem", fontWeight:900, color:text }}>
                  {selectedSubject}
                </h2>
              </div>
              <p style={{ color:muted, fontSize:"0.8rem" }}>{selectedGrade} · {filteredFiles.length} archivos</p>
            </div>
            {user ? (
              <button onClick={()=>setShowUpload(true)} style={{
                background:`linear-gradient(135deg,${color},${color}88)`,
                border:"none", borderRadius:"9px", color:"#fff",
                padding:"0.65rem 1.1rem", fontWeight:700, fontSize:"0.88rem", cursor:"pointer" }}>
                + Subir Archivo
              </button>
            ) : (
              <button onClick={handleLogin} style={{ background:card, border:`1px solid ${border}`,
                borderRadius:"9px", color:muted, padding:"0.65rem 1.1rem",
                fontWeight:600, fontSize:"0.82rem", cursor:"pointer" }}>
                🔒 Inicia sesión para subir
              </button>
            )}
          </div>

          <div style={{ display:"flex", gap:"0.65rem", marginBottom:"0.75rem", flexWrap:"wrap" }}>
            <div style={{ flex:1, minWidth:"180px", position:"relative" }}>
              <span style={{ position:"absolute", left:"0.8rem", top:"50%", transform:"translateY(-50%)", color:muted, fontSize:"0.85rem" }}>🔍</span>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar archivos..."
                style={{ width:"100%", background:card, border:`1px solid ${border}`,
                  borderRadius:"9px", color:text, padding:"0.6rem 0.8rem 0.6rem 2.1rem", fontSize:"0.85rem", outline:"none" }} />
            </div>
            <select value={sort} onChange={e=>setSort(e.target.value)}
              style={{ background:card, border:`1px solid ${border}`, borderRadius:"9px",
                color:muted, padding:"0.6rem 0.8rem", fontSize:"0.82rem", cursor:"pointer" }}>
              <option value="date">📅 Más reciente</option>
              <option value="downloads">⬇ Más descargados</option>
              <option value="name">🔤 Nombre A-Z</option>
            </select>
          </div>
          {/* Tag filters */}
          <div style={{ display:"flex", gap:"0.35rem", flexWrap:"wrap", marginBottom:"0.5rem" }}>
            {ALL_TAGS.map(tag => {
              const active = activeTag === tag;
              return (
                <button key={tag} onClick={()=>setActiveTag(active?null:tag)} style={{
                  background:active?`${color}20`:(darkMode?"#1A1A1A":"#F0F0F0"),
                  border:`1px solid ${active?color:(darkMode?"#2A2A2A":"#E0E0E0")}`,
                  color:active?color:muted,
                  borderRadius:"20px", padding:"0.2rem 0.65rem", fontSize:"0.73rem",
                  cursor:"pointer", transition:"all 0.15s", fontWeight:active?600:400 }}>
                  {tag}
                </button>
              );
            })}
          </div>
          {/* Role filters */}
          <div style={{ display:"flex", gap:"0.35rem", flexWrap:"wrap", marginBottom:"1rem" }}>
            <button onClick={()=>setRoleFilter(null)} style={{
              background:roleFilter===null?(darkMode?"#222":"#E8E8E8"):"transparent",
              border:`1px solid ${roleFilter===null?(darkMode?"#444":"#999"):border}`,
              color:roleFilter===null?text:muted,
              borderRadius:"20px", padding:"0.2rem 0.65rem", fontSize:"0.73rem",
              cursor:"pointer", fontWeight:roleFilter===null?600:400 }}>
              👥 Todos
            </button>
            {Object.entries(ROLES).map(([key, r]) => (
              <button key={key} onClick={()=>setRoleFilter(roleFilter===key?null:key)} style={{
                background:roleFilter===key?`${r.color}18`:"transparent",
                border:`1px solid ${roleFilter===key?r.color:border}`,
                color:roleFilter===key?r.color:muted,
                borderRadius:"20px", padding:"0.2rem 0.65rem", fontSize:"0.73rem",
                cursor:"pointer", fontWeight:roleFilter===key?600:400 }}>
                {r.emoji} {r.label}
              </button>
            ))}
          </div>

          {newFileFlash && (
            <div style={{ background:"rgba(52,211,153,0.08)", border:"1px solid rgba(52,211,153,0.2)",
              borderRadius:"9px", padding:"0.65rem 1rem", marginBottom:"1rem",
              color:"#34D399", fontSize:"0.82rem", fontWeight:600, animation:"slideIn 0.3s ease" }}>
              🟢 Nuevo archivo disponible en tiempo real
            </div>
          )}

          {loadingFiles ? (
            <div style={{ textAlign:"center", padding:"4rem", color:muted }}>Cargando archivos...</div>
          ) : filteredFiles.length === 0 ? (
            <div style={{ textAlign:"center", padding:"3.5rem 2rem",
              background:card, border:`1px solid ${border}`, borderRadius:"14px" }}>
              <div style={{ fontSize:"2.5rem", marginBottom:"0.75rem", opacity:0.4 }}>📭</div>
              <div style={{ color:muted }}>{activeTag?`Sin archivos con etiqueta "${activeTag}"`:search?"No se encontraron archivos":"Aún no hay archivos aquí"}</div>
              {!search && !activeTag && user && <div style={{ color:muted, fontSize:"0.82rem", marginTop:"0.4rem" }}>¡Sé el primero en subir material!</div>}
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:"0.65rem" }}>
              {filteredFiles.map(file => (
                <FileCard key={file.id} file={file} color={color} currentUser={user}
                  onDelete={id=>setFiles(prev=>prev.filter(f=>f.id!==id))}
                  onComment={f=>setCommentFile(f)}
                  onDownload={id=>setFiles(prev=>prev.map(f=>f.id===id?{...f,download_count:(f.download_count||0)+1}:f))}
                  onView={addToHistory}
                  darkMode={darkMode}
                  allUserRoles={allUserRoles} />
              ))}
            </div>
          )}
        </div>
      )}

      {showUpload && (
        <UploadModal grade={selectedGrade} subject={selectedSubject} user={user}
          onClose={()=>setShowUpload(false)}
          onUpload={f=>setFiles(prev=>[f,...prev])} />
      )}

      {commentFile && (
        <CommentsModal file={commentFile} user={user} onClose={()=>setCommentFile(null)} />
      )}

      {/* PROFILE MODAL */}
      {showProfile && user && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.88)", backdropFilter:"blur(10px)",
          zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" }}>
          <div style={{ background:darkMode?"#111":"#FFF", border:`1px solid ${border}`, borderRadius:"20px",
            width:"100%", maxWidth:"560px", maxHeight:"85vh", overflow:"hidden", display:"flex", flexDirection:"column" }}>
            <div style={{ padding:"1.5rem", borderBottom:`1px solid ${border}`, display:"flex", alignItems:"center", gap:"1rem" }}>
              {user.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="" style={{ width:"52px", height:"52px", borderRadius:"50%", border:`2px solid ${border}` }} />
              ) : (
                <div style={{ width:"52px", height:"52px", borderRadius:"50%", background:"linear-gradient(135deg,#4F8EF7,#6366F1)",
                  display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:"1.3rem", fontWeight:700 }}>
                  {(user.user_metadata?.full_name||user.email||"?")[0].toUpperCase()}
                </div>
              )}
              <div style={{ flex:1 }}>
                <div style={{ color:text, fontWeight:700, fontSize:"1rem" }}>{user.user_metadata?.full_name || "Usuario"}</div>
                <div style={{ color:muted, fontSize:"0.8rem" }}>{user.email}</div>
                <div style={{ color:"#4F8EF7", fontSize:"0.78rem", marginTop:"0.2rem" }}>
                  {profileFiles.length} {profileFiles.length===1?"archivo subido":"archivos subidos"}
                </div>
              </div>
              <button onClick={()=>setShowProfile(false)} style={{ background:"none", border:"none", color:muted, fontSize:"1.5rem", cursor:"pointer" }}>×</button>
            </div>
            <div style={{ overflowY:"auto", padding:"1rem", display:"flex", flexDirection:"column", gap:"0.5rem" }}>
              {profileFiles.length === 0 ? (
                <div style={{ textAlign:"center", padding:"2rem", color:muted, fontSize:"0.88rem" }}>
                  Aún no has subido ningún archivo
                </div>
              ) : profileFiles.map(f => (
                <div key={f.id} onClick={()=>{setSelectedGrade(f.grade);setSelectedSubject(f.subject);setScreen("files");setShowProfile(false);}}
                  style={{ background:darkMode?"#1A1A1A":"#F5F5F0", borderRadius:"10px", padding:"0.75rem 1rem",
                    cursor:"pointer", display:"flex", gap:"0.75rem", alignItems:"center",
                    border:`1px solid ${border}`, transition:"border-color 0.15s" }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor="#4F8EF766"}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=border}>
                  <span style={{ fontSize:"1.3rem" }}>{getFileIcon(f.file_type)}</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ color:text, fontWeight:600, fontSize:"0.86rem", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{f.name}</div>
                    <div style={{ color:muted, fontSize:"0.72rem" }}>{f.grade} · {f.subject} · {formatDate(f.uploaded_at)}</div>
                    {f.tags && f.tags.length > 0 && (
                      <div style={{ display:"flex", gap:"0.25rem", marginTop:"0.2rem", flexWrap:"wrap" }}>
                        {f.tags.map(tag=>(
                          <span key={tag} style={{ background:"rgba(79,142,247,0.12)", color:"#4F8EF7",
                            borderRadius:"20px", padding:"0.05rem 0.4rem", fontSize:"0.65rem" }}>{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span style={{ color:muted, fontSize:"0.72rem" }}>⬇ {f.download_count||0}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ROLE ADMIN PANEL */}
      {showRoleAdmin && user?.email === ADMIN_EMAIL && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.88)", backdropFilter:"blur(10px)",
          zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" }}>
          <div style={{ background:darkMode?"#111":"#FFF", border:`1px solid ${border}`, borderRadius:"20px",
            width:"100%", maxWidth:"580px", maxHeight:"85vh", overflow:"hidden", display:"flex", flexDirection:"column" }}>
            <div style={{ padding:"1.25rem 1.5rem", borderBottom:`1px solid ${border}`,
              display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div>
                <h2 style={{ color:text, fontWeight:700, fontSize:"1.05rem", fontFamily:"'Playfair Display',serif" }}>🛡️ Panel de Roles</h2>
                <p style={{ color:muted, fontSize:"0.78rem", marginTop:"0.15rem" }}>Asigna roles manualmente a los usuarios</p>
              </div>
              <button onClick={()=>setShowRoleAdmin(false)} style={{ background:"none", border:"none", color:muted, fontSize:"1.4rem", cursor:"pointer" }}>×</button>
            </div>
            {/* Role legend */}
            <div style={{ padding:"0.75rem 1.5rem", borderBottom:`1px solid ${border}`,
              display:"flex", gap:"0.5rem", flexWrap:"wrap" }}>
              {Object.entries(ROLES).map(([key, r]) => (
                <span key={key} style={{ background:`${r.color}15`, border:`1px solid ${r.color}33`,
                  color:r.color, borderRadius:"6px", padding:"0.2rem 0.6rem", fontSize:"0.72rem", fontWeight:700 }}>
                  {r.emoji} {r.label} {key!=="maestro"?`(${key==="lector"?"0 archivos":key==="participante"?"1–3":"4–9+"})` : "(manual)"}
                </span>
              ))}
            </div>
            <div style={{ overflowY:"auto", padding:"0.75rem" }}>
              {roleUsers.length === 0 ? (
                <div style={{ textAlign:"center", padding:"2rem", color:muted }}>Sin usuarios registrados aún</div>
              ) : roleUsers.map(u => {
                const role = ROLES[u.role] || ROLES.lector;
                return (
                  <div key={u.user_id} style={{ display:"flex", alignItems:"center", gap:"0.75rem",
                    padding:"0.75rem 0.5rem", borderBottom:`1px solid ${border}` }}>
                    <div style={{ width:"34px", height:"34px", borderRadius:"50%",
                      background:`${role.color}20`, display:"flex", alignItems:"center",
                      justifyContent:"center", fontSize:"1rem", flexShrink:0 }}>
                      {role.emoji}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ color:text, fontWeight:600, fontSize:"0.85rem",
                        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {u.user_name || "Anónimo"}
                        {u.manually_set && <span style={{ color:"#A78BFA", fontSize:"0.65rem", marginLeft:"0.4rem" }}>✦ manual</span>}
                      </div>
                      <div style={{ color:muted, fontSize:"0.72rem" }}>{u.user_email}</div>
                    </div>
                    <div style={{ display:"flex", gap:"0.3rem", flexWrap:"wrap", justifyContent:"flex-end" }}>
                      {Object.entries(ROLES).map(([key, r]) => (
                        <button key={key} onClick={()=>setUserRoleAdmin(u.user_id, key)}
                          disabled={u.role === key}
                          style={{ background:u.role===key?`${r.color}20`:"transparent",
                            border:`1px solid ${u.role===key?r.color:border}`,
                            color:u.role===key?r.color:muted,
                            borderRadius:"6px", padding:"0.2rem 0.5rem",
                            fontSize:"0.68rem", cursor:u.role===key?"default":"pointer",
                            fontWeight:u.role===key?700:400, opacity:u.role===key?1:0.7 }}>
                          {r.emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <footer style={{ borderTop:`1px solid ${border}`, padding:"1.25rem 2rem", marginTop:"4rem",
        textAlign:"center", color:muted, fontSize:"0.76rem", letterSpacing:"0.02em" }}>
        Instituto Nuestra Señora de la Asunción · Biblioteca Digital · {new Date().getFullYear()}
      </footer>
    </div>
  );
}
