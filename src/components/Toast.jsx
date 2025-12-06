import React, { useEffect, useState } from 'react';
import clsx from 'clsx';

const Toast = ({ message, type, duration, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);

    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // wait for fade-out
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = {
    success: 'bg-[#b0c242]',
    error: 'bg-[#d86359]',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500 text-black',
  }[type] || 'bg-gray-500';

  return (
    <div
      className={clsx(
        'flex justify-between items-center text-white px-4 py-2 rounded shadow-md transform transition-all duration-300',
        bgColor,
        visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
      )}
    >
      <span>{message}</span>
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(onClose, 300); // match fade-out duration
        }}
        className="ml-4 text-white hover:text-gray-200 focus:outline-none"
      >
        ✕
      </button>
    </div>
  );
};

export default Toast;