import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

const Modal = ({ show, onClose, children }) => {
  const [modalRoot, setModalRoot] = useState(null);
  const [el, setEl] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const createdEl = document.createElement("div");
      const root = document.getElementById("modal-root");
      setEl(createdEl);
      setModalRoot(root);

      if (root && createdEl) {
        root.appendChild(createdEl);
      }

      return () => {
        if (root && createdEl) {
          root.removeChild(createdEl);
        }
      };
    }
  }, []);

  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "scroll";
    }
    () => (document.body.style.overflow = "scroll");
  }, [show]);

  if (!el || !modalRoot) {
    return null;
  }

  // Simplified variants for smooth opacity transitions
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalContentVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4, ease: "easeInOut" } },
  };

  return ReactDOM.createPortal(
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999]"
          onClick={onClose}
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            variants={modalContentVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    el
  );
};

export default Modal;
