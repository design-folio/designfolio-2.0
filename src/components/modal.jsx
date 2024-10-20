import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { twMerge } from "tailwind-merge";

const Modal = ({ show, onClose, children, className }) => {
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
      document.body.style.overflowY = "hidden";
    } else {
      document.body.style.overflowY = "scroll";
    }
    () => (document.body.style.overflowY = "scroll");
  }, [show]);

  if (!el || !modalRoot) {
    return null;
  }

  const modalContentVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  return ReactDOM.createPortal(
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          className={twMerge(
            "fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[999] overflow-hidden",
            className
          )}
          onClick={onClose}
          variants={modalContentVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {/* Blurred background */}
          <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-[998]" />

          {/* Children remain clear */}
          <div className="relative z-[999]">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>,
    el
  );
};

export default Modal;
