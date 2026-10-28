import { useState, useEffect } from "react";
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

export default function Uploads() {
  const location = useLocation();

  const [file, setFile] = useState(() => location.state?.file ?? null);

  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [uploadedKey, setUploadedKey] = useState("");

  useEffect(() => {
    if (location.state?.file) {
      setFile(location.state.file);
      setStatus("idle");
      setError("");
      setUploadedKey("");
    }
  }, [location.key]);

  async function handleUpload() {
    if (!file || status === "uploading") return;

    setStatus("uploading");
    setError("");
    setUploadedKey("");

    try {
      // Step 1: Ask our API for a temporary S3 upload URL.
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

      // Step 2: Upload the file directly to private S3.
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
      setStatus("success");
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
  }

  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <span className="eyebrow">WORKSPACE / IMAGE PROCESSING</span>
          <h1>Process your images</h1>
          <p>Upload an image to CloudSight's serverless processing pipeline.</p>
        </div>

        <span className="status-pill">
          <span />
          {status === "uploading"
            ? "Uploading..."
            : status === "success"
              ? "Upload complete"
              : status === "error"
                ? "Upload failed"
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

        <UploadDropzone onFileChange={handleFileChange} initialFile={file} />

        <div className="upload-summary">
          <div className="summary-icon">
            <Info size={18} />
          </div>
          <div>
            <strong>
              {status === "success"
                ? "Image uploaded successfully"
                : status === "uploading"
                  ? "Sending image to AWS..."
                  : file
                    ? "Image selected"
                    : "Before you upload"}
            </strong>
            <p>
              {status === "success"
                ? "Your original image is stored in S3. Image processing runs asynchronously."
                : status === "uploading"
                  ? "Please keep this page open while the upload completes."
                  : file
                    ? `${file.name} is ready to upload.`
                    : "Choose a JPG, PNG, WebP, or AVIF image up to 20 MB."}
            </p>
          </div>
        </div>

        {status === "uploading" && (
          <div className="upload-summary" role="status">
            <LoaderCircle size={20} className="animate-spin" />
            <div>
              <strong>Uploading to CloudSight</strong>
              <p>Requesting a secure URL and transferring your image.</p>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="upload-summary" role="status">
            <CheckCircle size={20} />
            <div>
              <strong>Upload confirmed</strong>
              <p>Object key: {uploadedKey}</p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="upload-summary" role="alert">
            <AlertCircle size={20} />
            <div>
              <strong>Could not upload image</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        <button
          type="button"
          className="primary-button"
          onClick={handleUpload}
          disabled={!file || status === "uploading" || status === "success"}
        >
          {status === "uploading" ? (
            <>
              <LoaderCircle size={18} className="animate-spin" />
              Uploading...
            </>
          ) : status === "success" ? (
            <>
              <CheckCircle size={18} />
              Uploaded successfully
            </>
          ) : (
            <>
              <CloudUpload size={18} />
              Upload to CloudSight
            </>
          )}
        </button>

        {status === "error" && file && (
          <button
            type="button"
            className="secondary-button"
            onClick={handleUpload}
          >
            Try again
          </button>
        )}

        <div className="privacy-note">
          <ShieldCheck size={17} />
          Images are uploaded to your private S3 bucket using a temporary
          presigned URL. No AWS secret keys are stored in the frontend.
        </div>
      </section>
    </div>
  );
}
