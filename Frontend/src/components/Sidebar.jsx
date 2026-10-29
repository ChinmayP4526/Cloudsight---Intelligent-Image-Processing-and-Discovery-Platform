
import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  Aperture,
  LayoutDashboard,
  CloudUpload,
  Layers3,
  Settings2,
  CircleHelp,
  X,
  Zap,
} from "lucide-react";
import { useProfile } from "../context/ProfileContext";

const links = [
  { to: "/", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/uploads", label: "Image processing", icon: CloudUpload },
  { to: "/results", label: "My results", icon: Layers3 },
];

export default function Sidebar({ open, onClose }) {
  const { profile } = useProfile();

  const initials = (profile.name || "CS")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") {
        onClose?.();
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <>
      <div
        className={`sidebar-overlay ${open ? "visible" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand-row">
          <NavLink to="/" className="brand" onClick={onClose}>
            <span className="brand-mark">
              <Aperture size={23} />
            </span>

            <span className="brand-name">
              cloud<span>sight</span>
              <small>IMAGE INTELLIGENCE</small>
            </span>
          </NavLink>

          <button
            className="icon-button sidebar-close"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X size={19} />
          </button>
        </div>

        <div className="side-label">WORKSPACE</div>

        <nav className="nav-links" aria-label="Main navigation">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="usage-card">
            <span className="usage-icon">
              <Zap size={17} />
            </span>

            <strong>Serverless power</strong>

            <p>
              Image processing powered by AWS S3 and Lambda.
            </p>

            <small className="usage-description">
              AI-powered image optimization
            </small>
          </div>

          <NavLink
            to="/settings"
            onClick={onClose}
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
          >
            <Settings2 size={18} />
            <span>Settings</span>
          </NavLink>

          <NavLink
            to="/help"
            onClick={onClose}
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
          >
            <CircleHelp size={18} />
            <span>Help & support</span>
          </NavLink>

          <div className="profile">
            <div className="avatar">{initials || "CS"}</div>

            <div className="profile-copy">
              <strong>
                {profile.name || "CloudSight User"}
              </strong>

              <small>
                {profile.email || "Personal workspace"}
              </small>
            </div>

            <span
              className="profile-indicator"
              title="Cognito account"
            />
          </div>
        </div>
      </aside>
    </>
  );
}
