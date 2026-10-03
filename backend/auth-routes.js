const express = require("express");
const { loginAdmin } = require("./auth");

const router = express.Router();

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        const token = await loginAdmin(email, password);

        res.status(200).json({
            success: true,
            message: "Admin login successful.",
            token: token
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;