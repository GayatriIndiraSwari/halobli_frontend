import { useEffect, useState } from "react";
import api from "../../api/authAPI";
import { Card, Row, Col } from "react-bootstrap";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const DashboardAdmin = () => {
  const [data, setData] = useState([]);
  const [filterWaktu, setFilterWaktu] = useState("all");

  // =====================
  // FETCH DATA
  // =====================
  useEffect(() => {
    api.get("/pengaduan").then((res) => {
      setData(res.data.data || []);
    });
  }, []);

  // =====================
  // FILTER WAKTU
  // =====================
  const now = new Date();

  const filterByWaktu = (list) => {
    if (filterWaktu === "week") {
      const lastWeek = new Date();
      lastWeek.setDate(now.getDate() - 7);
      return list.filter(p => new Date(p.created_at) >= lastWeek);
    }

    if (filterWaktu === "month") {
      return list.filter(p => {
        const d = new Date(p.created_at);
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      });
    }

    return list;
  };

  const filteredData = filterByWaktu(data);

  // =====================
  // HITUNG DATA
  // =====================
  const today = new Date().toDateString();

  const total = filteredData.length;
  const selesai = filteredData.filter(p => p.status === "Selesai").length;
  const diproses = filteredData.filter(p => p.status === "Diproses").length;
  const dikirim = filteredData.filter(p => p.status === "Dikirim").length;

  const hariIni = filteredData.filter(
    p => new Date(p.created_at).toDateString() === today
  ).length;

  // =====================
  // PIE DATA
  // =====================
  const chartData = [
    { name: "Dikirim", value: dikirim, color: "#0d6efd" },
    { name: "Diproses", value: diproses, color: "#ffc107" },
    { name: "Selesai", value: selesai, color: "#198754" },
  ];

  const totalChart = dikirim + diproses + selesai;

  // =====================
  // BAR DATA (PER BULAN)
  // =====================
  const barData = [];

  filteredData.forEach((p) => {
    const date = new Date(p.created_at);

    const monthYear = `${date.toLocaleString("id-ID", {
      month: "short",
    })} ${date.getFullYear()}`;

    const existing = barData.find(
      (b) => b.month === monthYear
    );

    if (existing) {
      existing.total += 1;
    } else {
      barData.push({
        month: monthYear,
        total: 1,
      });
    }
  });

  // =====================
  // BAR DATA (STATUS PER KATEGORI)
  // =====================
  const kategoriStatusMap = {};

  filteredData.forEach((p) => {
    const kategori = p.Kategori?.nama || "Lainnya";

    if (!kategoriStatusMap[kategori]) {
      kategoriStatusMap[kategori] = {
        kategori,
        Dikirim: 0,
        Diproses: 0,
        Selesai: 0,
      };
    }

    kategoriStatusMap[kategori][p.status] += 1;
  });

  const barKategoriStatus = Object.values(kategoriStatusMap);
  // URUTKAN KATEGORI DARI PENGADUAN TERBANYAK
  const barKategoriStatusSorted = [...barKategoriStatus].sort(
    (a, b) =>
      (b.Dikirim + b.Diproses + b.Selesai) -
      (a.Dikirim + a.Diproses + a.Selesai)
  );

  // =====================
  // LABEL PERCENT PIE
  // =====================
  const renderLabel = ({ value }) => {
    if (value === 0) return "";
    return `${Math.round((value / totalChart) * 100)}%`;
  };

  // INSIGHT OTOMATIS
  const kategoriTerbanyak = barKategoriStatusSorted[0];

  const kategoriPerluTindakLanjut = barKategoriStatusSorted.filter(
    k => k.Dikirim + k.Diproses > 0
  );

  return (
    <div className="p-4">
      <h3>Dashboard Pengaduan</h3>

      {/* =====================
          CARD RINGKASAN
      ===================== */}
      <Row className="mt-3">
        <Col md={3}>
          <Card body>
            Total Pengaduan
            <br />
            <b>{total}</b>
          </Card>
        </Col>

        <Col md={3}>
          <Card body>
            Belum Ditangani
            <br />
            <b>{dikirim + diproses}</b>
          </Card>
        </Col>

        <Col md={3}>
          <Card body>
            Selesai
            <br />
            <b>{selesai}</b>
          </Card>
        </Col>

        <Col md={3}>
          <Card body>
            Hari Ini
            <br />
            <b>{hariIni}</b>
          </Card>
        </Col>
      </Row>

      {/* =====================
          PIE CHART
      ===================== */}
      <Card className="mt-4 p-3">

        {/* JUDUL + FILTER */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5>Status Pengaduan</h5>

          <select
            className="form-select w-auto"
            value={filterWaktu}
            onChange={(e) => setFilterWaktu(e.target.value)}
          >
            <option value="all">Semua</option>
            <option value="week">7 Hari Terakhir</option>
            <option value="month">Bulan Ini</option>
          </select>
        </div>

        {/* EMPTY STATE */}
        {totalChart === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-pie-chart fs-1"></i>
            <p className="mt-2">Belum ada data pengaduan</p>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={renderLabel}
                >
                  {chartData.map((item, i) => (
                    <Cell key={i} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [`${v} Pengaduan`, n]} />
              </PieChart>
            </ResponsiveContainer>

            {/* LEGEND MANUAL */}
            <div className="d-flex justify-content-center gap-4 mt-3">
              {chartData.map(item => (
                <div key={item.name} className="d-flex align-items-center gap-2">
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      backgroundColor: item.color,
                      borderRadius: 4,
                      display: "inline-block",
                    }}
                  />
                  <span>{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* =====================
          BAR CHART STATUS PER KATEGORI
      ===================== */}
      <Card className="mt-4 p-3">
        <h5>Status Pengaduan per Kategori</h5>

        {barKategoriStatus.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-bar-chart-steps fs-1"></i>
            <p>Belum ada data kategori</p>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={barKategoriStatusSorted}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="kategori" />
                <YAxis allowDecimals={false} />
                <Tooltip formatter={(v, n) => [`${v} Pengaduan`, n]} />
                <Legend />
                <Bar dataKey="Dikirim" stackId="a" fill="#0d6efd" />
                <Bar dataKey="Diproses" stackId="a" fill="#ffc107" />
                <Bar dataKey="Selesai" stackId="a" fill="#198754" />
              </BarChart>
            </ResponsiveContainer>
              
            {kategoriTerbanyak && (
              <div className="mt-3">
                {/* JUDUL ANALISIS */}
                <h6 className="fw-bold mb-2">
                  Ringkasan Analisis
                </h6>

                {/* BADGE PERINGATAN */}
                {kategoriPerluTindakLanjut.length > 0 && (
                  <div className="mb-2">
                    <span className="badge bg-warning text-dark">
                      Perlu Tindak Lanjut
                    </span>
                  </div>
                )}

                <ul className="mb-0">
                  <li>
                    Kategori dengan pengaduan terbanyak adalah{" "}
                    <b>{kategoriTerbanyak.kategori}</b> (
                    {kategoriTerbanyak.Dikirim +
                      kategoriTerbanyak.Diproses +
                      kategoriTerbanyak.Selesai} pengaduan)
                  </li>

                  {kategoriPerluTindakLanjut.length > 0 && (
                    <li>
                      Kategori yang masih perlu ditindaklanjuti:{" "}
                      <b>
                        {kategoriPerluTindakLanjut
                          .map(k => k.kategori)
                          .join(", ")}
                      </b>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </>
        )}
      </Card>

      {/* =====================
          BAR CHART
      ===================== */}
      <Card className="mt-4 p-3">
        <h5>Pengaduan per Bulan</h5>

        {barData.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-bar-chart fs-1"></i>
            <p>Belum ada data pengaduan</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="total" fill="#0d6efd" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
};

export default DashboardAdmin;
