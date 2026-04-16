import { createContext, useContext, useState } from "react";
import { Modal, Button } from "react-bootstrap";

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState({
    show: false,
    title: "",
    message: "",
    variant: "dark",
    onConfirm: null,
  });

  // ALERT BIASA
  const showAlert = (title, message, variant = "dark") => {
    setAlert({
      show: true,
      title,
      message,
      variant,
      onConfirm: null,
    });
  };

  // ALERT KONFIRMASI
  const showConfirm = (title, message, onConfirm) => {
    setAlert({
      show: true,
      title,
      message,
      variant: "danger",
      onConfirm,
    });
  };

  const closeAlert = () => {
    setAlert({ ...alert, show: false });
  };

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}

      {/* MODAL ALERT */}
      <Modal show={alert.show} onHide={closeAlert} centered>
        <Modal.Header closeButton>
          <Modal.Title>{alert.title}</Modal.Title>
        </Modal.Header>

        <Modal.Body className={`text-${alert.variant}`}>
          {alert.message}
        </Modal.Body>

        <Modal.Footer>
          {alert.onConfirm ? (
            <>
              <Button variant="secondary" onClick={closeAlert}>
                Batal
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  alert.onConfirm();
                  closeAlert();
                }}
              >
                Ya, Lanjutkan
              </Button>
            </>
          ) : (
            <Button variant="secondary" onClick={closeAlert}>
              Tutup
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </AlertContext.Provider>
  );
};

// HOOK
export const useAlert = () => useContext(AlertContext);
