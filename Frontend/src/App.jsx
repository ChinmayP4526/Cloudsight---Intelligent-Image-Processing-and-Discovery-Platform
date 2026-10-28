
import { useEffect, useRef, useState } from "react";
import { Routes, Route, useLocation, Link } from "react-router-dom";
import { gsap } from "gsap";
import { ArrowLeft, Home } from "lucide-react";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Overview from "./pages/Overview";
import Uploads from "./pages/Uploads";
import Results from "./pages/Results";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import "./App.css";

function NotFound() {
  return (
    <div className="not-found panel">
      <div className="empty-art"><Home size={27} /></div>
      <span className="eyebrow">404 / PAGE NOT FOUND</span>
      <h1>This page wandered off.</h1>
      <p>The page you're looking for doesn't exist in this workspace.</p>
      <Link className="primary-button not-found-button" to="/">
        <ArrowLeft size={17} /> Back to overview
      </Link>
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  const pageRef = useRef(null);

  useEffect(() => {
    if (!pageRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".page-enter",
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.38,
          ease: "power2.out",
          clearProps: "all",
        }
      );
    }, pageRef);

    return () => ctx.revert();
  }, [location.pathname]);

  return (
    <div ref={pageRef} className="route-container">
      <div className="page-enter">
        <Routes location={location}>
          <Route path="/" element={<Overview />} />
          <Route path="/uploads" element={<Uploads />} />
          <Route path="/results" element={<Results />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/help" element={<Help />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="main-area">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <div className="page-content">
          <AnimatedRoutes />
          <footer className="footer">
            <span>© 2026 CloudSight</span>
            <span>Built for smarter image workflows</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
