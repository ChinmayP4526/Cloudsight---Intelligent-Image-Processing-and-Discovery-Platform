import {
  BookOpen,
  Cloud,
  Image,
  ShieldCheck,
  ArrowUpRight,
  CircleHelp,
} from "lucide-react";
import { Link } from "react-router-dom";

const topics = [
  {
    icon: Image,
    title: "Supported image formats",
    description:
      "CloudSight accepts JPEG, PNG, WebP and AVIF uploads up to 20 MB. TIFF support depends on the upload interface and backend configuration.",
  },
  {
    icon: Cloud,
    title: "How image processing works",
    description:
      "Images are stored in Amazon S3. AWS Lambda creates optimized images and thumbnails, while Amazon Rekognition generates descriptive labels.",
  },
  {
    icon: ShieldCheck,
    title: "Account and privacy",
    description:
      "Sign in with your account to access your workspace. CloudSight uses authenticated API requests and user-specific storage paths to separate images between users.",
  },
  {
    icon: CircleHelp,
    title: "Why are my AI tags missing?",
    description:
      "Image processing may still be running. Wait briefly and refresh your results. If tags remain empty, check the processing status and report the issue.",
  },
];

export default function Help() {
  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <span className="eyebrow">CLOUDSIGHT RESOURCES</span>
          <h1>Help & support</h1>
          <p>Understand your workspace and the image-processing pipeline.</p>
        </div>
      </div>

      <div className="help-grid">
        {topics.map(({ icon: Icon, title, description }) => (
          <article className="panel help-card" key={title}>
            <div className="help-icon">
              <Icon size={21} />
            </div>
            <h2>{title}</h2>
            <p>{description}</p>
          </article>
        ))}
      </div>

      <section className="panel help-next">
        <div className="help-icon">
          <BookOpen size={21} />
        </div>
        <div>
          <h2>Need help?</h2>
          <p>
            If an image fails to process or its AI tags are missing, note the
            issue and contact the project support team.
          </p>
        </div>
        <Link to="/uploads" className="secondary-button">
          Open uploads <ArrowUpRight size={15} />
        </Link>
      </section>
    </div>
  );
}
