import React, { useState } from "react";
import "./Navbar.css";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth";

const Navbar = () => {
    // State to track which dropdown is open
    const [openDropdown, setOpenDropdown] = useState(null);
    const { user } = useAuth();

    // Function to toggle the specific dropdown
    const toggleDropdown = (dropdownName) => {
        setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
    };

    const handleOutsideClick = (e) => {
        // Close dropdown if clicked outside
        if (!e.target.closest(".dropdown")) {
            setOpenDropdown(null);
        }
    };

    React.useEffect(() => {
        document.addEventListener("click", handleOutsideClick);
        return () => {
            document.removeEventListener("click", handleOutsideClick);
        };
    }, []);

    return (
        <nav className="navbar">
            <div className="container">
                {/* Search Bar */}
                <form className="navbar-search">
                    <div className="search-input-group">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search for..."
                        />
                        <button className="search-btn" type="button">
                            <i className="fas fa-search"></i>
                        </button>
                    </div>
                </form>

                {/* Navbar Items */}
                <ul className="navbar-items">
                    {/* Alerts Dropdown */}
                    <li className="dropdown">
                        <button
                            className="dropdown-toggle"
                            type="button"
                            onClick={() => toggleDropdown("alerts")}
                        >
                            <span className="badge">3+</span>
                            <i className="fas fa-bell"></i>
                        </button>
                        {openDropdown === "alerts" && (
                            <div className="dropdown-menu">
                                <h6 className="dropdown-header">Alerts Center</h6>
                                <button className="dropdown-item" type="button">
                                    <div className="icon-circle bg-primary">
                                        <i className="fas fa-file-alt"></i>
                                    </div>
                                    <div>
                                        <span className="dropdown-time">December 12, 2019</span>
                                        <p>A new monthly report is ready to download!</p>
                                    </div>
                                </button>
                                <button className="dropdown-footer" type="button">Show All Alerts</button>
                            </div>
                        )}
                    </li>

                    {/* Messages Dropdown */}
                    <li className="dropdown">
                        <button
                            className="dropdown-toggle"
                            type="button"
                            onClick={() => toggleDropdown("messages")}
                        >
                            <span className="badge">7</span>
                            <i className="fas fa-envelope"></i>
                        </button>
                        {openDropdown === "messages" && (
                            <div className="dropdown-menu">
                                <h6 className="dropdown-header">Message Center</h6>
                                <button className="dropdown-item" type="button">
                                    <img
                                        className="dropdown-avatar"
                                        src="avatars/avatar4.jpeg"
                                        alt="Avatar"
                                    />
                                    <div>
                                        <p className="text-truncate">
                                            Hi there! Can you help me with a problem I've been having?
                                        </p>
                                        <span className="dropdown-time">Emily Fowler · 58m</span>
                                    </div>
                                </button>
                                <button className="dropdown-footer" type="button">Show All Messages</button>
                            </div>
                        )}
                    </li>

                    {/* User Profile */}
                    <li className="dropdown">
                        <button
                            className="dropdown-toggle"
                            type="button"
                            onClick={() => toggleDropdown("profile")}
                        >
                            <span className="user-name">{user.username}</span>
                            <img
                                className="user-avatar"
                                src="https://media.istockphoto.com/id/1300845620/vector/user-icon-flat-isolated-on-white-background-user-symbol-vector-illustration.jpg?s=612x612&w=0&k=20&c=yBeyba0hUkh14_jgv1OKqIH0CCSWU_4ckRkAoy2p73o="
                                alt="Profile"
                            />
                        </button>
                        {openDropdown === "profile" && (
                            <div className="dropdown-menu">
                                <Link to="/profile" className="dropdown-item" type="button">
                                    <i className="fas fa-user"></i>  
                                    <span>Profile</span>
                                </Link>
                                <button className="dropdown-item" type="button">
                                    <i className="fas fa-cogs"></i>
                                    <span>Settings</span>
                                </button>
                                <div className="dropdown-divider"></div>
                                <button className="dropdown-item" type="button">
                                    <i className="fas fa-sign-out-alt"></i>
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
