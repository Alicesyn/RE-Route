import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { useRouteStore } from '../../store/useRouteStore';
import { autoCategorize, getDefaultDuration } from '../../utils/categoryUtils';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose }) => {
  const [text, setText] = useState('');
  const { addPlace } = useRouteStore();

  if (!isOpen) return null;

  const handleImport = () => {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    lines.forEach((line) => {
      const category = autoCategorize(line);
      // Create a mock place for each imported line
      addPlace({
        id: `p_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: line,
        address: 'Imported Location',
        lat: 40.7580 + (Math.random() * 0.1 - 0.05), // random near NYC
        lng: -73.9855 + (Math.random() * 0.1 - 0.05),
        description: '',
        descriptionSource: 'user',
        category,
        estimatedDuration: getDefaultDuration(category),
      });
    });
    
    setText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-surface-200">
          <h2 className="text-lg font-bold text-surface-900 flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary-500" />
            Import Places
          </h2>
          <button 
            onClick={onClose}
            className="p-1 text-surface-400 hover:text-surface-700 hover:bg-surface-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          <p className="text-sm text-surface-600 mb-3">
            Paste a list of places (one per line) from Wanderlog, your notes, or a spreadsheet.
          </p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-64 p-3 border border-surface-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm text-surface-800 resize-none custom-scrollbar"
            placeholder="E.g.&#10;Central Park&#10;Times Square&#10;Empire State Building"
          />
        </div>
        
        <div className="p-4 border-t border-surface-200 bg-surface-50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-surface-700 bg-white border border-surface-300 rounded-lg hover:bg-surface-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleImport}
            disabled={text.trim().length === 0}
            className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Import Places
          </button>
        </div>
      </div>
    </div>
  );
};
