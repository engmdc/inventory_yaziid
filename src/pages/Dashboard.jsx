import React from 'react';
import { useStore } from '../contexts/StoreContext';
import styles from './Dashboard.module.css';

const Dashboard = () => {
    const { transactions, products, storeProfile } = useStore();

    const totalSales = transactions.reduce((acc, tx) => acc + tx.total, 0);
    const totalTransactions = transactions.length;
    const lowStockCount = products.filter(p => p.stock < 10).length;

    const recentTransactions = transactions.slice(0, 5);

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>{storeProfile?.name || 'Dashboard'}</h1>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Total Revenue</span>
                    <span className={styles.statValue}>${totalSales.toFixed(2)}</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Total Transactions</span>
                    <span className={styles.statValue}>{totalTransactions}</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Low Stock Items</span>
                    <span className={styles.statValue} style={{ color: lowStockCount > 0 ? 'var(--color-warning)' : 'inherit' }}>
                        {lowStockCount}
                    </span>
                </div>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Recent Activity</h2>
                <div className={styles.recentList}>
                    {recentTransactions.length === 0 ? (
                        <div style={{ padding: '1rem', color: '#94a3b8' }}>No recent activity.</div>
                    ) : (
                        recentTransactions.map(tx => (
                            <div key={tx.id} className={styles.recentItem}>
                                <div>
                                    <div style={{ fontWeight: 500 }}>Sale</div>
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{new Date(tx.date).toLocaleTimeString()}</div>
                                </div>
                                <div style={{ fontWeight: 600, color: 'var(--color-success)' }}>
                                    +${tx.total.toFixed(2)}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
