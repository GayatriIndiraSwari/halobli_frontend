import { useEffect, useState } from "react";

const PengaduanList = () => {
  const [pengaduan, setPengaduan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:5000/api/pengaduan", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Gagal mengambil data pengaduan");
        return res.json();
      })
      .then((result) => {
        setPengaduan(result.data || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-4">
      <h3>Daftar Pengaduan</h3>

      <table className="table table-bordered">
        <thead className="table-light">
          <tr>
            <th>No</th>
            <th>User ID</th>
            <th>Kategori</th>
            <th>Deskripsi</th>
            <th>Lampiran</th>
            <th>Status</th>
            <th>Dibuat</th>
          </tr>
        </thead>
        <tbody>
          {pengaduan.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center">
                Tidak ada data pengaduan
              </td>
            </tr>
          ) : (
            pengaduan.map((p, i) => (
              <tr key={p.id}>
                <td>{i + 1}</td>
                <td>{p.user_id}</td>
                <td>{p.Kategori?.nama || "-"}</td>
                <td>{p.deskripsi}</td>
                <td>{p.lampiran || "-"}</td>
                <td>{p.status}</td>
                <td>{new Date(p.createdAt).toLocaleString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PengaduanList;
