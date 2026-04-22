import React, { useState } from 'react';
import { X, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import styles from './CustomerModal.module.css'; // Reusing styles

const DebtPaymentModal = ({ isOpen, onClose, onPayment, customer }) => {
    const [amount, setAmount] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const val = parseFloat(amount);
        
        if (!val || val <= 0) {
            toast.error('Fadlan gali lacag (Please enter a valid amount)');
            return;
        }

        if (val > customer.debt) {
            toast.error('Lacagta la bixinayo kama badnaan karto deynta (' + customer.debt.toFixed(2) + ')');
            return;
        }

        onPayment(customer.id, val);
        setAmount('');
        onClose();
    };

    if (!isOpen || !customer) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 className={styles.title} style={{ marginBottom: 0 }}>Record Debt Payment</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                        <X size={24} />
                    </button>
                </div>

                <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Current Debt for</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#1e293b' }}>{customer.name}</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444', marginTop: '0.5rem' }}>
                        ${customer.debt?.toFixed(2) || '0.00'}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.group}>
                        <label className={styles.label}>Payment Amount</label>
                        <div style={{ position: 'relative' }}>
                            <DollarSign size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input
                                type="number"
                                required
                                min="0.01"
                                step="0.01"
                                className={styles.input}
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                style={{ paddingLeft: '2.5rem', width: '100%', boxSizing: 'border-box' }}
                            />
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <button type="button" onClick={onClose} className={styles.cancel}>
                            Cancel
                        </button>
                        <button type="submit" className={styles.submit}>
                            Confirm Payment
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DebtPaymentModal;
