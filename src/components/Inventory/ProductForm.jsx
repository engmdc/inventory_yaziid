import React, { useState, useEffect } from 'react';
import styles from './ProductForm.module.css';

const ProductForm = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState({
        name: '',
        customId: '', // Barcode / Custom ID
        category: '',
        price: '',
        cost: '',
        stock: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                name: initialData.name || '',
                customId: initialData.customId || '',
                category: initialData.category || '',
                price: initialData.price !== undefined && initialData.price !== null ? initialData.price : '',
                cost: initialData.cost !== undefined && initialData.cost !== null ? initialData.cost : '',
                stock: initialData.stock !== undefined && initialData.stock !== null ? initialData.stock : ''
            });
        } else {
            setFormData({ name: '', customId: '', category: '', price: '', cost: '', stock: '' });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            price: parseFloat(formData.price) || 0,
            cost: parseFloat(formData.cost) || 0,
            stock: parseInt(formData.stock) || 0
        });
        onClose();
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h2 className={styles.title}>{initialData ? 'Edit Product' : 'Add New Product'}</h2>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.group}>
                        <label className={styles.label}>Product Name</label>
                        <input
                            className={styles.input}
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className={styles.group}>
                        <label className={styles.label}>Barcode / Product ID (Optional)</label>
                        <input
                            className={styles.input}
                            value={formData.customId || ''}
                            onChange={e => setFormData({ ...formData, customId: e.target.value })}
                            placeholder="Scan barcode or type ID..."
                            disabled={!!initialData} // Disable editing ID for existing products
                        />
                    </div>

                    <div className={styles.group}>
                        <label className={styles.label}>Category</label>
                        <input
                            className={styles.input}
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                            required
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className={styles.group}>
                            <label className={styles.label}>Selling Price</label>
                            <input
                                type="number"
                                step="0.01"
                                className={styles.input}
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                                required
                            />
                        </div>
                        <div className={styles.group}>
                            <label className={styles.label}>Cost Price</label>
                            <input
                                type="number"
                                step="0.01"
                                className={styles.input}
                                value={formData.cost}
                                onChange={e => setFormData({ ...formData, cost: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.group}>
                        <label className={styles.label}>Stock Quantity</label>
                        <input
                            type="number"
                            className={styles.input}
                            value={formData.stock}
                            onChange={e => setFormData({ ...formData, stock: e.target.value })}
                            required
                        />
                    </div>

                    <div className={styles.actions}>
                        <button type="button" onClick={onClose} className={styles.cancel}>Cancel</button>
                        <button type="submit" className={styles.submit}>Save Product</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductForm;
