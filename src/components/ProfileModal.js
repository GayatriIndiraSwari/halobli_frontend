import { Modal, Form, Button, InputGroup, Badge } from "react-bootstrap";
import { useState, useEffect } from "react";
import api from "../api/authAPI";
import { useAlert } from "../context/AlertContext";
import { useNavigate } from "react-router-dom";

const ProfileModal = ({ show, onHide, user }) => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const role = user?.role; // "admin" | "user"
  const isAdmin = role === "admin";

  // =======================
  // STATE
  // =======================
  const [nama, setNama] = useState("");
  const [lokasi, setLokasi] = useState("");

  const [passwordLama, setPasswordLama] = useState("");
  const [passwordBaru, setPasswordBaru] = useState("");
  const [konfirmasiPassword, setKonfirmasiPassword] = useState("");

  const [showPassword, setShowPassword] = useState({ lama: false, baru: false, konfirmasi: false,});
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // =======================
  // DERIVED STATE
  // =======================
  const profileChanged =
    nama !== (user?.nama || "") || lokasi !== (user?.lokasi || "");

  const passwordValid =
    passwordBaru.length >= 5 &&
    /[a-zA-Z]/.test(passwordBaru) &&
    /\d/.test(passwordBaru);

  const getLoginPath = () =>
    isAdmin ? "/login-admin" : "/login-user";

  // =======================
  // EFFECT
  // =======================
  useEffect(() => {
    if (user && show) {
      setNama(user.nama || "");
      setLokasi(user.lokasi || "");
    }
  }, [user, show]);

  const resetPassword = () => {
    setPasswordLama("");
    setPasswordBaru("");
    setKonfirmasiPassword("");
  };

  const resetAll = () => {
    // reset profil ke data user awal
    setNama(user?.nama || "");
    setLokasi(user?.lokasi || "");

    // reset password
    resetPassword();

    // reset show password (ikon mata)
    setShowPassword({
      lama: false,
      baru: false,
      konfirmasi: false,
    });
  };

  const handleClose = () => {
    resetAll();
    onHide();
  };

  // =======================
  // UPDATE PROFILE
  // =======================
  const handleSaveProfile = async () => {
    if (!profileChanged) return;

    try {
      setLoadingProfile(true);
      const res = await api.put("/user/profile", { nama, lokasi });
      localStorage.setItem("user", JSON.stringify(res.data.user));
      showAlert("Berhasil", "Profil berhasil diperbarui", "success");
      handleClose();
    } catch (err) {
      showAlert(
        "Gagal",
        err.response?.data?.message || "Gagal update profil",
        "danger"
      );
    } finally {
      setLoadingProfile(false);
    }
  };

  // =======================
  // CHANGE PASSWORD
  // =======================
  const handleChangePassword = async () => {
    if (!passwordValid) {
      showAlert(
        "Validasi",
        "Password minimal 5 karakter dan mengandung huruf & angka (contoh: user0)",
        "warning"
      );
      return;
    }

    if (passwordBaru !== konfirmasiPassword) {
      showAlert("Validasi", "Konfirmasi password tidak cocok", "warning");
      return;
    }

    try {
      setLoadingPassword(true);

      await api.put("/user/change-password", {
        passwordLama,
        passwordBaru,
      });

      // ALERT SUKSES (GANTI confirm)
      showAlert(
        "Berhasil",
        "Password berhasil diubah, silakan login kembali",
        "success"
      );

      // TUNGGU USER LIHAT ALERT
      setTimeout(() => {
        localStorage.clear();
        handleClose();
        navigate(getLoginPath(), { replace: true });
      }, 1200);

    } catch (err) {
      showAlert(
        "Gagal",
        err.response?.data?.message || "Gagal mengganti password",
        "danger"
      );
    } finally {
    setLoadingPassword(false);
    }
  };

  return (
    <>
      <Modal show={show} onHide={handleClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            Pengaturan Akun{" "}
            <Badge bg={isAdmin ? "danger" : "primary"}>
              {isAdmin ? "Admin" : "User"}
            </Badge>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {/* =======================
              PROFIL
          ======================= */}
          <h6 className="text-secondary">Profil</h6>

          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Nama</Form.Label>
              <Form.Control
                value={nama}
                onChange={(e) => setNama(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Lokasi</Form.Label>
              <Form.Select
                value={lokasi}
                onChange={(e) => setLokasi(e.target.value)}
                disabled={isAdmin} // 🔒 ADMIN TIDAK BOLEH UBAH LOKASI
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
              {isAdmin && (
                <small className="text-muted">
                  Lokasi admin tidak dapat diubah
                </small>
              )}
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button
                disabled={!profileChanged || loadingProfile}
                onClick={handleSaveProfile}
              >
                {loadingProfile ? "Menyimpan..." : "Simpan Profil"}
              </Button>
            </div>
          </Form>

          <hr />

          {/* =======================
              PASSWORD
          ======================= */}
          <h6 className="text-secondary">Keamanan</h6>

          {[
            {
              key: "lama",
              label: "Password Lama",
              value: passwordLama,
              set: setPasswordLama,
            },
            {
              key: "baru",
              label: "Password Baru",
              value: passwordBaru,
              set: setPasswordBaru,
            },
            {
              key: "konfirmasi",
              label: "Konfirmasi Password",
              value: konfirmasiPassword,
              set: setKonfirmasiPassword,
            },
          ].map((f) => (
            <Form.Group className="mb-2" key={f.key}>
              <Form.Label>{f.label}</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword[f.key] ? "text" : "password"}
                  value={f.value}
                  onChange={(e) => f.set(e.target.value)}
                />
                <Button
                  variant="outline-secondary"
                  onClick={() =>
                    setShowPassword((prev) => ({
                      ...prev,
                      [f.key]: !prev[f.key],
                    }))
                  }
                >
                  <i
                    className={`bi ${
                      showPassword[f.key] ? "bi-eye-slash" : "bi-eye"
                    } fs-5`}
                  />
                </Button>
              </InputGroup>
            </Form.Group>
          ))}

          <small className="text-muted">
            Minimal 5 karakter, huruf & angka (contoh: user0)
          </small>

          <div className="d-flex justify-content-end mt-3">
            <Button
              variant="warning"
              disabled={!passwordLama || !passwordValid}
              onClick={() => setShowConfirm(true)}
            >
              Ganti Password
            </Button>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Tutup
          </Button>
        </Modal.Footer>
      </Modal>

      {/* =======================
        MODAL KONFIRMASI GANTI PASSWORD
      ======================= */}
      <Modal
        show={showConfirm}
        onHide={() => setShowConfirm(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Konfirmasi</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          Apakah Anda yakin ingin mengganti password dan logout?
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowConfirm(false)}
          >
            Batal
          </Button>

          <Button
            variant="warning"
            onClick={() => {
              setShowConfirm(false);
              handleChangePassword();
            }}
          >
            Ya, Ganti
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ProfileModal;
