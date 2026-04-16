import { useAlert } from "../../context/AlertContext";
import { useEffect, useState, useCallback } from "react";
import api from "../../api/authAPI";
import { Badge, Form } from "react-bootstrap";

/**
 * =======================
 * RIWAYAT PENGADUAN (ADMIN)
 * =======================
 * Fungsi:
 * - Menampilkan SEMUA pengaduan
 * - Filter status
 * - Urutkan terbaru
 * - Menampilkan tanggal penting
 */
const RiwayatPengaduanAdmin = () => {
  // =======================
  // STATE
  // =======================
  const [data, setData] = useState([]);
  const { showAlert } = useAlert();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortConfig, setSortConfig] = useState({
    key: "",
    direction: "asc",
  });

  // PRINT PENGADUAN TERPILIH
  const [selectedPengaduan, setSelectedPengaduan] = useState([]);
  const [printMode, setPrintMode] = useState("TABLE"); 
  const [historiesMap, setHistoriesMap] = useState({});

  // =======================
  // PAGINATION
  // =======================
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // =======================
  // LOAD DATA
  // =======================
  const loadRiwayat = useCallback(async () => {
    try {
      const res = await api.get("/pengaduan");
      setData(res.data.data || []);
    } catch (error) {
      console.error(error);
      showAlert("Error", "Gagal mengambil riwayat pengaduan", "danger");
    }
  }, [showAlert]);


  useEffect(() => {
    loadRiwayat();
  }, [loadRiwayat]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, sortConfig]);

  const toDate = (val) => {
    if (!val) return new Date(0);
    const d = new Date(val);
    return isNaN(d.getTime()) ? new Date(0) : d;
  };

  const formatTanggalID = (tanggal, fallback = "-") => {
    return tanggal
      ? new Date(tanggal).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : fallback;
  };

  // LOAD HISTORY
  const loadHistoriesForPrint = async () => {
    const map = {};
    try{
      for (const id of selectedPengaduan) {
        const res = await api.get(`/pengaduan/${id}/history`);
        map[id] = res.data.data || [];
      }

      setHistoriesMap(map);
    } catch (err) {
      console.error(err);
      showAlert("Error", "Gagal mengambil riwayat pengaduan", "danger");
    }
  };

  // =======================
  // FILTER + SORT
  // =======================
  const filteredData = [...data]
  // FILTER STATUS
  .filter((p) => {
    if (statusFilter === "ALL") return true;
    return p.status === statusFilter;
  })

  // SEARCH SEMUA FIELD
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

  // SORT
  .sort((a, b) => {
    if (!sortConfig.key) return 0;

    switch (sortConfig.key) {
      case "nama":
        return sortConfig.direction === "asc"
          ? (a.Pelapor?.nama || "").localeCompare(b.Pelapor?.nama || "")
          : (b.Pelapor?.nama || "").localeCompare(a.Pelapor?.nama || "");

      case "lokasi":
        return sortConfig.direction === "asc"
          ? (a.Pelapor?.lokasi || "").localeCompare(b.Pelapor?.lokasi || "")
          : (b.Pelapor?.lokasi || "").localeCompare(a.Pelapor?.lokasi || "");

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
          ? toDate(a.tanggal_ditindaklanjuti) -
              toDate(b.tanggal_ditindaklanjuti)
          : toDate(b.tanggal_ditindaklanjuti) -
              toDate(a.tanggal_ditindaklanjuti);

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

  //SORT HEADER
  const requestSort = (key) => {
    if (sortConfig.key !== key) {
      setSortConfig({ key, direction: "asc" });
    } else if (sortConfig.direction === "asc") {
      setSortConfig({ key, direction: "desc" });
    } else {
      setSortConfig({ key: "", direction: "asc" });
    }
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return "bi-arrow-down-up";
    return sortConfig.direction === "asc"
      ? "bi-sort-alpha-down"
      : "bi-sort-alpha-up";
  };

  // =======================
  // BADGE STATUS
  // =======================
  const statusBadge = (status) => {
    if (status === "Dikirim") return <Badge bg="primary">Dikirim</Badge>;
    if (status === "Diproses") return <Badge bg="warning">Diproses</Badge>;
    return <Badge bg="success">Selesai</Badge>;
  };

  // HELPER SELECT PENGADUAN
  const toggleSelect = (id) => {
    setSelectedPengaduan((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  return (
    <div className={`p-4 print-area print-${printMode.toLowerCase()}`}>
      <h3>Riwayat Seluruh Pengaduan</h3>

      <div className="mb-3 filter-area" style={{ maxWidth: "300px" }}>
        {/* SEARCH */}
        <Form.Control
          type="text"
          placeholder="Cari pengaduan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* FILTER STATUS */}
        <div className="d-flex gap-2 flex-wrap mt-2">
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
      </div>

      {/* HEADER CETAK */}
      <div className="print-header print-only text-center mb-4">
        <img
          src="/logo-bps.jpeg"
          alt="Logo Instansi"
          className="print-logo mb-2"
        />
        <h4 className="mb-0">LAPORAN RIWAYAT PENGADUAN</h4>
        <small>
          Dicetak pada:{" "}
          {new Date().toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </small>
        <hr />
      </div>

      <table className="table table-striped table-bordered align-middle">
        <thead className="table-dark">
          <tr>
            <th className="no-print" width="3%">Pilih</th>
            <th width="5%" className="text-center">No</th>
            <th
              onClick={() => requestSort("nama")}
              style={{ cursor: "pointer", whiteSpace: "nowrap" }}
            >
              <div className="d-flex align-items-center justify-content-center gap-1">
                <span>Nama</span>
                <i className={`bi ${getSortIcon("nama")}`}></i>
              </div>
            </th>
            <th
              onClick={() => requestSort("lokasi")}
              style={{ cursor: "pointer", whiteSpace: "nowrap" }}
            >
              <div className="d-flex align-items-center justify-content-center gap-1">
                <span>Lokasi</span>
                <i className={`bi ${getSortIcon("lokasi")}`}></i>
              </div>
            </th>
            <th
              onClick={() => requestSort("kategori")}
              style={{ cursor: "pointer", whiteSpace: "nowrap" }}
            >
              <div className="d-flex align-items-center justify-content-center gap-1">
                <span>Kategori</span>
                <i className={`bi ${getSortIcon("kategori")}`}></i>
              </div>
            </th>
            <th>Deskripsi</th>
            <th>Solusi</th>
            <th
              onClick={() => requestSort("status")}
              style={{ cursor: "pointer", whiteSpace: "nowrap" }}
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
            <th
              onClick={() => requestSort("tanggal_ditindaklanjuti")}
              style={{ cursor: "pointer", whiteSpace: "nowrap" }}
            >
              <div className="d-flex align-items-center justify-content-center gap-1">
                <span>Tanggal Diproses</span>
                <i className={`bi ${getSortIcon("tanggal_ditindaklanjuti")}`}></i>
              </div>
            </th>
            <th
              onClick={() => requestSort("tanggal_selesai")}
              style={{ cursor: "pointer", whiteSpace: "nowrap" }}
            >
              <div className="d-flex align-items-center justify-content-center gap-1">
                <span>Tanggal Selesai</span>
                <i className={`bi ${getSortIcon("tanggal_selesai")}`}></i>
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          {filteredData.length === 0 ? (
            <tr>
              <td colSpan="11" className="text-center">
                Tidak ada data
              </td>
            </tr>
          ) : (
            paginatedData.map((p, i) => (
              <tr key={p.id}>
                <td className="no-print text-center">
                  <Form.Check
                    type="checkbox"
                    checked={selectedPengaduan.includes(p.id)}
                    onChange={() => toggleSelect(p.id)}
                  />
                </td>

                <td className="text-center">
                  {(currentPage - 1) * itemsPerPage + i + 1}
                </td>
                <td>{p.Pelapor?.nama || "-"}</td>
                <td>{p.Pelapor?.lokasi || "-"}</td>
                <td>{p.Kategori?.nama || "-"}</td>
                <td>{p.deskripsi}</td>
                <td style={{ maxWidth: "250px" }}>
                  {p.status === "Selesai" && p.solusi ? (
                    <span title={p.solusi}>
                      {p.solusi.length > 80
                        ? p.solusi.substring(0, 80) + "..."
                        : p.solusi}
                    </span>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
                <td>{statusBadge(p.status)}</td>
                <td>{formatTanggalID(p.created_at)}</td>
                <td>{formatTanggalID(p.tanggal_ditindaklanjuti)}</td>
                <td>{formatTanggalID(p.tanggal_selesai)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* =======================
          PAGINATION
      ======================= */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3 no-print">

          <div className="text-muted">
            Menampilkan {(currentPage - 1) * itemsPerPage + 1}–
            {Math.min(currentPage * itemsPerPage, totalItems)} dari {totalItems} data
          </div>

          <div className="d-flex gap-1">

            <button
              className="btn btn-sm btn-outline-secondary"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Prev
            </button>

            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  className={`btn btn-sm ${
                    page === currentPage
                      ? "btn-primary"
                      : "btn-outline-primary"
                  }`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              );
            })}

            <button
              className="btn btn-sm btn-outline-secondary"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </button>

          </div>
        </div>
      )}

      {/* PRINT PENGADUAN TERTENTU */}
      {printMode === "TEXT" && (
        <div className="print-text-area">
          {data
            .filter((p) => selectedPengaduan.includes(p.id))
            .map((p) => (
              <div key={p.id} className="mb-4">

                <h5 className="text-center">LAPORAN PENGADUAN</h5>

                <p><strong>Nomor Pengaduan:</strong> {p.id}</p>
                <p><strong>Tanggal Pengaduan:</strong> {formatTanggalID(p.created_at)}</p>
                <p><strong>Status:</strong> {p.status}</p>

                <hr />

                <p><strong>Nama Pelapor:</strong> {p.Pelapor?.nama || "-"}</p>
                {p.Pelapor?.nip && (
                  <p><strong>NIP:</strong> {p.Pelapor.nip}</p>
                )}
                <p><strong>Lokasi:</strong> {p.Pelapor?.lokasi}</p>
                <p><strong>Kategori:</strong> {p.Kategori?.nama}</p>

                <hr />

                {/* ISI PENGADUAN */}
                <p style={{ textAlign: "justify" }}>
                  <strong>Isi Pengaduan:</strong><br />
                  {p.deskripsi}
                </p>

                {/* RIWAYAT PENANGANAN */}
                <p style={{ marginTop: "12px" }}>
                  <strong>Riwayat Penanganan:</strong>
                </p>

                {(() => {
                  const histories = historiesMap[p.id] || [];

                  return histories.length > 0 ? (
                    <ol>
                      {histories.map((h, idx) => (
                        <li key={h.id || idx}>
                          <div>
                            <strong>{formatTanggalID(h.created_at)}</strong>
                          </div>
                          <div style={{ textAlign: "justify" }}>
                            {h.catatan || h.keterangan || h.deskripsi}
                          </div>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-muted">Belum ada riwayat penanganan.</p>
                  );
                })()}

                {/* SOLUSI AKHIR */}
                <p style={{ marginTop: "12px" }}>
                  <strong>Solusi Akhir:</strong>
                </p>

                {p.status === "Selesai" && p.solusi ? (
                  <p style={{ textAlign: "justify" }}>
                    {p.solusi}
                  </p>
                ) : (
                  <p className="text-muted">Pengaduan belum selesai.</p>
                )}

                <hr />

                <p><strong>Tanggal Diproses:</strong> {formatTanggalID(p.tanggal_ditindaklanjuti)}</p>
                <p><strong>Tanggal Selesai:</strong> {formatTanggalID(p.tanggal_selesai)}</p>

                <br />

                {/* TANDA TANGAN */}
                <div className="print-signature">
                  <div className="sign-left">
                    <p><strong>Pelapor</strong></p>
                    <br /><br />
                    <p>{p.Pelapor?.nama}</p>
                  </div>

                  <div className="sign-right">
                    <p><strong>Petugas Penanganan</strong></p>
                    <br /><br />
                    <p>{p.Petugas?.nama || "-"}</p>
                  </div>
                </div>

                <hr />
              </div>
            ))}
        </div>
      )}

      {/* CETAK */}
      <button
        className="btn btn-outline-secondary mt-3 me-2 no-print"
        onClick={() => {
          setPrintMode("TABLE");
          setTimeout(() => window.print(), 100);
        }}
      >
        Cetak Semua (Tabel)
      </button>

      <button
        className="btn btn-outline-primary mt-3 no-print"
        disabled={selectedPengaduan.length === 0}
        onClick={async () => {
          await loadHistoriesForPrint();
          setPrintMode("TEXT");
          requestAnimationFrame(() => window.print());
        }}
      >
        Cetak Pengaduan Terpilih
      </button>
    </div>
  );
};

export default RiwayatPengaduanAdmin;