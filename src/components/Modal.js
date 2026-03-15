import React from 'react';
import { X } from 'lucide-react';
import { useAdminTheme } from '../theme/ThemeContext';

const Modal = ({ isOpen, onClose, title, children }) => {
  const { theme } = useAdminTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
      <div 
        className="relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300"
        style={{ backgroundColor: theme.card }}
      >
        <div 
          className="flex items-center justify-between px-8 py-6 border-b"
          style={{ borderColor: theme.border }}
        >
          <h3 className="text-xl font-black uppercase tracking-widest" style={{ color: theme.primary }}>
            {title}
          </h3>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            style={{ color: theme.text }}
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-8 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;