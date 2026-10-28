
import { useEffect, useRef, useState } from "react";
import { CloudUpload, FileImage, Check, X } from "lucide-react";

const MAX_SIZE = 20 * 1024 * 1024;
const SUPPORTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export default function UploadDropzone({ onFileChange }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function chooseFile(candidate) {
    if (!candidate) return;

    if (!SUPPORTED_TYPES.includes(candidate.type)) {
      setError("Choose a JPG, PNG, WebP, or AVIF image.");
      return;
    }
    if (candidate.size > MAX_SIZE) {
      setError("This image exceeds 20 MB. Please choose a smaller file.");
      return;
    }

    setError("");
    setFile(candidate);
    onFileChange?.(candidate);
  }

  function removeFile() {
    setFile(null);
    setError("");
    onFileChange?.(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="upload-component">
      <div
        className={`dropzone ${dragging ? "dragging" : ""} ${file ? "has-file" : ""}`}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setDragging(false);
          }
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          chooseFile(event.dataTransfer.files?.[0]);
        }}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Choose an image"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          hidden
          onChange={(event) => {
            chooseFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />

        <div className="upload-icon"><CloudUpload size={27} /></div>
        <h3>Drop your image here</h3>
        <p>Drag and drop or <span className="browse-link">browse files</span></p>
        <div className="upload-formats">
          <span>JPG</span><span>PNG</span><span>WEBP</span><span>AVIF</span>
        </div>
        <small className="size-limit">Maximum file size: 20 MB</small>
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}

      {file && (
        <div className="preview-card">
          <div className="preview-image-wrap">
            {previewUrl && <img src={previewUrl} alt="Selected image preview" />}
          </div>
          <div className="preview-details">
            <div className="file-icon"><FileImage size={19} /></div>
            <div className="file-copy">
              <strong title={file.name}>{file.name}</strong>
              <small>{(file.size / (1024 * 1024)).toFixed(2)} MB · {file.type}</small>
            </div>
            <span className="ready-tag"><Check size={13} /> Ready</span>
            <button
              className="icon-button remove-button"
              onClick={removeFile}
              aria-label="Remove selected image"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
