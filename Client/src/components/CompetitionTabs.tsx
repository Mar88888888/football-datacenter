import React, { ReactNode } from 'react';
import type { CompetitionFormat } from '../types';

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-6 py-2 rounded-lg font-medium transition-all ${
      active ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
    }`}
  >
    {children}
  </button>
);

export type TabType = 'standings' | 'knockout' | 'matches';

interface CompetitionTabsProps {
  format: CompetitionFormat;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const CompetitionTabs: React.FC<CompetitionTabsProps> = ({ format, activeTab, onTabChange }) => {
  if (format !== 'group_knockout' && format !== 'knockout') {
    return null;
  }

  return (
    <div className="flex justify-center mb-8">
      <div className="inline-flex bg-slate-800 rounded-xl p-1 border border-slate-700">
        {format === 'group_knockout' && (
          <TabButton active={activeTab === 'standings'} onClick={() => onTabChange('standings')}>
            Group Stage
          </TabButton>
        )}
        <TabButton active={activeTab === 'knockout'} onClick={() => onTabChange('knockout')}>
          Knockout
        </TabButton>
        <TabButton active={activeTab === 'matches'} onClick={() => onTabChange('matches')}>
          All Matches
        </TabButton>
      </div>
    </div>
  );
};

export default CompetitionTabs;
