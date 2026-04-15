import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

const EmployeeContext = createContext();

export const useEmployee = () => {
    return useContext(EmployeeContext);
};

export const EmployeeProvider = ({ children }) => {
    const { user } = useAuth();

    // Load EVERYTHING (Multi-tenant simulation)
    const [allEmployees, setAllEmployees] = useState(() => {
        const saved = localStorage.getItem('store_employees');
        return saved ? JSON.parse(saved) : [];
    });

    const [allPayroll, setAllPayroll] = useState(() => {
        const saved = localStorage.getItem('store_payroll');
        return saved ? JSON.parse(saved) : [];
    });

    // Current User Data
    const [employees, setEmployees] = useState([]);
    const [payroll, setPayroll] = useState([]);

    // Filter by User ID
    useEffect(() => {
        if (user) {
            setEmployees(allEmployees.filter(e => e.ownerId === user.id));
            setPayroll(allPayroll.filter(p => p.ownerId === user.id));
        } else {
            setEmployees([]);
            setPayroll([]);
        }
    }, [user, allEmployees, allPayroll]);

    // Persist to LocalStorage
    useEffect(() => {
        localStorage.setItem('store_employees', JSON.stringify(allEmployees));
    }, [allEmployees]);

    useEffect(() => {
        localStorage.setItem('store_payroll', JSON.stringify(allPayroll));
    }, [allPayroll]);

    // Actions
    const addEmployee = (empData) => {
        if (!user) return;
        const newEmployee = {
            ...empData,
            id: crypto.randomUUID(),
            ownerId: user.id,
            createdAt: new Date().toISOString()
        };
        setAllEmployees(prev => [...prev, newEmployee]);
        toast.success('Employee added successfully');
    };

    const updateEmployee = (id, updatedData) => {
        setAllEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updatedData } : e));
        toast.success('Employee updated successfully');
    };

    const deleteEmployee = (id) => {
        if (confirm('Are you sure? This will delete the employee record.')) {
            setAllEmployees(prev => prev.filter(e => e.id !== id));
            toast.success('Employee deleted');
        }
    };

    const addPayment = (paymentData) => {
        if (!user) return;
        const newPayment = {
            ...paymentData,
            id: crypto.randomUUID(),
            ownerId: user.id,
            date: new Date().toISOString()
        };
        setAllPayroll(prev => [newPayment, ...prev]); // Newest first
        toast.success(`Payment of $${paymentData.amount} recorded`);
    };

    const value = {
        employees,
        payroll,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        addPayment
    };

    return (
        <EmployeeContext.Provider value={value}>
            {children}
        </EmployeeContext.Provider>
    );
};
