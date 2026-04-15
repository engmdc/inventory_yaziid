import React, { useState, useEffect } from 'react';
import styles from './CustomerModal.module.css';

const CustomerModal = ({ isOpen, onClose, onSave, customer = null }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [debt, setDebt] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (customer) {
            setName(customer.name);
            setPhone(customer.phone || '');
            setEmail(customer.email || '');
            setDebt(customer.debt || '');
            setNotes(customer.notes || '');
        } else {
            setName('');
            setPhone('');
            setEmail('');
            setDebt('');
            setNotes('');
        }
    }, [customer, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            name,
            phone,
            email,
            debt,
            notes
        });
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h2 className={styles.title}>{customer ? 'Edit Customer' : 'New Customer'}</h2>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.group}>
                        <label className={styles.label}>Name</label>
                        <input
                            type="text"
                            required
                            className={styles.input}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Customer Name"
                        />
                    </div>

                    <div className={styles.group}>
                        <label className={styles.label}>Phone</label>
                        <input
                            type="tel"
                            className={styles.input}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Phone Number"
                        />
                    </div>

                    <div className={styles.group}>
                        <label className={styles.label}>Email</label>
                        <input
                            type="email"
                            className={styles.input}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email Address"
                        />
                    </div>

                    <div className={styles.group}>
                        <label className={styles.label}>Current Debt</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            className={styles.input}
                            value={debt}
                            onChange={(e) => setDebt(e.target.value)}
                            placeholder="0.00"
                        />
                    </div>

                    <div className={styles.group}>
                        <label className={styles.label}>Notes</label>
                        <textarea
                            className={styles.input}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Additional notes..."
                            rows={3}
                        />
                    </div>

                    <div className={styles.actions}>
                        <button type="button" onClick={onClose} className={styles.cancel}>
                            Cancel
                        </button>
                        <button type="submit" className={styles.submit}>
                            Save Customer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CustomerModal;
