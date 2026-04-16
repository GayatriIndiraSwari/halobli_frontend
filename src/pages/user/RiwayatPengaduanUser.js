import { Container, Badge, Form } from "react-bootstrap";
import { useEffect, useState } from "react";

const RiwayatPengaduanUser = () => {
  const [data, setData] = useState([]);
  const token = localStorage.getItem("token");

  // SEARCH & SORT (SAMA DENGAN HOMEUSER)
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortConfig, setSortConfig] = useState({
    key: "",
    direction: "desc",
  });

  // =======================
  // PAGINATION
  // =======================
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetch("http://localhost:5000/api/pengaduan", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((res) => setData(res.data || []))
      .catch((err) => console.error(err));
  }, [token]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, sortConfig]);

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

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return "bi-arrow-down-up";
    return sortConfig.direction === "asc"
      ? "bi-sort-alpha-down"
      : "bi-sort-alpha-up";
  };

  // =======================
  // FILTER + SORT
  // =======================
  const filteredData = data
    // FILTER STATUS (BARU)
    .filter((p) => {
      if (statusFilter === "ALL") return true;
      return p.status === statusFilter;
    })
    .filter((p) => {
      if (!search) return true;
      const key = search.toLowerCase();
      return (
        p.Kategori?.nama?.toLowerCase().includes(key) ||
        p.deskripsi?.toLowerCase().includes(key) ||
        p.status?.toLowerCase().includes(key)
      );
    })
    .sort((a, b) => {
      if (!sortConfig.key) return 0;

      // SORT KATEGORI (KHUSUS)
      if (sortConfig.key === "kategori") {
        const aKat = a.Kategori?.nama || "";
        const bKat = b.Kategori?.nama || "";
        return sortConfig.direction === "asc"
          ? aKat.localeCompare(bKat)
          : bKat.localeCompare(aKat);
      }

      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (
        sortConfig.key.includes("tanggal") ||
        sortConfig.key.includes("created")
      ) {
        return sortConfig.direction === "asc"
          ? new Date(aVal || 0) - new Date(bVal || 0)
          : new Date(bVal || 0) - new Date(aVal || 0);
      }

      return sortConfig.direction === "asc"
        ? (aVal || "").localeCompare(bVal || "")
        : (bVal || "").localeCompare(aVal || "");
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

  const formatTanggalID = (tanggal) =>
    tanggal
      ? new Date(tanggal).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "-";

  return (
    <Container className="mt-4 print-area">
      <h4>Riwayat Pengaduan Saya</h4>

      {/* HEADER CETAK */}
      <div className="print-header d-none d-print-block text-center mb-4">
        <img src="/logo-bps.jpeg" className="print-logo mb-2" alt="Logo" />
        <h5>LAPORAN RIWAYAT PENGADUAN USER</h5>
        <small>
          Dicetak pada{" "}
          {new Date().toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </small>
        <hr />
      </div>

      <div className="filter-area">
        {/* SEARCH */}
        <Form.Control
          className="mb-3 w-50 d-print-none"
          placeholder="Cari kategori, deskripsi, status..."
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
      </div>

      {/* TABLE */}
      <table className="table table-bordered align-middle">
        <thead className="table-light">
          <tr>
            <th className="text-center">No</th>

            <th onClick={() => requestSort("kategori")} style={{ cursor: "pointer" }}>
              Kategori <i className={`bi ${getSortIcon("kategori")}`} />
            </th>

            <th>Deskripsi</th>
            <th>Solusi</th>

            <th onClick={() => requestSort("status")} style={{ cursor: "pointer" }}>
              Status <i className={`bi ${getSortIcon("status")}`} />
            </th>

            <th onClick={() => requestSort("created_at")} style={{ cursor: "pointer" }}>
              Tanggal Pengaduan <i className={`bi ${getSortIcon("created_at")}`} />
            </th>

            <th onClick={() => requestSort("tanggal_ditindaklanjuti")} style={{ cursor: "pointer" }}>
              Tanggal Diproses <i className={`bi ${getSortIcon("tanggal_ditindaklanjuti")}`} />
            </th>

            <th onClick={() => requestSort("tanggal_selesai")} style={{ cursor: "pointer" }}>
              Tanggal Selesai <i className={`bi ${getSortIcon("tanggal_selesai")}`} />
            </th>
          </tr>
        </thead>

        <tbody>
          {filteredData.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center">
                Belum ada pengaduan
              </td>
            </tr>
          ) : (
            paginatedData.map((p, i) => (
              <tr key={p.id}>
                <td className="text-center">
                  {(currentPage - 1) * itemsPerPage + i + 1}
                </td>
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
                <td>
                  <Badge
                    bg={
                      p.status === "Dikirim"
                        ? "primary"
                        : p.status === "Diproses"
                        ? "warning"
                        : "success"
                    }
                  >
                    {p.status}
                  </Badge>
                </td>
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
        <div className="d-flex justify-content-between align-items-center mt-3">

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

      {/* CETAK */}
      <button
        className="btn btn-outline-secondary mt-3 d-print-none"
        onClick={() => window.print()}
      >
        Cetak Riwayat
      </button>
    </Container>
  );
};

export default RiwayatPengaduanUser;
