import React, { useState } from 'react';
import { useEmployee } from '../contexts/EmployeeContext';
import { User, DollarSign, Calendar, Plus, Trash2, Briefcase, Phone, CreditCard, Edit2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import styles from './Employees.module.css';

const Employees = () => {
    const { employees, payroll, addEmployee, deleteEmployee, addPayment, updateEmployee } = useEmployee();
    const [activeTab, setActiveTab] = useState('list'); // list | payroll
    const [showModal, setShowModal] = useState(false);
    const [showPayModal, setShowPayModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    // Forms
    const [newEmp, setNewEmp] = useState({ name: '', role: '', phone: '', salary: '', shiftStart: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [payment, setPayment] = useState({ amount: '', type: 'Salary' });

    const handleSaveEmployee = (e) => {
        e.preventDefault();
        if (isEditing) {
            updateEmployee(editingId, newEmp);
        } else {
            addEmployee(newEmp);
        }
        setNewEmp({ name: '', role: '', phone: '', salary: '', shiftStart: '' });
        setIsEditing(false);
        setEditingId(null);
        setShowModal(false);
    };

    const openEditModal = (emp) => {
        setNewEmp({ name: emp.name, role: emp.role, phone: emp.phone, salary: emp.salary, shiftStart: emp.shiftStart || '' });
        setIsEditing(true);
        setEditingId(emp.id);
        setShowModal(true);
    };

    const openAddModal = () => {
        setNewEmp({ name: '', role: '', phone: '', salary: '', shiftStart: '' });
        setIsEditing(false);
        setEditingId(null);
        setShowModal(true);
    };

    const handlePaySubmit = (e) => {
        e.preventDefault();
        if (!selectedEmployee) return;
        addPayment({
            employeeId: selectedEmployee.id,
            employeeName: selectedEmployee.name,
            amount: Number(payment.amount),
            type: payment.type
        });
        setPayment({ amount: '', type: 'Salary' });
        setShowPayModal(false);
    };

    const openPayModal = (emp) => {
        setSelectedEmployee(emp);
        setPayment({ ...payment, amount: emp.salary }); // Default to base salary
        setShowPayModal(true);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Employee Management</h1>
                <div className={styles.controls}>
                    <button
                        className={`${styles.tabButton} ${activeTab === 'list' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('list')}
                    >
                        <User size={18} /> Staff List
                    </button>
                    <button
                        className={`${styles.tabButton} ${activeTab === 'payroll' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('payroll')}
                    >
                        <CreditCard size={18} /> Payroll History
                    </button>
                    {activeTab === 'list' && (
                        <button className={styles.addButton} onClick={openAddModal}>
                            <Plus size={20} /> Add Staff
                        </button>
                    )}
                </div>
            </div>

            {/* Employee List (Grid View) */}
            {activeTab === 'list' && (
                <div className={styles.cardGrid}>
                    {employees.length === 0 ? (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>
                            <User size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <p>No employees found. Click "Add Staff" to start.</p>
                        </div>
                    ) : (
                        employees.map((emp, index) => (
                            <div key={emp.id} className={styles.employeeCard}>
                                <div className={styles.cardHeader}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{
                                            background: '#f1f5f9',
                                            color: '#64748b',
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.75rem',
                                            fontWeight: 'bold'
                                        }}>
                                            #{index + 1}
                                        </div>
                                        <div className={styles.avatar}>
                                            {emp.name.charAt(0).toUpperCase()}
                                        </div>
                                    </div>
                                    <span className={styles.roleBadge}>{emp.role}</span>
                                </div>

                                <div>
                                    <h3 className={styles.empName}>{emp.name}</h3>
                                    <div className={styles.empDetails}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Phone size={14} /> {emp.phone || 'No phone'}
                                        </div>
                                        {emp.shiftStart && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)' }}>
                                                <Clock size={14} /> Shift: {new Date('1970-01-01T' + emp.shiftStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <DollarSign size={14} /> <span className={styles.salary}>${emp.salary}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.actions}>
                                    <button
                                        className={styles.iconButton}
                                        onClick={() => openEditModal(emp)}
                                        title="Edit Details"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        className={`${styles.iconButton} ${styles.payBtn}`}
                                        onClick={() => openPayModal(emp)}
                                        title="Pay Salary"
                                    >
                                        <DollarSign size={18} style={{ marginRight: '0.25rem' }} /> Pay
                                    </button>
                                    <button
                                        className={`${styles.iconButton} ${styles.deleteBtn}`}
                                        onClick={() => deleteEmployee(emp.id)}
                                        title="Delete Record"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Payroll History */}
            {activeTab === 'payroll' && (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Employee</th>
                                <th>Type</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payroll.length === 0 ? (
                                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No payment history.</td></tr>
                            ) : (
                                payroll.map(p => (
                                    <tr key={p.id}>
                                        <td>{new Date(p.date).toLocaleDateString()} {new Date(p.date).toLocaleTimeString()}</td>
                                        <td>{p.employeeName}</td>
                                        <td>{p.type}</td>
                                        <td style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>${p.amount}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add Employee Modal */}
            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2>{isEditing ? 'Edit Employee' : 'Add New Employee'}</h2>
                        <form onSubmit={handleSaveEmployee}>
                            <div className={styles.formGroup}>
                                <label>Full Name</label>
                                <input value={newEmp.name} onChange={e => setNewEmp({ ...newEmp, name: e.target.value })} required placeholder="e.g. Faarax Cali" />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Role / Job Title</label>
                                <input value={newEmp.role} onChange={e => setNewEmp({ ...newEmp, role: e.target.value })} required placeholder="e.g. Salesman" />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Phone</label>
                                <input value={newEmp.phone} onChange={e => setNewEmp({ ...newEmp, phone: e.target.value })} placeholder="e.g. 061xxxxxxx" />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Shift Start Time</label>
                                <input type="time" value={newEmp.shiftStart} onChange={e => setNewEmp({ ...newEmp, shiftStart: e.target.value })} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Salary Amount ($)</label>
                                <input type="number" value={newEmp.salary} onChange={e => setNewEmp({ ...newEmp, salary: e.target.value })} required placeholder="0.00" />
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" onClick={() => setShowModal(false)} className={styles.cancelButton}>Cancel</button>
                                <button type="submit" className={styles.saveButton}>
                                    {isEditing ? 'Update Employee' : 'Save Employee'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Pay Salary Modal */}
            {showPayModal && selectedEmployee && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2>Pay {selectedEmployee.name}</h2>
                        <form onSubmit={handlePaySubmit}>
                            <div className={styles.formGroup}>
                                <label>Payment Type</label>
                                <select value={payment.type} onChange={e => setPayment({ ...payment, type: e.target.value })}>
                                    <option value="Salary">Monthly Salary</option>
                                    <option value="Bonus">Bonus</option>
                                    <option value="Advance">Advance (Hordhac)</option>
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Amount ($)</label>
                                <input type="number" value={payment.amount} onChange={e => setPayment({ ...payment, amount: e.target.value })} required />
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" onClick={() => setShowPayModal(false)} className={styles.cancelButton}>Cancel</button>
                                <button type="submit" className={styles.saveButton} style={{ backgroundColor: 'var(--color-success)' }}>Confirm Payment</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Employees;
