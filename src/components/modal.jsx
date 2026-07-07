import React, { useEffect, useState, startTransition } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { twMerge } from "tailwind-merge";

const Modal = ({ show, onClose, children, className }) => {
  const [modalRoot, setModalRoot] = useState(null);
  const [el, setEl] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const createdEl = document.createElement("div");
      const root = document.getElementById("modal-root");
      startTransition(() => {
        setEl(createdEl);
        setModalRoot(root);
      });

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
            "fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm",
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
