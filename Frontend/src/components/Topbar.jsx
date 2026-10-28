
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu, ChevronDown, UserRound, Settings2, CircleHelp, LogOut
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function Topbar({ onMenuClick }) {
  const [accountOpen, setAccountOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setAccountOpen(false);
      }
    }
    function handleEscape(event) {
      if (event.key === "Escape") setAccountOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="icon-button mobile-menu-button" onClick={onMenuClick} aria-label="Open navigation">
          <Menu size={20} />
        </button>
        <div className="breadcrumb">
          <span>Workspace</span>
          <span className="crumb-slash">/</span>
          <strong>CloudSight</strong>
        </div>
      </div>

      <div className="topbar-right">
        <span className="system-status"><span /> Image engine</span>
        <ThemeToggle />

        <div className="account-wrap" ref={menuRef}>
          <button
            className={`account-trigger ${accountOpen ? "account-active" : ""}`}
            onClick={() => setAccountOpen((open) => !open)}
            aria-expanded={accountOpen}
            aria-haspopup="menu"
          >
            <span className="avatar avatar-small">CS</span>
            <ChevronDown size={15} />
          </button>

          {accountOpen && (
            <div className="account-menu" role="menu">
              <div className="account-menu-header">
                <span className="avatar">CS</span>
                <div>
                  <strong>CloudSight User</strong>
                  <small>Personal workspace</small>
                </div>
              </div>
              <div className="account-menu-divider" />
              <Link to="/settings" role="menuitem" onClick={() => setAccountOpen(false)}>
                <UserRound size={16} /> Account & preferences
              </Link>
              <Link to="/settings" role="menuitem" onClick={() => setAccountOpen(false)}>
                <Settings2 size={16} /> Settings
              </Link>
              <Link to="/help" role="menuitem" onClick={() => setAccountOpen(false)}>
                <CircleHelp size={16} /> Help & support
              </Link>
              <div className="account-menu-divider" />
              <button role="menuitem" onClick={() => {
                setAccountOpen(false);
                navigate("/settings");
              }}>
                <LogOut size={16} /> Local demo profile
              </button>
              <p className="account-menu-note">Authentication isn't configured yet.</p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
