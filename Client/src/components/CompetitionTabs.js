import React from 'react';

const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-6 py-2 rounded-lg font-medium transition-all ${
      active ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
    }`}
  >
    {children}
  </button>
);

const CompetitionTabs = ({ format, activeTab, onTabChange }) => {
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
