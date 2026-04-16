import NavbarUser from "./NavbarUser";
import Footer from "./Footer";

const LayoutUser = ({ children }) => {
  return (
    <div className="app-wrapper">
      <NavbarUser />
      <main className="content">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default LayoutUser;
