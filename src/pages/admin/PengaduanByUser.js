import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Container, Table, Badge, Button, Modal } from "react-bootstrap";
import api from "../../api/authAPI";

const PengaduanByUser = () => {
  const { userId } = useParams();
  const [data, setData] = useState([]);
  const [user, setUser] = useState(null);

  // 🔥 modal
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      const res = await api.get(`/pengaduan/user/${userId}`);
      setData(res.data.data.pengaduan || []);
      setUser(res.data.data.user);
    } catch (err) {
      console.error(err);
    }
  };

  const formatTanggal = (tgl) => {
    if (!tgl) return "-";
    return new Date(tgl).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <Container className="mt-4">
      <h4>Daftar Pengaduan User</h4>

      {user && (
        <p className="text-muted">
          <b>{user.nama}</b> ({user.nip}) — {user.lokasi}
        </p>
      )}

      {/* ================= TABEL RINGKAS ================= */}
      <Table bordered hover>
        <thead className="table-light">
          <tr>
            <th>No</th>
            <th>Kategori</th>
            <th>Status</th>
            <th>Tanggal Dibuat</th>
            <th>Aksi</th>
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center">
                Tidak ada pengaduan
              </td>
            </tr>
          ) : (
            data.map((p, i) => (
              <tr key={p.id}>
                <td>{i + 1}</td>
                <td>{p.kategori}</td>
                <td>
                  <Badge
                    bg={
                      p.status === "Selesai"
                        ? "success"
                        : p.status === "Diproses"
                        ? "warning"
                        : "secondary"
                    }
                  >
                    {p.status}
                  </Badge>
                </td>
                <td>{formatTanggal(p.created_at)}</td>
                <td>
                  <Button
                    size="sm"
                    variant="info"
                    onClick={() => {
                      setSelected(p);
                      setShowModal(true);
                    }}
                  >
                    Detail
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      <Button variant="secondary" onClick={() => window.history.back()}>
        Kembali
      </Button>

      {/* ================= MODAL DETAIL ================= */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Detail Pengaduan</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {selected && (
            <>
              <p><b>Kategori:</b> {selected.kategori}</p>
              <p><b>Status:</b> {selected.status}</p>

              <hr />

              <p><b>Deskripsi:</b></p>
              <p>{selected.deskripsi || "-"}</p>

              <p><b>Catatan:</b></p>
              <p>{selected.catatan || "-"}</p>

              <p><b>Solusi:</b></p>
              <p>{selected.solusi || "-"}</p>

              <hr />

              <p><b>Tanggal Dibuat:</b> {formatTanggal(selected.created_at)}</p>
              <p><b>Tanggal Ditindaklanjuti:</b> {formatTanggal(selected.tanggal_ditindaklanjuti)}</p>
              <p><b>Tanggal Selesai:</b> {formatTanggal(selected.tanggal_selesai)}</p>

              <hr />

              <p><b>Lampiran:</b></p>
              {selected.lampiran ? (
                <a
                  href={`http://localhost:5000/uploads/${selected.lampiran}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Lihat Lampiran
                </a>
              ) : (
                <p>-</p>
              )}
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Tutup
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PengaduanByUser;
