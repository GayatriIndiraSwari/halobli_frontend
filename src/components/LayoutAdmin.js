import NavbarAdmin from "./NavbarAdmin";
import Footer from "./Footer";

const LayoutAdmin = ({ children }) => {
  return (
    <div className="app-wrapper">
      <NavbarAdmin />
      <main className="content">
        {children}
      </main>
      <Footer variant="admin"/>
    </div>
  );
};

export default LayoutAdmin;
