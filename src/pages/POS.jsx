import React, { useState, useMemo } from 'react';
import { Search, Minus, Plus, Trash2, ShoppingCart, User, Percent, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../contexts/StoreContext';
import styles from './POS.module.css';

const POS = () => {
    const { products, addTransaction, customers } = useStore();
    const [search, setSearch] = useState('');
    const [customTxId, setCustomTxId] = useState('');
    const [cart, setCart] = useState([]);

    // New State for Discounts & Customers
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [discountType, setDiscountType] = useState('amount'); // 'amount' | 'percent'
    const [discountValue, setDiscountValue] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' | 'credit'

    // Filter products by search
    const filteredProducts = useMemo(() => {
        return products.filter(p =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.category.toLowerCase().includes(search.toLowerCase()) ||
            (p.id && p.id.toLowerCase().includes(search.toLowerCase())) // Search by ID
        );
    }, [products, search]);

    const addToCart = (product) => {
        if (product.stock <= 0) return; // Prevent adding out of stock

        setCart(prev => {
            const existing = prev.find(item => item.productId === product.id);
            if (existing) {
                if (existing.quantity >= product.stock) return prev; // Limit to max stock
                return prev.map(item =>
                    item.productId === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { ...product, productId: product.id, quantity: 1 }];
        });
    };

    const updateQuantity = (productId, delta) => {
        setCart(prev => {
            return prev.map(item => {
                if (item.productId === productId) {
                    const newQty = item.quantity + delta;
                    if (newQty <= 0) return null; // Remove if 0

                    // Check stock limit logic if needed, but for now we assume cart item has full product data snapshot 
                    // Realistically we should check live stock here too
                    const product = products.find(p => p.id === productId);
                    if (product && newQty > product.stock) return item;

                    return { ...item, quantity: newQty };
                }
                return item;
            }).filter(Boolean);
        });
    };

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.productId !== productId));
    };

    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const discountAmount = useMemo(() => {
        const val = parseFloat(discountValue) || 0;
        if (discountType === 'amount') return Math.min(val, totalAmount);
        return (totalAmount * val) / 100;
    }, [totalAmount, discountValue, discountType]);

    const finalTotal = Math.max(0, totalAmount - discountAmount);

    const handleCheckout = () => {
        if (cart.length === 0) return;

        if (paymentMethod === 'credit' && !selectedCustomerId) {
            toast.error('Customer is required for Credit sales');
            return;
        }

        const transaction = {
            items: cart,
            subtotal: totalAmount,
            discount: discountAmount,
            total: finalTotal,
            type: 'sale',
            paymentMethod,
            customerId: selectedCustomerId || null,
            customerName: customers.find(c => c.id === selectedCustomerId)?.name || null,
            customId: customTxId.trim() || null
        };

        addTransaction(transaction);
        setCart([]); // Clear cart
        setCustomTxId(''); // Reset ID
        setDiscountValue(''); // Reset discount
        setSelectedCustomerId(''); // Reset customer
        setPaymentMethod('cash'); // Reset payment method

        toast.success('Transaction Completed Successfully!', {
            description: `Total: ${paymentMethod === 'cash' ? 'SLSH ' : '$'}${finalTotal.toFixed(2)}`
        });
    };

    return (
        <div className={styles.container}>
            {/* Product Grid Area */}
            <div className={styles.main}>
                <div style={{ position: 'relative' }}>
                    <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                    <input
                        className={styles.search}
                        placeholder="Search products..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ paddingLeft: '3rem' }}
                    />
                </div>

                <div className={styles.grid}>
                    {filteredProducts.map(product => (
                        <div
                            key={product.id}
                            className={styles.card}
                            onClick={() => addToCart(product)}
                            style={{ opacity: product.stock <= 0 ? 0.5 : 1 }}
                        >
                            <div>
                                <div className={styles.productName}>{product.name}</div>
                                <div className={styles.productStock}>{product.stock} in stock</div>
                            </div>
                            <div className={styles.productPrice}>${product.price.toFixed(2)}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Cart Area */}
            <div className={styles.cart}>
                <div className={styles.cartHeader}>
                    <div className={styles.cartTitle}>Current Order</div>
                </div>

                <div className={styles.cartItems}>
                    {cart.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', marginTop: '2rem' }}>
                            <ShoppingCart size={48} style={{ margin: '0 auto', display: 'block', marginBottom: '1rem', opacity: 0.5 }} />
                            Cart is empty
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.productId} className={styles.cartItem}>
                                <div className={styles.itemInfo}>
                                    <span className={styles.itemName}>{item.name}</span>
                                    <span className={styles.itemPrice}>{paymentMethod === 'cash' ? 'SLSH ' : '$'}{item.price.toFixed(2)} x {item.quantity}</span>
                                </div>
                                <div className={styles.itemControls}>
                                    <button className={styles.qtyBtn} onClick={() => updateQuantity(item.productId, -1)}>
                                        <Minus size={14} />
                                    </button>
                                    <span>{item.quantity}</span>
                                    <button className={styles.qtyBtn} onClick={() => updateQuantity(item.productId, 1)}>
                                        <Plus size={14} />
                                    </button>
                                    <button className={styles.removeBtn} onClick={() => removeFromCart(item.productId)}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className={styles.cartFooter}>
                    <div className={styles.inputGroup} style={{ marginBottom: '1rem' }}>

                        {/* Customer Selection */}
                        <div style={{ marginBottom: '0.75rem' }}>
                            <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                                Customer (Optional for Cash)
                            </label>
                            <div style={{ position: 'relative' }}>
                                <User size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                                <select
                                    className={styles.search}
                                    style={{ width: '100%', paddingLeft: '2.5rem', appearance: 'none' }}
                                    value={selectedCustomerId}
                                    onChange={e => setSelectedCustomerId(e.target.value)}
                                >
                                    <option value="">Add Customers  Credit</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.name} {c.debt > 0 ? `(Debt: $${c.debt.toFixed(2)})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Discount */}
                        <div style={{ marginBottom: '0.75rem' }}>
                            <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                                Discount
                            </label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <div style={{ position: 'relative', flex: 1 }}>
                                    <Percent size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                                    <input
                                        type="number"
                                        min="0"
                                        className={styles.search}
                                        style={{ width: '100%', paddingLeft: '2.5rem', boxSizing: 'border-box' }}
                                        placeholder="0"
                                        value={discountValue}
                                        onChange={e => setDiscountValue(e.target.value)}
                                    />
                                </div>
                                <select
                                    className={styles.search}
                                    style={{ width: 'auto', padding: '0.5rem' }}
                                    value={discountType}
                                    onChange={e => setDiscountType(e.target.value)}
                                >
                                    <option value="amount">$</option>
                                    <option value="percent">%</option>
                                </select>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                                Payment Method
                            </label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    className={`${styles.qtyBtn} ${styles.paymentBtn} ${paymentMethod === 'cash' ? styles.activePayment : ''}`}
                                    onClick={() => setPaymentMethod('cash')}
                                >
                                    Cash
                                </button>
                                <button
                                    className={`${styles.qtyBtn} ${styles.paymentBtn} ${paymentMethod === 'credit' ? styles.activePayment : ''}`}
                                    onClick={() => setPaymentMethod('credit')}
                                >
                                    Doller
                                </button>
                            </div>
                        </div>

                        <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                            Invoice # / Custom ID (Optional)
                        </label>
                        <input
                            className={styles.search}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                fontSize: '0.9rem'
                            }}
                            placeholder="Enter Transaction ID..."
                            value={customTxId}
                            onChange={e => setCustomTxId(e.target.value)}
                        />
                    </div>
                    <div className={styles.total} style={{ flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                            <span>Subtotal</span>
                            <span>{paymentMethod === 'cash' ? 'SLSH ' : '$'}{totalAmount.toFixed(2)}</span>
                        </div>
                        {discountAmount > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.9rem', color: '#10b981' }}>
                                <span>Discount</span>
                                <span>-{paymentMethod === 'cash' ? 'SLSH ' : '$'}{discountAmount.toFixed(2)}</span>
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '1.5rem', fontWeight: 'bold' }}>
                            <span>Total</span>
                            <span>{paymentMethod === 'cash' ? 'SLSH ' : '$'}{finalTotal.toFixed(2)}</span>
                        </div>
                    </div>
                    <button
                        className={styles.checkoutBtn}
                        onClick={handleCheckout}
                        disabled={cart.length === 0}
                    >
                        Checkout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default POS;
