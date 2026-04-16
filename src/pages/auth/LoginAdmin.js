import { useState } from "react";
import { Container, Form, Button, Card } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/authAPI";
import AlertModal from "../../components/AlertModal";

 function LoginAdmin() {
  const [nip, setNip] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();


  // =======================
  // STATE MODAL (WAJIB)
  // =======================
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalVariant, setModalVariant] = useState("success");
   
  const handleLoginAdmin = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/login-admin", {
        nip,
        password,
      });

      const { token, User } = res.data;

      // BUKAN ADMIN
      if (User.role !== "admin") {
        setModalTitle("Akses Ditolak");
        setModalMessage("Akun ini bukan admin");
        setModalVariant("danger");
        setShowModal(true);
        return;
      }

      // =======================
      // SIMPAN LOGIN
      // =======================
      localStorage.clear();
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(User));
      localStorage.setItem("role", "admin");

      // BERHASIL
      setModalTitle("Login Berhasil");
      setModalMessage("Selamat datang, Admin");
      setModalVariant("success");
      setShowModal(true);

      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 1000);
    } catch (err) {
      setModalTitle("Login Gagal");
      setModalMessage(
        err.response?.data?.message || "Terjadi kesalahan"
      );
      setModalVariant("danger");
      setShowModal(true);
    }
  };

  return (
    <Container className="mt-5">
      <Card className="mx-auto" style={{ maxWidth: "450px" }}>
        <Card.Body>
          <Card.Title className="text-center mb-4">Login Admin</Card.Title>

           {/* ===== MODAL ===== */}
          <AlertModal
            show={showModal}
            onClose={() => setShowModal(false)}
            title={modalTitle}
            message={modalMessage}
            variant={modalVariant}
          />

          <Form onSubmit={handleLoginAdmin}>
            <Form.Group className="mb-3">
              <Form.Label>NIP</Form.Label>
              <Form.Control
                type="text"
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Button type="submit" className="w-100">Login</Button>
          </Form>

          <div className="text-center mt-3">
            <small>
              Kembali ke <Link to="/login-user">Login User</Link>
            </small>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default LoginAdmin;
