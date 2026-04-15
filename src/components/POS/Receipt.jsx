import React, { forwardRef } from 'react';
import { useStore } from '../../contexts/StoreContext';
import { useAuth } from '../../contexts/AuthContext';
import './Receipt.css';

const Receipt = forwardRef(({ transaction }, ref) => {
    const { storeProfile, customers } = useStore();
    const { user } = useAuth();
    if (!transaction) return null;

    const customer = transaction.customerId ? customers.find(c => c.id === transaction.customerId) : null;

    // Calculate total credit and total payments for the formula display
    const { transactions } = useStore();
    let totalCredit = 0;
    let totalPaid = 0;

    if (transaction.customerId && transactions) {
        const customerTx = transactions.filter(tx => tx.customerId === transaction.customerId);
        customerTx.forEach(tx => {
            if (tx.type === 'sale' && tx.paymentMethod === 'credit') {
                totalCredit += tx.total;
            } else if (tx.type === 'payment') {
                totalPaid += (tx.amount || tx.total);
            }
        });
    }

    const calculatedRemaining = customer ? (customer.debt || 0) : Math.max(0, totalCredit - totalPaid);

    // Logically bridge any untracked initial debt onto the total credit display
    if (customer && customer.debt) {
        totalCredit = calculatedRemaining + totalPaid;
    }

    const receiptSize = storeProfile.receiptSize || '80mm';
    const paperClass = receiptSize === '58mm' ? 'paper-58mm' : receiptSize === 'A4' ? 'paper-a4' : 'paper-80mm';

    return (
        <div id="printable-receipt" ref={ref} className={`receiptContainer ${paperClass}`}>
            <div className="receiptHeader">
                <h2>{storeProfile.name || 'Store Name'}</h2>
                <p>{storeProfile.address || 'Address'}</p>
                <p>Tel: {storeProfile.phone || 'Phone'}</p>
                {storeProfile.taxNumber && (
                    <p style={{ whiteSpace: 'pre-wrap' }}>{storeProfile.taxNumber}</p>
                )}
            </div>

            <div className="receiptInfo">
                <div>
                    <span className="infoLabel">Date:</span>
                    <span>{new Date(transaction.date).toLocaleString()}</span>
                </div>
                <div>
                    <span className="infoLabel">Receipt No:</span>
                    <span>{transaction.id.slice(0, 8)}</span>
                </div>
                {storeProfile.showCashier !== 'no' && user && (
                    <div>
                        <span className="infoLabel">Cashier:</span>
                        <span>{user.name || user.username}</span>
                    </div>
                )}
                {transaction.customerName && (
                    <div>
                        <span className="infoLabel">Customer:</span>
                        <span>{transaction.customerName}</span>
                    </div>
                )}
            </div>

            {transaction.type !== 'payment' && transaction.items && transaction.items.length > 0 && (
                <table className="receiptTable">
                    <thead>
                        <tr>
                            <th className="left">Item</th>
                            <th className="center">Qty</th>
                            <th className="right">Price</th>
                            <th className="right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transaction.items.map((item, idx) => (
                            <tr key={idx}>
                                <td className="left">
                                    <div className="itemName">{item.name}</div>
                                    {item.productId && item.productId.length < 20 && (
                                        <div className="itemSKU">ID: {item.productId}</div>
                                    )}
                                </td>
                                <td className="center">{item.quantity}</td>
                                <td className="right">${item.price.toFixed(2)}</td>
                                <td className="right">${(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <div className="receiptTotals">
                {transaction.type === 'payment' ? (
                    <div className="totalsRow grandTotal">
                        <span>Payment Amount:</span>
                        <span>${transaction.amount ? transaction.amount.toFixed(2) : transaction.total.toFixed(2)}</span>
                    </div>
                ) : (
                    <>
                        {transaction.discount > 0 && (
                            <div className="totalsRow text-muted">
                                <span>Subtotal:</span>
                                <span>${(transaction.total + transaction.discount).toFixed(2)}</span>
                            </div>
                        )}
                        {transaction.discount > 0 && (
                            <div className="totalsRow text-muted">
                                <span>Discount:</span>
                                <span>-${transaction.discount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="totalsRow grandTotal">
                            <span>Total:</span>
                            <span>${transaction.total.toFixed(2)}</span>
                        </div>
                    </>
                )}

                {transaction.type !== 'payment' && (
                    <div className="totalsRow paymentMethod">
                        <span>Amount Paid:</span>
                        <span>${transaction.paymentMethod === 'credit' ? '0.00' : transaction.total.toFixed(2)}</span>
                    </div>
                )}

                <div className="totalsRow paymentMethod">
                    <span>Paid via:</span>
                    <span style={{ textTransform: 'capitalize' }}>{transaction.paymentMethod || 'cash'}</span>
                </div>

                {transaction.customerId && (
                    <div style={{ marginTop: '1rem', paddingTop: '0.5rem', borderTop: '2px dashed #cbd5e1' }}>
                        <div className="totalsRow text-muted" style={{ fontSize: '0.9em' }}>
                            <span>Total Credit:</span>
                            <span>${totalCredit.toFixed(2)}</span>
                        </div>
                        <div className="totalsRow text-muted" style={{ fontSize: '0.9em' }}>
                            <span>Total Payments:</span>
                            <span>-${totalPaid.toFixed(2)}</span>
                        </div>
                        <div className="totalsRow debtInfo" style={{ marginTop: '0.25rem', paddingTop: '0.25rem', borderTop: '1px solid #e2e8f0' }}>
                            <span>Remaining Balance (Debt):</span>
                            <span style={{ fontWeight: 'bold' }}>${calculatedRemaining.toFixed(2)}</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="receiptFooter">
                <p>{storeProfile.receiptFooter || 'Thank you for your business!'}</p>
                <div className="barcode-placeholder"></div>
            </div>
        </div>
    );
});

export default Receipt;
