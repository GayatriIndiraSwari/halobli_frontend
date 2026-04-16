import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import DashboardUser from "./pages/user/DashboardUser";
import DashboardAdmin from "./pages/admin/DashboardAdmin";
import LayoutUser from "./components/LayoutUser";
import LayoutAdmin from "./components/LayoutAdmin";
import KelolaKategori from "./pages/admin/KelolaKategori";



// AUTH
import LoginUser from "./pages/auth/LoginUser";
import LoginAdmin from "./pages/auth/LoginAdmin";
import RegisterUser from "./pages/auth/RegisterUser";

// PROTECTED
import ProtectedRouteAdmin from "./pages/admin/ProtectedRouteAdmin";
import ProtectedRouteUser from "./pages/user/ProtectedRouteUser";



// USER PAGES
import HomeUser from "./pages/user/HomeUser";
import ContactUser from "./pages/user/ContactUser";
import RiwayatPengaduanUser from "./pages/user/RiwayatPengaduanUser";

// ADMIN PAGES
import KelolaPengaduan from "./pages/admin/KelolaPengaduan";
import RiwayatPengaduanAdmin from "./pages/admin/RiwayatPengaduanAdmin";
import KelolaAkun from "./pages/admin/KelolaAkun";
import PengaduanByUser from "./pages/admin/PengaduanByUser";


import { AlertProvider } from "./context/AlertContext";


function App() {
  return (
    <AlertProvider>
      <Router>
        <Routes>

          {/* USER */}
          {/* USER (WAJIB LOGIN) */}
          <Route path="/" element={<Navigate to="/login-user" />} />
          
          //AUTH
          <Route path="/login-user" element={<LoginUser />} />
          <Route path="/register" element={<RegisterUser />} />
          <Route path="/login-admin" element={<LoginAdmin />} />

          //USER
          <Route
            path="/user"
            element={
              <ProtectedRouteUser>
                <LayoutUser>
                  <HomeUser />
                </LayoutUser>
              </ProtectedRouteUser>
            }
          />

          <Route
            path="/user/dashboard"
            element={
              <ProtectedRouteUser>
                <LayoutUser>
                  <DashboardUser />
                </LayoutUser>
              </ProtectedRouteUser>
            }
          />

          <Route
            path="/contact"
            element={
              <ProtectedRouteUser>
                <LayoutUser>
                  <ContactUser />
                </LayoutUser>
              </ProtectedRouteUser>
            }
          />

          <Route
            path="/riwayat"
            element={
              <ProtectedRouteUser>
                <LayoutUser>
                  <RiwayatPengaduanUser />
                </LayoutUser>
              </ProtectedRouteUser>
            }
          />

          {/* ADMIN */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRouteAdmin>
                <LayoutAdmin>
                  <DashboardAdmin />
                </LayoutAdmin>
              </ProtectedRouteAdmin>
            }
          />

          <Route
            path="/admin/kelola"
            element={
              <ProtectedRouteAdmin>
                <LayoutAdmin>
                  <KelolaPengaduan />
                </LayoutAdmin>
              </ProtectedRouteAdmin>
            }
          />

          <Route
            path="/admin/kategori"
            element={
              <ProtectedRouteAdmin>
                <LayoutAdmin>
                  <KelolaKategori />
                </LayoutAdmin>
              </ProtectedRouteAdmin>
            }
          />

          <Route
            path="/admin/riwayat"
            element={
              <ProtectedRouteAdmin>
                <LayoutAdmin>
                  <RiwayatPengaduanAdmin />
                </LayoutAdmin>
              </ProtectedRouteAdmin>
            }
          />

          <Route
            path="/admin/kelola-akun"
            element={
              <ProtectedRouteAdmin>
                <LayoutAdmin>
                  <KelolaAkun />
                </LayoutAdmin>
              </ProtectedRouteAdmin>
            }
          />

          <Route
            path="/admin/pengaduan/user/:userId"
            element={<PengaduanByUser />}
          />
        </Routes>
      </Router>
    </AlertProvider>
  );
}

export default App;
