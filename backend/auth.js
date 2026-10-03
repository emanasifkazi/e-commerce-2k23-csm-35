const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("./db");

async function createAdmin() {
    const name = "StyleCart Admin";
    const email = "admin@stylecart.local";
    const password = "Admin@123";

    const passwordHash = await bcrypt.hash(password, 10);

    const [existing] = await pool.query(
        "SELECT id FROM users WHERE email = ?",
        [email]
    );

    if (existing.length > 0) {
        console.log("Admin already exists.");
        return;
    }

    await pool.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES (?, ?, ?, 'admin')`,
        [name, email, passwordHash]
    );

    console.log("Admin created successfully.");
}

async function loginAdmin(email, password) {
    const [users] = await pool.query(
        "SELECT * FROM users WHERE email = ? AND role = 'admin'",
        [email]
    );

    if (users.length === 0) {
        throw new Error("Invalid admin credentials.");
    }

    const admin = users[0];

    const passwordValid = await bcrypt.compare(
        password,
        admin.password_hash
    );

    if (!passwordValid) {
        throw new Error("Invalid admin credentials.");
    }

    const token = jwt.sign(
        {
            id: admin.id,
            email: admin.email,
            role: admin.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "2h"
        }
    );

    return token;
}

module.exports = {
    createAdmin,
    loginAdmin
};