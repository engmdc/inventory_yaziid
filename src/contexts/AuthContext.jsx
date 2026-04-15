import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [registeredUsers, setRegisteredUsers] = useState([]);

    useEffect(() => {
        // Load registered users from MySQL DB
        const loadUsers = async () => {
            try {
                const res = await fetch('http://localhost:5001/api/users');
                if (res.ok) {
                    const data = await res.json();
                    if (data.length > 0) {
                        setRegisteredUsers(data);
                    } else {
                        // Create default admin if DB empty
                        const defaultAdmin = {
                            id: 'admin',
                            username: 'admin',
                            password: 'admin',
                            role: 'admin',
                            name: 'Administrator'
                        };
                        setRegisteredUsers([defaultAdmin]);
                        await fetch('http://localhost:5001/api/users', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(defaultAdmin)
                        });
                    }
                }
            } catch (err) {
                console.error("Failed to fetch users, fallback off.", err);
            }
        };
        loadUsers();

        // Check existing session strictly in sessionStorage
        const savedSession = sessionStorage.getItem('store_user');
        if (savedSession) {
            setUser(JSON.parse(savedSession));
        }
        setLoading(false);
    }, []);

    // System Sleep Detector
    useEffect(() => {
        if (!user) return;

        let lastTime = Date.now();
        const sleepThreshold = 60000; // 1 minute of suspended execution implies sleep

        const interval = setInterval(() => {
            const currentTime = Date.now();
            if (currentTime - lastTime > sleepThreshold) {
                // Device woke up from sleep
                setUser(null);
                sessionStorage.removeItem('store_user');
                toast.error('Session expired due to system sleep. Please login again.');
            }
            lastTime = currentTime;
        }, 5000);

        return () => clearInterval(interval);
    }, [user]);

    const login = (username, password) => {
        const foundUser = registeredUsers.find(
            u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
        );

        if (foundUser) {
            const sessionUser = {
                id: foundUser.id,
                username: foundUser.username,
                role: foundUser.role,
                name: foundUser.name
            };
            setUser(sessionUser);
            sessionStorage.setItem('store_user', JSON.stringify(sessionUser));
            toast.success(`Welcome back, ${foundUser.name || foundUser.username}`);
            return true;
        }

        return false;
    };

    const logout = () => {
        setUser(null);
        sessionStorage.removeItem('store_user');
        toast.info('Logged out successfully');
    };

    const registerUser = async (newUser) => {
        if (registeredUsers.some(u => u.username.toLowerCase() === newUser.username.toLowerCase())) {
            toast.error('Username already exists');
            return false;
        }

        const userWithId = { ...newUser, id: crypto.randomUUID() };

        // Optimistic UI Update
        setRegisteredUsers(prev => [...prev, userWithId]);

        // DB Upload
        try {
            await fetch('http://localhost:5001/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userWithId)
            });
            toast.success('User created successfully');
            return true;
        } catch (err) {
            console.error(err);
            toast.error('Network Error: Database sync failed');
            return false;
        }
    };

    const deleteUser = async (userId) => {
        if (registeredUsers.length <= 1) {
            toast.error('Cannot delete the last user');
            return;
        }

        // Optimistic UI Update
        setRegisteredUsers(prev => prev.filter(u => u.id !== userId));

        // DB Deletion
        try {
            await fetch(`http://localhost:5001/api/users/${userId}`, { method: 'DELETE' });
            toast.success('User deleted');
        } catch (err) {
            console.error(err);
        }
    };

    const value = {
        user,
        login,
        logout,
        loading,
        registeredUsers,
        registerUser,
        deleteUser
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
