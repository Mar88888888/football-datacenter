import React from 'react';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import '../styles/SearchResults.css'

const SearchResultsPage = () => {
    const location = useLocation();
    const { results } = location.state || { results: [] };

    if (results.length === 0) {
        return <p>No results found</p>;
    }

    return (
        <div className="container">
            <h1 className="title">Search Results</h1>
            <ul className="list">
                {results.map((result) => (
                    <li key={result.id} className="result-list-item">
                        <Link to={result.crest ? `/teams/${result.id}` : `/competitions/${result.id}`}>
                            <img 
                                src={result.crest ? result.crest : result.emblem} 
                                alt={result.name} 
                                className="emblem"
                                style={{ width: '50px', height: '50px', marginRight: '10px' }}
                            />
                            {result.name}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SearchResultsPage;
