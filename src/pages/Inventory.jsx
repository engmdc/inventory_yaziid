import React, { useState } from 'react';
import { Plus, Edit2, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../contexts/StoreContext';
import ProductForm from '../components/Inventory/ProductForm';
import StockAdjustmentModal from '../components/Inventory/StockAdjustmentModal';
import styles from './Inventory.module.css';

const Inventory = () => {
    const { products = [], addProduct, updateProduct, deleteProduct } = useStore();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [stockProduct, setStockProduct] = useState(null);

    const handleCreate = (data) => {
        addProduct(data);
        toast.success('Product added successfully');
    };

    const handleUpdate = (data) => {
        if (editingProduct) {
            updateProduct(editingProduct.id, data);
            setEditingProduct(null);
            toast.success('Product updated');
        }
    };

    const openCreateModal = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const openStockModal = (product) => {
        setStockProduct(product);
        setIsStockModalOpen(true);
    };

    const handleStockAdjustment = (productId, delta) => {
        const product = products.find(p => p.id === productId);
        if (product) {
            updateProduct(productId, {
                stock: (product.stock || 0) + delta
            });
            toast.success(`Stock updated by ${delta > 0 ? '+' : ''}${delta}`);
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            deleteProduct(id);
            toast.error('Product deleted');
        }
    };

    return (
        <div>
            <div className={styles.header}>
                <h1 className={styles.title}>Inventory</h1>
                <button className={styles.addButton} onClick={openCreateModal}>
                    <Plus size={20} />
                    Add Product
                </button>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>ID / Barcode</th>
                            <th>Category</th>
                            <th>Stock</th>
                            <th>Price</th>
                            <th>Cost</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {!Array.isArray(products) || products.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                                    No products found. Add some!
                                </td>
                            </tr>
                        ) : (
                            products.map(product => (
                                <tr key={product.id || Math.random()}>
                                    <td>{product.name || 'N/A'}</td>

                                    <td style={{ fontFamily: 'monospace', color: 'var(--color-primary)' }}>
                                        {String(product.id || '').length < 20 ? product.id : '-'}
                                    </td>

                                    <td>{product.category || 'N/A'}</td>

                                    <td style={{
                                        color: (product.stock || 0) < 10
                                            ? 'var(--color-danger)'
                                            : 'inherit'
                                    }}>
                                        {product.stock ?? 0}
                                    </td>

                                    <td>${product.price?.toFixed(2) || '0.00'}</td>
                                    <td>${product.cost?.toFixed(2) || '0.00'}</td>

                                    <td>
                                        <div className={styles.actions}>
                                            <button
                                                className={styles.editBtn}
                                                onClick={() => openStockModal(product)}
                                                title="Adjust Stock"
                                                style={{ color: 'var(--color-warning)' }}
                                            >
                                                <RefreshCw size={18} />
                                            </button>

                                            <button
                                                className={styles.editBtn}
                                                onClick={() => openEditModal(product)}
                                            >
                                                <Edit2 size={18} />
                                            </button>

                                            <button
                                                className={styles.deleteBtn}
                                                onClick={() => handleDelete(product.id)}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <ProductForm
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={editingProduct ? handleUpdate : handleCreate}
                initialData={editingProduct}
            />

            <StockAdjustmentModal
                isOpen={isStockModalOpen}
                onClose={() => setIsStockModalOpen(false)}
                product={stockProduct}
                onConfirm={handleStockAdjustment}
            />
        </div>
    );
};

export default Inventory;