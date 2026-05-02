import React, { useState } from 'react';
import { useRouteStore } from '../../store/useRouteStore';
import { Map, Download, Save, Moon, Sun, Upload, FolderOpen, Check, FileText } from 'lucide-react';

import { ImportModal } from './ImportModal';
import { LoadTripModal } from './LoadTripModal';

export const Header: React.FC = () => {
  const { appMode, setAppMode, title, saveTrip, places } = useRouteStore();
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isLoadOpen, setIsLoadOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    saveTrip();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleExportTxt = () => {
    const textContent = places.map((p, i) => `${i + 1}. ${p.name}\n   ${p.address}`).join('\n\n');
    const blob = new Blob([`Places to Visit - ${title}\n\n${textContent}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Wanderlog_Places_${title.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="bg-primary-500 p-2 rounded-lg">
          <Map className="text-white w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-surface-900 tracking-tight">{title}</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative">
          <select 
            value={appMode}
            onChange={(e) => setAppMode(e.target.value as 'real' | 'mock' | 'dropdown-mock')}
            className={`appearance-none flex items-center gap-2 pl-4 pr-10 py-2 rounded-full text-sm font-medium transition-colors border cursor-pointer outline-none focus:ring-2 focus:ring-primary-500 ${
              appMode === 'real' 
                ? 'bg-white text-surface-700 border-surface-200' 
                : 'bg-amber-100 text-amber-800 border-amber-200'
            }`}
          >
            <option value="real">Real Mode</option>
            <option value="mock">Mock Mode</option>
            <option value="dropdown-mock">Dropdown Mock Mode</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {appMode === 'real' ? <Moon className="w-4 h-4 text-surface-400" /> : <Sun className="w-4 h-4 text-amber-600" />}
          </div>
        </div>
        
        <button 
          onClick={handleSave}
          className={`flex items-center gap-2 font-medium text-sm transition-colors ${
            isSaved ? 'text-green-600' : 'text-surface-600 hover:text-primary-600'
          }`}
        >
          {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {isSaved ? 'Saved!' : 'Save'}
        </button>

        <button 
          onClick={() => setIsLoadOpen(true)}
          className="flex items-center gap-2 text-surface-600 hover:text-primary-600 font-medium text-sm transition-colors"
        >
          <FolderOpen className="w-4 h-4" /> Load
        </button>

        <button 
          onClick={() => setIsImportOpen(true)}
          className="flex items-center gap-2 text-surface-600 hover:text-primary-600 font-medium text-sm transition-colors"
        >
          <Upload className="w-4 h-4" /> Import
        </button>
        
        <div className="relative group">
          <button 
            onClick={() => window.print()}
            className="btn-secondary flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export PDF
          </button>
          
          {/* Dropdown for TXT export on hover */}
          <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-surface-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
            <button 
              onClick={handleExportTxt}
              className="w-full text-left px-4 py-3 text-sm text-surface-700 hover:bg-surface-50 hover:text-primary-600 flex items-center gap-2 transition-colors font-medium"
            >
              <FileText className="w-4 h-4" />
              Export Places (TXT)
            </button>
          </div>
        </div>
      </div>
      
      <ImportModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />
      <LoadTripModal isOpen={isLoadOpen} onClose={() => setIsLoadOpen(false)} />
    </header>
  );
};
