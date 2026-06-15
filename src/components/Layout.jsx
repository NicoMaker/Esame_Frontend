import React, { useState, useEffect } from "react";
import { useApp } from "../App.jsx";
import {
  LayoutDashboard,
  Building2,
  CalendarPlus,
  BarChart3,
  Menu,
  X,
  Bell,
  Settings,
  ChevronRight,
  Users,
  Zap,
} from "lucide-react";

const NAV_ITEMS = [
  {
    id: "home",
    label: "Dashboard",
    icon: LayoutDashboard,
    section: "principale",
  },
  {
    id: "spaces",
    label: "Gestione Spazi",
    icon: Building2,
    section: "principale",
  },
  {
    id: "booking",
    label: "Nuova Prenotazione",
    icon: CalendarPlus,
    section: "operativo",
  },
  {
    id: "reports",
    label: "Reportistica",
    icon: BarChart3,
    section: "operativo",
  },
];

const PAGE_LABELS = {
  home: "Dashboard",
  spaces: "Gestione Spazi",
  booking: "Prenotazioni",
  reports: "Reportistica",
};

function Sidebar({ isMobileOpen, onClose }) {
  const { currentPage, setCurrentPage, sidebarOpen, bookings } = useApp();
  const activeBookings = bookings.filter(
    (b) => b.status === "confirmed",
  ).length;
  const today = new Date().toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short",
  });

  const grouped = NAV_ITEMS.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {});

  const handleNav = (id) => {
    setCurrentPage(id);
    if (onClose) onClose();
  };

  return (
    <aside
      className={`sidebar ${!sidebarOpen ? "collapsed" : ""} ${isMobileOpen ? "mobile-open" : ""}`}
    >
      <div className="sidebar-logo">
        <div className="logo-mark">
          <div className="logo-icon">🏢</div>
          <div>
            <div className="logo-text">CoWork Hub</div>
            <div className="logo-sub">Admin Portal</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {Object.entries(grouped).map(([section, items]) => (
          <div key={section}>
            <div className="nav-section-label">{section}</div>
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <div
                  key={item.id}
                  className={`nav-item ${isActive ? "active" : ""}`}
                  onClick={() => handleNav(item.id)}
                >
                  <Icon className="nav-icon" strokeWidth={isActive ? 2.5 : 2} />
                  <span>{item.label}</span>
                  {item.id === "booking" && activeBookings > 0 && (
                    <span className="nav-badge">{activeBookings}</span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "10px",
            padding: "6px 12px",
          }}
        >
          <Zap size={13} color="var(--amber)" />
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
            {today} · Sistema attivo
          </span>
        </div>
        <div className="user-card">
          <div className="user-avatar">AM</div>
          <div>
            <div className="user-name">Admin Manager</div>
            <div className="user-role">Super Admin</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function Topbar({ onMobileToggle }) {
  const { currentPage, sidebarOpen, setSidebarOpen, bookings } = useApp();
  const newBookings = bookings.filter((b) => {
    const d = new Date(b.createdAt);
    return Date.now() - d.getTime() < 86400000;
  }).length;

  const today = new Date().toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const todayCap = today.charAt(0).toUpperCase() + today.slice(1);

  return (
    <header className="topbar">
      <button className="topbar-toggle" onClick={onMobileToggle}>
        <Menu size={18} />
      </button>

      <div className="topbar-breadcrumb">
        <span>CoWork Hub</span>
        <ChevronRight size={14} className="breadcrumb-sep" />
        <span className="breadcrumb-current">
          {PAGE_LABELS[currentPage] || "Dashboard"}
        </span>
      </div>

      <div className="topbar-actions">
        <span className="topbar-date">{todayCap} </span>
      </div>
    </header>
  );
}

export default function Layout({ children }) {
  const { sidebarOpen } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="app-shell">
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 99,
          }}
        />
      )}
      <Sidebar isMobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div
        className={`main-wrapper ${!sidebarOpen ? "sidebar-collapsed" : ""}`}
      >
        <Topbar onMobileToggle={() => setMobileOpen((p) => !p)} />
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
