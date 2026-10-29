import { Moon, Sun, Palette, Monitor, Check } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { updateUserAttributes } from "aws-amplify/auth";
import { useProfile } from "../context/ProfileContext";
import { useEffect, useState } from "react";
import { UserRound, Mail, Save } from "lucide-react";
export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { profile, updateProfile } = useProfile();
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    setDisplayName(profile.name);
  }, [profile.name]);
  // useEffect(() => {
  //   fetchUserAttributes()
  //     .then((attributes) => {
  //       setDisplayName(attributes.name || "");
  //       setEmail(attributes.email || "");
  //       setEmailVerified(attributes.email_verified === "true");
  //     })
  //     .catch((error) => {
  //       console.error("Could not load account settings:", error);
  //       setMessage("Unable to load account information.");
  //     });
  // }, []);

  async function saveProfile(event) {
    event.preventDefault();
    setMessage("");

    const name = displayName.trim();

    if (!name) {
      setMessage("Display name cannot be empty.");
      return;
    }

    setSaving(true);

    try {
      await updateUserAttributes({
        userAttributes: { name },
      });

      // Update every component using the shared context.
      updateProfile({ name });

      setDisplayName(name);
      setMessage("Display name updated successfully.");
    } catch (error) {
      console.error("Profile update failed:", error);
      setMessage(error.message || "Unable to update display name.");
    } finally {
      setSaving(false);
    }
  }

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
          <div className="settings-heading-icon">
            <UserRound size={20} />
          </div>

          <div>
            <h2>Account & preferences</h2>
            <p>Manage your CloudSight profile information.</p>
          </div>
        </div>

        <form onSubmit={saveProfile} className="profile-settings-form">
          <label htmlFor="displayName">Display name</label>

          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Enter your display name"
            maxLength={100}
            required
          />

          <label htmlFor="accountEmail">Email address</label>

          <input
            id="accountEmail"
            type="email"
            value={profile.email}
            readOnly
            aria-describedby="email-status"
          />

          <p id="email-status">
            <Mail size={14} />{" "}
            {profile.emailVerified ? "Email verified" : "Email not verified"}
          </p>

          <button className="primary-button" type="submit" disabled={saving}>
            <Save size={16} />
            {saving ? "Saving..." : "Save changes"}
          </button>

          {message && (
            <p role="status" aria-live="polite">
              {message}
            </p>
          )}
        </form>
      </section>
      <section className="panel settings-panel">
        <div className="settings-section-heading">
          <div className="settings-heading-icon">
            <Palette size={20} />
          </div>
          <div>
            <h2>Appearance</h2>
            <p>Choose the theme that's comfortable for you.</p>
          </div>
        </div>

        <div className="theme-options">
          <button
            className={`theme-option ${theme === "light" ? "selected" : ""}`}
            onClick={() => setTheme("light")}
            aria-pressed={theme === "light"}
          >
            <span className="theme-preview light-preview">
              <Sun size={25} />
            </span>
            <span className="theme-option-copy">
              <strong>Light</strong>
              <small>Bright and clean</small>
            </span>
            {theme === "light" && <Check size={18} className="theme-check" />}
          </button>

          <button
            className={`theme-option ${theme === "dark" ? "selected" : ""}`}
            onClick={() => setTheme("dark")}
            aria-pressed={theme === "dark"}
          >
            <span className="theme-preview dark-preview">
              <Moon size={25} />
            </span>
            <span className="theme-option-copy">
              <strong>Dark</strong>
              <small>Easy on the eyes</small>
            </span>
            {theme === "dark" && <Check size={18} className="theme-check" />}
          </button>
        </div>

        <div className="settings-divider" />

        <div className="settings-row">
          <div className="settings-heading-icon">
            <Monitor size={20} />
          </div>
          <div className="settings-row-copy">
            <strong>Workspace layout</strong>
            <p>Responsive layout adapts automatically to your screen.</p>
          </div>
          <span className="status-pill">Automatic</span>
        </div>
      </section>

      <div className="settings-footnote">
        Theme preference is saved locally in this browser. Account
        synchronization is not configured.
      </div>
    </div>
  );
}
