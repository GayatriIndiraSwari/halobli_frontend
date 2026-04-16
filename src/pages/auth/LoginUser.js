import { useState } from "react";
import { Container, Form, Button, Card } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/authAPI";
import AlertModal from "../../components/AlertModal";


function LoginUser() {
  const [nip, setNip] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalVariant, setModalVariant] = useState("success");

  const handleLoginUser = async (e) => {
  e.preventDefault();

  try {
    const res = await api.post("/auth/login-user", { nip, password });
    const { token, User } = res.data;

    if (User.role !== "user") {
      setModalTitle("Akses Ditolak");
      setModalMessage("Akun ini bukan user");
      setModalVariant("danger");
      setShowModal(true);
      return;
    }

    localStorage.clear();
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(User));
    localStorage.setItem("role", "user");

    setModalTitle("Login Berhasil");
    setModalMessage("Selamat datang di sistem pengaduan");
    setModalVariant("success");
    setShowModal(true);

    setTimeout(() => {
      navigate("/user/dashboard");
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
      <Card className="mx-auto" style={{ maxWidth: "400px" }}>
        <Card.Body>
          <Card.Title className="text-center mb-4">
            Login Pegawai BPS
          </Card.Title>

          <AlertModal
            show={showModal}
            onClose={() => setShowModal(false)}
            title={modalTitle}
            message={modalMessage}
            variant={modalVariant}
          />

          <Form onSubmit={handleLoginUser}>
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

            <Button type="submit" className="w-100">
              Login
            </Button>

            <div className="mt-2 text-center">
              <small>
                Belum punya akun?{" "}
                <Link to="/register">Register</Link>
              </small>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default LoginUser;
