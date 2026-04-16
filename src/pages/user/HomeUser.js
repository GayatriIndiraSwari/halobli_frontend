import { useState, useEffect } from "react";
import { Button, Form, Modal, Badge } from "react-bootstrap";
import PengaduanForm from "../../components/PengaduanForm";

const HomeUser = () => {
  // =======================
  // STATE UTAMA
  // =======================
  const [data, setData] = useState([]); // WAJIB array
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);


  // MODAL KONFIRMASI HAPUS
  const [showDelete, setShowDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);


  const [selected, setSelected] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const getKategoriNama = (p) => p?.Kategori?.nama || "-";



  // =======================
  // SEARCH & SORT 
  // =======================
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortConfig, setSortConfig] = useState({
    key: "",
    direction: "desc",
  });

  // =======================
  // PAGINATION (BARU)
  // =======================
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // =======================
  // AMBIL TOKEN & USER
  // =======================
  const token = localStorage.getItem("token");

  // =======================
  // PROTEKSI HALAMAN USER
  // =======================
  useEffect(() => {
    loadPengaduan();
  }, [token]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  // =======================
  // LOAD DATA PENGADUAN
  // =======================
  const loadPengaduan = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/pengaduan", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();
      setData(result.data || []); // PENGAMAN
    } catch (err) {
      console.error(err);
      setData([]);
    }
  };

  // =======================
  // HELPER: tandai catatan sudah dibaca
  // =======================
  const markCatatanAsRead = async (p) => {
    if (
      p?.catatan &&
      (!p.catatan_read_at ||
        new Date(p.catatan_updated_at) > new Date(p.catatan_read_at))
    ) {
      await fetch(
        `http://localhost:5000/api/pengaduan/${p.id}/read-catatan`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      loadPengaduan();
    }
  };

  // =======================
  // SORT HANDLER 
  // =======================
  const requestSort = (key) => {
    setSortConfig((prev) => {
      // klik kolom baru → ASC
      if (prev.key !== key) {
        return { key, direction: "asc" };
      }

      // klik kedua → DESC
      if (prev.direction === "asc") {
        return { key, direction: "desc" };
      }

      // klik ketiga → RESET (tanpa sort)
      return { key: "", direction: "asc" };
    });
  };

  // =======================
  // SORT ICON (BARU)
  // =======================
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return "bi-arrow-down-up";
    return sortConfig.direction === "asc"
      ? "bi-sort-alpha-down"
      : "bi-sort-alpha-up";
  }; 

  // =======================
  // FILTER + SEARCH + SORT (BARU)
  // =======================
  const filteredData = data
    // FILTER STATUS (BARU)
    .filter((p) => {
      if (statusFilter === "ALL") return true;
      return p.status === statusFilter;
    })
    .filter((p) => {
      if (!search) return true;
      const keyword = search.toLowerCase();

      return (
        p.Pelapor?.nama?.toLowerCase().includes(keyword) ||
        p.Pelapor?.lokasi?.toLowerCase().includes(keyword) ||
        getKategoriNama(p).toLowerCase().includes(keyword) ||
        p.deskripsi?.toLowerCase().includes(keyword) ||
        p.status?.toLowerCase().includes(keyword)
      );
    })
    .sort((a, b) => {
      let aVal = "";
      let bVal = "";

      if (sortConfig.key === "kategori") {
        aVal = a?.Kategori?.nama || "";
        bVal = b?.Kategori?.nama || "";
      } else {
        aVal = a[sortConfig.key] || "";
        bVal = b[sortConfig.key] || "";
      }

      if (sortConfig.key?.includes("tanggal") || sortConfig.key?.includes("created")) {
        return sortConfig.direction === "asc"
          ? new Date(aVal) - new Date(bVal)
          : new Date(bVal) - new Date(aVal);
      }

      return sortConfig.direction === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
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
  
  const formatTanggal = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="p-4">
      <h3>Pengaduan User</h3>

      <Button
        className="mb-3"
        onClick={() => {
          setEditId(null); // buat pengaduan baru
          setShowForm(true);
        }}
      >
        + Buat Pengaduan
      </Button>

      {/* SEARCH BAR */}
      <Form.Control
        type="text"
        placeholder="Cari kategori atau deskripsi..."
        className="mb-3 w-50"
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
          FORM PENGADUAN
      ======================= */}
      {showForm && (
        <Modal show={showForm} onHide={() => setShowForm(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>{editId ? "Edit Pengaduan" : "Buat Pengaduan"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <PengaduanForm
              initialData={
                editId
                  ? data.find((p) => p.id === editId) // data untuk edit
                  : null
              }
              onSubmit={async (formData) => {
                try {
                  const url = editId
                    ? `http://localhost:5000/api/pengaduan/${editId}`
                    : "http://localhost:5000/api/pengaduan";

                  const res = await fetch(url, {
                    method: editId ? "PUT" : "POST",
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                  });

                  if (!res.ok) throw new Error("Gagal menyimpan pengaduan");

                  setSuccessMessage(
                    editId
                      ? "Pengaduan berhasil diperbarui"
                      : "Pengaduan berhasil dikirim"
                  );
                  setShowSuccess(true);
                  setShowForm(false);
                  setEditId(null);
                  loadPengaduan();
                } catch (err) {
                  console.error(err);
                  alert("Terjadi kesalahan saat menyimpan pengaduan");
                }
              }}
              batal={() => setShowForm(false)}
            />
          </Modal.Body>
        </Modal>
      )}

      {/* =======================
          TABEL PENGADUAN
      ======================= */}
      <table className="table table-bordered align-middle">
        <thead className="table-light">
          <tr>
            <th width="5%" className="text-center">No</th>

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
              onClick={() => requestSort("created_at")}
              style={{ cursor: "pointer", whiteSpace: "nowrap" }}
            >
              <div className="d-flex align-items-center justify-content-center gap-1">
                <span>Tanggal Pengaduan</span>
                <i className={`bi ${getSortIcon("created_at")}`}></i>
              </div>
            </th>
            
            <th onClick={() => requestSort("tanggal_ditindaklanjuti")} style={{ cursor: "pointer", whiteSpace: "nowrap" }}>
              <div className="d-flex align-items-center justify-content-center gap-1">
                <span>Tanggal Diproses</span>
                <i className={`bi ${getSortIcon("tanggal_ditindaklanjuti")}`}></i>
              </div>
            </th>
             <th onClick={() => requestSort("tanggal_selesai")} style={{ cursor: "pointer", whiteSpace: "nowrap" }}>
              <div className="d-flex align-items-center justify-content-center gap-1">
                <span>Tanggal Selesai</span>
                <i className={`bi ${getSortIcon("tanggal_selesai")}`}></i>
              </div>
            </th>
          
            <th width="25%" className="text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center">
                Belum ada pengaduan
              </td>
            </tr>
          ) : (
            paginatedData.map((p, i) => (
              <tr key={p.id}>
                <td>
                  {(currentPage - 1) * itemsPerPage + i + 1}
                </td>
                <td>{getKategoriNama(p)}</td>
                <td>{p.deskripsi}</td>

                <td>
                  <span
                    className={`badge ${
                      p.status === "Dikirim"
                        ? "bg-primary"
                        : p.status === "Diproses"
                        ? "bg-warning"
                        : "bg-success"
                    }`}
                  >
                    {p.status}
                  </span>

                  {p.status === "Diproses" && p.catatan && (
                    <div className="small mt-1 text-dark">
                      {(!p.catatan_read_at || 
                        new Date(p.catatan_updated_at) > new Date(p.catatan_read_at))
                        ? "Ada catatan baru"
                        : "Catatan dari admin"}
                    </div>
                  )}

                  {p.status === "Selesai" && p.solusi && (
                    <div className="small text-muted mt-1">
                      Ada solusi
                    </div>
                  )}
                </td>

                <td>{formatTanggal(p.created_at)}</td>
                <td>{formatTanggal(p.tanggal_ditindaklanjuti)}</td>
                <td>{formatTanggal(p.tanggal_selesai)}</td>

                <td>
                  <div className="d-flex gap-1 justify-content-center">

                    {/* LIHAT DETAIL */}
                    <Button
                      size="sm"
                      variant="info"
                      title="Lihat Detail"
                      onClick={async () => {
                        setSelected(p);
                        setShowDetail(true);
                        await markCatatanAsRead(p);
                        setLoadingHistory(true);

                        try {
                          const res = await fetch(
                            `http://localhost:5000/api/pengaduan/${p.id}/history`,
                            {
                              headers: {
                                Authorization: `Bearer ${token}`,
                              },
                            }
                          );

                          const result = await res.json();
                          setHistory(result.data || []);
                        } catch {
                          setHistory([]);
                        } finally {
                          setLoadingHistory(false);
                        }
                      }}
                    >
                      <i className="bi bi-eye"></i>
                    </Button>

                    {/* EDIT (HANYA SAAT DIKIRIM) */}
                    <Button
                      size="sm"
                      variant="warning"
                      title="Edit Pengaduan"
                      disabled={p.status !== "Dikirim"}
                      onClick={() => {
                        setEditId(p.id);
                        setShowForm(true);
                      }}
                    >
                      <i className="bi bi-pencil-square"></i>
                    </Button>

                    {/* HAPUS (HANYA SAAT DIKIRIM) */}
                    <Button
                      size="sm"
                      variant="danger"
                      title="Hapus Pengaduan"
                      disabled={p.status !== "Dikirim"}
                      onClick={() => {
                        setDeleteTarget(p);
                        setShowDelete(true);
                      }}

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
          MODAL DETAIL
      ======================= */}
      <Modal
        show={showDetail}
        onHide={() => setShowDetail(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Detail Pengaduan</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p><b>Kategori:</b> {getKategoriNama(selected)}</p>
          <p><b>Deskripsi:</b> {selected?.deskripsi}</p>

          <p>
            <b>Status:</b>{" "}
            <span
              className={`badge ${
                selected?.status === "Dikirim"
                  ? "bg-primary"
                  : selected?.status === "Diproses"
                  ? "bg-warning"
                  : "bg-success"
              }`}
            >
              {selected?.status}
            </span>
          </p>

          {selected?.lampiran && (
            <>
              <hr />
              <p><b>Lampiran:</b></p>

              {selected.lampiran.match(/\.(jpg|jpeg|png)$/i) ? (
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
                  Lihat Lampiran
                </a>
              )}
            </>
          )}

          {selected?.status === "Selesai" && selected?.solusi && (
            <>
              <hr />
              <p><b>Solusi:</b></p>
              <div className="bg-light p-3 rounded border">
                {selected.solusi}
              </div>
            </>
          )}

          {/* ===== HISTORY PENANGANAN ===== */}
          <hr />
          <h6>
            <i className="bi bi-clock-history me-2"></i>
            History Penanganan
          </h6>

          {loadingHistory ? (
            <div className="text-muted text-center">Memuat history...</div>
          ) : history.length === 0 ? (
            <div className="text-muted text-center">Belum ada riwayat</div>
          ) : (
            <div className="timeline mt-3">
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

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetail(false)}>
            Tutup
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showSuccess}
        onHide={() => setShowSuccess(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Berhasil</Modal.Title>
        </Modal.Header>

        <Modal.Body className="text-center">
          <i className="bi bi-check-circle-fill text-success fs-1 mb-3"></i>
          <p className="mt-2">{successMessage}</p>
        </Modal.Body>

        <Modal.Footer className="justify-content-center">
          <Button variant="success" onClick={() => setShowSuccess(false)}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>

      {/* =======================
          MODAL KONFIRMASI HAPUS
      ======================= */}
      <Modal
        show={showDelete}
        onHide={() => setShowDelete(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Konfirmasi Hapus</Modal.Title>
        </Modal.Header>

        <Modal.Body className="text-center">
          <i className="bi bi-exclamation-triangle-fill text-danger fs-1 mb-3"></i>

          <p>
            Yakin ingin menghapus pengaduan ini?
          </p>

          <p className="fw-bold text-muted">
            {deleteTarget?.Kategori?.nama || "-"}
          </p>
        </Modal.Body>

        <Modal.Footer className="justify-content-center">
          <Button
            variant="secondary"
            onClick={() => setShowDelete(false)}
          >
            Batal
          </Button>

          <Button
            variant="danger"
            onClick={async () => {
              try {
                await fetch(
                  `http://localhost:5000/api/pengaduan/${deleteTarget.id}`,
                  {
                    method: "DELETE",
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );

                setShowDelete(false);
                setDeleteTarget(null);
                loadPengaduan();
              } catch (err) {
                console.error(err);
              }
            }}
          >
            Hapus
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default HomeUser;
