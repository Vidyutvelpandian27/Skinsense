import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="sidebar bg-white shadow-sm">

      {/* Sidebar Header */}
      <div className="sidebar-header p-4 border-bottom">
        <h5 className="mb-0 fw-bold text-success">
          SkinSense
        </h5>
      </div>

      {/* Sidebar Navigation */}
      <nav className="sidebar-nav p-3">

        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <span>📊</span>
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/analysis"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <span>🔍</span>
          <span>Skin Analysis</span>
        </NavLink>

        <NavLink
          to="/history"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <span>📋</span>
          <span>Analysis History</span>
        </NavLink>

        <NavLink
          to="/products"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <span>🧴</span>
          <span>Products</span>
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <span>👤</span>
          <span>Profile</span>
        </NavLink>

        <div className="border-top my-3"></div>

        <button
          type="button"
          className="sidebar-link"
          onClick={handleLogout}
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>

      </nav>
    </aside>
  );
};

export default Sidebar;