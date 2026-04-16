import { useState, useEffect } from "react";
import { Container, Form, Button, Card, Modal, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";

function RegisterUser() {
  const [nip, setNip] = useState("");
  const [nama, setNama] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [password, setPassword] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const navigate = useNavigate();

  // VALIDASI PASSWORD REAL-TIME
  useEffect(() => {
    if (password && password.length < 5) {
      setPasswordError("Password minimal 5 karakter");
    } else if (password && !/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
      setPasswordError("Password harus mengandung huruf dan angka");
    } else {
      setPasswordError("");
    }

    if (confirmPassword && confirmPassword !== password) {
      setConfirmError("Password dan konfirmasi tidak sama");
    } else {
      setConfirmError("");
    }
  }, [password, confirmPassword]);

  const handleRegister = async (e) => {
    e.preventDefault();

    // VALIDASI FRONTEND (DITAMBAHKAN DI SINI)
    if (!nip || !nama || !lokasi || !password || !confirmPassword) {
      setErrorMessage("Semua field wajib diisi");
      return;
    }
    if (passwordError || confirmError) {
      setErrorMessage("Perbaiki error pada form sebelum submit");
      return;
    }
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        nip,
        nama,
        lokasi,
        password,
        confirmPassword, // dikirim ke backend untuk double-check
        role: "user",
      });

      setErrorMessage(""); // reset error
      setShowModal(true);
    } catch (err) {
      console.log(err);
      setErrorMessage(err.response?.data?.message || "Registrasi gagal");
    }
  };

  return (
    <Container className="mt-5">
      <Card className="mx-auto" style={{ maxWidth: "450px" }}>
        <Card.Body>
          <Card.Title className="text-center mb-4">
            Registrasi Pegawai
          </Card.Title>

          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

          <Modal
            show={showModal}
            onHide={() => setShowModal(false)}
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Registrasi Berhasil</Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <p>Akun Anda berhasil didaftarkan.</p>
              <p>Silakan login untuk melanjutkan.</p>
            </Modal.Body>

            <Modal.Footer>
              <Button
                variant="primary"
                onClick={() => navigate("/login-user")}
              >
                Login Sekarang
              </Button>
            </Modal.Footer>
          </Modal>

          <Form onSubmit={handleRegister}>
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
              <Form.Label>Nama Lengkap</Form.Label>
              <Form.Control
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Lokasi</Form.Label>
              <Form.Select
                value={lokasi}
                onChange={(e) => setLokasi(e.target.value)}
                required
              >
                <option value="">-- Pilih Lokasi --</option>
                <option value="TU">TU</option>
                <option value="Sosial">Sosial</option>
                <option value="Produksi">Produksi</option>
                <option value="Distribusi">Distribusi</option>
                <option value="Neraca">Neraca</option>
                <option value="PST">PST</option>
                <option value="IPDS">IPDS</option>
              </Form.Select>
            </Form.Group>


            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                isInvalid={!!passwordError}
                required
              />
              <Form.Control.Feedback type="invalid">{passwordError}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Konfirmasi Password</Form.Label>
              <Form.Control
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                isInvalid={!!confirmError}
                required
              />
              <Form.Control.Feedback type="invalid">{confirmError}</Form.Control.Feedback>
            </Form.Group>

            <Button type="submit" className="w-100">
              Daftar
            </Button>
          </Form>

          <div className="text-center mt-3">
            <small>
              Sudah punya akun? <Link to="/login-user">Login</Link>
            </small>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default RegisterUser;
