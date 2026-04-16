import { Container } from "react-bootstrap";

const Footer = ({ variant = "user" }) => {
  return (
    <footer className={variant === "admin" ? "footer-admin" : "footer-user"}>
      <small>© 2026 Sistem Pengaduan Internal</small>
    </footer>
  );
};

export default Footer;
