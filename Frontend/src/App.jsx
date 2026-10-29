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
import { getCurrentUser, signOut } from "aws-amplify/auth";
import AuthPage from "./pages/AuthPage";

function NotFound() {
  return (
    <div className="not-found panel">
      <div className="empty-art">
        <Home size={27} />
      </div>
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
        },
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
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    let active = true;

    getCurrentUser()
      .then((currentUser) => {
        if (active) setUser(currentUser);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setCheckingAuth(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleAuthenticated() {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
  }

  async function handleLogout() {
    await signOut();
    setUser(null);
    setSidebarOpen(false);
  }

  if (checkingAuth) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#101522",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        Loading CloudSight...
      </div>
    );
  }

  if (!user) {
    return <AuthPage onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="main-area">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 12,
            padding: "8px 24px",
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 13, opacity: 0.8 }}>
            Signed in as {user.signInDetails?.loginId || user.username}
          </span>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              padding: "7px 13px",
              borderRadius: 7,
              border: "1px solid #718096",
              background: "transparent",
              color: "inherit",
              cursor: "pointer",
            }}
          >
            Sign out
          </button>
        </div>

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
