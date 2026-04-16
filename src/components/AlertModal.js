import { Modal, Button } from "react-bootstrap";

const AlertModal = ({ show, onClose, title, message, variant }) => {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body className={`text-${variant || "dark"}`}>
        {message}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Tutup
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AlertModal;
