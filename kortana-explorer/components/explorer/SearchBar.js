'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

const SearchBar = ({ large = false }) => {
    const [query, setQuery] = useState('');
    const router = useRouter();

    const handleSearch = (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        // Simple validation to decide where to go
        if (query.startsWith('0x')) {
            if (query.length === 66) {
                // Transaction hash
                router.push(`/tx/${query}`);
            } else if (query.length === 42 || query.length === 50) {
                // Address (Kortana addresses are 24 bytes/50 chars including 0x)
                router.push(`/address/${query}`);
            }
        } else if (!isNaN(query)) {
            // Block number
            router.push(`/block/${query}`);
        }
    };

    return (
        <form onSubmit={handleSearch} className={large ? 'search-container search-container-large' : 'search-container'}>
            <Search className="search-icon" size={large ? 24 : 18} />
            <input
                type="text"
                className="search-input"
                style={{ paddingLeft: large ? '4rem' : '3rem', fontSize: large ? '1.1rem' : '1rem' }}
                placeholder="Search by Address / Txn Hash / Block"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            {large && (
                <button type="submit" className="btn btn-primary search-btn-inline">
                    Search
                </button>
            )}
        </form>
    );
};

export default SearchBar;
