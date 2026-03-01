import { useState } from 'react';
import { motion } from 'framer-motion';

const Button3D = ({ children, onClick, disabled = false, className = '' }) => {
  const [isPressed, setIsPressed] = useState(false);
  const baseColor = '#e6a855';
  const shadowColor = '#b37d36';
  const hoverColor = '#d69845';

  const handleMouseDown = () => { if (!disabled) setIsPressed(true); };
  const handleMouseUp = () => { setIsPressed(false); };
  const handleClick = (e) => { if (onClick && !disabled) onClick(e); };

  return (
    <motion.button
      className={`font-bold rounded-md px-4 py-2 text-xs text-black ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} focus:outline-none select-none flex items-center justify-center transition-colors ${className}`}
      style={{ backgroundColor: baseColor }}
      initial={{ boxShadow: `0 4px 0 0 ${shadowColor}`, y: 0 }}
      whileHover={!disabled ? { backgroundColor: hoverColor, scale: 1.02, boxShadow: `0 5px 0 0 ${shadowColor}`, transition: { duration: 0.1 } } : {}}
      whileTap={!disabled ? { scale: 0.98, y: 2, boxShadow: `0 1px 0 0 ${shadowColor}`, transition: { duration: 0.1 } } : {}}
      animate={{ y: isPressed ? 2 : 0, boxShadow: isPressed ? `0 1px 0 0 ${shadowColor}` : `0 4px 0 0 ${shadowColor}` }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleClick}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );
};

export default Button3D;
