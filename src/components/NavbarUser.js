import { Navbar, Nav, Container, Modal, Button } from "react-bootstrap";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import ProfileModal from "./ProfileModal";

const NavbarUser = () => {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const navbarRef = useRef(null);
  const [expanded, setExpanded] = useState(false);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleConfirmLogout = () => {
    localStorage.clear();
    navigate("/login-user");
  };

   useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        expanded &&
        navbarRef.current &&
        !navbarRef.current.contains(event.target)
      ) {
        setExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [expanded]);

  if (!token || role !== "user") return null;
  
  return (
    <>
      <Navbar  ref={navbarRef} expand="lg" fixed="top" expanded={expanded}   onToggle={(val) => setExpanded(val)} className="navbar-user shadow-sm">
        <Container>
          <Navbar.Brand
            as={Link}
            to="/user/dashboard"
            className="d-flex align-items-center gap-2"
          >
            <img src="/logo.svg" alt="Logo Pengaduan" height="32" />
            <span className="fw-semibold">Sistem Pengaduan Internal</span>
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="user-navbar-nav" />

          <Navbar.Collapse id="user-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={NavLink} to="/user/dashboard" end className="nav-user-link" onClick={() => setExpanded(false)}>
                Dashboard
              </Nav.Link>
              <Nav.Link as={NavLink} to="/user" end className="nav-user-link" onClick={() => setExpanded(false)}>
                Pengaduan
              </Nav.Link>
              <Nav.Link as={NavLink} to="/contact" className="nav-user-link" onClick={() => setExpanded(false)}> 
                Contact
              </Nav.Link>
              <Nav.Link as={NavLink} to="/riwayat" className="nav-user-link" onClick={() => setExpanded(false)}>
                Riwayat
              </Nav.Link>

              <Nav.Link
                className="nav-user-link"
                onClick={() => {
                  setShowProfile(true);
                  setExpanded(false);
                }}
              >
                Profil
              </Nav.Link>
            </Nav>

            <Nav className="ms-auto">
              <Button
                onClick={() => {
                  setShowLogout(true);
                  setExpanded(false);
                }}
                className="nav-user-link nav-logout"
              >
                Logout
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* MODAL PROFILE */}
      <ProfileModal
        show={showProfile}
        onHide={() => setShowProfile(false)}
        user={user}
      />

      {/* MODAL KONFIRMASI LOGOUT */}
      <Modal
        show={showLogout}
        onHide={() => setShowLogout(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Konfirmasi Logout</Modal.Title>
        </Modal.Header>

        <Modal.Body className="text-center">
          <i className="bi bi-exclamation-triangle-fill text-warning fs-1 mb-3"></i>
          <p>Apakah Anda yakin ingin logout?</p>
        </Modal.Body>

        <Modal.Footer className="justify-content-center">
          <Button
            variant="secondary"
            onClick={() => setShowLogout(false)}
          >
            Batal
          </Button>

          <Button
            variant="danger"
            onClick={handleConfirmLogout}
          >
            Ya, Logout
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default NavbarUser;
