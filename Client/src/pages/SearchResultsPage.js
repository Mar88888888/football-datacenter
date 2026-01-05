import React from 'react';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';

const SearchResultsPage = () => {
  const location = useLocation();
  const { results } = location.state || { results: [] };

  if (results.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <h1 className="text-2xl font-bold text-slate-400">No results found</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white text-center mb-8">
          Search Results
        </h1>
        <ul className="list-none p-0 space-y-3">
          {results.map((result) => (
            <li key={result.id}>
              <Link
                to={result.crest ? `/teams/${result.id}` : `/competitions/${result.id}`}
                className="flex items-center gap-4 bg-slate-800 border border-slate-700 rounded-lg p-4 hover:bg-slate-700 hover:border-slate-600 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <img
                  src={result.crest ? result.crest : result.emblem}
                  alt={result.name}
                  className="w-12 h-12 object-contain"
                />
                <span className="text-slate-200 font-semibold">{result.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SearchResultsPage;
