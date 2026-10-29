import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
  CloudUpload,
  ShieldCheck,
  Info,
  CheckCircle,
  AlertCircle,
  LoaderCircle,
  Image as ImageIcon,
  ArrowLeftRight,
  HardDrive,
  FileImage,
  RefreshCw,
} from "lucide-react";
import UploadDropzone from "../components/UploadDropzone";

const API_URL = "https://yhzobik9cl.execute-api.ap-southeast-2.amazonaws.com";

const POLL_INTERVAL = 2000;
const MAX_POLL_ATTEMPTS = 60;

function formatBytes(bytes) {
  if (bytes == null || !Number.isFinite(Number(bytes))) return "—";

  const value = Number(bytes);
  if (value === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(value) / Math.log(1024)),
    units.length - 1,
  );

  return `${(value / 1024 ** index).toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
}

function getDimensions(width, height) {
  if (!width || !height) return "Detecting dimensions...";
  return `${width} × ${height} px`;
}

function BeforeAfterComparison({
  originalUrl,
  optimizedUrl,
  onOriginalLoad,
  onOptimizedLoad,
}) {
  const [position, setPosition] = useState(50);

  useEffect(() => {
    setPosition(50);
  }, [originalUrl, optimizedUrl]);

  if (!originalUrl || !optimizedUrl) {
    return (
      <div className="comparison-empty">
        <ImageIcon size={36} />
        <strong>Your comparison will appear here</strong>
        <p>Upload an image and wait for optimization to finish.</p>
      </div>
    );
  }

  return (
    <div className="comparison-content">
      <div className="comparison-stage">
        <img
          src={originalUrl}
          alt="Original image"
          className="comparison-image"
          onLoad={(event) =>
            onOriginalLoad({
              width: event.currentTarget.naturalWidth,
              height: event.currentTarget.naturalHeight,
            })
          }
        />

        <div
          className="comparison-overlay"
          style={{
            clipPath: `inset(0 ${100 - position}% 0 0)`,
          }}
        >
          <img
            src={optimizedUrl}
            alt="Optimized WebP image"
            className="comparison-image"
            onLoad={(event) =>
              onOptimizedLoad({
                width: event.currentTarget.naturalWidth,
                height: event.currentTarget.naturalHeight,
              })
            }
          />
        </div>

        <span className="comparison-label comparison-label-original">
          Original
        </span>
        <span className="comparison-label comparison-label-optimized">
          Optimized WebP
        </span>

        <div className="comparison-divider" style={{ left: `${position}%` }}>
          <span className="comparison-handle">
            <ArrowLeftRight size={18} />
          </span>
        </div>
      </div>

      <div className="comparison-slider-control">
        <span>Original</span>
        <input
          type="range"
          min="0"
          max="100"
          value={position}
          onChange={(event) => setPosition(Number(event.target.value))}
          aria-label="Compare original and optimized images"
          style={{ "--comparison-position": `${position}%` }}
        />
        <span>Optimized</span>
      </div>

      <p className="comparison-hint">
        Drag the slider to compare both versions.
      </p>
    </div>
  );
}

function Metric({ label, value, icon: Icon }) {
  return (
    <div className="optimization-metric">
      <div className="optimization-metric-icon">
        <Icon size={17} />
      </div>
      <div className="optimization-metric-copy">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

export default function Uploads() {
  const location = useLocation();
  const pollingRef = useRef(false);

  const [file, setFile] = useState(() => location.state?.file ?? null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [uploadedKey, setUploadedKey] = useState("");
  const [processingMessage, setProcessingMessage] = useState("");

  const [optimizedImage, setOptimizedImage] = useState(null);
  const [originalDimensions, setOriginalDimensions] = useState(null);
  const [optimizedDimensions, setOptimizedDimensions] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  const [originalUrl, setOriginalUrl] = useState("");

  useEffect(() => {
    if (!file) {
      setOriginalUrl("");
      return undefined;
    }

    const url = URL.createObjectURL(file);
    setOriginalUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  const resetImageDetails = useCallback(() => {
    setOptimizedImage(null);
    setOriginalDimensions(null);
    setOptimizedDimensions(null);
    setDetailsError("");
  }, []);

  useEffect(() => {
    if (location.state?.file) {
      setFile(location.state.file);
      setStatus("idle");
      setError("");
      setUploadedKey("");
      setProcessingMessage("");
      pollingRef.current = false;
      resetImageDetails();
    }
  }, [location.key, resetImageDetails]);

  const loadOptimizationDetails = useCallback(async (originalKey) => {
    setDetailsLoading(true);
    setDetailsError("");

    try {
      const response = await fetch(`${API_URL}/results`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load image results.");
      }

      const originalName = originalKey.split("/").pop();
      const optimizedName = originalName.replace(/\.[^.]+$/, ".webp");
      const expectedKey = `optimized/uploads/${optimizedName}`;

      const result = (data.images || []).find(
        (image) => image.key === expectedKey,
      );

      if (!result?.previewUrl) {
        throw new Error(
          "The processed image was not found in the results API. Try refreshing the details.",
        );
      }

      setOptimizedImage({
        key: result.key,
        previewUrl: result.previewUrl,
        sizeBytes: Number(result.sizeBytes),
        fileName: result.fileName || optimizedName,
      });
    } catch (err) {
      console.error("Could not load optimization details:", err);
      setDetailsError(err.message || "Could not load optimization details.");
    } finally {
      setDetailsLoading(false);
    }
  }, []);

  const checkProcessingStatus = useCallback(
    async (key) => {
      if (pollingRef.current) return;

      pollingRef.current = true;
      setStatus("processing");
      setProcessingMessage("Waiting for AWS to process your image...");

      try {
        for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
          if (attempt > 0) {
            await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
          }

          const response = await fetch(
            `${API_URL}/processing-status?key=${encodeURIComponent(key)}`,
          );

          const data = await response.json();

          if (!response.ok && data.status !== "processing") {
            throw new Error(
              data.message ||
                data.error ||
                "Could not check processing status.",
            );
          }

          if (data.status === "completed") {
            setStatus("success");
            setProcessingMessage(
              "Your optimized image and thumbnail are ready.",
            );

            // Image processing is complete; load its real output size and URL.
            await loadOptimizationDetails(key);
            return;
          }

          if (data.status === "not_found") {
            throw new Error(
              "The uploaded image could not be found. Please try uploading again.",
            );
          }

          setProcessingMessage(
            `Processing your image... Check ${attempt + 1} of ${MAX_POLL_ATTEMPTS}`,
          );
        }

        setStatus("processing-timeout");
        setProcessingMessage(
          "Processing is taking longer than expected. Check the status again.",
        );
      } catch (err) {
        console.error("CloudSight processing-status check failed:", err);
        setStatus("processing-error");
        setError(
          err.message || "Could not verify whether image processing completed.",
        );
      } finally {
        pollingRef.current = false;
      }
    },
    [loadOptimizationDetails],
  );

  async function handleUpload() {
    if (
      !file ||
      status === "uploading" ||
      status === "processing" ||
      status === "success"
    ) {
      return;
    }

    setStatus("uploading");
    setError("");
    setUploadedKey("");
    setProcessingMessage("");
    pollingRef.current = false;
    resetImageDetails();

    try {
      const urlResponse = await fetch(`${API_URL}/upload-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType: file.type,
          fileSize: file.size,
          fileName: file.name,
        }),
      });

      const urlData = await urlResponse.json();

      if (!urlResponse.ok) {
        throw new Error(urlData.error || "Could not prepare the upload.");
      }

      if (!urlData.uploadUrl || !urlData.key) {
        throw new Error("The API returned an invalid upload response.");
      }

      const uploadResponse = await fetch(urlData.uploadUrl, {
        method: "PUT",
        headers: urlData.uploadHeaders,
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error(`S3 upload failed (HTTP ${uploadResponse.status}).`);
      }

      setUploadedKey(urlData.key);
      await checkProcessingStatus(urlData.key);
    } catch (err) {
      console.error("CloudSight upload failed:", err);
      setError(
        err.message ||
          "Upload failed. Please check your connection and try again.",
      );
      setStatus("error");
    }
  }

  function handleFileChange(nextFile) {
    setFile(nextFile);
    setStatus("idle");
    setError("");
    setUploadedKey("");
    setProcessingMessage("");
    pollingRef.current = false;
    resetImageDetails();
  }

  const isBusy = status === "uploading" || status === "processing";

  const originalSize = file?.size ?? null;
  const optimizedSize = optimizedImage?.sizeBytes ?? null;

  const bytesSaved =
    originalSize != null && optimizedSize != null
      ? originalSize - optimizedSize
      : null;

  const savingsPercent =
    originalSize > 0 && optimizedSize != null
      ? (bytesSaved / originalSize) * 100
      : null;

  const compressionText =
    savingsPercent == null
      ? "—"
      : savingsPercent >= 0
        ? `${savingsPercent.toFixed(1)}%`
        : `${Math.abs(savingsPercent).toFixed(1)}% larger`;

  return (
    <div className="page-stack uploads-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">WORKSPACE / IMAGE PROCESSING</span>
          <h1>Process your images</h1>
          <p>Upload, optimize and compare your images in one workspace.</p>
        </div>

        <span className={`status-pill upload-status-${status}`}>
          {isBusy ? (
            <LoaderCircle size={15} className="animate-spin" />
          ) : status === "success" ? (
            <CheckCircle size={15} />
          ) : status === "error" || status === "processing-error" ? (
            <AlertCircle size={15} />
          ) : (
            <span />
          )}

          {status === "uploading"
            ? "Uploading..."
            : status === "processing"
              ? "Processing..."
              : status === "success"
                ? "Processing complete"
                : status === "error"
                  ? "Upload failed"
                  : status === "processing-error"
                    ? "Status check failed"
                    : status === "processing-timeout"
                      ? "Still processing"
                      : "Ready for selection"}
        </span>
      </div>

      <div className="upload-workspace-grid">
        <section className="panel standalone-upload">
          <div className="section-heading">
            <div>
              <span className="eyebrow">STEP 01</span>
              <h2>Choose your image</h2>
            </div>
            <CloudUpload size={22} className="heading-icon" />
          </div>

          <div className="upload-dropzone-wrapper">
            <UploadDropzone
              onFileChange={handleFileChange}
              initialFile={file}
            />
          </div>

          <div className="upload-summary">
            <div className="summary-icon">
              <Info size={18} />
            </div>
            <div>
              <strong>
                {status === "success"
                  ? "Image processed successfully"
                  : status === "processing"
                    ? "AWS is processing your image..."
                    : status === "uploading"
                      ? "Sending image to AWS..."
                      : file
                        ? "Image selected"
                        : "Before you upload"}
              </strong>
              <p>
                {status === "success"
                  ? "Your original image, optimized WebP and thumbnail are ready."
                  : status === "processing"
                    ? processingMessage
                    : status === "uploading"
                      ? "Please keep this page open while the upload completes."
                      : file
                        ? `${file.name} is ready to upload.`
                        : "Choose a JPG, PNG, WebP, or AVIF image up to 20 MB."}
              </p>
            </div>
          </div>

          {isBusy && (
            <div
              className="upload-progress-area"
              role="status"
              aria-live="polite"
            >
              <div className="upload-progress-heading">
                <LoaderCircle size={18} className="animate-spin" />
                <span>
                  {status === "uploading"
                    ? "Uploading to CloudSight"
                    : "Optimizing image and creating thumbnail"}
                </span>
              </div>
              <div
                className="upload-progress-track"
                role="progressbar"
                aria-label={
                  status === "uploading"
                    ? "Image upload in progress"
                    : "Image processing in progress"
                }
                aria-valuetext={
                  status === "uploading"
                    ? "Upload in progress"
                    : "Processing in progress"
                }
              >
                <div className="upload-progress-indicator" />
              </div>
              <p>
                {status === "uploading"
                  ? "Transferring your image to S3."
                  : "Waiting for the optimized image and thumbnail to become available."}
              </p>
            </div>
          )}

          {status === "success" && (
            <div
              className="upload-summary upload-success-message"
              role="status"
            >
              <CheckCircle size={20} />
              <div>
                <strong>Image processing complete!</strong>
                <p>Original object key: {uploadedKey}</p>
                <p>{processingMessage}</p>
              </div>
            </div>
          )}

          {(status === "error" || status === "processing-error") && (
            <div className="upload-summary upload-error-message" role="alert">
              <AlertCircle size={20} />
              <div>
                <strong>
                  {status === "error"
                    ? "Could not upload image"
                    : "Could not verify processing status"}
                </strong>
                <p>{error}</p>
              </div>
            </div>
          )}

          {status === "processing-timeout" && (
            <div className="upload-summary" role="status">
              <Info size={20} />
              <div>
                <strong>Processing is taking longer than expected</strong>
                <p>{processingMessage}</p>
              </div>
            </div>
          )}

          <div className="upload-actions">
            <button
              type="button"
              className="primary-button"
              onClick={handleUpload}
              disabled={!file || isBusy || status === "success"}
            >
              {isBusy ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  {status === "uploading" ? "Uploading..." : "Processing..."}
                </>
              ) : status === "success" ? (
                <>
                  <CheckCircle size={18} />
                  Processing complete
                </>
              ) : (
                <>
                  <CloudUpload size={18} />
                  Upload to CloudSight
                </>
              )}
            </button>

            {(status === "processing-timeout" ||
              status === "processing-error") &&
              uploadedKey && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    setError("");
                    checkProcessingStatus(uploadedKey);
                  }}
                >
                  Check status again
                </button>
              )}

            {status === "error" && file && (
              <button
                type="button"
                className="secondary-button"
                onClick={handleUpload}
              >
                Try again
              </button>
            )}
          </div>

          <div className="privacy-note">
            <ShieldCheck size={17} />
            <span>
              Images are uploaded using a temporary presigned URL. No AWS secret
              keys are stored in the frontend.
            </span>
          </div>
        </section>

        <div className="upload-insights-column">
          <section className="panel optimization-report">
            <div className="section-heading">
              <div>
                <span className="eyebrow">STEP 02</span>
                <h2>Optimization report</h2>
              </div>
              <HardDrive size={22} className="heading-icon" />
            </div>

            {status !== "success" || !optimizedImage ? (
              <div className="report-empty">
                {detailsLoading || status === "processing" ? (
                  <LoaderCircle size={28} className="animate-spin" />
                ) : (
                  <FileImage size={30} />
                )}
                <strong>
                  {detailsLoading
                    ? "Loading image details..."
                    : status === "processing"
                      ? "Image processing in progress"
                      : "No report yet"}
                </strong>
                <p>
                  {detailsError ||
                    "Upload an image and we'll calculate its actual storage savings and dimensions."}
                </p>
                {status === "success" && detailsError && (
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => loadOptimizationDetails(uploadedKey)}
                    disabled={detailsLoading}
                  >
                    <RefreshCw size={16} />
                    Retry report
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="optimization-savings">
                  <span>Storage reduction</span>
                  <strong>{compressionText}</strong>
                  <p>
                    {bytesSaved >= 0
                      ? `${formatBytes(bytesSaved)} saved`
                      : `${formatBytes(Math.abs(bytesSaved))} larger than original`}
                  </p>
                </div>

                <div className="optimization-metrics">
                  <Metric
                    label="Original size"
                    value={formatBytes(originalSize)}
                    icon={FileImage}
                  />
                  <Metric
                    label="Optimized size"
                    value={formatBytes(optimizedSize)}
                    icon={HardDrive}
                  />
                  <Metric
                    label="Original dimensions"
                    value={getDimensions(
                      originalDimensions?.width,
                      originalDimensions?.height,
                    )}
                    icon={ImageIcon}
                  />
                  <Metric
                    label="Optimized dimensions"
                    value={getDimensions(
                      optimizedDimensions?.width,
                      optimizedDimensions?.height,
                    )}
                    icon={ImageIcon}
                  />
                  <Metric label="Output format" value="WebP" icon={FileImage} />
                  <Metric
                    label="Space saved"
                    value={
                      bytesSaved >= 0
                        ? formatBytes(bytesSaved)
                        : "No space saved"
                    }
                    icon={HardDrive}
                  />
                </div>

                <p className="optimization-report-note">
                  Calculations use the selected original file size and the
                  optimized object's actual S3 size.
                </p>
              </>
            )}
          </section>

          <section className="panel comparison-panel">
            <div className="section-heading">
              <div>
                <span className="eyebrow">STEP 03</span>
                <h2>Before &amp; after</h2>
              </div>
              <ArrowLeftRight size={22} className="heading-icon" />
            </div>

            <BeforeAfterComparison
              originalUrl={originalUrl}
              optimizedUrl={optimizedImage?.previewUrl}
              onOriginalLoad={setOriginalDimensions}
              onOptimizedLoad={setOptimizedDimensions}
            />

            {status === "success" && detailsError && (
              <p className="comparison-note">{detailsError}</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
