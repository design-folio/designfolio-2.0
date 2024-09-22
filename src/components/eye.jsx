const EyeIcon = ({ stroke = "#000" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={21}
    height={20}
    fill="none"
    data-modal-id="password"
  >
    <path
      stroke={stroke}
      strokeWidth={1.25}
      d="M18.453 9.204c.254.355.38.533.38.796s-.126.44-.38.796c-1.138 1.596-4.045 5.037-7.953 5.037-3.908 0-6.815-3.44-7.953-5.037-.254-.355-.38-.533-.38-.796s.126-.44.38-.796C3.685 7.608 6.592 4.167 10.5 4.167c3.908 0 6.815 3.44 7.953 5.037Z"
    />
    <path
      stroke={stroke}
      strokeWidth={1.25}
      d="M13 10a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z"
    />
  </svg>
);
export default EyeIcon;
