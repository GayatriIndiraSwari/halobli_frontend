import { useAlert } from "../../context/AlertContext";
import { useEffect, useState } from "react";
import { Container, Form, Button, Table, Modal } from "react-bootstrap";
import api from "../../api/authAPI";

const KelolaAkun = () => {
  // =======================
  // STATE MODE
  // =======================
  const [mode, setMode] = useState("tambah"); // tambah | kelola
  const { showAlert, showConfirm } = useAlert();
  const getKategoriNama = (p) => p?.Kategori?.nama || "-";
  // MODAL LIST PENGADUAN
  const [showPengaduan, setShowPengaduan] = useState(false);
  const [pengaduanUser, setPengaduanUser] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);


  // =======================
  // STATE DATA
  // =======================
  const [data, setData] = useState([]);
  const [nip, setNip] = useState("");
  const [nama, setNama] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [search, setSearch] = useState("");


  // =======================
  // LOAD USER
  // =======================
  const loadUsers = async () => {
    try {
      const res = await api.get("/user");
      setData(res.data.data);
    } catch (err) {
      showAlert("Error", "Gagal mengambil data user", "danger");
    }
  };

  useEffect(() => {
    if (mode === "kelola") {
      loadUsers();
    }
  }, [mode]);

  // =======================
  // LOAD PENGADUAN PER USER (MODAL)
  // =======================
  const bukaPengaduanUser = async (user) => {
    try {
      const res = await api.get(`/pengaduan/user/${user.id}`);
      setPengaduanUser(res.data.data.pengaduan || []);
      setSelectedUser(user);
      setShowPengaduan(true);
    } catch {
      showAlert("Error", "Gagal mengambil data pengaduan", "danger");
    }
  };

  // =======================
  // TAMBAH AKUN
  // =======================
  const submit = async (e) => {
    e.preventDefault();

    // VALIDASI FRONTEND
    if (!nip || !nama || !lokasi || !password) {
      showAlert("Validasi", "Semua field wajib diisi", "warning");
      return;
    }

    try {
      await api.post("/user/add", {
        nip,
        nama,
        lokasi,
        password,
        role,
      });

      // PAKAI MODAL (AlertContext)
      showAlert("Berhasil", "Akun berhasil ditambahkan", "success");

      setNip("");
      setNama("");
      setLokasi("");
      setPassword("");
      setRole("user");
    } catch (err) {
      showAlert(
        "Gagal",
        err.response?.data?.message || "Gagal tambah akun",
        "danger"
      );
    }
  };

  // =======================
  // HAPUS AKUN
  // =======================
  const hapus = (id) => {
    showConfirm(
      "Hapus Akun",
      "Yakin ingin menghapus akun ini?",
      async () => {
        try {
          await api.delete(`/user/${id}`);
          loadUsers();
          showAlert("Berhasil", "Akun berhasil dihapus", "success");
        } catch {
          showAlert("Error", "Gagal menghapus akun", "danger");
        }
      }
    );
  };

  // RESET PASSWORD
  const resetPassword = (id) => {
    showConfirm(
      "Reset Password",
      "Password akan direset ke default (user123). Lanjutkan?",
      async () => {
        try {
          await api.put(`/user/reset-password/${id}`);
          showAlert("Berhasil", "Password berhasil direset", "success");
        } catch {
          showAlert("Error", "Gagal reset password", "danger");
        }
      }
    );
  };

  // HELPER TANGGAL
  const formatTanggal = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // FILTER SEARCH USER
  const filteredUsers = data.filter((u) => {
    if (!search) return true;

    const keyword = search.toLowerCase();

    return (
      u.nip?.toLowerCase().includes(keyword) ||
      u.nama?.toLowerCase().includes(keyword) ||
      u.lokasi?.toLowerCase().includes(keyword) ||
      u.role?.toLowerCase().includes(keyword) ||
      String(u.Pengaduans?.length || 0).includes(keyword)
    );
  });

  return (
    <Container className="mt-4">
      <h4>Kelola Akun</h4>

      {/* SWITCH MODE */}
      <div className="mb-3 d-flex gap-2">
        <Button
          variant={mode === "tambah" ? "primary" : "outline-primary"}
          onClick={() => setMode("tambah")}
        >
          Tambah Akun
        </Button>

        <Button
          variant={mode === "kelola" ? "primary" : "outline-primary"}
          onClick={() => setMode("kelola")}
        >
          Kelola Akun
        </Button>
      </div>

      {/* =======================
          FORM TAMBAH AKUN
      ======================= */}
      {mode === "tambah" && (
        <Form onSubmit={submit}>
          <Form.Control
            className="mb-2"
            placeholder="NIP"
            value={nip}
            onChange={(e) => setNip(e.target.value)}
            required
          />

          <Form.Control
            className="mb-2"
            placeholder="Nama"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            required
          />

          <Form.Select
            className="mb-2"
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

          <Form.Control
            type="password"
            className="mb-2"
            placeholder="Password awal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Form.Select
            className="mb-3"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </Form.Select>

          <Button type="submit">Tambah Akun</Button>
        </Form>
      )}

      <Modal
        show={showPengaduan}
        onHide={() => {
          setShowPengaduan(false);
          setPengaduanUser([]);
          setSelectedUser(null);
        }}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Daftar Pengaduan – {selectedUser?.nama}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Table bordered hover>
            <thead className="table-light">
              <tr>
                <th className="text-center">No</th>
                <th>Kategori</th>
                <th>Deskripsi</th>
                <th>Status</th>
                <th>Catatan</th>
                <th>Solusi</th>
                <th>Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {pengaduanUser.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">
                    Tidak ada pengaduan
                  </td>
                </tr>
              ) : (
                pengaduanUser.map((p, i) => (
                  <tr key={p.id}>
                    <td className="text-center">{i + 1}</td>
                    <td>{getKategoriNama(p)}</td>

                    {/* DESKRIPSI RINGKAS */}
                    <td
                      className="text-truncate"
                      style={{ maxWidth: "280px" }}
                      title={p.deskripsi}
                    >
                      {p.deskripsi}
                    </td>

                    <td>{p.status}</td>

                    {/* CATATAN */}
                    <td className="text-center">
                      {p.status === "Diproses" && p.catatan ? (
                        <span
                          className="badge bg-warning text-dark"
                          title={p.catatan}
                          style={{ cursor: "help" }}
                        >
                          Ada catatan
                        </span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>

                    <td>{p.solusi || "-"}</td>

                    {/* TANGGAL DINAMIS */}
                    <td> 
                      {p.status === "Selesai" && p.tanggal_selesai
                        ? formatTanggal(p.tanggal_selesai)
                        : formatTanggal(p.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowPengaduan(false);
              setPengaduanUser([]);
              setSelectedUser(null);
            }}
          >
            Tutup
          </Button>
        </Modal.Footer>
      </Modal>

      {/* =======================
          TABEL KELOLA AKUN
      ======================= */}
      {mode === "kelola" && (
        <>
          {/* SEARCH */}
          <div className="mb-3">
            <Form.Control
              style={{ maxWidth: "300px" }}
              placeholder="Cari akun..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <Table bordered className="mt-3">
            <thead className="table-light">
              <tr>
                <th className="text-center">No</th>
                <th>NIP</th>
                <th>Nama</th>
                <th>Lokasi</th>
                <th>Role</th>
                <th className="text-center">Jumlah Pengaduan</th>
                <th className="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u, index) => (
                  <tr key={u.id}>
                    <td className="text-center">{index + 1}</td>
                    <td>{u.nip}</td>
                    <td>{u.nama || "-"}</td>
                    <td>{u.lokasi || "-"}</td>
                    <td>{u.role}</td>

                    {/* JUMLAH PENGADUAN */}
                    <td className="text-center">
                      {u.Pengaduans?.length > 0 ? (
                        <Button
                          variant="link"
                          className="fw-bold p-0 text-decoration-none"
                          style={{ cursor: "pointer" }}
                          onClick={() => bukaPengaduanUser(u)}
                        >
                          {u.Pengaduans.length}
                        </Button>
                      ) : (
                        <span className="text-muted">0</span>
                      )}
                    </td>
                    
                    <td className="text-center">
                      <Button
                        size="sm"
                        variant="warning"
                        className="me-2"
                        onClick={() => resetPassword(u.id)}
                      >
                        Reset Password
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => hapus(u.id)}
                      >
                        Hapus
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </>
      )}
    </Container>
  );
};

export default KelolaAkun;
