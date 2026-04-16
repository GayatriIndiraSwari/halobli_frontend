import { Navbar, Nav, Container, Modal, Button } from "react-bootstrap";
import { useState, useRef, useEffect } from "react";
import ProfileModal from "./ProfileModal";
import { NavLink, Link, useNavigate } from "react-router-dom";

const NavbarAdmin = () => {
  const [showProfile, setShowProfile] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const navbarRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleConfirmLogout = () => {
    localStorage.clear();
    navigate("/login-admin");
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

  // ❗ JIKA BUKAN ADMIN → NAVBAR TIDAK MUNCUL
  if (!token || role !== "admin") return null;

  return (
    <>
      <Navbar  ref={navbarRef} expand="lg" fixed="top" expanded={expanded}   onToggle={(val) => setExpanded(val)} className="navbar-admin shadow-sm" bg="dark" variant="dark">
        <Container>
          <Navbar.Brand
            as={Link}
            to="/admin/dashboard"
            className="d-flex align-items-center gap-2"
          >
            <img
              src="/logo.svg"
              alt="Logo Pengaduan"
              className="brand-logo"
            />
            <span className="fw-semibold">Sistem Pengaduan Internal</span>
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="admin-navbar-nav" />
          <Navbar.Collapse id="admin-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link as={NavLink} to="/admin/dashboard" end className="nav-admin-link" onClick={() => setExpanded(false)}>
                Dashboard
              </Nav.Link>

              <Nav.Link as={NavLink} to="/admin/kelola" end className="nav-admin-link" onClick={() => setExpanded(false)}>
                Kelola Pengaduan
              </Nav.Link>

              <Nav.Link as={NavLink} to="/admin/kategori" end className="nav-admin-link" onClick={() => setExpanded(false)}>
                Kelola Kategori
              </Nav.Link>

              <Nav.Link as={NavLink} to="/admin/riwayat" end className="nav-admin-link" onClick={() => setExpanded(false)}>
                Riwayat Pengaduan
              </Nav.Link>

              <Nav.Link as={NavLink} to="/admin/kelola-akun" end className="nav-admin-link" onClick={() => setExpanded(false)}>
                Kelola Akun
              </Nav.Link>

              <Nav.Link
                className="nav-admin-link"
                onClick={() => {
                  setShowProfile(true);
                  setExpanded(false);
                }}
              >
                Profil
              </Nav.Link>

              <Nav.Link
                className="nav-admin-link"
                onClick={() => {
                  setShowLogout(true);
                  setExpanded(false);
                }}
              >
                Logout
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

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

export default NavbarAdmin;
