import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, Info, Zap, MessageCircle, X } from 'lucide-react';

export default function Toast({ message, type, onClose, duration = 5000 }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [message, onClose, duration]);

  if (!message) return null;

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500 border-green-600 text-white';
      case 'error':
        return 'bg-red-500 border-red-600 text-white';
      case 'info':
        return 'bg-blue-500 border-blue-600 text-white';
      case 'warning':
        return 'bg-yellow-500 border-yellow-600 text-white';
      default:
        return 'bg-gray-500 border-gray-600 text-white';
    }
  };

  const getIcon = () => {
    switch (type) {
        case 'success': return <CheckCircle size={20} />;
        case 'error': return <AlertTriangle size={20} />;
        case 'info': return <Info size={20} />;
        case 'warning': return <Zap size={20} />;
        default: return <MessageCircle size={20} />;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div className={`${getToastStyles()} border-l-4 p-4 rounded-lg shadow-xl max-w-md`}>
        <div className="flex items-start">
          <div className="text-xl mr-3 mt-0.5">
            {getIcon()}
          </div>
          <div className="flex-1">
            <p className="font-medium">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-3 text-white hover:text-gray-200 transition-colors"
          >
            <X size={16} className="text-white hover:text-gray-200" />
          </button>
        </div>
      </div>
    </div>
  );
}