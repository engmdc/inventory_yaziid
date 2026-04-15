import React, { useState } from 'react';
import styles from './StockAdjustmentModal.module.css';

const StockAdjustmentModal = ({ isOpen, onClose, product, onConfirm }) => {
    const [adjustmentType, setAdjustmentType] = useState('add'); // 'add' or 'remove'
    const [quantity, setQuantity] = useState('');

    if (!isOpen || !product) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const qty = parseInt(quantity);
        if (!qty || qty <= 0) return;

        const finalQty = adjustmentType === 'add' ? qty : -qty;
        onConfirm(product.id, finalQty);

        // Reset
        setQuantity('');
        setAdjustmentType('add');
        onClose();
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h2 className={styles.title}>
                    Update Stock
                    <span className={styles.productName}>{product.name} (Current: {product.stock})</span>
                </h2>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.typeSelector}>
                        <button
                            type="button"
                            className={`${styles.typeBtn} ${adjustmentType === 'add' ? styles.active : ''}`}
                            onClick={() => setAdjustmentType('add')}
                        >
                            Add Stock (+)
                        </button>
                        <button
                            type="button"
                            className={`${styles.typeBtn} ${styles.remove} ${adjustmentType === 'remove' ? styles.active : ''}`}
                            onClick={() => setAdjustmentType('remove')}
                        >
                            Remove Stock (-)
                        </button>
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Quantity</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            className={styles.input}
                            value={quantity}
                            onChange={e => {
                                const val = e.target.value;
                                if (val === '' || /^\d+$/.test(val)) {
                                    setQuantity(val);
                                }
                            }}
                            placeholder="0"
                            autoFocus
                            required
                        />
                    </div>

                    <div className={styles.actions}>
                        <button type="button" onClick={onClose} className={styles.cancel}>Cancel</button>
                        <button type="submit" className={styles.submit}>Confirm</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StockAdjustmentModal;
