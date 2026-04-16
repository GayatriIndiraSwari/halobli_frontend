import { useState, useEffect } from "react";
import { Form, Button, Card } from "react-bootstrap";

const PengaduanForm = ({ onSubmit, initialData, batal }) => {
  const [kategori, setKategori] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [file, setFile] = useState(null);
  const [kategoriList, setKategoriList] = useState([]);
  const [loadingKategori, setLoadingKategori] = useState(true);


  // Ambil list kategori dari backend
  useEffect(() => {
    const fetchKategori = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:5000/api/kategori", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Unauthorized / Forbidden");
        }

        const json = await res.json();
        console.log("RESPON KATEGORI:", json); // DEBUG

        setKategoriList(json.data || []);
      } catch (err) {
        console.error("Gagal ambil kategori:", err);
        setKategoriList([]);
      } finally {
        setLoadingKategori(false);
      }
    };

    fetchKategori();
  }, []);

  useEffect(() => {
    if (initialData) {
      setKategori(initialData.kategori_id);
      setDeskripsi(initialData.deskripsi);
    }
  }, [initialData]);

  const submit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("kategori_id", kategori);
    formData.append("deskripsi", deskripsi);

    if (file) {
      formData.append("lampiran", file);
    }

    onSubmit(formData);
  };

  return (
    <Card className="mb-3">
      <Card.Body>
        <h5>Form Pengaduan</h5>

        <Form onSubmit={submit}>
          <Form.Select
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
            required
            disabled={loadingKategori}
          >
            {loadingKategori ? (
              <option>Loading...</option>
            ) : (
              <>
                <option value="">Pilih Kategori</option>
                {kategoriList.map((k) => (
                  <option key={k.id} value={k.id}>{k.nama}</option>
                ))}
              </>
            )}
          </Form.Select>

          <Form.Control
            as="textarea"
            className="mb-2"
            placeholder="Deskripsi pengaduan"
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            required
          />

          <Form.Control
            type="file"
            className="mb-2"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <Button type="submit">{initialData ? "Update" : "Simpan"}</Button>{" "}
          <Button variant="secondary" onClick={batal}>
            Batal
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default PengaduanForm;
