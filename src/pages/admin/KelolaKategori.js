import { useEffect, useState } from "react";
import { Container, Table, Button, Form, Modal, Card, Badge } from "react-bootstrap";
import api from "../../api/authAPI";
import { useAlert } from "../../context/AlertContext";

const KelolaKategori = () => {
  const [kategori, setKategori] = useState([]);
  const [nama, setNama] = useState("");
  const [editData, setEditData] = useState(null);

  const { showAlert, showConfirm } = useAlert();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const loadKategori = async () => {
    const res = await api.get("/kategori");
    setKategori(res.data.data);
  };

  useEffect(() => {
    loadKategori();
  }, []);

  // ======================
  // TAMBAH
  // ======================
  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/kategori", { nama });
      setNama("");
      loadKategori();
      showAlert("Sukses", "Kategori berhasil ditambahkan", "success");
    } catch (err) {
      showAlert("Gagal", err.response?.data?.message, "danger");
    }
  };

  // ======================
  // UPDATE
  // ======================
  const updateKategori = async () => {
    try {
      await api.put(`/kategori/${editData.id}`, { nama: editData.nama });
      setEditData(null);
      loadKategori();
      showAlert("Sukses", "Kategori berhasil diperbarui", "success");
    } catch (err) {
      showAlert("Gagal", err.response?.data?.message, "danger");
    }
  };

  // ======================
  // HAPUS
  // ======================
  const deleteKategori = (id) => {
    showConfirm(
      "Hapus Kategori",
      "Kategori yang sudah digunakan tidak bisa dihapus",
      async () => {
        try {
          await api.delete(`/kategori/${id}`);
          loadKategori();
          showAlert("Sukses", "Kategori berhasil dihapus", "success");
        } catch (err) {
          showAlert("Gagal", err.response?.data?.message, "danger");
        }
      }
    );
  };

  // LOGIKA SEARCH DAN SORT
  const filteredKategori = [...kategori]
    // SEARCH
    .filter((k) =>
      k.nama.toLowerCase().includes(search.toLowerCase())
    )
    // FILTER STATUS
    .filter((k) => {
      if (statusFilter === "ALL") return true;
      if (statusFilter === "DIGUNAKAN") return k.digunakan;
      if (statusFilter === "BEBAS") return !k.digunakan;
      return true;
    })
    // SORT: Digunakan dulu (optional, boleh dihapus)
    .sort((a, b) => Number(b.digunakan) - Number(a.digunakan));

  return (
    <Container className="mt-4">
      <h4>Kelola Kategori</h4>

      {/* FORM TAMBAH */}
      <Card className="mb-3">
        <Card.Body>
          <Form onSubmit={submit}>
            <Form.Control
              placeholder="Nama kategori"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
            />
            <Button className="mt-2" type="submit">
              Tambah
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <div className="d-flex gap-2 mb-3 flex-wrap">
        <Form.Control
          style={{ maxWidth: "300px" }}
          placeholder="Cari kategori..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Form.Select
          style={{ maxWidth: "200px" }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">Semua Status</option>
          <option value="DIGUNAKAN">Digunakan</option>
          <option value="BEBAS">Bebas</option>
        </Form.Select>
      </div>

      {/* TABEL */}
      <Table bordered hover className="text-center">
        <thead>
          <tr>
            <th>No</th>
            <th>Nama</th>
            <th>Status</th>
            <th width="180">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {filteredKategori.map((k, i) => (
            <tr key={k.id}>
              <td>{i + 1}</td>
              <td>{k.nama}</td>
              <td>
                {k.digunakan ? (
                  <Badge bg="secondary">Digunakan</Badge>
                ) : (
                  <Badge bg="success">Bebas</Badge>
                )}
              </td>
              <td>
                <Button
                  size="sm"
                  variant="warning"
                  className="me-2"
                  disabled={k.digunakan}   
                  title={
                    k.digunakan
                      ? "Kategori sudah digunakan dan tidak bisa diedit"
                      : "Edit kategori"
                  }
                  onClick={() => setEditData(k)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  disabled={k.digunakan}   
                  title={
                    k.digunakan
                      ? "Kategori sudah digunakan dan tidak bisa dihapus"
                      : "Hapus kategori"
                  }
                  onClick={() => deleteKategori(k.id)}
                >
                  Hapus
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* MODAL EDIT */}
      <Modal show={!!editData} onHide={() => setEditData(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Kategori</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            value={editData?.nama || ""}
            onChange={(e) =>
              setEditData({ ...editData, nama: e.target.value })
            }
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setEditData(null)}>
            Batal
          </Button>
          <Button onClick={updateKategori}>Simpan</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default KelolaKategori;
