"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  RefObject,
} from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth";
import Notification from "../Notification/Notification";
import "./Navbar.css";

type DropdownKey = "notifications" | "messages" | "profile" | null;

const Navbar: React.FC = () => {
  const [openDropdown, setOpenDropdown] = useState<DropdownKey>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { user, logout } = useAuth();

  // Correctly type dropdownRefs
  const dropdownRefs = useRef<Record<string, HTMLLIElement | null>>({});

  const toggleDropdown = (dropdownName: DropdownKey) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };

  const handleOutsideClick = useCallback(
    (e: MouseEvent) => {
      if (
        openDropdown &&
        dropdownRefs.current[openDropdown] &&
        !dropdownRefs.current[openDropdown]?.contains(e.target as Node)
      ) {
        setOpenDropdown(null);
      }
    },
    [openDropdown]
  );

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [handleOutsideClick]);

  const registerDropdownRef = (name: DropdownKey, element: HTMLLIElement | null) => {
    if (element) {
      dropdownRefs.current[name as string] = element;
    }
  };

  return (
    <nav className="navbar" aria-label="Main navigation">
      <div className="container">
        {/* Search Bar */}
        <form className="navbar-search" onSubmit={handleSearch}>
          <div className="search-input-group">
            <input
              type="text"
              className="search-input"
              placeholder="Search for..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search"
            />
            <button className="search-btn" type="submit" aria-label="Submit search">
              <i className="fas fa-search" aria-hidden="true"></i>
            </button>
          </div>
        </form>

        {/* Navbar Items */}
        <ul className="navbar-items">
           

          {/* Messages */}
          <li className="dropdown" ref={(el) => registerDropdownRef("messages", el)}>
            <button
              className="dropdown-toggle"
              onClick={() => toggleDropdown("messages")}
              aria-expanded={openDropdown === "messages"}
              aria-haspopup="true"
              aria-label="Messages"
            >
              <span className="badge" aria-label="7 unread messages">7</span>
              <i className="fas fa-envelope" aria-hidden="true"></i>
            </button>

            {openDropdown === "messages" && (
              <div className="dropdown-menu" role="menu">
                <h6 className="dropdown-header">Message Center</h6>
                <button className="dropdown-item" type="button">
                  <img className="dropdown-avatar" src="avatars/avatar4.jpeg" alt="Emily Fowler" />
                  <div>
                    <p className="text-truncate">
                      Hi there! Can you help me with a problem I've been having?
                    </p>
                    <span className="dropdown-time">Emily Fowler · 58m</span>
                  </div>
                </button>
                <button className="dropdown-footer" type="button">
                  Show All Messages
                </button>
              </div>
            )}
          </li>

          {/* User Profile */}
          <li className="dropdown user-dropdown" ref={(el) => registerDropdownRef("profile", el)}>
            <button
              className="dropdown-toggle"
              onClick={() => toggleDropdown("profile")}
              aria-expanded={openDropdown === "profile"}
              aria-haspopup="true"
              aria-label="User profile"
            >
              <span className="user-name">{user?.username || "User"}</span>
              <img
                className="user-avatar"
                src={
                  user?.avatar ||
                  "https://media.istockphoto.com/id/1300845620/vector/user-icon-flat-isolated-on-white-background-user-symbol-vector-illustration.jpg"
                }
                alt="Profile"
              />
            </button>

            {openDropdown === "profile" && (
              <div className="dropdown-menu" role="menu">
                <Link to="/profile" className="dropdown-item">
                  <i className="fas fa-user" aria-hidden="true"></i>
                  <span>Profile</span>
                </Link>
                <Link to="/settings" className="dropdown-item">
                  <i className="fas fa-cogs" aria-hidden="true"></i>
                  <span>Settings</span>
                </Link>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item logout-item" type="button" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt" aria-hidden="true"></i>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
