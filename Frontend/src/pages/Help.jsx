
import { BookOpen, Cloud, Image, ShieldCheck, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const topics = [
  {
    icon: Image,
    title: "Supported image formats",
    description: "The current interface accepts JPG, PNG, WebP and AVIF files up to 20 MB."
  },
  {
    icon: Cloud,
    title: "How processing works",
    description: "Amazon S3 stores originals. An object-created event invokes AWS Lambda to create optimized WebP images and thumbnails."
  },
  {
    icon: ShieldCheck,
    title: "Security and uploads",
    description: "The browser must never contain AWS secret keys. We'll use short-lived presigned upload URLs from a trusted backend."
  }
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
            <div className="help-icon"><Icon size={21} /></div>
            <h2>{title}</h2>
            <p>{description}</p>
          </article>
        ))}
      </div>

      <section className="panel help-next">
        <div className="help-icon"><BookOpen size={21} /></div>
        <div>
          <h2>Ready to process an image?</h2>
          <p>Start with the upload interface. AWS upload integration is the next development step.</p>
        </div>
        <Link to="/uploads" className="secondary-button">Open uploads <ArrowUpRight size={15} /></Link>
      </section>
    </div>
  );
}
