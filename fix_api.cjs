const fs = require('fs');
let b = fs.readFileSync('backend/server.js', 'utf8');

// Replacements for GET routes to strictly isolate data

b = b.replace(
    /app\.get\('\/api\/customers', async \(req, res\) => \{\s*try \{\s*const \[rows\] = await pool\.query\('SELECT \* FROM customers'\);/,
    "app.get('/api/customers', async (req, res) => {\n    try {\n        const ownerId = req.headers['x-owner-id'];\n        if (!ownerId) return res.status(401).json({ error: 'Unauthorized' });\n        const [rows] = await pool.query('SELECT * FROM customers WHERE owner_id = ?', [ownerId]);"
);

b = b.replace(
    /app\.get\('\/api\/products', async \(req, res\) => \{\s*try \{\s*const \[rows\] = await pool\.query\('SELECT \* FROM products'\);/,
    "app.get('/api/products', async (req, res) => {\n    try {\n        const ownerId = req.headers['x-owner-id'];\n        if (!ownerId) return res.status(401).json({ error: 'Unauthorized' });\n        const [rows] = await pool.query('SELECT * FROM products WHERE owner_id = ?', [ownerId]);"
);

b = b.replace(
    /app\.get\('\/api\/transactions', async \(req, res\) => \{\s*try \{\s*const \[transactions\] = await pool\.query\('SELECT \* FROM transactions ORDER BY date DESC'\);/,
    "app.get('/api/transactions', async (req, res) => {\n    try {\n        const ownerId = req.headers['x-owner-id'];\n        if (!ownerId) return res.status(401).json({ error: 'Unauthorized' });\n        const [transactions] = await pool.query('SELECT * FROM transactions WHERE owner_id = ? ORDER BY date DESC', [ownerId]);"
);

b = b.replace(
    /app\.get\('\/api\/store_profiles', async \(req, res\) => \{\s*try \{\s*const \[rows\] = await pool\.query\('SELECT \* FROM store_profiles'\);/,
    "app.get('/api/store_profiles', async (req, res) => {\n    try {\n        const ownerId = req.headers['x-owner-id'];\n        if (!ownerId) return res.status(401).json({ error: 'Unauthorized' });\n        const [rows] = await pool.query('SELECT * FROM store_profiles WHERE user_id = ?', [ownerId]);"
);

// Replacements for DELETE routes
b = b.replace(
    /app\.delete\('\/api\/customers\/:id', async \(req, res\) => \{\s*try \{\s*await pool\.query\('DELETE FROM customers WHERE id = \?', \[req\.params\.id\]\);/,
    "app.delete('/api/customers/:id', async (req, res) => {\n    try {\n        const ownerId = req.headers['x-owner-id'];\n        if (!ownerId) return res.status(401).json({ error: 'Unauthorized' });\n        await pool.query('DELETE FROM customers WHERE id = ? AND owner_id = ?', [req.params.id, ownerId]);"
);

b = b.replace(
    /app\.delete\('\/api\/products\/:id', async \(req, res\) => \{\s*try \{\s*await pool\.query\('DELETE FROM products WHERE id = \?', \[req\.params\.id\]\);/,
    "app.delete('/api/products/:id', async (req, res) => {\n    try {\n        const ownerId = req.headers['x-owner-id'];\n        if (!ownerId) return res.status(401).json({ error: 'Unauthorized' });\n        await pool.query('DELETE FROM products WHERE id = ? AND owner_id = ?', [req.params.id, ownerId]);"
);

b = b.replace(
    /app\.delete\('\/api\/transactions\/:id', async \(req, res\) => \{\s*try \{\s*\/\/ Items will cascade delete automatically because of ON DELETE CASCADE in db definition\s*await pool\.query\('DELETE FROM transactions WHERE id = \?', \[req\.params\.id\]\);/,
    "app.delete('/api/transactions/:id', async (req, res) => {\n    try {\n        const ownerId = req.headers['x-owner-id'];\n        if (!ownerId) return res.status(401).json({ error: 'Unauthorized' });\n        // Items will cascade delete automatically because of ON DELETE CASCADE in db definition\n        await pool.query('DELETE FROM transactions WHERE id = ? AND owner_id = ?', [req.params.id, ownerId]);"
);

// Updates to PATCH
b = b.replace(
    /let query = 'UPDATE customers SET debt = \?';/,
    "const ownerId = req.headers['x-owner-id'];\n        if (!ownerId) return res.status(401).json({ error: 'Unauthorized' });\n        let query = 'UPDATE customers SET debt = ?';"
);
b = b.replace(
    /query \+= ' WHERE id = \?';\s*params\.push\(req\.params\.id\);/,
    "query += ' WHERE id = ? AND owner_id = ?';\n        params.push(req.params.id, ownerId);"
);

// Bulk Patch
b = b.replace(
    /app\.patch\('\/api\/products\/bulk-stock', async \(req, res\) => \{\s*const \{ updates \} = req\.body;/,
    "app.patch('/api/products/bulk-stock', async (req, res) => {\n    const ownerId = req.headers['x-owner-id'];\n    if (!ownerId) return res.status(401).json({ error: 'Unauthorized' });\n    const { updates } = req.body;"
);
b = b.replace(
    /await connection\.query\('UPDATE products SET stock = \? WHERE id = \?', \[item\.newStock, item\.id\]\);/g,
    "await connection.query('UPDATE products SET stock = ? WHERE id = ? AND owner_id = ?', [item.newStock, item.id, ownerId]);"
);

fs.writeFileSync('backend/server.js', b);
console.log('✅ Server patched successfully.');
