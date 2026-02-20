'use client';

import React, { useState, useEffect } from 'react';
import SearchBar from '@/components/explorer/SearchBar';
import StatsOverview from '@/components/explorer/StatsOverview';
import BlockList from '@/components/explorer/BlockList';
import TransactionList from '@/components/explorer/TransactionList';
import NetworkCharts from '@/components/explorer/NetworkCharts';
import { getLatestBlocks, provider, getNetworkStats, getGlobalTransactions } from '@/lib/rpc';
import { ethers } from 'ethers';

export default function Home() {
  const [blocks, setBlocks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ latestBlock: '0' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const networkStats = await getNetworkStats();
      if (networkStats) {
        setStats(prev => ({ ...prev, ...networkStats }));
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const latestBlocks = await getLatestBlocks(10);
        setBlocks(latestBlocks);

        if (latestBlocks.length > 0) {
          // Update latest block in stats if networkStats didn't already
          setStats(prev => ({ ...prev, latestBlock: latestBlocks[0].number.toString() }));

          // Fetch global transactions instead of scanning blocks manually
          const allTxs = await getGlobalTransactions();
          setTransactions(allTxs.slice(0, 10).map(tx => ({
            ...tx,
            value_formatted: ethers.formatEther(tx.value || 0)
          })));
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Polling for new blocks every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ paddingBottom: '4rem' }}>
      {/* Hero Section */}
      <section style={{
        padding: 'clamp(3rem, 10vw, 6rem) 0 clamp(2rem, 8vw, 4rem)',
        background: 'radial-gradient(circle at center, rgba(157, 78, 221, 0.15) 0%, transparent 70%)',
        textAlign: 'center'
      }}>
        <div className="container">
          <h1 className="font-heading" style={{
            fontSize: 'clamp(2rem, 8vw, 3.5rem)',
            marginBottom: '1.5rem',
            lineHeight: '1.1'
          }}>
            The <span style={{ color: 'var(--primary-light)' }}>Kortana</span> Blockchain Explorer
          </h1>
          <p className="text-dim" style={{
            fontSize: 'clamp(1rem, 3vw, 1.25rem)',
            marginBottom: '3rem',
            maxWidth: '700px',
            margin: '0 auto 3rem'
          }}>
            Explore blocks, transactions, and addresses on the most advanced high-performance blockchain.
          </p>
          <SearchBar large={true} />
        </div>
      </section>


      <div className="container">
        <StatsOverview stats={stats} />

        <NetworkCharts />

        <div className="responsive-grid">
          <BlockList blocks={blocks} />
          <TransactionList transactions={transactions} />
        </div>
      </div>
    </div>
  );
}
