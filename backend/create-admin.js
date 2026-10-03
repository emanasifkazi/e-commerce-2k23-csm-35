const { createAdmin } = require("./auth");
const pool = require("./db");

async function main() {
    try {
        await createAdmin();
    } catch (error) {
        console.error("Admin creation failed:");
        console.error(error.message);
    } finally {
        await pool.end();
    }
}

main();