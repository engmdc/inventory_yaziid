import fs from 'fs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function run() {
    console.log("⌛ Ku xirida Database-ka Railway...");
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        multipleStatements: true // Tani waxay noo ogolaanaysaa inaan wada run gareyno dhamaan tables-ka halmar
    });

    try {
        const sql = fs.readFileSync('init.sql', 'utf8');
        console.log("⌛ Gelinta Tables-ka iyo xogta...");
        await pool.query(sql);
        console.log("✅ Si guul leh ayaa Tables-kii loogu dhex abuuray Railway Database!");
    } catch (err) {
        console.error("❌ Cilad ayaa dhacday:", err);
    } finally {
        await pool.end();
    }
}

run();
