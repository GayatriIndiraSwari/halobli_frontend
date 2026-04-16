import { useAlert } from "../../context/AlertContext";
import { useCallback, useEffect, useState } from "react";
import { Button, Form, Modal, Badge, Alert } from "react-bootstrap";
import api from "../../api/authAPI";

/**
 * =======================
 * HALAMAN KELOLA PENGADUAN (ADMIN)
 * =======================
 * Fungsi:
 * - Menampilkan semua pengaduan
 * - Admin dapat:
 *   - Proses pengaduan
 *   - Memberi solusi & menyelesaikan
 *   - Melihat detail + lampiran
 *   - Menghapus laporan
 *   - Tindak lanjut hanya boleh saat status = Diproses
 *   - Admin dapat menyimpan CATATAN SEMENTARA
 *   - Status Diproses ≠ langsung Selesai
 */
const KelolaPengaduan = () => {
  // =======================
  // STATE UTAMA
  // =======================
  const [data, setData] = useState([]);
  const { showAlert, showConfirm } = useAlert();
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortConfig, setSortConfig] = useState({
    key: "",
    direction: "asc",
  });

  // STATE MODAL
  const [showDetail, setShowDetail] = useState(false);
  const [catatan, setCatatan] = useState("");
  const [solusi, setSolusi] = useState("");
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showCatatan, setShowCatatan] = useState(false);
  const [showSolusi, setShowSolusi] = useState(false);

  // EDIT HISTORY PENANGANAN
  const [showEditHistory, setShowEditHistory] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [editDeskripsi, setEditDeskripsi] = useState("");

  // =======================
  // PAGINATION
  // =======================
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // =======================
  // LOAD DATA PENGADUAN
  // =======================
  const loadPengaduan = useCallback(async () => {
    try {
      const res = await api.get("/pengaduan");
      const withHistoryFlag = await Promise.all(
        res.data.data.map(async (p) => {
          try {
            const h = await api.get(`/pengaduan/${p.id}/history`);
            return {
              ...p,
              hasHistory: h.data.data && h.data.data.length > 0,
            };
          } catch {
            return {
              ...p,
              hasHistory: false,
            };
          }
        })
      );

      setData(withHistoryFlag);
    } catch (err) {
      showAlert(
        "Gagal Memuat Data",
        "Tidak dapat mengambil data pengaduan",
        "danger"
      );
    }
  }, [showAlert]);


  useEffect(() => {
    loadPengaduan();
  }, [loadPengaduan]);

  // RESET HALAMAN SAAT SEARCH / SORT
  useEffect(() => {
    setCurrentPage(1);
  }, [search, sortConfig]);

  // =======================
  // HELPER AMAN SORT TANGGAL
  // =======================
  const toDate = (val) => {
    if (!val) return new Date(0); // 1 Jan 1970
    const d = new Date(val);
    return isNaN(d.getTime()) ? new Date(0) : d;
  };

  // =======================
  // FILTER & SEARCH & SORT
  // =======================
  const filteredData = [...data]
  // FILTER STATUS (BARU)
  .filter((p) => {
    if (statusFilter === "ALL") return true;
    return p.status === statusFilter;
  })
    
  // SEARCH SEMUA KOLOM
  .filter((p) => {
    if (!search) return true;
    const keyword = search.toLowerCase();

    return (
      p.Pelapor?.nama?.toLowerCase().includes(keyword) ||
      p.Pelapor?.lokasi?.toLowerCase().includes(keyword) ||
      p.Kategori?.nama?.toLowerCase().includes(keyword) ||
      p.deskripsi?.toLowerCase().includes(keyword) ||
      p.status?.toLowerCase().includes(keyword)
    );
  })

  // 🔃 SORT HEADER
  .sort((a, b) => {
  if (!sortConfig.key) return 0;

  let aVal, bVal;

  switch (sortConfig.key) {
    case "nama":
      aVal = a.Pelapor?.nama || "";
      bVal = b.Pelapor?.nama || "";
      return sortConfig.direction === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);

    case "lokasi":
      aVal = a.Pelapor?.lokasi || "";
      bVal = b.Pelapor?.lokasi || "";
      return sortConfig.direction === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);

    case "kategori":
      return sortConfig.direction === "asc"
        ? (a.Kategori?.nama || "").localeCompare(b.Kategori?.nama || "")
        : (b.Kategori?.nama || "").localeCompare(a.Kategori?.nama || "");

    case "status":
      return sortConfig.direction === "asc"
        ? a.status.localeCompare(b.status)
        : b.status.localeCompare(a.status);

    case "created_at":
      return sortConfig.direction === "asc"
        ? toDate(a.created_at) - toDate(b.created_at)
        : toDate(b.created_at) - toDate(a.created_at);

    case "tanggal_ditindaklanjuti":
      return sortConfig.direction === "asc"
        ? toDate(a.tanggal_ditindaklanjuti) - toDate(b.tanggal_ditindaklanjuti)
        : toDate(b.tanggal_ditindaklanjuti) - toDate(a.tanggal_ditindaklanjuti);

    case "tanggal_selesai":
      return sortConfig.direction === "asc"
        ? toDate(a.tanggal_selesai) - toDate(b.tanggal_selesai)
        : toDate(b.tanggal_selesai) - toDate(a.tanggal_selesai);

    default:
      return 0;
  }
});
  
  // =======================
    // HITUNG PAGINATION
    // =======================
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const paginatedData = filteredData.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

  //Format Tanggal
  const formatTanggalID = (tanggal, fallback = "-") => {
    return tanggal
      ? new Date(tanggal).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : fallback;
  };

  // FUNGSI REQUEST SORT (HEADER)
  // (ASC → DESC → RESET)
  const requestSort = (key) => {
    if (sortConfig.key !== key) {
      setSortConfig({ key, direction: "asc" });
    } else if (sortConfig.direction === "asc") {
      setSortConfig({ key, direction: "desc" });
    } else {
      // RESET SORT
      setSortConfig({ key: "", direction: "asc" });
    }
  };

  // ICON SORT
  const getSortIcon = (key) => {
  if (sortConfig.key !== key) return "bi-arrow-down-up";
  return sortConfig.direction === "asc"
    ? "bi-sort-alpha-down"
    : "bi-sort-alpha-up";
  };

  // =======================
  // PROSES PENGADUAN
  // =======================
  const prosesPengaduan = async (id) => {
    await api.put(`/pengaduan/status/${id}`, { status: "Diproses" });
    loadPengaduan();
  };

  // =======================
  // SIMPAN CATATAN SEMENTARA
  // =======================
  const simpanCatatan = async () => {
    if (!catatan || catatan.trim() === "") {
      showAlert("Validasi", "Catatan tidak boleh kosong", "warning");
      return;
    }
    try {
      await api.put(`/pengaduan/status/${selected.id}`, {
        status: "Diproses",
        catatan: catatan,
      });

      showAlert(
        "Berhasil",
        "Catatan berhasil disimpan",
        "success"
      );
      setShowCatatan(false);
      loadPengaduan();
    } catch (err) {
      console.error("Gagal simpan catatan:", err);
      showAlert(
        "Gagal Menyimpan",
        err.response?.data?.message || "Terjadi kesalahan saat menyimpan catatan",
        "danger"
      );
    }
  };

  const handleShowSolusi = async (p) => {
    try {
      const res = await api.get(`/pengaduan/${p.id}/history`);

      if (!res.data.data || res.data.data.length === 0) {
        showAlert(
          "Validasi",
          "Pengaduan belum memiliki catatan/history penanganan",
          "warning"
        );
        return;
      }

      setSelected(p);
      setSolusi("");
      setShowSolusi(true);
    } catch (err) {
      console.error(err);
      showAlert(
        "Error",
        "Gagal memeriksa history pengaduan",
        "danger"
      );
    }
  };

  // =======================
  // SIMPAN & SELESAIKAN
  // =======================
  const simpanSolusi = async () => {
    if (!solusi || solusi.trim() === "") {
      showAlert(
        "Validasi",
        "Solusi final wajib diisi sebelum menyelesaikan pengaduan",
        "warning"
      );
      return;
    }

    try {
      await api.put(`/pengaduan/status/${selected.id}`, {
        status: "Selesai",
        solusi: solusi,
      });

      showAlert("Berhasil", "Pengaduan berhasil diselesaikan", "success");

      setShowSolusi(false);
      setSolusi("");
      setCatatan("");
      setSelected(null);
      loadPengaduan();
    } catch (err) {
      showAlert(
        "Error",
        err.response?.data?.message || "Gagal menyimpan solusi",
        "danger"
      );
    }
  };

  // =======================
  // BADGE STATUS
  // =======================
  const statusBadge = (status) => {
    if (status === "Dikirim") return <Badge bg="primary">Dikirim</Badge>;
    if (status === "Diproses") return <Badge bg="warning">Diproses</Badge>;
    return <Badge bg="success">Selesai</Badge>;
  };

  // =======================
  // HAPUS PENGADUAN (ADMIN)
  // =======================
  const hapusPengaduan = (id) => {
    showConfirm(
      "Hapus Pengaduan",
      "Data akan dihapus permanen. Lanjutkan?",
      async () => {
        try {
          await api.delete(`/pengaduan/admin/${id}`);
          showAlert("Berhasil", "Pengaduan berhasil dihapus", "success");
          loadPengaduan();
        } catch (err) {
          showAlert("Error", err.response?.data?.message || "Gagal menghapus", "danger");
        }
      }
    );
  };

  return (
    <div className="p-4">
      <h3>Kelola Seluruh Pengaduan</h3>

      <Form.Control
        type="text"
        placeholder="Cari nama, kategori, atau deskripsi..."
        className="mb-3"
        style={{ maxWidth: "350px" }}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="d-flex gap-2 mb-3 flex-wrap">
        <Badge
          bg={statusFilter === "ALL" ? "dark" : "secondary"}
          style={{ cursor: "pointer" }}
          onClick={() => setStatusFilter("ALL")}
        >
          Semua
        </Badge>

        <Badge
          bg={statusFilter === "Dikirim" ? "primary" : "secondary"}
          style={{ cursor: "pointer" }}
          onClick={() => setStatusFilter("Dikirim")}
        >
          Dikirim
        </Badge>

        <Badge
          bg={statusFilter === "Diproses" ? "warning" : "secondary"}
          style={{ cursor: "pointer" }}
          onClick={() => setStatusFilter("Diproses")}
        >
          Diproses
        </Badge>

        <Badge
          bg={statusFilter === "Selesai" ? "success" : "secondary"}
          style={{ cursor: "pointer" }}
          onClick={() => setStatusFilter("Selesai")}
        >
          Selesai
        </Badge>
      </div>

      {/* =======================
          TABEL PENGADUAN
      ======================= */}
      <table className="table table-bordered mt-3 align-middle">
        <thead className="table-light">
          <tr>
            <th width="5%" className="text-center">No</th>
            <th
              style={{ cursor: "pointer", whiteSpace: "nowrap"}}
              onClick={() => requestSort("nama")}
            >
              <div className="d-flex align-items-center justify-content-center gap-1">
                <span>Nama</span>
                <i className={`bi ${getSortIcon("nama")}`}></i>
              </div>
            </th>
            
            <th
              style={{ cursor: "pointer", whiteSpace: "nowrap" }}
              onClick={() => requestSort("lokasi")}
            >
              <div className="d-flex align-items-center justify-content-center gap-1">
                <span>Lokasi</span>
                <i className={`bi ${getSortIcon("lokasi")}`}></i>
              </div>
            </th>

            <th
              style={{ cursor: "pointer", whiteSpace: "nowrap" }}
              onClick={() => requestSort("kategori")}
            >
              <div className="d-flex align-items-center justify-content-center gap-1">
                <span>Kategori</span>
                <i className={`bi ${getSortIcon("kategori")}`}></i>
              </div>
            </th>

            <th width="20%">Deskripsi</th> 

            <th
              style={{ cursor: "pointer", whiteSpace: "nowrap" }}
              onClick={() => requestSort("status")}
            >
              <div className="d-flex align-items-center justify-content-center gap-1">
                <span>Status</span>
                <i className={`bi ${getSortIcon("status")}`}></i>
              </div>
            </th>

            <th
              style={{ cursor: "pointer", whiteSpace: "nowrap" }}
              onClick={() => requestSort("created_at")}
            >
              <div className="d-flex align-items-center justify-content-center gap-1">
                <span>Tgl Pengaduan</span>
                <i className={`bi ${getSortIcon("created_at")}`}></i>
              </div>
            </th>
            
            <th onClick={() => requestSort("tanggal_ditindaklanjuti")} style={{ cursor: "pointer", whiteSpace: "nowrap" }}>
              <div className="d-flex align-items-center justify-content-center gap-1">
                <span>Tgl Proses</span>
                <i className={`bi ${getSortIcon("tanggal_ditindaklanjuti")}`}></i>
              </div>
            </th>
             <th onClick={() => requestSort("tanggal_selesai")} style={{ cursor: "pointer", whiteSpace: "nowrap" }}>
              <div className="d-flex align-items-center justify-content-center gap-1">
                <span>Tgl Selesai</span>
                <i className={`bi ${getSortIcon("tanggal_selesai")}`}></i>
              </div>
            </th>
          
            <th width="25%" className="text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>

          {paginatedData.length === 0 ? (
            <tr>
              <td colSpan="10" className="text-center">
                Tidak ada pengaduan
              </td>
            </tr>
          ) : (
            paginatedData.map((p, i) => (
              <tr key={p.id}>
                <td className="text-center">{(currentPage - 1) * itemsPerPage + i + 1}</td>
                <td>{p.Pelapor?.nama || "-"}</td>
                <td>{p.Pelapor?.lokasi || "-"}</td>
                <td>{p.Kategori?.nama || "-"}</td>
                <td>{p.deskripsi}</td>
                <td>{statusBadge(p.status)}</td>
                <td>{formatTanggalID(p.created_at)}</td>
                <td>{formatTanggalID(p.tanggal_ditindaklanjuti)}</td>
                <td>{formatTanggalID(p.tanggal_selesai)}</td>

                <td>
                  <div className="d-flex flex-wrap gap-1 justify-content-center">

                    {/* PROSES */}
                    {p.status === "Dikirim" && (
                      <Button
                        size="sm"
                        variant="warning"
                        title="Proses Pengaduan"
                        onClick={() => prosesPengaduan(p.id)}
                      >
                        <i className="bi bi-arrow-repeat spin"></i>
                      </Button>
                    )}

                    {p.status === "Diproses" && (
                      <>
                        {/* CATATAN */}
                        <Button
                          size="sm"
                          variant="warning"
                          title="Tambah Catatan"
                          onClick={() => {
                            setSelected(p);
                            setCatatan(""); 
                            setShowCatatan(true);
                          }}
                        >
                          <i className="bi bi-pencil-square"></i>
                        </Button>

                        {/* SOLUSI */}
                        {p.hasHistory && (
                          <Button
                            size="sm"
                            variant="success"
                            title="Selesaikan Pengaduan"
                            onClick={() => handleShowSolusi(p)}
                          >
                            <i className="bi bi-check-circle"></i>
                          </Button>
                        )}
                      </>
                    )}

                    {/* DETAIL */}
                    <Button
                      size="sm"
                      variant="info"
                      title="Lihat Detail"
                      onClick={async () => {
                        setSelected(p);
                        setShowDetail(true);
                        setLoadingHistory(true);

                        try {
                          const res = await api.get(`/pengaduan/${p.id}/history`);
                          setHistory(res.data.data);
                        } catch {
                          setHistory([]);
                        } finally {
                          setLoadingHistory(false);
                        }
                      }}
                    >
                      <i className="bi bi-eye"></i>
                    </Button>

                    {/* HAPUS */}
                    <Button
                      size="sm"
                      variant="danger"
                      title="Hapus Pengaduan"
                      onClick={() => hapusPengaduan(p.id)}
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* =======================
          PAGINATION
      ======================= */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3">

          <div className="text-muted">
            Menampilkan {(currentPage - 1) * itemsPerPage + 1}–
            {Math.min(currentPage * itemsPerPage, totalItems)} dari {totalItems} data
          </div>

          <div className="d-flex gap-1">

            <Button
              size="sm"
              variant="outline-secondary"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Prev
            </Button>

            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  size="sm"
                  variant={page === currentPage ? "primary" : "outline-primary"}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              );
            })}

            <Button
              size="sm"
              variant="outline-secondary"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </Button>

          </div>
        </div>
      )}

      {/* =======================
          MODAL DETAIL (READ ONLY)
      ======================= */}
      <Modal show={showDetail} onHide={() => setShowDetail(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Detail Pengaduan</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {selected && (
            <>
              <p><b>Nama Pelapor:</b> {selected.Pelapor?.nama}</p>
              <p><b>Lokasi:</b> {selected.Pelapor?.lokasi}</p>
              <p><b>NIP:</b> {selected.Pelapor?.nip}</p>
              <p><b>Kategori:</b> {selected?.Kategori?.nama || "-"}</p>
              <p><b>Status:</b> {selected.status}</p>
              <p><b>Deskripsi:</b></p>
              <p>{selected.deskripsi}</p>

              {/* ===== LAMPIRAN ADMIN ===== */}
              {selected.lampiran && (
                <>
                  <hr />
                  <p><b>Lampiran:</b></p>

                  {selected.lampiran?.match(/\.(jpg|jpeg|png)$/i) ? (
                    <img
                      src={`http://localhost:5000/uploads/${selected.lampiran}`}
                      alt="Lampiran"
                      className="img-fluid rounded border"
                    />
                  ) : (
                    <a
                      href={`http://localhost:5000/uploads/${selected.lampiran}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      📄 Lihat Lampiran
                    </a>
                  )}
                </>
              )}

              {/* ===== SOLUSI (JIKA ADA) ===== */}
              {selected.solusi && (
                <>
                  <hr />
                  <p><b>Solusi:</b></p>
                  <div className="bg-light p-2 rounded">
                    {selected.solusi}
                  </div>
                </>
              )}

              {/* =======================
                  HISTORY PENANGANAN
              ======================= */}
              <hr />
              <h6 className="fw-bold mb-3">
                <i className="bi bi-clock-history me-2"></i>
                History Penanganan
              </h6>

              {loadingHistory ? (
                <div className="text-center text-muted">Memuat history...</div>
              ) : history.length === 0 ? (
                <div className="text-center text-muted py-3">
                  <i className="bi bi-clock-history fs-3 d-block mb-2"></i>
                  Belum ada riwayat penanganan
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

                          <p className="mb-2 fw-semibold">{h.deskripsi}</p>
                          {selected.status === "Diproses" && (
                            <Button
                              size="sm"
                              variant="outline-warning"
                              className="mt-1"
                              onClick={() => {
                                setSelectedHistory(h);
                                setEditDeskripsi(h.deskripsi);
                                setShowEditHistory(true);
                              }}
                            >
                              <i className="bi bi-pencil-square me-1"></i>
                              Edit
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetail(false)}>
            Tutup
          </Button>
        </Modal.Footer>
      </Modal>

      {/* =======================
      MODAL EDIT HISTORY PENGADUAN
      ======================= */}
      <Modal show={showEditHistory} onHide={() => setShowEditHistory(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit History Penanganan</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group>
            <Form.Label>Deskripsi Penanganan</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={editDeskripsi}
              onChange={(e) => setEditDeskripsi(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditHistory(false)}>
            Batal
          </Button>

          <Button
            variant="warning"
            onClick={async () => {
              if (!editDeskripsi.trim()) {
                showAlert("Validasi", "Deskripsi tidak boleh kosong", "warning");
                return;
              }

              try {
                await api.put(
                  `/pengaduan/history/${selectedHistory.id}`,
                  { deskripsi: editDeskripsi }
                );

                showAlert("Berhasil", "History berhasil diperbarui", "success");

                // refresh history
                const res = await api.get(`/pengaduan/${selected.id}/history`);
                setHistory(res.data.data);

                setShowEditHistory(false);
              } catch (err) {
                showAlert(
                  "Error",
                  err.response?.data?.message || "Gagal mengedit history",
                  "danger"
                );
              }
            }}
          >
            Simpan Perubahan
          </Button>
        </Modal.Footer>
      </Modal>

      {/* =======================
          MODAL Catatan
      ======================= */}
      <Modal show={showCatatan} onHide={() => setShowCatatan(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Tambah Catatan Perkembangan</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p className="text-muted small">
            Catatan akan muncul di history penanganan
          </p>

          <Form.Group>
            <Form.Label>Catatan</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Contoh: Sedang koordinasi dengan bidang terkait..."
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCatatan(false)}>
            Batal
          </Button>
          <Button variant="warning" onClick={simpanCatatan}>
            Simpan Catatan
          </Button>
        </Modal.Footer>
      </Modal>

      {/* =======================
          MODAL Solusi
      ======================= */}
      <Modal show={showSolusi} onHide={() => setShowSolusi(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Selesaikan Pengaduan</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Alert variant="warning">
            Pastikan solusi sudah final sebelum menyelesaikan pengaduan
          </Alert>

          <Form.Group>
            <Form.Label>Solusi Final</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={solusi}
              onChange={(e) => setSolusi(e.target.value)}
              placeholder="Tuliskan solusi akhir yang diberikan kepada pelapor"
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSolusi(false)}>
            Batal
          </Button>
          <Button variant="success" onClick={simpanSolusi}>
            Simpan & Selesaikan
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default KelolaPengaduan;
