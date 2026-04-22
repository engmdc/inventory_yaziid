import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const StoreContext = createContext();

export const useStore = () => {
    return useContext(StoreContext);
};

export const StoreProvider = ({ children }) => {
    const { user } = useAuth();

    const [products, setProducts] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [storeProfile, setStoreProfile] = useState({
        name: 'MyStore',
        address: 'Mogadishu, Somalia',
        phone: '+252 61 5000000'
    });

    // Initial DB Load
    useEffect(() => {
        const loadDB = async () => {
            try {
                const [prodRes, txRes, custRes, profRes] = await Promise.all([
                    fetch('http://localhost:5001/api/products'),
                    fetch('http://localhost:5001/api/transactions'),
                    fetch('http://localhost:5001/api/customers'),
                    fetch('http://localhost:5001/api/store_profiles')
                ]);

                if (prodRes.ok) setProducts(await prodRes.json());
                if (txRes.ok) setTransactions(await txRes.json());
                if (custRes.ok) setCustomers(await custRes.json());
                if (profRes.ok) {
                    const profile = await profRes.json();
                    if (profile) setStoreProfile(profile);
                }
            } catch (err) {
                console.error("Database sync failed, ensure backend is running.");
            }
        };
        loadDB();
    }, []);

    const apiPush = (endpoint, method, data) => {
        const headers = { 'Content-Type': 'application/json' };
        if (user) headers['X-Owner-Id'] = user.id;

        fetch(`http://localhost:5001/api/${endpoint}`, {
            method,
            headers,
            body: data ? JSON.stringify(data) : null
        }).catch(console.error);
    };

    // Actions
    const addProduct = (product) => {
        if (!user) return;
        const newProduct = {
            ...product,
            id: product.customId || crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            ownerId: user.id
        };
        setProducts(prev => [...prev, newProduct]);
        apiPush('products', 'POST', newProduct);
    };

    const updateProduct = (id, updatedData) => {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedData } : p));
        // We use POST which acts as UPSERT due to SQL constraints generated
        const target = products.find(p => p.id === id);
        if (target) apiPush('products', 'POST', { ...target, ...updatedData });
    };

    const deleteProduct = (id) => {
        setProducts(prev => prev.filter(p => p.id !== id));
        apiPush(`products/${id}`, 'DELETE');
    };

    const addTransaction = (transaction) => {
        if (!user) return;
        const newTransaction = {
            ...transaction,
            id: transaction.customId || crypto.randomUUID(),
            date: new Date().toISOString(),
            ownerId: user.id
        };

        setTransactions(prev => [newTransaction, ...prev]);
        apiPush('transactions', 'POST', newTransaction);

        // Update stock
        if (transaction.type === 'sale' || transaction.type === 'credit') {
            const stockUpdates = [];
            transaction.items.forEach(item => {
                setProducts(prev => prev.map(p => {
                    if (p.id === item.productId) {
                        const newStock = p.stock - item.quantity;
                        stockUpdates.push({ id: p.id, newStock: newStock });
                        return { ...p, stock: newStock };
                    }
                    return p;
                }));
            });
            if (stockUpdates.length > 0) {
                apiPush('products/bulk-stock', 'PATCH', { updates: stockUpdates });
            }
        }

        // Handle Credit
        if (transaction.paymentMethod === 'credit' && transaction.customerId) {
            setCustomers(prev => prev.map(c => {
                if (c.id === transaction.customerId) {
                    const newDebt = (c.debt || 0) + transaction.total;
                    apiPush(`customers/${c.id}/debt`, 'PATCH', { debt: newDebt, addPurchase: true });
                    return { ...c, debt: newDebt, totalPurchases: (c.totalPurchases || 0) + 1 };
                }
                return c;
            }));
        }
    };

    const deleteTransaction = (id) => {
        const transaction = transactions.find(t => t.id === id);
        if (!transaction) return;

        setTransactions(prev => prev.filter(t => t.id !== id));
        apiPush(`transactions/${id}`, 'DELETE');



        // Revert Debt
        if (transaction.paymentMethod === 'credit' && transaction.customerId) {
            setCustomers(prev => prev.map(c => {
                if (c.id === transaction.customerId) {
                    const newDebt = Math.max(0, (c.debt || 0) - transaction.total);
                    apiPush(`customers/${c.id}/debt`, 'PATCH', { debt: newDebt });
                    return { ...c, debt: newDebt };
                }
                return c;
            }));
        }

        // Revert Debt Payment
        if (transaction.type === 'payment' && transaction.customerId) {
            setCustomers(prev => prev.map(c => {
                if (c.id === transaction.customerId) {
                    const newDebt = (c.debt || 0) + transaction.amount;
                    apiPush(`customers/${c.id}/debt`, 'PATCH', { debt: newDebt });
                    return { ...c, debt: newDebt };
                }
                return c;
            }));
        }
    };

    const addCustomer = (customer) => {
        if (!user) return;
        const newCustomer = {
            ...customer,
            id: crypto.randomUUID(),
            debt: parseFloat(customer.debt) || 0,
            totalPurchases: 0,
            createdAt: new Date().toISOString(),
            ownerId: user.id
        };
        setCustomers(prev => [...prev, newCustomer]);
        apiPush('customers', 'POST', newCustomer);
    };

    const updateCustomer = (id, updatedData) => {
        setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updatedData } : c));
        const target = customers.find(c => c.id === id);
        if (target) apiPush('customers', 'POST', { ...target, ...updatedData });
    };

    const deleteCustomer = (id) => {
        setCustomers(prev => prev.filter(c => c.id !== id));
        apiPush(`customers/${id}`, 'DELETE');
    };

    const payCustomerDebt = (customerId, amount) => {
        if (!user) return;
        const customerInfo = customers.find(c => c.id === customerId);

        const paymentTransaction = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            type: 'payment',
            amount: amount,
            total: amount,
            customerId: customerId,
            customerName: customerInfo ? customerInfo.name : null,
            ownerId: user.id,
            items: []
        };

        setTransactions(prev => [paymentTransaction, ...prev]);
        apiPush('transactions', 'POST', paymentTransaction);

        setCustomers(prev => prev.map(c => {
            if (c.id === customerId) {
                const newDebt = Math.max(0, (c.debt || 0) - amount);
                apiPush(`customers/${c.id}/debt`, 'PATCH', { debt: newDebt });
                return { ...c, debt: newDebt };
            }
            return c;
        }));
    };

    const updateStoreProfile = (data) => {
        const newProfileData = { ...storeProfile, ...data };
        setStoreProfile(newProfileData);
        apiPush('store_profiles', 'POST', newProfileData);
    };

    const value = {
        products, transactions, addProduct, updateProduct, deleteProduct,
        addTransaction, deleteTransaction, customers, addCustomer,
        updateCustomer, deleteCustomer, payCustomerDebt,
        storeProfile, updateStoreProfile
    };

    return (
        <StoreContext.Provider value={value}>
            {children}
        </StoreContext.Provider>
    );
};
