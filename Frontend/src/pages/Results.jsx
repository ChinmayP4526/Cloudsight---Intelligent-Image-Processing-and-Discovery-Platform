import { useCallback, useEffect, useMemo, useState } from "react";
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
  Search,
  X,
  ArrowDownUp,
  ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";
const API_URL = "https://yhzobik9cl.execute-api.ap-southeast-2.amazonaws.com";

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

function ResultsSkeleton() {
  return (
    <div
      className="results-grid"
      aria-label="Loading processed images"
      aria-busy="true"
    >
      {Array.from({ length: 6 }, (_, index) => (
        <div className="skeleton-result-card" key={index}>
          <div className="cloudsight-skeleton skeleton-result-image" />

          <div className="skeleton-result-body">
            <div className="cloudsight-skeleton skeleton-result-title" />
            <div className="cloudsight-skeleton skeleton-result-meta" />
            <div className="cloudsight-skeleton skeleton-result-meta" />
            <div className="cloudsight-skeleton skeleton-result-actions" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Results() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingKey, setDeletingKey] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  // Client-side search, sorting, and filtering.
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [sizeFilter, setSizeFilter] = useState("all");

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

    const interval = setInterval(
      () => {
        fetchResults(true);
      },
      10 * 60 * 1000,
    );

    return () => clearInterval(interval);
  }, [fetchResults]);

  useEffect(() => {
    if (!selectedImage) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setSelectedImage(null);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedImage]);

  const filteredImages = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return images
      .filter((image) => {
        const matchesSearch = (image.fileName || "")
          .toLowerCase()
          .includes(query);

        const size = Number(image.sizeBytes) || 0;

        const matchesSize =
          sizeFilter === "all" ||
          (sizeFilter === "small" && size < 500 * 1024) ||
          (sizeFilter === "medium" &&
            size >= 500 * 1024 &&
            size < 2 * 1024 * 1024) ||
          (sizeFilter === "large" && size >= 2 * 1024 * 1024);

        return matchesSearch && matchesSize;
      })
      .sort((a, b) => {
        if (sortBy === "largest") {
          return (Number(b.sizeBytes) || 0) - (Number(a.sizeBytes) || 0);
        }

        if (sortBy === "smallest") {
          return (Number(a.sizeBytes) || 0) - (Number(b.sizeBytes) || 0);
        }

        const dateA = new Date(a.lastModified || 0).getTime() || 0;
        const dateB = new Date(b.lastModified || 0).getTime() || 0;

        return sortBy === "oldest" ? dateA - dateB : dateB - dateA;
      });
  }, [images, searchQuery, sortBy, sizeFilter]);

  const clearFilters = () => {
    setSearchQuery("");
    setSortBy("newest");
    setSizeFilter("all");
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" || sortBy !== "newest" || sizeFilter !== "all";

  const handleDelete = async (image) => {
    const confirmed = window.confirm(
      `Permanently delete "${image.fileName}" and its original image, optimized image, and thumbnail?`,
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
        body: JSON.stringify({ key: image.key }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Could not delete this image.");
      }

      setImages((current) => current.filter((item) => item.key !== image.key));

      setNotice(`"${image.fileName}" was deleted successfully.`);
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
          <RefreshCw size={16} className={refreshing ? "spin-animation" : ""} />
          {refreshing ? "Refreshing..." : "Refresh"}
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

      {!loading && images.length > 0 && (
        <section
          className="results-toolbar"
          aria-label="Search and filter images"
        >
          <div className="results-search">
            <Search size={18} aria-hidden="true" />

            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by filename..."
              aria-label="Search processed images by filename"
            />

            {searchQuery && (
              <button
                type="button"
                className="results-search-clear"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="results-control">
            <label htmlFor="results-sort">
              <ArrowDownUp size={15} />
              Sort by
            </label>

            <select
              id="results-sort"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="largest">Largest file</option>
              <option value="smallest">Smallest file</option>
            </select>
          </div>

          <div className="results-control">
            <label htmlFor="results-size-filter">
              <HardDrive size={15} />
              File size
            </label>

            <select
              id="results-size-filter"
              value={sizeFilter}
              onChange={(event) => setSizeFilter(event.target.value)}
            >
              <option value="all">All sizes</option>
              <option value="small">Under 500 KB</option>
              <option value="medium">500 KB – 2 MB</option>
              <option value="large">2 MB and above</option>
            </select>
          </div>

          <div className="results-filter-summary">
            <span>
              Showing <strong>{filteredImages.length}</strong> of{" "}
              <strong>{images.length}</strong> images
            </span>

            {hasActiveFilters && (
              <button
                type="button"
                className="results-clear-filters"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            )}
          </div>
        </section>
      )}

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
        <>
          <div className="results-loading-heading" role="status">
            <LoaderCircle size={18} className="spin-animation" />
            Fetching your processed images...
          </div>

          <ResultsSkeleton />
        </>
      ) : error && images.length === 0 ? (
        <div className="results-empty">
          <div className="results-empty-icon">
            <AlertCircle size={34} />
          </div>

          <h3>Couldn't load your results</h3>
          <p>Check your connection and try fetching the gallery again.</p>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => fetchResults()}
          >
            <RefreshCw size={16} />
            Try again
          </button>
        </div>
      ) : images.length === 0 ? (
        <div className="results-empty">
          <div className="results-empty-icon">
            <ImageIcon size={34} />
          </div>

          <h3>No processed images yet</h3>

          <p>Upload an image and CloudSight will optimize it automatically.</p>

          <Link to="/uploads" className="btn btn-primary">
            Upload an image <ArrowUpRight size={16} />
          </Link>
        </div>
      ) : filteredImages.length === 0 ? (
        <div className="results-empty">
          <div className="results-empty-icon">
            <Search size={34} />
          </div>

          <h3>No matching images</h3>
          <p>Try another filename or change your filters.</p>

          <button
            type="button"
            className="btn btn-primary"
            onClick={clearFilters}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="results-grid">
          {filteredImages.map((image) => {
            const isDeleting = deletingKey === image.key;

            return (
              <article className="result-card" key={image.key}>
                <button
                  type="button"
                  className="result-image result-image-trigger"
                  onClick={() => setSelectedImage(image)}
                  aria-label={`View details for ${image.fileName}`}
                >
                  <img
                    src={image.thumbnailUrl || image.previewUrl}
                    alt={image.fileName}
                    loading="lazy"
                  />

                  <span className="result-image-badge">
                    <Sparkles size={12} />
                    Optimized
                  </span>
                </button>

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
                        <LoaderCircle size={17} className="spin-animation" />
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

      {selectedImage && (
        <div
          className="image-details-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedImage(null);
          }}
          role="presentation"
        >
          <section
            className="image-details-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="image-details-title"
          >
            <div className="image-details-header">
              <div>
                <span className="eyebrow">IMAGE DETAILS</span>
                <h2 id="image-details-title">
                  {selectedImage.fileName || "Processed image"}
                </h2>
              </div>
              <button
                type="button"
                className="image-details-close"
                onClick={() => setSelectedImage(null)}
                aria-label="Close image details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="image-details-content">
              <div className="image-details-preview">
                <img
                  src={selectedImage.previewUrl || selectedImage.thumbnailUrl}
                  alt={selectedImage.fileName || "Selected processed image"}
                />
              </div>

              <div className="image-details-info">
                <div className="image-details-facts">
                  <div className="image-details-fact">
                    <span>File size</span>
                    <strong>{formatBytes(selectedImage.sizeBytes)}</strong>
                  </div>
                  <div className="image-details-fact">
                    <span>Last modified</span>
                    <strong>{formatDate(selectedImage.lastModified)}</strong>
                  </div>
                </div>

                <div className="image-details-tags-section">
                  <h3>
                    <Sparkles size={16} /> AI-generated tags
                  </h3>
                  {(() => {
                    const rawTags =
                      selectedImage.tags || selectedImage.labels || [];
                    const tags = rawTags
                      .map((tag) =>
                        typeof tag === "string"
                          ? tag
                          : tag?.name || tag?.Name || tag?.label || tag?.Label,
                      )
                      .filter(Boolean);
                    return tags.length ? (
                      <div className="image-details-tags">
                        {tags.map((tag, index) => (
                          <span
                            className="image-details-tag"
                            key={`${tag}-${index}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="image-details-no-tags">
                        AI tags are not available for this image yet.
                      </p>
                    );
                  })()}
                </div>

                <div className="image-details-actions">
                  {selectedImage.previewUrl && (
                    <a
                      className="btn btn-outline-secondary result-action-link"
                      href={selectedImage.previewUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ExternalLink size={15} /> Open image
                    </a>
                  )}
                  {selectedImage.downloadUrl && (
                    <a
                      className="btn btn-primary result-action-link"
                      href={selectedImage.downloadUrl}
                      download
                    >
                      <Download size={15} /> Download
                    </a>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
