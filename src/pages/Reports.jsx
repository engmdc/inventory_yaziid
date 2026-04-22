import React, { useState, useMemo } from 'react';
import { Download, Filter, BarChart3, TrendingUp, PieChart, Activity } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { startOfDay, subDays, startOfMonth, format, isAfter, isBefore } from 'date-fns';
import { toast } from 'sonner';
import styles from './Reports.module.css';

const Reports = () => {
    const { transactions, products, customers } = useStore();

    // Form state
    const [reportType, setReportType] = useState('sales');
    const [dateRange, setDateRange] = useState('7days');
    const [groupBy, setGroupBy] = useState('day');

    // Result state
    const [reportData, setReportData] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // Mock/Generate Data based on selections
    const generateReport = () => {
        setIsGenerating(true);

        // Simulate network delay for effect
        setTimeout(() => {
            const endDate = new Date();
            let startDate = new Date();

            if (dateRange === 'today') startDate = startOfDay(new Date());
            if (dateRange === '7days') startDate = subDays(new Date(), 7);
            if (dateRange === '30days') startDate = subDays(new Date(), 30);
            if (dateRange === 'month') startDate = startOfMonth(new Date());

            // Filter transactions within date
            const relevantTx = (transactions || []).filter(tx => {
                const txDate = new Date(tx.date);
                return isAfter(txDate, startDate) && isBefore(txDate, endDate);
            });

            // Grouping logic (simplified for demonstration)
            let grouped = {};

            if (reportType === 'sales') {
                relevantTx.forEach(tx => {
                    const dateKey = format(new Date(tx.date), groupBy === 'day' ? 'MMM dd' : groupBy === 'week' ? 'ww' : 'MMM yyyy');
                    if (!grouped[dateKey]) grouped[dateKey] = { label: dateKey, value: 0, count: 0 };
                    grouped[dateKey].value += tx.total;
                    grouped[dateKey].count += 1;
                });
            } else if (reportType === 'products') {
                relevantTx.forEach(tx => {
                    tx.items.forEach(item => {
                        const key = item.name;
                        if (!grouped[key]) grouped[key] = { label: key, value: 0, count: 0 };
                        grouped[key].value += item.price * item.quantity;
                        grouped[key].count += item.quantity;
                    });
                });
            } else if (reportType === 'customer_debt') {
                (customers || []).forEach(customer => {
                    if (customer.debt > 0) {
                        grouped[customer.id] = { label: customer.name || 'Unknown Customer', value: Number(customer.debt) || 0, count: Number(customer.totalPurchases) || 0 };
                    }
                });
            } else if (reportType === 'inventory') {
                (products || []).forEach(product => {
                    const remainingStock = Number(product.stock) || 0;

                    grouped[product.id] = {
                        label: product.name || 'Unknown Product',
                        value: remainingStock,     // for chart
                        count: remainingStock,     // Stock Quantity
                        status: remainingStock > 0 ? 'Stable' : 'Unstable'
                    };
                });
            }

            const chartData = Object.values(grouped);

            // Sort by label contextually or by value
            if (reportType === 'products' || reportType === 'customer_debt' || reportType === 'inventory') {
                chartData.sort((a, b) => b.value - a.value);
            }

            // Cap to top 10 for products if needed
            const finalData = reportType === 'products' ? chartData.slice(0, 10) : chartData;

            const totalValue = finalData.reduce((acc, curr) => acc + curr.value, 0);

            setReportData({
                type: reportType,
                range: dateRange,
                total: totalValue,
                items: finalData,
                generatedAt: new Date()
            });

            setIsGenerating(false);
            toast.success('Report generated successfully');
        }, 600);
    };

    const handleExport = () => {
        if (!reportData || !reportData.items.length) {
            toast.error('No data to export');
            return;
        }

        toast.info('Export started. Downloading CSV...');

        // Define headers based on report type
        let csvContent = '';
        if (reportType === 'products') {
            csvContent = 'Product Name,Units Sold,Total Revenue ($)\n';
        } else if (reportType === 'customer_debt') {
            csvContent = 'Customer Name,Total Purchases,Outstanding Debt ($)\n';
        } else if (reportType === 'inventory') {
            csvContent = 'Stock,Quantity,Status\n';
        } else {
            csvContent = 'Date,Transactions,Total Amount ($)\n';
        }

        // Append data rows
        reportData.items.forEach(item => {
            // Escape labels that might contain commas
            const labelStr = item.label ? String(item.label) : 'Unknown';
            const safeLabel = `"${labelStr.replace(/"/g, '""')}"`;

            if (reportType === 'inventory') {
                csvContent += `${safeLabel},${item.count},${item.status}\n`;
            } else {
                const formattedValue = Number(item.value).toFixed(2);
                csvContent += `${safeLabel},${item.count},${formattedValue}\n`;
            }
        });

        // Create Blob and URL
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        // Create temporary download link element
        const link = document.createElement('a');
        const filename = `${reportType}_report_${format(new Date(), 'yyyy-MM-dd')}.csv`;
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.display = 'none';
        document.body.appendChild(link);

        // Trigger download and cleanup
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success(`Report exported as ${filename}`);
    };

    // Calculate max value for chart scaling
    const maxValue = useMemo(() => {
        if (!reportData || !reportData.items.length) return 0;
        return Math.max(...reportData.items.map(i => i.value));
    }, [reportData]);

    const getReportTitle = () => {
        const types = { sales: 'Sales Overview', products: 'Top Selling Products', inventory: 'Inventory Valuation', customer_debt: 'Customer Debt Tracking' };
        return types[reportType] || 'Custom Report';
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Reports</h1>
                <button
                    className={styles.exportBtn}
                    onClick={handleExport}
                    disabled={!reportData}
                >
                    <Download size={18} />
                    Export CSV
                </button>
            </div>

            <div className={styles.content}>
                {/* Configuration Panel */}
                <div className={styles.controlsPanel}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--color-text-main)', fontWeight: '600' }}>
                        <Filter size={20} />
                        <h2>Report Builder</h2>
                    </div>

                    <div className={styles.controlGroup}>
                        <label className={styles.controlLabel}>Report Type</label>
                        <select
                            className={styles.select}
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                        >
                            <option value="sales">Sales Overview</option>
                            <option value="products">Top Products</option>
                            <option value="inventory">Inventory Status</option>
                            <option value="customer_debt">Customer Debt Tracking</option>
                        </select>
                    </div>

                    <div className={styles.controlGroup}>
                        <label className={styles.controlLabel}>Date Range</label>
                        <select
                            className={styles.select}
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            disabled={reportType === 'inventory' || reportType === 'customer_debt'}
                        >
                            <option value="today">Today</option>
                            <option value="7days">Last 7 Days</option>
                            <option value="30days">Last 30 Days</option>
                            <option value="month">This Month</option>
                        </select>
                    </div>

                    <div className={styles.controlGroup}>
                        <label className={styles.controlLabel}>Group By</label>
                        <select
                            className={styles.select}
                            value={groupBy}
                            onChange={(e) => setGroupBy(e.target.value)}
                            disabled={reportType !== 'sales'}
                        >
                            <option value="day">Day</option>
                            <option value="week">Week</option>
                            <option value="month">Month</option>
                        </select>
                    </div>

                    <button
                        className={styles.generateBtn}
                        onClick={generateReport}
                        disabled={isGenerating}
                    >
                        {isGenerating ? (
                            <Activity size={20} className="animate-spin" />
                        ) : (
                            <BarChart3 size={20} />
                        )}
                        {isGenerating ? 'Generating...' : 'Generate Report'}
                    </button>
                </div>

                {/* Report View Area */}
                <div className={styles.reportArea}>
                    {!reportData ? (
                        <div className={styles.emptyState}>
                            <PieChart size={64} className={styles.emptyStateIcon} />
                            <h3>No Report Generated</h3>
                            <p>Select your criteria on the left and click "Generate Report" to view insights.</p>
                        </div>
                    ) : (
                        <>
                            <div className={styles.reportHeader}>
                                <div>
                                    <h2 className={styles.reportTitle}>{getReportTitle()}</h2>
                                    <p className={styles.reportSubtitle}>
                                        Generated on {format(reportData.generatedAt, 'MMM dd, yyyy HH:mm')}
                                    </p>
                                </div>
                                <div className={styles.reportSummary}>
                                    <div className={styles.summaryLabel}>Total {reportType === 'products' ? 'Revenue' : (reportType === 'customer_debt' ? 'Outstanding Debt' : reportType === 'inventory' ? 'Items in Stock' : 'Amount')}</div>
                                    <div className={styles.summaryValue}>{reportType === 'inventory' ? '' : '$'}{reportType === 'inventory' ? reportData.total : Number(reportData.total).toFixed(2)}</div>
                                </div>
                            </div>

                            {/* Chart Visualization */}
                            {reportData.items.length > 0 ? (
                                <>
                                    <div className={styles.chartContainer}>
                                        {reportData.items.map((item, idx) => {
                                            const heightPercent = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
                                            return (
                                                <div key={idx} className={styles.barWrapper}>
                                                    <div className={styles.barBackground}>
                                                        <div className={styles.barTooltip}>
                                                            {reportType === 'inventory' ? item.value : `$${Number(item.value).toFixed(2)}`}
                                                        </div>
                                                        <div
                                                            className={styles.bar}
                                                            style={{ height: `${Math.max(heightPercent, 2)}%` }} // min height 2%
                                                        ></div>
                                                    </div>
                                                    <span className={styles.barLabel}>{item.label}</span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Data Table */}
                                    <div className={styles.tableContainer}>
                                        <table className={styles.table}>
                                            <thead>
                                                <tr>
                                                    <th>{reportType === 'products' ? 'Product Name' : (reportType === 'customer_debt' ? 'Customer Name' : reportType === 'inventory' ? 'Stock' : 'Date')}</th>
                                                    <th>{reportType === 'products' ? 'Units Sold' : (reportType === 'customer_debt' ? 'Total Purchases' : reportType === 'inventory' ? 'Quantity' : 'Transactions')}</th>
                                                    <th>{reportType === 'inventory' ? 'Status' : 'Total ($)'}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reportData.items.map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td style={{ fontWeight: 500, color: 'var(--color-text-main)' }}>{item.label}</td>
                                                        <td>{item.count}</td>
                                                        <td style={{ color: reportType === 'inventory' ? (item.count > 0 ? 'var(--color-success)' : 'var(--color-danger)') : 'var(--color-success)', fontWeight: 600 }}>
                                                            {reportType === 'inventory' ? item.status : `$${Number(item.value).toFixed(2)}`}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            ) : (
                                <div className={styles.emptyState} style={{ minHeight: '300px' }}>
                                    <p>No data found for the selected criteria.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Reports;
