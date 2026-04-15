import React, { useState, useMemo } from 'react';
import { Search, Plus, Trash2, Edit2, Wallet, FileText } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { toast } from 'sonner';
import CustomerModal from '../components/CustomerModal';
import DebtPaymentModal from '../components/DebtPaymentModal';
import CustomerStatement from '../components/CustomerStatement';
import styles from './Customers.module.css'; // Will create this

const Customers = () => {
    const { customers, addCustomer, updateCustomer, deleteCustomer, payCustomerDebt } = useStore();
    const [search, setSearch] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [payingCustomer, setPayingCustomer] = useState(null);
    const [statementCustomer, setStatementCustomer] = useState(null);
    const statementRef = React.useRef();

    const filteredCustomers = useMemo(() => {
        return customers.filter(c =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            (c.phone && c.phone.includes(search))
        );
    }, [customers, search]);

    const handleSaveCustomer = (data) => {
        if (editingCustomer) {
            updateCustomer(editingCustomer.id, data);
            toast.success('Customer updated successfully');
            setEditingCustomer(null);
        } else {
            addCustomer(data);
            toast.success('Customer added successfully');
        }
        setIsAddModalOpen(false);
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure? This action cannot be undone.')) {
            deleteCustomer(id);
            toast.success('Customer deleted');
        }
    };

    const handlePayment = (customerId, amount) => {
        payCustomerDebt(customerId, amount);
        toast.success(`Payment of $${amount.toFixed(2)} recorded`);
        setPayingCustomer(null);
    };

    const handlePrintStatement = (customer) => {
        setStatementCustomer(customer);
        setTimeout(() => {
            window.print();
        }, 100);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Customers</h1>
                    <p className={styles.subtitle}>Manage your customer base and debts</p>
                </div>
                <button className={styles.addButton} onClick={() => { setEditingCustomer(null); setIsAddModalOpen(true); }}>
                    <Plus size={20} />
                    Add Customer
                </button>
            </div>

            <div className={styles.controls}>
                <div style={{ position: 'relative', width: '300px' }}>
                    <Search size={20} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                    <input
                        className={styles.search}
                        placeholder="Search name or phone..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Info</th>
                            <th>Total Purchases</th>
                            <th>Current Debt</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCustomers.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>
                                    No customers found.
                                </td>
                            </tr>
                        ) : (
                            filteredCustomers.map(customer => (
                                <tr key={customer.id}>
                                    <td style={{ fontWeight: 500 }}>{customer.name}</td>
                                    <td>
                                        <div style={{ fontSize: '0.875rem' }}>{customer.phone || '-'}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{customer.email}</div>
                                    </td>
                                    <td>{customer.totalPurchases || 0}</td>
                                    <td>
                                        <span style={{
                                            fontWeight: 'bold',
                                            color: customer.debt > 0 ? 'var(--color-danger)' : 'var(--color-success)'
                                        }}>
                                            ${(customer.debt || 0).toFixed(2)}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.actions}>
                                            <button
                                                className={styles.actionBtn}
                                                onClick={() => setPayingCustomer(customer)}
                                                title="Pay Credit/Debt"
                                                disabled={!customer.debt || customer.debt <= 0}
                                                style={{ opacity: (!customer.debt || customer.debt <= 0) ? 0.5 : 1 }}
                                            >
                                                <Wallet size={16} />
                                            </button>
                                            <button
                                                className={styles.actionBtn}
                                                onClick={() => handlePrintStatement(customer)}
                                                title="Print Statement"
                                            >
                                                <FileText size={16} />
                                            </button>
                                            <button
                                                className={styles.actionBtn}
                                                onClick={() => { setEditingCustomer(customer); setIsAddModalOpen(true); }}
                                                title="Edit"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                className={styles.actionBtn}
                                                onClick={() => handleDelete(customer.id)}
                                                style={{ color: 'var(--color-danger)' }}
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <CustomerModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleSaveCustomer}
                customer={editingCustomer}
            />

            <DebtPaymentModal
                isOpen={!!payingCustomer}
                onClose={() => setPayingCustomer(null)}
                onPayment={handlePayment}
                customer={payingCustomer}
            />

            <CustomerStatement ref={statementRef} customer={statementCustomer} />
        </div>
    );
};

export default Customers;
