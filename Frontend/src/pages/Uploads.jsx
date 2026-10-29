import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
  CloudUpload,
  ShieldCheck,
  Info,
  CheckCircle,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";
import UploadDropzone from "../components/UploadDropzone";

const API_URL = "https://yhzobik9cl.execute-api.ap-southeast-2.amazonaws.com";

const POLL_INTERVAL = 2000;
const MAX_POLL_ATTEMPTS = 60;

export default function Uploads() {
  const location = useLocation();
  const pollingRef = useRef(false);

  const [file, setFile] = useState(() => location.state?.file ?? null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [uploadedKey, setUploadedKey] = useState("");
  const [processingMessage, setProcessingMessage] = useState("");

  useEffect(() => {
    if (location.state?.file) {
      setFile(location.state.file);
      setStatus("idle");
      setError("");
      setUploadedKey("");
      setProcessingMessage("");
      pollingRef.current = false;
    }
  }, [location.key]);

  const checkProcessingStatus = useCallback(async (key) => {
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
            data.message || data.error || "Could not check processing status.",
          );
        }

        if (data.status === "completed") {
          setStatus("success");
          setProcessingMessage("Your optimized image and thumbnail are ready.");
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
        "Processing is taking longer than expected. You can check My results or retry the status check.",
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
  }, []);

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

    try {
      const urlResponse = await fetch(`${API_URL}/upload-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contentType: file.type,
          fileSize: file.size,
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
        headers: {
          "Content-Type": file.type,
        },
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
  }

  const isBusy = status === "uploading" || status === "processing";

  return (
    <div className="page-stack uploads-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">WORKSPACE / IMAGE PROCESSING</span>
          <h1>Process your images</h1>
          <p>Upload an image to CloudSight's serverless processing pipeline.</p>
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

      <section className="panel standalone-upload">
        <div className="section-heading">
          <div>
            <span className="eyebrow">STEP 01</span>
            <h2>Choose your image</h2>
          </div>

          <CloudUpload size={22} className="heading-icon" />
        </div>

        <div className="upload-dropzone-wrapper">
          <UploadDropzone onFileChange={handleFileChange} initialFile={file} />
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
                ? "Your original, optimized image, and thumbnail are ready in S3."
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
                ? "Requesting a secure URL and transferring your image."
                : "CloudSight is checking for the optimized image and thumbnail. This usually takes a short time."}
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="upload-summary upload-success-message" role="status">
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
            {status === "uploading" ? (
              <>
                <LoaderCircle size={18} className="animate-spin" />
                Uploading...
              </>
            ) : status === "processing" ? (
              <>
                <LoaderCircle size={18} className="animate-spin" />
                Processing...
              </>
            ) : status === "success" ? (
              <>
                <CheckCircle size={18} />
                Processing complete
              </>
            ) : (
              <>
                <CloudUpload size={18} />
                {status === "processing-timeout"
                  ? "Upload another time"
                  : status === "processing-error"
                    ? "Retry upload"
                    : status === "error"
                      ? "Try upload again"
                      : "Upload to CloudSight"}
              </>
            )}
          </button>

          {(status === "processing-timeout" || status === "processing-error") &&
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
            Images are uploaded to your private S3 bucket using a temporary
            presigned URL. No AWS secret keys are stored in the frontend.
          </span>
        </div>
      </section>
    </div>
  );
}
