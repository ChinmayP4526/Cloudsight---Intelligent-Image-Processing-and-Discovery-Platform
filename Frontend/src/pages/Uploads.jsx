
import { useState } from "react";
import { CloudUpload, ShieldCheck, Info } from "lucide-react";
import UploadDropzone from "../components/UploadDropzone";

export default function Uploads() {
  const [file, setFile] = useState(null);

  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <span className="eyebrow">WORKSPACE / IMAGE PROCESSING</span>
          <h1>Process your images</h1>
          <p>Prepare an image for the CloudSight processing pipeline.</p>
        </div>
        <span className="status-pill"><span /> Ready for selection</span>
      </div>

      <section className="panel standalone-upload">
        <div className="section-heading">
          <div><span className="eyebrow">STEP 01</span><h2>Choose your image</h2></div>
          <CloudUpload size={22} className="heading-icon" />
        </div>

        <UploadDropzone onFileChange={setFile} />

        <div className="upload-summary">
          <div className="summary-icon"><Info size={18} /></div>
          <div>
            <strong>{file ? "Image selected" : "Before you upload"}</strong>
            <p>
              {file
                ? `${file.name} is ready for the next step. It has not been sent to AWS yet.`
                : "Choose a JPG, PNG, WebP, or AVIF image up to 20 MB."}
            </p>
          </div>
        </div>

        <div className="privacy-note">
          <ShieldCheck size={17} />
          Uploading to S3 will be enabled after we connect a secure presigned-URL endpoint.
        </div>
      </section>
    </div>
  );
}
