const pool = require("./db");

async function testDatabase() {
    try {
        const [rows] = await pool.query("SELECT DATABASE() AS database_name");
        console.log("Database connected successfully!");
        console.log("Connected database:", rows[0].database_name);
    } catch (error) {
        console.error("Database connection failed:");
        console.error(error.message);
    } finally {
        await pool.end();
    }
}

testDatabase();