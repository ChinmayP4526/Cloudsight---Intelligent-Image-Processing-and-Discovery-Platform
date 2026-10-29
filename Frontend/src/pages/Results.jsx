
import { useCallback, useEffect, useState } from "react";
import {
  Image as ImageIcon,
  Sparkles,
  ArrowUpRight,
  Download,
  RefreshCw,
  HardDrive,
  Clock3,
  AlertCircle,
  LoaderCircle,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";

const API_URL =
  "https://yhzobik9cl.execute-api.ap-southeast-2.amazonaws.com";

function formatBytes(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(date) {
  if (!date) return "Unknown date";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Unknown date";

  return parsed.toLocaleString();
}

export default function Results() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingKey, setDeletingKey] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);

  const fetchResults = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await fetch(`${API_URL}/results`);

      if (!response.ok) {
        throw new Error(`Could not load results (${response.status}).`);
      }

      const data = await response.json();

      setImages(data.images || []);
      setUpdatedAt(data.updatedAt || new Date().toISOString());
    } catch (err) {
      setError(err.message || "Failed to load processed images.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchResults();

    // Refresh before the 15-minute preview URLs expire.
    const interval = setInterval(() => {
      fetchResults(true);
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchResults]);

  const handleDelete = async (image) => {
    const confirmed = window.confirm(
      `Permanently delete "${image.fileName}" and its original image, optimized image, and thumbnail?`
    );

    if (!confirmed) return;

    setDeletingKey(image.key);
    setError("");
    setNotice("");

    try {
      const response = await fetch(`${API_URL}/delete-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: image.key,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Could not delete this image.");
      }

      setImages((current) =>
        current.filter((item) => item.key !== image.key)
      );

      setNotice(`"${image.fileName}" was deleted successfully.`);

      // Refresh the gallery with fresh results and preview URLs.
      await fetchResults(true);
    } catch (err) {
      setError(err.message || "Deletion failed. Please try again.");
    } finally {
      setDeletingKey(null);
    }
  };

  return (
    <div className="page-container results-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <Sparkles size={15} />
            IMAGE DISCOVERY
          </div>

          <h1>Processed Results</h1>

          <p className="page-description">
            View, preview, download, and manage your optimized images.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-secondary results-refresh"
          onClick={() => fetchResults(true)}
          disabled={loading || refreshing || Boolean(deletingKey)}
        >
          <RefreshCw
            size={16}
            className={refreshing ? "spin-animation" : ""}
          />
          Refresh
        </button>
      </div>

      <div className="results-summary">
        <div className="results-summary-icon">
          <ImageIcon size={22} />
        </div>

        <div>
          <div className="results-summary-value">
            {loading ? "—" : images.length}
          </div>
          <div className="results-summary-label">Processed images</div>
        </div>

        <div className="results-updated">
          <Clock3 size={14} />
          Updated: {updatedAt ? formatDate(updatedAt) : "—"}
        </div>
      </div>

      {notice && (
        <div className="results-message results-success" role="status">
          <CheckCircle2 size={18} />
          <span>{notice}</span>
          <button
            type="button"
            className="results-dismiss"
            onClick={() => setNotice("")}
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}

      {error && (
        <div className="results-message results-error" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button
            type="button"
            className="results-dismiss"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {loading ? (
        <div className="results-message">
          <LoaderCircle size={22} className="spin-animation" />
          Loading your processed images...
        </div>
      ) : images.length === 0 ? (
        <div className="results-empty">
          <div className="results-empty-icon">
            <ImageIcon size={34} />
          </div>

          <h3>No processed images yet</h3>

          <p>
            Upload an image and CloudSight will optimize it automatically.
          </p>

          <Link to="/uploads" className="btn btn-primary">
            Upload an image <ArrowUpRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="results-grid">
          {images.map((image) => {
            const isDeleting = deletingKey === image.key;

            return (
              <article className="result-card" key={image.key}>
                <div className="result-image">
                  <img
                    src={image.thumbnailUrl || image.previewUrl}
                    alt={image.fileName}
                    loading="lazy"
                  />

                  <span className="result-image-badge">
                    <Sparkles size={12} />
                    Optimized
                  </span>
                </div>

                <div className="result-card-body">
                  <h3 title={image.fileName}>{image.fileName}</h3>

                  <div className="result-meta">
                    <span>
                      <HardDrive size={14} />
                      {formatBytes(image.sizeBytes)}
                    </span>

                    <span>
                      <Clock3 size={14} />
                      {formatDate(image.lastModified)}
                    </span>
                  </div>

                  <div className="result-actions">
                    <a
                      className="btn btn-primary result-action-link"
                      href={image.previewUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ArrowUpRight size={15} />
                      Preview
                    </a>

                    <a
                      className="btn btn-outline-secondary result-action-link"
                      href={image.downloadUrl}
                      download
                    >
                      <Download size={15} />
                      Download
                    </a>

                    <button
                      type="button"
                      className="btn btn-outline-danger result-delete-button"
                      onClick={() => handleDelete(image)}
                      disabled={Boolean(deletingKey)}
                      title={`Delete ${image.fileName}`}
                      aria-label={`Delete ${image.fileName}`}
                    >
                      {isDeleting ? (
                        <LoaderCircle
                          size={17}
                          className="spin-animation"
                        />
                      ) : (
                        <Trash2 size={17} />
                      )}
                      <span>{isDeleting ? "Deleting..." : "Delete"}</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
