import React from 'react';

interface InputTabsProps {
  activeTab: 'upload' | 'text';
  onTabChange: (tab: 'upload' | 'text') => void;
}

/**
 * Tab navigation for input methods (upload vs. paste)
 */
export function InputTabs({ activeTab, onTabChange }: InputTabsProps) {
  return (
    <div className="input-tabs">
      <button
        className={`tab-button ${activeTab === 'upload' ? 'active' : ''}`}
        onClick={() => onTabChange('upload')}
      >
        📸 Upload Snapshot or Design
      </button>
      <button
        className={`tab-button ${activeTab === 'text' ? 'active' : ''}`}
        onClick={() => onTabChange('text')}
      >
        📝 Paste Description
      </button>
    </div>
  );
}
