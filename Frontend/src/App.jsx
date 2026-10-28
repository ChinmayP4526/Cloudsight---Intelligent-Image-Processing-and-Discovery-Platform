
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import {
  Aperture, ArrowDownToLine, ArrowRight, Check, ChevronDown,
  CircleHelp, CloudUpload, FileImage, FolderOpen, Gauge,
  Image as ImageIcon, Layers3, LayoutDashboard, LoaderCircle,
  Menu, MoreHorizontal, Settings2, ShieldCheck, Sparkles,
  Upload, X, Zap
} from "lucide-react";
import "./App.css";

function Sidebar() {
  return (
    <aside className="sidebar">
      <a className="brand" href="#home">
        <span className="brand-mark"><Aperture size={23} /></span>
        <span>cloud<span className="brand-accent">sight</span><small>IMAGE INTELLIGENCE</small></span>
      </a>

      <div className="side-label">WORKSPACE</div>
      <nav className="nav-links">
        <a className="nav-link active" href="#home"><LayoutDashboard size={18} /> Overview</a>
        <a className="nav-link" href="#upload"><CloudUpload size={18} /> Image processing</a>
        <a className="nav-link" href="#results"><Layers3 size={18} /> My results <span className="nav-count">0</span></a>
      </nav>

      <div className="sidebar-bottom">
        <div className="usage-card">
          <div className="usage-icon"><Zap size={17} /></div>
          <strong>Serverless power</strong>
          <p>Powered by AWS Lambda and Amazon S3.</p>
          <div className="usage-line"><span /></div>
          <small>CloudSight processing pipeline</small>
        </div>
        <a className="nav-link" href="#settings"><Settings2 size={18} /> Settings</a>
        <a className="nav-link" href="#help"><CircleHelp size={18} /> Help & support</a>
        <div className="profile">
          <div className="avatar">CS</div>
          <div className="profile-copy"><strong>CloudSight User</strong><small>Personal workspace</small></div>
          <MoreHorizontal size={19} />
        </div>
      </div>
    </aside>
  );
}

function Topbar() {
  return (
    <header className="topbar">
      <div className="breadcrumb"><span>Workspace</span><span className="crumb-slash">/</span><strong>Overview</strong></div>
      <div className="topbar-right">
        <span className="system-status"><span /> Image engine configured</span>
        <button className="icon-button" aria-label="Settings"><Settings2 size={18} /></button>
        <div className="avatar avatar-small">CS</div>
      </div>
    </header>
  );
}

function StatCard({ icon: Icon, label, value, note }) {
  return (
    <article className="stat-card">
      <div className="stat-top">
        <span className="stat-icon"><Icon size={19} /></span>
        <span className="stat-note">{note}</span>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </article>
  );
}

function UploadPanel({ onFile }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  function acceptFile(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file.");
      return;
    }
    onFile(file);
  }

  return (
    <div
      className={`dropzone ${dragging ? "dragging" : ""}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        acceptFile(e.dataTransfer.files?.[0]);
      }}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
      role="button"
      tabIndex={0}
      aria-label="Choose an image to preview"
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        hidden
        onChange={(e) => {
          acceptFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <div className="upload-icon"><CloudUpload size={27} /></div>
      <h3>Drop your image here</h3>
      <p>Drag and drop an image, or <span className="browse-link">browse files</span></p>
      <div className="upload-formats">
        <span>JPG</span><span>PNG</span><span>WEBP</span><span>AVIF</span>
        <span className="size-limit">Up to 20 MB recommended</span>
      </div>
    </div>
  );
}

function ImagePreview({ file, onRemove }) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  if (!file) return null;

  return (
    <div className="preview-card">
      <div className="preview-image-wrap">
        {url && <img src={url} alt="Selected image preview" />}
        <button className="remove-image" onClick={onRemove} aria-label="Remove image"><X size={16} /></button>
      </div>
      <div className="preview-details">
        <div className="file-icon"><FileImage size={20} /></div>
        <div className="file-copy">
          <strong title={file.name}>{file.name}</strong>
          <small>{(file.size / (1024 * 1024)).toFixed(2)} MB · {file.type || "Image file"}</small>
        </div>
        <span className="ready-tag"><Check size={13} /> Ready</span>
      </div>
    </div>
  );
}

function ResultsPanel() {
  return (
    <section className="results-section" id="results">
      <div className="section-heading">
        <div><span className="eyebrow">YOUR LIBRARY</span><h2>Recent results</h2></div>
        <button className="text-button">View all <ArrowRight size={15} /></button>
      </div>
      <div className="empty-results">
        <div className="empty-art"><ImageIcon size={27} /><Sparkles className="empty-sparkle" size={17} /></div>
        <h3>Your image library starts here</h3>
        <p>Once you connect AWS uploads, your optimized images and thumbnails will appear here.</p>
        <span className="pipeline-label"><span /> AWS results not connected yet</span>
      </div>
    </section>
  );
}

export default function App() {
  const mainRef = useRef(null);
  const [file, setFile] = useState(null);
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".animate-in", {
        y: 18, opacity: 0, duration: 0.65,
        stagger: 0.09, ease: "power3.out", clearProps: "all"
      });
      gsap.from(".stat-card", {
        y: 14, opacity: 0, duration: 0.5,
        stagger: 0.1, delay: 0.15, ease: "power2.out"
      });
    }, mainRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="app-shell" id="home">
      <div className={`mobile-overlay ${mobileNav ? "show" : ""}`} onClick={() => setMobileNav(false)} />
      <div className={mobileNav ? "sidebar-wrap open" : "sidebar-wrap"}>
        <Sidebar />
      </div>

      <main className="main-area" ref={mainRef}>
        <Topbar />
        <div className="page-content">
          <section className="welcome-row animate-in">
            <div>
              <div className="welcome-tag"><Sparkles size={14} /> YOUR AI-READY IMAGE WORKSPACE</div>
              <h1>Make every image <span>work smarter.</span></h1>
              <p>Optimize, transform, and prepare your images for anything.</p>
            </div>
            <div className="welcome-art" aria-hidden="true">
              <div className="art-glow" />
              <div className="art-frame frame-back"><ImageIcon size={34} /></div>
              <div className="art-frame frame-front"><Aperture size={45} /></div>
              <Sparkles className="art-sparkle" size={22} />
            </div>
          </section>

          <section className="stats-grid animate-in">
            <StatCard icon={ImageIcon} label="Images uploaded" value="—" note="Awaiting AWS" />
            <StatCard icon={Gauge} label="Storage saved" value="—" note="Awaiting results" />
            <StatCard icon={Layers3} label="Images processed" value="—" note="Awaiting AWS" />
            <StatCard icon={ShieldCheck} label="Processing status" value="Ready" note="Frontend demo" />
          </section>

          <section className="workspace-grid" id="upload">
            <article className="panel upload-panel animate-in">
              <div className="section-heading">
                <div><span className="eyebrow">START CREATING</span><h2>Image processing</h2></div>
                <span className="step-pill"><span /> STEP 01</span>
              </div>
              <UploadPanel onFile={setFile} />
              <ImagePreview file={file} onRemove={() => setFile(null)} />
              <div className="privacy-note"><ShieldCheck size={16} /><span>Your selected image stays in this browser until we connect the AWS upload flow.</span></div>
              <button className="primary-button" disabled={!file} onClick={() => alert("Image preview is ready! Next, we will connect this button to your AWS upload flow.")}>
                <Upload size={17} /> {file ? "Image selected — connect AWS next" : "Select an image to begin"} <ArrowRight size={17} />
              </button>
            </article>

            <aside className="panel pipeline-panel animate-in">
              <div className="section-heading">
                <div><span className="eyebrow">HOW IT WORKS</span><h2>Processing pipeline</h2></div>
                <span className="pipeline-status"><span /> Preview</span>
              </div>
              <div className="pipeline-list">
                <div className="pipeline-step complete"><div className="pipeline-icon"><FolderOpen size={18} /></div><div><strong>Original image</strong><p>Upload to object storage</p></div><span className="step-number">01</span></div>
                <div className="pipeline-connector"><span /></div>
                <div className="pipeline-step"><div className="pipeline-icon"><Settings2 size={18} /></div><div><strong>Optimize image</strong><p>Resize and convert to WebP</p></div><span className="step-number">02</span></div>
                <div className="pipeline-connector"><span /></div>
                <div className="pipeline-step"><div className="pipeline-icon"><ImageIcon size={18} /></div><div><strong>Generate thumbnail</strong><p>Create a compact preview</p></div><span className="step-number">03</span></div>
                <div className="pipeline-connector"><span /></div>
                <div className="pipeline-step"><div className="pipeline-icon"><Sparkles size={18} /></div><div><strong>AI discovery</strong><p>Captions and tags — coming next</p></div><span className="step-number">04</span></div>
              </div>
              <div className="pipeline-footer"><Zap size={16} /><span>Built around an event-driven AWS workflow</span></div>
            </aside>
          </section>

          <div className="animate-in"><ResultsPanel /></div>
          <footer className="footer"><span>© 2026 CloudSight</span><span>Built for smarter image workflows <Sparkles size={13} /></span></footer>
        </div>
      </main>
      <button className="mobile-menu" onClick={() => setMobileNav(!mobileNav)} aria-label="Toggle menu">
        {mobileNav ? <X size={21} /> : <Menu size={21} />}
      </button>
    </div>
  );
}
