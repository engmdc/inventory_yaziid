import React, { forwardRef } from 'react';
import { useStore } from '../contexts/StoreContext';
import '../components/POS/Receipt.css';

const CustomerStatement = forwardRef(({ customer }, ref) => {
    const { storeProfile, transactions } = useStore();

    if (!customer) return null;

    // Filter credit sales and payments for this specific customer
    const customerTx = transactions
        .filter(tx => tx.customerId === customer.id && (tx.type === 'payment' || tx.paymentMethod === 'credit'))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    let totalCredit = 0;
    let totalPaid = 0;

    const ledger = customerTx.map(tx => {
        let itemsStr = '-';
        let creditAmount = 0;
        let paidAmount = 0;

        if (tx.type === 'sale' && tx.paymentMethod === 'credit') {
            creditAmount = tx.total;
            totalCredit += creditAmount;
            itemsStr = tx.items.map(i => `${i.name} (x${i.quantity})`).join(', ');
        } else if (tx.type === 'payment') {
            paidAmount = tx.amount || tx.total;
            totalPaid += paidAmount;
            itemsStr = 'Debt Payment';
        }

        return {
            id: tx.id,
            date: tx.date,
            itemsStr,
            creditAmount,
            paidAmount,
        };
    });

    const remainingBalance = customer.debt || 0;

    // If the customer was created with an initial debt that isn't cleanly tracked as a transaction,
    // we logically bridge it into the Total Credit taken so the math adds up perfectly.
    totalCredit = remainingBalance + totalPaid;
    const receiptSize = storeProfile.receiptSize || 'A4';
    const paperClass = 'paper-a4'; // Usually statements are better on A4

    return (
        <div id="printable-receipt" ref={ref} className={`receiptContainer ${paperClass}`}>
            <div className="receiptHeader">
                <h2>{storeProfile.name || 'Store Name'}</h2>
                <p>{storeProfile.address || 'Address'}</p>
                <p>Tel: {storeProfile.phone || 'Phone'}</p>
                <h3 style={{ marginTop: '10px', textTransform: 'uppercase' }}>Customer Statement</h3>
            </div>

            <div className="receiptInfo">
                <div>
                    <span className="infoLabel">Customer Name:</span>
                    <span>{customer.name}</span>
                </div>
                {customer.phone && (
                    <div>
                        <span className="infoLabel">Phone:</span>
                        <span>{customer.phone}</span>
                    </div>
                )}
                <div>
                    <span className="infoLabel">Date Generated:</span>
                    <span>{new Date().toLocaleString()}</span>
                </div>
            </div>

            <table className="receiptTable">
                <thead>
                    <tr>
                        <th className="left">Date</th>
                        <th className="left">Transaction Details</th>
                        <th className="right">Credit (+${ })</th>
                        <th className="right">Payment (-${ })</th>
                    </tr>
                </thead>
                <tbody>
                    {ledger.length === 0 ? (
                        <tr>
                            <td colSpan="4" className="center" style={{ padding: '20px' }}>No credit or payment transactions found.</td>
                        </tr>
                    ) : (
                        ledger.map((tx, idx) => (
                            <tr key={idx}>
                                <td className="left" style={{ width: '25%' }}>
                                    {new Date(tx.date).toLocaleDateString()}
                                    <div className="itemSKU">{new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                </td>
                                <td className="left">
                                    <div className="itemName">{tx.itemsStr}</div>
                                    <div className="itemSKU">Ref: {tx.id.slice(0, 8)}</div>
                                </td>
                                <td className="right" style={{ color: '#ef4444' }}>
                                    {tx.creditAmount > 0 ? `$${tx.creditAmount.toFixed(2)}` : '-'}
                                </td>
                                <td className="right" style={{ color: '#10b981' }}>
                                    {tx.paidAmount > 0 ? `$${tx.paidAmount.toFixed(2)}` : '-'}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            <div className="receiptTotals">
                <div className="totalsRow text-muted">
                    <span>Total Credit Taken:</span>
                    <span>${totalCredit.toFixed(2)}</span>
                </div>
                <div className="totalsRow text-muted">
                    <span>Total Payments Made:</span>
                    <span>-${totalPaid.toFixed(2)}</span>
                </div>
                <div className="totalsRow grandTotal">
                    <span>Remaining Balance (Debt):</span>
                    <span style={{ color: '#ef4444' }}>${remainingBalance.toFixed(2)}</span>
                </div>
            </div>

            <div className="receiptFooter">
                <p>Please contact us if there are any discrepancies in this statement.</p>
            </div>
        </div>
    );
});

export default CustomerStatement;
