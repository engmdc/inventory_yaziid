import React, { useState, useMemo, useRef } from 'react';
import { Download, Printer, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../contexts/StoreContext';
import { useAuth } from '../contexts/AuthContext';
import Receipt from '../components/POS/Receipt';
import styles from './Transactions.module.css';

const Transactions = () => {
    const { transactions, deleteTransaction } = useStore();
    const { registeredUsers } = useAuth();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [search, setSearch] = useState('');
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    const receiptRef = useRef();

    const filteredTransactions = useMemo(() => {
        return transactions.filter(tx => {
            // Date Filter
            let dateMatch = true;
            if (startDate || endDate) {
                const txDate = new Date(tx.date);
                const start = startDate ? new Date(startDate) : new Date(0);
                const end = endDate ? new Date(endDate) : new Date();
                end.setHours(23, 59, 59, 999);
                dateMatch = txDate >= start && txDate <= end;
            }

            // Search Filter
            let searchMatch = true;
            if (search) {
                const searchLower = search.toLowerCase();
                const idMatch = tx.id.toLowerCase().includes(searchLower);
                // tx.items might be undefined in legacy data, check existence
                const itemMatch = tx.items && tx.items.some(item =>
                    item.name.toLowerCase().includes(searchLower) ||
                    (item.productId && item.productId.toLowerCase().includes(searchLower))
                );
                const customerMatch = tx.customerName && tx.customerName.toLowerCase().includes(searchLower);
                searchMatch = idMatch || itemMatch || customerMatch;
            }

            return dateMatch && searchMatch;
        });
    }, [transactions, startDate, endDate, search]);

    const handlePrint = (transaction) => {
        setSelectedTransaction(transaction);
        // Give react time to render the receipt component with new data
        setTimeout(() => {
            window.print();
        }, 100);
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this transaction?')) {
            deleteTransaction(id);
            toast.success('Transaction deleted');
        }
    };

    const exportCSV = () => {
        if (filteredTransactions.length === 0) return;

        const headers = ['Date', 'ID', 'Role', 'Type', 'Customer', 'Method', 'Total', 'Discount', 'Items'];

        // Helper to escape CSV fields (wrap in quotes if contains comma, quote, or newline)
        const safeCSV = (str) => {
            const val = String(str);
            if (val.includes(',') || val.includes('"') || val.includes('\n')) {
                return `"${val.replace(/"/g, '""')}"`;
            }
            return val;
        };

        const rows = filteredTransactions.map(tx => {
            const userRef = registeredUsers?.find(u => u.id === tx.ownerId);
            let roleString = 'System';
            if (userRef) {
                const name = userRef.name || userRef.username;
                const role = userRef.role ? userRef.role.toUpperCase() : 'USER';
                roleString = `${name} (${role})`;
            }

            return [
                new Date(tx.date).toLocaleDateString(),
                tx.id,
                roleString,
                tx.type,
                tx.customerName || '-',
                tx.paymentMethod || 'cash',
                tx.total.toFixed(2),
                (tx.discount || 0).toFixed(2),
                tx.items.map(i => `${i.name} (x${i.quantity})`).join('; ')
            ];
        });

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(safeCSV).join(','))
        ].join('\n');

        // Add BOM for Excel compatibility (\uFEFF)
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `transactions_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div>
            <div className={styles.header}>
                <h1 className={styles.title}>Transaction History</h1>
                <div style={{ position: 'relative', width: '300px' }}>
                    <Search size={20} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                        className={styles.input}
                        style={{ paddingLeft: '2.5rem', width: '100%', boxSizing: 'border-box' }}
                        placeholder="Search ID or Product..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.controls}>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Start Date</label>
                    <input
                        type="date"
                        className={styles.input}
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>End Date</label>
                    <input
                        type="date"
                        className={styles.input}
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                    />
                </div>

                <button className={styles.exportBtn} onClick={exportCSV}>
                    <Download size={18} />
                    Export CSV
                </button>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Transaction ID</th>
                            <th>Role</th>
                            <th>Info</th>
                            <th>Items</th>
                            <th>Total Amount</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTransactions.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                                    No transactions found for this period.
                                </td>
                            </tr>
                        ) : (
                            filteredTransactions.map(tx => (
                                <tr key={tx.id}>
                                    <td>{new Date(tx.date).toLocaleString()}</td>
                                    <td style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                                        {tx.id.length < 20 ? tx.id : tx.id.slice(0, 8) + '...'}
                                    </td>
                                    <td style={{ fontWeight: '500', color: 'var(--color-primary)' }}>
                                        {(() => {
                                            const userRef = registeredUsers?.find(u => u.id === tx.ownerId);
                                            if (!userRef) return 'System';
                                            return (
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span>{userRef.name || userRef.username}</span>
                                                    <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>
                                                        ({userRef.role || 'USER'})
                                                    </span>
                                                </div>
                                            );
                                        })()}
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: '500' }}>{tx.customerName || 'Walk-in'}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                            {tx.paymentMethod === 'credit' ?
                                                <span style={{ color: '#ef4444', fontWeight: 'bold' }}>CREDIT</span> :
                                                'Cash'}
                                        </div>
                                    </td>
                                    <td>
                                        {tx.items.map(i => (
                                            <div key={i.productId}>
                                                {i.name}
                                                {/* Only show product ID if it is custom (short) */}
                                                {i.productId.length < 20 && (
                                                    <span style={{ fontWeight: 'bold', marginLeft: '0.5rem', fontSize: '0.8rem', color: 'var(--color-primary)' }}>
                                                        ({i.productId})
                                                    </span>
                                                )}
                                                <span style={{ marginLeft: '0.5rem' }}>x{i.quantity}</span>
                                            </div>
                                        ))}
                                    </td>
                                    <td className={styles.amount}>
                                        {tx.paymentMethod === 'cash' ? `SLSH ${tx.total.toFixed(2)}` : `$${tx.total.toFixed(2)}`}
                                        {tx.discount > 0 && (
                                            <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 'normal' }}>
                                                Disc: -{tx.paymentMethod === 'cash' ? `SLSH ${tx.discount.toFixed(2)}` : `$${tx.discount.toFixed(2)}`}
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <button
                                            className={styles.printBtn}
                                            onClick={() => handlePrint(tx)}
                                            style={{ marginRight: '1rem' }}
                                        >
                                            <Printer size={16} />
                                        </button>
                                        <button
                                            className={styles.printBtn}
                                            onClick={() => handleDelete(tx.id)}
                                            style={{ color: 'var(--color-danger)' }}
                                            title="Delete Transaction"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Hidden Receipt Component for Printing */}
            <Receipt ref={receiptRef} transaction={selectedTransaction} />
        </div>
    );
};

export default Transactions;
