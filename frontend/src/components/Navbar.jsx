import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Navbar = () => {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  // 🔁 React to login/logout changes
  useEffect(() => {
    const syncAuth = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
    };

    // custom event for same-tab updates
    window.addEventListener("auth-change", syncAuth);

    return () => {
      window.removeEventListener("auth-change", syncAuth);
    };
  }, []);

  // 🚪 Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("auth-change")); // 🔥 notify navbar
    setMenuOpen(false);
    navigate("/login");
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <nav className="navbar">
        <div className="nav-header">
          <div className="brand">📘 Study App</div>

          <button
            className="hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>
        </div>

        <div className={`nav-links ${menuOpen ? "open" : ""}`}>
          {/* PUBLIC */}
          <NavLink to="/" end onClick={closeMenu}>
            Home
          </NavLink>

          <NavLink to="/notes" onClick={closeMenu}>
            Notes
          </NavLink>

          <NavLink to="/question-papers" onClick={closeMenu}>
            Question Papers
          </NavLink>

          {/* AUTH BASED */}
          {isLoggedIn ? (
            <>
              <NavLink to="/profile" onClick={closeMenu}>
                Profile
              </NavLink>

              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={closeMenu}>
                Login
              </NavLink>

              <NavLink to="/register" onClick={closeMenu}>
                Register
              </NavLink>
            </>
          )}
        </div>
      </nav>

      {menuOpen && (
        <div className="menu-overlay" onClick={closeMenu}></div>
      )}
    </>
  );
};

export default Navbar;




