import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Receipt, Store, LogOut, Settings as SettingsIcon, Users, Menu, X, BarChart3 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useStore } from '../../contexts/StoreContext';
import styles from './Sidebar.module.css';

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { logout, user } = useAuth();
    const { storeProfile } = useStore();

    let navItems = [
        { path: '/', label: 'Overview', icon: LayoutDashboard },
        { path: '/pos', label: 'Point of Sale', icon: ShoppingCart },
        { path: '/inventory', label: 'Inventory', icon: Package },
        { path: '/transactions', label: 'Transactions', icon: Receipt },
        { path: '/customers', label: 'Customers', icon: Users },
    ];

    if (user?.role === 'admin') {
        navItems = [
            ...navItems,
            { path: '/employees', label: 'Employees', icon: Users },
            { path: '/reports', label: 'Reports', icon: BarChart3 },
            { path: '/settings', label: 'Settings', icon: SettingsIcon },
        ];
    }

    const toggleSidebar = () => setIsOpen(!isOpen);
    const closeSidebar = () => setIsOpen(false);

    return (
        <>
            {/* Mobile Hamburger Button */}
            <button
                className={styles.hamburger}
                onClick={toggleSidebar}
                aria-label="Toggle menu"
            >
                <Menu size={24} />
            </button>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className={styles.overlay}
                    onClick={closeSidebar}
                />
            )}

            {/* Sidebar */}
            <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
                {/* Close button for mobile */}
                <button
                    className={styles.closeBtn}
                    onClick={closeSidebar}
                    aria-label="Close menu"
                >
                    <X size={24} />
                </button>

                <div className={styles.logo}>
                    <Store size={24} />
                    <span>{storeProfile?.name || 'MyStore'}</span>
                </div>
                <nav className={styles.nav}>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `${styles.link} ${isActive ? styles.active : ''}`
                            }
                            onClick={closeSidebar}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                    <button
                        onClick={() => { closeSidebar(); logout(); }}
                        className={styles.link}
                        style={{ marginTop: 'auto', background: 'none', border: 'none', width: '100%', cursor: 'pointer', color: 'var(--color-danger)' }}
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;
