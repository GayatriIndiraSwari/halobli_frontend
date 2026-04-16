import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import api from "../api/authAPI";

const HistoryPengaduanModal = ({ show, onHide, pengaduanId }) => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!pengaduanId || !show) return;

    api.get(`/pengaduan/${pengaduanId}/history`)
      .then((res) => setHistory(res.data.data))
      .catch(() => setHistory([]));
  }, [pengaduanId, show]);

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>History Penanganan Pengaduan</Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ maxHeight: "60vh", overflowY: "auto" }}>
        {history.length === 0 ? (
          <div className="text-center text-muted py-4">
            <i className="bi bi-clock-history fs-3 d-block mb-2"></i>
            Belum ada riwayat pengaduan
          </div>
        ) : (
          <div className="timeline">
            {history.map((h, i) => (
              <div key={i} className="timeline-item d-flex mb-4">
                {/* Bullet */}
                <div className="me-3">
                  <span className="timeline-dot"></span>
                </div>

                {/* Content */}
                <div className="flex-grow-1">
                  <div className="bg-light rounded p-3 shadow-sm">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <small className="text-muted">
                        {new Date(h.created_at).toLocaleString("id-ID", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </small>

                      <span className="badge bg-secondary">
                        {h.Petugas?.nama || "Admin"}
                      </span>
                    </div>

                    <p className="mb-0 fw-semibold">{h.deskripsi}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default HistoryPengaduanModal;
