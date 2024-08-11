import React, { useEffect, useContext } from 'react';

const ProtectedComponent = () => {
    const fetchData = async () => {
        const response = await fetch(process.env.REACT_APP_API_URL, {
            method: 'GET',
        });

        if (response.ok) {
            const data = await response.json();
            console.log(data);
        } else {
            console.error('Failed to fetch data');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div>
            <h1>Protected Data</h1>
        </div>
    );
};

export default ProtectedComponent;
