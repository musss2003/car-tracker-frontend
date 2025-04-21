"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../contexts/useAuth"
import Notification from "../Notification/Notification"
import "./Navbar.css"

const Navbar = () => {
  const [openDropdown, setOpenDropdown] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const { user, logout } = useAuth()
  const dropdownRefs = useRef({})

  // Handle dropdown toggling
  const toggleDropdown = (dropdownName) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName)
  }

  // Handle clicks outside of dropdowns
  const handleOutsideClick = useCallback((e) => {
    if (openDropdown && dropdownRefs.current[openDropdown] && !dropdownRefs.current[openDropdown].contains(e.target)) {
      setOpenDropdown(null)
    }
  }, [openDropdown, dropdownRefs])

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault()
    // Implement search functionality here
    console.log("Searching for:", searchQuery)
    // You could redirect to search results page or filter content
  }

  // Handle logout
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout()
      // Redirect to login page or handle in your auth context
    }
  }

  // Set up event listeners
  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick)
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
    }
  }, [openDropdown, handleOutsideClick])

  // Register dropdown refs
  const registerDropdownRef = (name, element) => {
    if (element && !dropdownRefs.current[name]) {
      dropdownRefs.current[name] = element
    }
  }

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
          {/* Notifications Component */}
          <Notification
            openDropdown={openDropdown}
            toggleDropdown={toggleDropdown}
            registerRef={(el) => registerDropdownRef("notifications", el)}
          />

          {/* Messages Dropdown */}
          <li className="dropdown" ref={(el) => registerDropdownRef("messages", el)}>
            <button
              className="dropdown-toggle"
              type="button"
              onClick={() => toggleDropdown("messages")}
              aria-expanded={openDropdown === "messages"}
              aria-haspopup="true"
              aria-label="Messages"
            >
              <span className="badge" aria-label="7 unread messages">
                7
              </span>
              <i className="fas fa-envelope" aria-hidden="true"></i>
            </button>

            {openDropdown === "messages" && (
              <div className="dropdown-menu" role="menu">
                <h6 className="dropdown-header">Message Center</h6>

                <button className="dropdown-item" type="button">
                  <img className="dropdown-avatar" src="avatars/avatar4.jpeg" alt="Emily Fowler" />
                  <div>
                    <p className="text-truncate">Hi there! Can you help me with a problem I've been having?</p>
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
              type="button"
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
                  "https://media.istockphoto.com/id/1300845620/vector/user-icon-flat-isolated-on-white-background-user-symbol-vector-illustration.jpg?s=612x612&w=0&k=20&c=yBeyba0hUkh14_jgv1OKqIH0CCSWU_4ckRkAoy2p73o="
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
  )
}

export default Navbar

