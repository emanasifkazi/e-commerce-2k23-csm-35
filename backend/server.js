const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./auth-routes");
const adminRoutes = require("./admin-routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "StyleCart Backend API is running."
    });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`StyleCart server running on http://localhost:${PORT}`);
});