import React from 'react';
import { Menu, User, FileText, MonitorPlay, Columns } from 'lucide-react';

interface HeaderProps {
  toggleSidebar: () => void;
  title?: string;
  currentModel: string;
  onModelChange: (model: string) => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, title, currentModel, onModelChange }) => {
  const getIcon = () => {
    return currentModel.includes('-split') ? <Columns size={14} /> : <MonitorPlay size={14} />;
  };

  return (
    <header className="h-14 bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 shadow-sm">
      <div className="flex items-center">
        <div className="flex items-center w-64">
          <span className="text-xl font-bold tracking-tight text-gray-800 mr-2">
            make<span className="text-purple-600">ticket</span> <span className="text-gray-500 bg-gray-100 text-xs px-1 py-0.5 rounded">ADM</span>
          </span>
        </div>
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
        >
          <Menu size={24} />
        </button>
        <div className="ml-4 flex items-center">
            <div className="relative">
              <select 
                className="form-select py-1 pl-9 pr-8 text-sm border-purple-200 rounded-md focus:ring-purple-500 focus:border-purple-500 bg-purple-50 text-purple-900 font-medium shadow-sm transition-all hover:bg-purple-100"
                value={currentModel}
                onChange={(e) => onModelChange(e.target.value)}
              >
                {[1, 2, 3, 4, 5, 6, 7].map(num => (
                  <React.Fragment key={num}>
                    <option value={`model${num}-split`}>Model {num} (개발명세서 포함)</option>
                    <option value={`model${num}-app`}>Model {num} (기획 시뮬레이션)</option>
                  </React.Fragment>
                ))}
              </select>
              <div className="absolute left-2.5 top-1.5 text-purple-600 pointer-events-none">
                {getIcon()}
              </div>
            </div>
        </div>
        {title && (
          <h1 className="ml-4 text-lg font-semibold text-purple-700 hidden md:block border-l border-gray-300 pl-4">
            {title}
          </h1>
        )}
      </div>
      <div className="flex items-center space-x-4">
        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 cursor-pointer hover:bg-purple-200 transition-colors">
          <User size={18} />
        </div>
      </div>
    </header>
  );
};

export default Header;