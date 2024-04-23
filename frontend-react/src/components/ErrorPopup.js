import { useEffect } from "react";

const ErrorPopup = ({ error, clearError }) => {
  useEffect(() => {
    let timeout;
    if (error) {
      timeout = setTimeout(() => clearError(error), 4000);
    }
    return () => clearInterval(timeout);
  }, []);

  return <div className="error-popup">⚠ {error}</div>;
};

export default ErrorPopup;
