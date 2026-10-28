
import { Image as ImageIcon, Sparkles, ArrowUpRight } from "lucide-react";

export default function Results() {
  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <span className="eyebrow">WORKSPACE / LIBRARY</span>
          <h1>My results</h1>
          <p>Your optimized images and generated thumbnails will live here.</p>
        </div>
      </div>

      <section className="panel results-panel">
        <div className="section-heading">
          <div><span className="eyebrow">IMAGE LIBRARY</span><h2>Processed images</h2></div>
          <span className="status-pill">0 results connected</span>
        </div>
        <div className="empty-results">
          <div className="empty-art">
            <ImageIcon size={27} />
            <Sparkles className="empty-sparkle" size={17} />
          </div>
          <h3>Your image library starts here</h3>
          <p>Once the frontend is connected to AWS, your real optimized images and thumbnails will appear here.</p>
          <a className="secondary-button" href="/uploads">
            Explore image processing <ArrowUpRight size={15} />
          </a>
        </div>
      </section>
    </div>
  );
}
