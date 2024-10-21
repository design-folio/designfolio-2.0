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
          className={twMerge(
            "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999]",
            className
          )}
          onClick={onClose}
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>,
    el
  );
};

export default Modal;
