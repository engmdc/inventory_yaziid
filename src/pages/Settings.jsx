import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useStore } from '../contexts/StoreContext';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, Trash2, Shield, User, Printer, FileText } from 'lucide-react';
import styles from './Settings.module.css';

const Settings = () => {
    const { storeProfile, updateStoreProfile } = useStore();
    const { registeredUsers, registerUser, deleteUser, user: currentUser } = useAuth();
    const [formData, setFormData] = useState(storeProfile);

    useEffect(() => {
        setFormData(storeProfile);
    }, [storeProfile]);

    // User Form State
    const [newUser, setNewUser] = useState({ name: '', username: '', password: '', role: 'cashier' });

    const handleCreateUser = (e) => {
        e.preventDefault();
        if (!newUser.username || !newUser.password) return;

        const success = registerUser(newUser);
        if (success) {
            setNewUser({ name: '', username: '', password: '', role: 'cashier' });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        updateStoreProfile(formData);
        toast.success('Settings updated successfully');
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Store Settings</h1>

            <div className={styles.card}>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.group}>
                        <label className={styles.label}>Store Name</label>
                        <input
                            className={styles.input}
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className={styles.group}>
                        <label className={styles.label}>Address / Location</label>
                        <input
                            className={styles.input}
                            value={formData.address}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                            placeholder="e.g. Mogadishu, Somalia"
                        />
                    </div>

                    <div className={styles.group}>
                        <label className={styles.label}>Phone Number</label>
                        <input
                            className={styles.input}
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="e.g. +252 61 5..."
                        />
                    </div>

                    <button type="submit" className={styles.button}>
                        Save Changes
                    </button>
                </form>
            </div>

            <div className={styles.card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <Printer size={24} color="var(--color-primary)" />
                    <h2 className={styles.title} style={{ fontSize: '1.5rem', margin: 0 }}>Receipt Design</h2>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.group}>
                        <label className={styles.label}>Receipt Paper Size</label>
                        <select
                            className={styles.input}
                            value={formData.receiptSize || '80mm'}
                            onChange={e => setFormData({ ...formData, receiptSize: e.target.value })}
                        >
                            <option value="58mm">58mm (Small Thermal)</option>
                            <option value="80mm">80mm (Standard Thermal)</option>
                            <option value="A4">A4 (Standard Printer)</option>
                        </select>
                    </div>

                    <div className={styles.group}>
                        <label className={styles.label}>Registration / Tax Numbers</label>
                        <textarea
                            className={styles.input}
                            style={{ minHeight: '60px', resize: 'vertical' }}
                            value={formData.taxNumber || ''}
                            onChange={e => setFormData({ ...formData, taxNumber: e.target.value })}
                            placeholder="e.g. VAT: 12345678&#10;TIN: 87654321"
                        />
                    </div>

                    <div className={styles.group}>
                        <label className={styles.label}>Footer Message</label>
                        <textarea
                            className={styles.input}
                            style={{ minHeight: '80px', resize: 'vertical' }}
                            value={formData.receiptFooter || 'Thank you for your business!'}
                            onChange={e => setFormData({ ...formData, receiptFooter: e.target.value })}
                            placeholder="e.g. Thank you for shopping with us! No returns after 3 days."
                        />
                    </div>

                    <div className={styles.group}>
                        <label className={styles.label}>Show Cashier Name</label>
                        <select
                            className={styles.input}
                            value={formData.showCashier || 'yes'}
                            onChange={e => setFormData({ ...formData, showCashier: e.target.value })}
                        >
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                        </select>
                    </div>

                    <button type="submit" className={styles.button}>
                        Save Design Settings
                    </button>
                </form>
            </div>

            <div className={styles.card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <Shield size={24} color="var(--color-primary)" />
                    <h2 className={styles.title} style={{ fontSize: '1.5rem', margin: 0 }}>User Management</h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    {/* Add User Form */}
                    <form onSubmit={handleCreateUser} className={styles.form}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--color-text-secondary)' }}>Add New User</h3>
                        <div className={styles.group}>
                            <label className={styles.label}>Full Name</label>
                            <input
                                className={styles.input}
                                value={newUser.name}
                                onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                placeholder="e.g. Ahmed Ali"
                            />
                        </div>
                        <div className={styles.group}>
                            <label className={styles.label}>Username</label>
                            <input
                                className={styles.input}
                                value={newUser.username}
                                onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                                required
                                autoComplete="off"
                            />
                        </div>
                        <div className={styles.group}>
                            <label className={styles.label}>Password</label>
                            <input
                                type="password"
                                className={styles.input}
                                value={newUser.password}
                                onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                required
                                autoComplete="new-password"
                            />
                        </div>
                        <div className={styles.group}>
                            <label className={styles.label}>Role</label>
                            <select
                                className={styles.input}
                                value={newUser.role}
                                onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                            >
                                <option value="cashier">Cashier</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <button type="submit" className={styles.button}>
                            <UserPlus size={18} style={{ marginRight: '0.5rem' }} />
                            Create User
                        </button>
                    </form>

                    {/* User List */}
                    <div>
                        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: 'var(--color-text-secondary)' }}>Existing Users</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {registeredUsers.map(u => (
                                <div key={u.id} style={{
                                    padding: '1rem',
                                    backgroundColor: 'var(--color-bg-main)',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--color-border)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{
                                            width: '32px', height: '32px',
                                            borderRadius: '50%', backgroundColor: 'var(--color-bg-paper)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            border: '1px solid var(--color-border)'
                                        }}>
                                            <User size={16} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{u.username}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{u.role}</div>
                                        </div>
                                    </div>

                                    {/* Prevent deleting yourself or if only 1 user */}
                                    {u.id !== currentUser?.id && registeredUsers.length > 1 && (
                                        <button
                                            onClick={() => deleteUser(u.id)}
                                            style={{
                                                background: 'none', border: 'none',
                                                color: 'var(--color-danger)', cursor: 'pointer',
                                                padding: '0.5rem'
                                            }}
                                            title="Delete User"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
