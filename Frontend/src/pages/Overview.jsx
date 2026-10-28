import { useState, useEffect } from "react";
import {
  Image as ImageIcon,
  Gauge,
  Layers3,
  ShieldCheck,
  Sparkles,
  FolderOpen,
  Settings2,
  ArrowRight,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import StatCard from "../components/StatCard";
import UploadDropzone from "../components/UploadDropzone";

export default function Overview() {
  const [selectedFile, setSelectedFile] = useState(null);

  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadStats() {
      try {
        const response = await fetch(
          "https://yhzobik9cl.execute-api.ap-southeast-2.amazonaws.com/dashboard-stats",
        );

        if (!response.ok) {
          throw new Error("Could not load dashboard statistics");
        }

        const data = await response.json();

        if (active) {
          setStats(data);
          setStatsError(false);
        }
      } catch (error) {
        console.error("Dashboard statistics error:", error);
        if (active) setStatsError(true);
      }
    }

    loadStats();

    const intervalId = setInterval(loadStats, 30000);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, []);

  function formatMB(bytes) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  return (
    <div className="page-stack">
      <section className="welcome-row animate-in">
        <div>
          <div className="welcome-tag">
            <Sparkles size={14} /> YOUR IMAGE WORKSPACE
          </div>
          <h1>
            Make every image <span>work smarter.</span>
          </h1>
          <p>Optimize, transform, and prepare your images for anything.</p>
          <Link className="welcome-link" to="/uploads">
            Explore image processing <ArrowRight size={16} />
          </Link>
        </div>
        <div className="welcome-art" aria-hidden="true">
          <div className="art-glow" />
          <div className="art-frame frame-back">
            <ImageIcon size={34} />
          </div>
          <div className="art-frame frame-front">
            <Sparkles size={42} />
          </div>
        </div>
      </section>

      <section className="stats-grid">
        <StatCard
          icon={ImageIcon}
          label="Images uploaded"
          value={stats ? stats.imagesUploaded.toLocaleString() : "—"}
          note={
            statsError
              ? "Unable to load"
              : stats
                ? "From Amazon S3"
                : "Loading..."
          }
        />

        <StatCard
          icon={Gauge}
          label="Storage saved"
          value={stats ? formatMB(stats.savedBytes) : "—"}
          note={
            stats
              ? `${stats.savingsPercent}% reduction`
              : statsError
                ? "Unable to load"
                : "Calculating..."
          }
        />

        <StatCard
          icon={Layers3}
          label="Images processed"
          value={stats ? stats.imagesProcessed.toLocaleString() : "—"}
          note={
            stats
              ? `${stats.thumbnailsCreated} thumbnails created`
              : statsError
                ? "Unable to load"
                : "Loading..."
          }
        />

        <StatCard
          icon={ShieldCheck}
          label="Processing engine"
          value="Ready"
          note="AWS configured"
        />
      </section>

      <section className="workspace-grid">
        <article className="panel upload-panel animate-in">
          <div className="section-heading">
            <div>
              <span className="eyebrow">GET STARTED</span>
              <h2>Image processing</h2>
            </div>
            <span className="step-pill">STEP 01</span>
          </div>
          <UploadDropzone onFileChange={setSelectedFile} />
          <div className="privacy-note">
            <ShieldCheck size={16} />
            <span>
              Select an image here, continue to image processing, and upload it
              securely to your private AWS S3 bucket.
            </span>
          </div>
          <Link
            className={`primary-button ${!selectedFile ? "button-disabled" : ""}`}
            to="/uploads"
            state={{ file: selectedFile }}
            onClick={(event) => {
              if (!selectedFile) {
                event.preventDefault();
              }
            }}
            aria-disabled={!selectedFile}
          >
            <FolderOpen size={17} />
            {selectedFile
              ? "Continue to image processing"
              : "Choose an image to begin"}
            <ArrowRight size={17} />
          </Link>
        </article>

        <aside className="panel pipeline-panel">
          <div className="section-heading">
            <div>
              <span className="eyebrow">UNDER THE HOOD</span>
              <h2>Processing pipeline</h2>
            </div>
            <span className="pipeline-status">
              <span /> AWS workflow
            </span>
          </div>
          <div className="pipeline-list">
            <PipelineStep
              number="01"
              icon={FolderOpen}
              title="Original image"
              description="Store in Amazon S3"
              done
            />
            <PipelineStep
              number="02"
              icon={Settings2}
              title="Image optimization"
              description="Resize and convert to WebP"
            />
            <PipelineStep
              number="03"
              icon={ImageIcon}
              title="Thumbnail generation"
              description="Create a compact preview"
            />
            <PipelineStep
              number="04"
              icon={Sparkles}
              title="AI discovery"
              description="Captions and tags — planned"
            />
          </div>
          <div className="pipeline-footer">
            <Zap size={16} /> Event-driven processing with AWS Lambda
          </div>
        </aside>
      </section>
    </div>
  );
}

function PipelineStep({ number, icon: Icon, title, description, done }) {
  return (
    <div className={`pipeline-step ${done ? "complete" : ""}`}>
      <div className="pipeline-icon">
        <Icon size={18} />
      </div>
      <div>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
      <span className="step-number">{number}</span>
    </div>
  );
}
