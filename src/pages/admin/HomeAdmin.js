import { useState, useEffect } from "react";
import { Container, Table, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import NavbarAdmin from "../../components/NavbarAdmin";

const HomeAdmin = () => {
  const [pengaduan, setPengaduan] = useState([]);
  const navigate = useNavigate();

  // 🔐 PROTEKSI LOGIN ADMIN
  useEffect(() => {
    const isLogin = localStorage.getItem("isLogin");
    const role = localStorage.getItem("role");

    if (!isLogin || role !== "admin") {
      navigate("/admin/login");
    }
  }, [navigate]);

  const tindaklanjuti = (id) => {
    setPengaduan(
      pengaduan.map((p) =>
        p.id === id ? { ...p, status: "Diproses" } : p
      )
    );
  };

  return (
    <>
      <NavbarAdmin />

      <Container className="mt-4">
        <h4>Kelola Pengaduan</h4>

        <Button className="mb-2" onClick={() => window.print()}>
          Print Riwayat
        </Button>

        <Table bordered>
          <thead>
            <tr>
              <th>Kategori</th>
              <th>Deskripsi</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {pengaduan.map((p) => (
              <tr key={p.id}>
                <td>{p.kategori}</td>
                <td>{p.deskripsi}</td>
                <td>{p.status}</td>
                <td>
                  <Button size="sm" onClick={() => tindaklanjuti(p.id)}>
                    Tindaklanjuti
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>
    </>
  );
};

export default HomeAdmin;
