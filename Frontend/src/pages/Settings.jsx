
import { Moon, Sun, Palette, Monitor, Check } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function Settings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <span className="eyebrow">PREFERENCES</span>
          <h1>Settings</h1>
          <p>Personalize your CloudSight workspace.</p>
        </div>
      </div>

      <section className="panel settings-panel">
        <div className="settings-section-heading">
          <div className="settings-heading-icon"><Palette size={20} /></div>
          <div><h2>Appearance</h2><p>Choose the theme that's comfortable for you.</p></div>
        </div>

        <div className="theme-options">
          <button
            className={`theme-option ${theme === "light" ? "selected" : ""}`}
            onClick={() => setTheme("light")}
            aria-pressed={theme === "light"}
          >
            <span className="theme-preview light-preview"><Sun size={25} /></span>
            <span className="theme-option-copy"><strong>Light</strong><small>Bright and clean</small></span>
            {theme === "light" && <Check size={18} className="theme-check" />}
          </button>

          <button
            className={`theme-option ${theme === "dark" ? "selected" : ""}`}
            onClick={() => setTheme("dark")}
            aria-pressed={theme === "dark"}
          >
            <span className="theme-preview dark-preview"><Moon size={25} /></span>
            <span className="theme-option-copy"><strong>Dark</strong><small>Easy on the eyes</small></span>
            {theme === "dark" && <Check size={18} className="theme-check" />}
          </button>
        </div>

        <div className="settings-divider" />

        <div className="settings-row">
          <div className="settings-heading-icon"><Monitor size={20} /></div>
          <div className="settings-row-copy">
            <strong>Workspace layout</strong>
            <p>Responsive layout adapts automatically to your screen.</p>
          </div>
          <span className="status-pill">Automatic</span>
        </div>
      </section>

      <div className="settings-footnote">
        Theme preference is saved locally in this browser. Account synchronization is not configured.
      </div>
    </div>
  );
}
