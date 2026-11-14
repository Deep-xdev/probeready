
import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  ChartNoAxesCombined,
  Menu,
  X
} from "lucide-react";

import BrandLogo from "./BrandLogo";
import "./WorkspaceLayout.css";

const navigation = [
  { icon: LayoutDashboard, label: "Dashboard", link: "/dashboard" },
  { icon: FileText, label: "My Resume", link: "/resume" },
  { icon: MessageSquare, label: "Mock Interview", link: "/interview" },
  { icon: ChartNoAxesCombined, label: "Analytics", link: "/analytics" }
];

function WorkspaceLayout({ title, activePage, children, actions }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const renderNavigation = (mobile = false) => (
    <nav
      className={mobile ? "workspace-mobile-nav" : "workspace-nav"}
      aria-label="Main navigation"
    >
      {navigation.map(({ icon: Icon, label, link }) => (
        <NavLink
          key={label}
          to={link}
          tabIndex={mobile && !isMobileMenuOpen ? -1 : 0}
          onClick={mobile ? closeMobileMenu : undefined}
          className={({ isActive }) =>
            `workspace-nav-link ${
              isActive || activePage === link ? "active" : ""
            }`
          }
        >
          <Icon size={19} strokeWidth={1.8} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="workspace-layout">

      {/* SPATIAL BACKGROUND LAYERS */}
      <div className="workspace-atmosphere" aria-hidden="true">
        <div className="workspace-glow workspace-glow-violet" />
        <div className="workspace-glow workspace-glow-blue" />
        <div className="workspace-grid" />
      </div>

      {/* MOBILE HEADER */}
      <header className="workspace-mobile-header">
        <BrandLogo />

        <button
          type="button"
          className="workspace-mobile-menu-button"
          onClick={() =>
            setIsMobileMenuOpen(previous => !previous)
          }
          aria-label={
            isMobileMenuOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={isMobileMenuOpen}
          aria-controls="workspace-mobile-navigation"
        >
          {isMobileMenuOpen ? (
            <X size={22} />
          ) : (
            <Menu size={22} />
          )}
        </button>
      </header>

      {/* MOBILE NAVIGATION */}
      <div
        id="workspace-mobile-navigation"
        className={`workspace-mobile-navigation ${
          isMobileMenuOpen ? "open" : ""
        }`}
        aria-hidden={!isMobileMenuOpen}
        inert={!isMobileMenuOpen}
      >
        {renderNavigation(true)}
      </div>

      {/* DESKTOP SIDEBAR */}
      <aside className="workspace-sidebar">
        <div className="workspace-sidebar-brand">
          <BrandLogo />
        </div>

        <div className="workspace-sidebar-content">
          <p className="workspace-sidebar-label">
            WORKSPACE
          </p>

          {renderNavigation()}
        </div>

        <div className="workspace-sidebar-footer">
          <div className="workspace-system-status">
            <span className="workspace-status-indicator" />
            <span>AI SYSTEM ACTIVE</span>
          </div>
        </div>
      </aside>

      {/* MAIN WORKSPACE */}
      <main className="workspace-main">

        {/* TOP BAR */}
        <header className="workspace-topbar">
          <div className="workspace-topbar-heading">
            <div className="workspace-breadcrumb">
              <span>PROBEREADY</span>
              <span className="workspace-breadcrumb-divider">/</span>
              <span>{title.toUpperCase()}</span>
            </div>

            <h2>{title}</h2>
          </div>

          {actions && (
            <div className="workspace-topbar-actions">
              {actions}
            </div>
          )}
        </header>

        {/* PAGE CONTENT */}
        <div className="workspace-content">
          {children}
        </div>

      </main>
    </div>
  );
}

export default WorkspaceLayout;
