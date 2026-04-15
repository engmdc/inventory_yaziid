const fs = require('fs');
let b = fs.readFileSync('backend/server.js', 'utf8');

// Undo GET
b = b.replace(
    /app\.get\('\/api\/customers', async \(req, res\) => \{\n    try \{\n        const ownerId = req.headers\['x-owner-id'\];\n        if \(!ownerId\) return res\.status\(401\)\.json\(\{ error: 'Unauthorized' \}\);\n        const \[rows\] = await pool\.query\('SELECT \* FROM customers WHERE owner_id = \?', \[ownerId\]\);/,
    "app.get('/api/customers', async (req, res) => {\n    try {\n        const [rows] = await pool.query('SELECT * FROM customers');"
);

b = b.replace(
    /app\.get\('\/api\/products', async \(req, res\) => \{\n    try \{\n        const ownerId = req\.headers\['x-owner-id'\];\n        if \(!ownerId\) return res\.status\(401\)\.json\(\{ error: 'Unauthorized' \}\);\n        const \[rows\] = await pool\.query\('SELECT \* FROM products WHERE owner_id = \?', \[ownerId\]\);/,
    "app.get('/api/products', async (req, res) => {\n    try {\n        const [rows] = await pool.query('SELECT * FROM products');"
);

b = b.replace(
    /app\.get\('\/api\/transactions', async \(req, res\) => \{\n    try \{\n        const ownerId = req\.headers\['x-owner-id'\];\n        if \(!ownerId\) return res\.status\(401\)\.json\(\{ error: 'Unauthorized' \}\);\n        const \[transactions\] = await pool\.query\('SELECT \* FROM transactions WHERE owner_id = \? ORDER BY date DESC', \[ownerId\]\);/,
    "app.get('/api/transactions', async (req, res) => {\n    try {\n        const [transactions] = await pool.query('SELECT * FROM transactions ORDER BY date DESC');"
);

b = b.replace(
    /app\.get\('\/api\/store_profiles', async \(req, res\) => \{\n    try \{\n        const ownerId = req\.headers\['x-owner-id'\];\n        if \(!ownerId\) return res\.status\(401\)\.json\(\{ error: 'Unauthorized' \}\);\n        const \[rows\] = await pool\.query\('SELECT \* FROM store_profiles WHERE user_id = \?', \[ownerId\]\);/,
    "app.get('/api/store_profiles', async (req, res) => {\n    try {\n        const [rows] = await pool.query('SELECT * FROM store_profiles');"
);

// Undo DELETE
b = b.replace(
    /app\.delete\('\/api\/customers\/:id', async \(req, res\) => \{\n    try \{\n        const ownerId = req\.headers\['x-owner-id'\];\n        if \(!ownerId\) return res\.status\(401\)\.json\(\{ error: 'Unauthorized' \}\);\n        await pool\.query\('DELETE FROM customers WHERE id = \? AND owner_id = \?', \[req\.params\.id, ownerId\]\);/,
    "app.delete('/api/customers/:id', async (req, res) => {\n    try {\n        await pool.query('DELETE FROM customers WHERE id = ?', [req.params.id]);"
);

b = b.replace(
    /app\.delete\('\/api\/products\/:id', async \(req, res\) => \{\n    try \{\n        const ownerId = req\.headers\['x-owner-id'\];\n        if \(!ownerId\) return res\.status\(401\)\.json\(\{ error: 'Unauthorized' \}\);\n        await pool\.query\('DELETE FROM products WHERE id = \? AND owner_id = \?', \[req\.params\.id, ownerId\]\);/,
    "app.delete('/api/products/:id', async (req, res) => {\n    try {\n        await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);"
);

b = b.replace(
    /app\.delete\('\/api\/transactions\/:id', async \(req, res\) => \{\n    try \{\n        const ownerId = req\.headers\['x-owner-id'\];\n        if \(!ownerId\) return res\.status\(401\)\.json\(\{ error: 'Unauthorized' \}\);\n        \/\/ Items will cascade delete automatically because of ON DELETE CASCADE in db definition\n        await pool\.query\('DELETE FROM transactions WHERE id = \? AND owner_id = \?', \[req\.params\.id, ownerId\]\);/,
    "app.delete('/api/transactions/:id', async (req, res) => {\n    try {\n        // Items will cascade delete automatically because of ON DELETE CASCADE in db definition\n        await pool.query('DELETE FROM transactions WHERE id = ?', [req.params.id]);"
);

// Undo Updates PATCH
b = b.replace(
    /const ownerId = req\.headers\['x-owner-id'\];\n        if \(!ownerId\) return res\.status\(401\)\.json\(\{ error: 'Unauthorized' \}\);\n        let query = 'UPDATE customers SET debt = \?';/,
    "let query = 'UPDATE customers SET debt = ?';"
);
b = b.replace(
    /query \+= ' WHERE id = \? AND owner_id = \?';\n        params\.push\(req\.params\.id, ownerId\);/,
    "query += ' WHERE id = ?';\n        params.push(req.params.id);"
);

// Undo Bulk Patch
b = b.replace(
    /app\.patch\('\/api\/products\/bulk-stock', async \(req, res\) => \{\n    const ownerId = req\.headers\['x-owner-id'\];\n    if \(!ownerId\) return res\.status\(401\)\.json\(\{ error: 'Unauthorized' \}\);\n    const \{ updates \} = req\.body;/,
    "app.patch('/api/products/bulk-stock', async (req, res) => {\n    const { updates } = req.body;"
);
b = b.replace(
    /await connection\.query\('UPDATE products SET stock = \? WHERE id = \? AND owner_id = \?', \[item\.newStock, item\.id, ownerId\]\);/g,
    "await connection.query('UPDATE products SET stock = ? WHERE id = ?', [item.newStock, item.id]);"
);

fs.writeFileSync('backend/server.js', b);
console.log('✅ Server REVERTED successfully to global shared store mode.');
