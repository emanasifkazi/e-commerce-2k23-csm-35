const express = require("express");
const pool = require("./db");

const {
    authenticateToken,
    requireAdmin
} = require("./middleware");

const router = express.Router();

// ==========================================
// ADMIN AUTHENTICATION
// ==========================================

router.use(authenticateToken);
router.use(requireAdmin);


// ==========================================
// CREATE CATEGORY
// ==========================================

router.post("/categories", async (req, res) => {
    try {
        const {
            name,
            slug,
            parent_id = null
        } = req.body;

        if (!name || !slug) {
            return res.status(400).json({
                success: false,
                message: "Category name and slug are required."
            });
        }

        // Check parent category
        if (parent_id !== null) {
            const [parent] = await pool.query(
                "SELECT id FROM categories WHERE id = ?",
                [parent_id]
            );

            if (parent.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Parent category does not exist."
                });
            }
        }

        // Check duplicate slug
        const [existing] = await pool.query(
            "SELECT id FROM categories WHERE slug = ?",
            [slug]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Category slug already exists."
            });
        }

        const [result] = await pool.query(
            `INSERT INTO categories
            (parent_id, name, slug, is_active)
            VALUES (?, ?, ?, TRUE)`,
            [parent_id, name, slug]
        );

        res.status(201).json({
            success: true,
            message: "Category created successfully.",
            category: {
                id: result.insertId,
                name,
                slug,
                parent_id,
                is_active: true
            }
        });

    } catch (error) {
        console.error("Create category error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to create category."
        });
    }
});


// ==========================================
// GET ALL CATEGORIES
// ==========================================

router.get("/categories", async (req, res) => {
    try {
        const [categories] = await pool.query(
            `SELECT
                id,
                parent_id,
                name,
                slug,
                is_active,
                created_at,
                updated_at
             FROM categories
             ORDER BY id ASC`
        );

        res.status(200).json({
            success: true,
            count: categories.length,
            categories
        });

    } catch (error) {
        console.error("Get categories error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch categories."
        });
    }
});


// ==========================================
// CREATE PRODUCT
// ==========================================

router.post("/products", async (req, res) => {
    try {
        const {
            category_id,
            name,
            slug,
            description = null,
            status = "draft",
            specifications = null
        } = req.body;

        if (!category_id || !name || !slug) {
            return res.status(400).json({
                success: false,
                message: "Category ID, product name and slug are required."
            });
        }

        const allowedStatuses = [
            "draft",
            "active",
            "archived"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be draft, active, or archived."
            });
        }

        // Check category
        const [category] = await pool.query(
            "SELECT id FROM categories WHERE id = ?",
            [category_id]
        );

        if (category.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Category does not exist."
            });
        }

        // Check duplicate slug
        const [existing] = await pool.query(
            "SELECT id FROM products WHERE slug = ?",
            [slug]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Product slug already exists."
            });
        }

        const [result] = await pool.query(
            `INSERT INTO products
            (
                category_id,
                name,
                slug,
                description,
                status,
                specifications
            )
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                category_id,
                name,
                slug,
                description,
                status,
                specifications
            ]
        );

        res.status(201).json({
            success: true,
            message: "Product created successfully.",
            product: {
                id: result.insertId,
                category_id,
                name,
                slug,
                description,
                status,
                specifications
            }
        });

    } catch (error) {
        console.error("Create product error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to create product."
        });
    }
});


// ==========================================
// GET ALL PRODUCTS
// ==========================================

router.get("/products", async (req, res) => {
    try {
        const [products] = await pool.query(
            `SELECT
                p.id,
                p.category_id,
                c.name AS category_name,
                p.name,
                p.slug,
                p.description,
                p.status,
                p.specifications,
                p.created_at,
                p.updated_at
             FROM products p
             INNER JOIN categories c
                ON p.category_id = c.id
             ORDER BY p.id ASC`
        );

        res.status(200).json({
            success: true,
            count: products.length,
            products
        });

    } catch (error) {
        console.error("Get products error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch products."
        });
    }
});


// ==========================================
// UPDATE PRODUCT
// ==========================================

router.patch("/products/:id", async (req, res) => {
    try {
        const productId = req.params.id;

        const {
            category_id,
            name,
            slug,
            description,
            status,
            specifications
        } = req.body;

        // Check product
        const [products] = await pool.query(
            "SELECT id FROM products WHERE id = ?",
            [productId]
        );

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product does not exist."
            });
        }

        // Validate status if provided
        const allowedStatuses = [
            "draft",
            "active",
            "archived"
        ];

        if (
            status !== undefined &&
            !allowedStatuses.includes(status)
        ) {
            return res.status(400).json({
                success: false,
                message: "Status must be draft, active, or archived."
            });
        }

        // Check category if provided
        if (category_id !== undefined) {
            const [category] = await pool.query(
                "SELECT id FROM categories WHERE id = ?",
                [category_id]
            );

            if (category.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Category does not exist."
                });
            }
        }

        // Check duplicate slug
        if (slug !== undefined) {
            const [existing] = await pool.query(
                `SELECT id
                 FROM products
                 WHERE slug = ?
                 AND id != ?`,
                [slug, productId]
            );

            if (existing.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: "Product slug already exists."
                });
            }
        }

        const fields = [];
        const values = [];

        if (category_id !== undefined) {
            fields.push("category_id = ?");
            values.push(category_id);
        }

        if (name !== undefined) {
            fields.push("name = ?");
            values.push(name);
        }

        if (slug !== undefined) {
            fields.push("slug = ?");
            values.push(slug);
        }

        if (description !== undefined) {
            fields.push("description = ?");
            values.push(description);
        }

        if (status !== undefined) {
            fields.push("status = ?");
            values.push(status);
        }

        if (specifications !== undefined) {
            fields.push("specifications = ?");
            values.push(specifications);
        }

        if (fields.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No fields provided for update."
            });
        }

        values.push(productId);

        await pool.query(
            `UPDATE products
             SET ${fields.join(", ")}
             WHERE id = ?`,
            values
        );

        res.status(200).json({
            success: true,
            message: "Product updated successfully."
        });

    } catch (error) {
        console.error("Update product error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to update product."
        });
    }
});


// ==========================================
// CREATE VARIANT
// ==========================================

router.post("/products/:id/variants", async (req, res) => {
    try {
        const productId = req.params.id;

        const {
            option_values,
            combination_key
        } = req.body;

        if (!option_values || !combination_key) {
            return res.status(400).json({
                success: false,
                message: "Option values and combination key are required."
            });
        }

        // Check product
        const [products] = await pool.query(
            "SELECT id FROM products WHERE id = ?",
            [productId]
        );

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product does not exist."
            });
        }

        // Check duplicate combination
        const [existing] = await pool.query(
            `SELECT id
             FROM variants
             WHERE product_id = ?
             AND combination_key = ?`,
            [productId, combination_key]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: "This variant combination already exists."
            });
        }

        const [result] = await pool.query(
            `INSERT INTO variants
            (
                product_id,
                option_values,
                combination_key
            )
            VALUES (?, ?, ?)`,
            [
                productId,
                option_values,
                combination_key
            ]
        );

        res.status(201).json({
            success: true,
            message: "Variant created successfully.",
            variant: {
                id: result.insertId,
                product_id: Number(productId),
                option_values,
                combination_key
            }
        });

    } catch (error) {
        console.error("Create variant error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to create variant."
        });
    }
});


// ==========================================
// GET VARIANTS FOR PRODUCT
// ==========================================

router.get("/products/:id/variants", async (req, res) => {
    try {
        const productId = req.params.id;

        const [variants] = await pool.query(
            `SELECT
                id,
                product_id,
                option_values,
                combination_key,
                created_at
             FROM variants
             WHERE product_id = ?
             ORDER BY id ASC`,
            [productId]
        );

        res.status(200).json({
            success: true,
            count: variants.length,
            variants
        });

    } catch (error) {
        console.error("Get variants error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch variants."
        });
    }
});


// ==========================================
// CREATE SKU
// ==========================================

router.post("/products/:id/skus", async (req, res) => {
    try {
        const productId = req.params.id;

        const {
            variant_id,
            sku_code,
            price,
            stock_quantity = 0,
            is_active = true
        } = req.body;

        if (!variant_id || !sku_code || price === undefined) {
            return res.status(400).json({
                success: false,
                message: "Variant ID, SKU code and price are required."
            });
        }

        if (Number(price) < 0) {
            return res.status(400).json({
                success: false,
                message: "Price cannot be negative."
            });
        }

        if (Number(stock_quantity) < 0) {
            return res.status(400).json({
                success: false,
                message: "Stock quantity cannot be negative."
            });
        }

        // Check product
        const [products] = await pool.query(
            "SELECT id FROM products WHERE id = ?",
            [productId]
        );

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product does not exist."
            });
        }

        // Check variant belongs to product
        const [variants] = await pool.query(
            `SELECT id
             FROM variants
             WHERE id = ?
             AND product_id = ?`,
            [variant_id, productId]
        );

        if (variants.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Variant does not belong to this product."
            });
        }

        // Check duplicate SKU
        const [existing] = await pool.query(
            "SELECT id FROM skus WHERE sku_code = ?",
            [sku_code]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: "SKU code already exists."
            });
        }

        const [result] = await pool.query(
            `INSERT INTO skus
            (
                variant_id,
                sku_code,
                price,
                stock_quantity,
                is_active
            )
            VALUES (?, ?, ?, ?, ?)`,
            [
                variant_id,
                sku_code,
                price,
                stock_quantity,
                is_active
            ]
        );

        res.status(201).json({
            success: true,
            message: "SKU created successfully.",
            sku: {
                id: result.insertId,
                variant_id: Number(variant_id),
                sku_code,
                price: Number(price),
                stock_quantity: Number(stock_quantity),
                is_active: Boolean(is_active)
            }
        });

    } catch (error) {
        console.error("Create SKU error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to create SKU."
        });
    }
});


// ==========================================
// GET SKUs FOR PRODUCT
// ==========================================

router.get("/products/:id/skus", async (req, res) => {
    try {
        const productId = req.params.id;

        const [skus] = await pool.query(
            `SELECT
                s.id,
                s.variant_id,
                s.sku_code,
                s.price,
                s.stock_quantity,
                s.is_active,
                s.created_at,
                s.updated_at
             FROM skus s
             INNER JOIN variants v
                ON s.variant_id = v.id
             WHERE v.product_id = ?
             ORDER BY s.id ASC`,
            [productId]
        );

        res.status(200).json({
            success: true,
            count: skus.length,
            skus
        });

    } catch (error) {
        console.error("Get SKUs error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch SKUs."
        });
    }
});


// ==========================================
// UPDATE SKU
// ==========================================

router.patch("/skus/:id", async (req, res) => {
    try {
        const skuId = req.params.id;

        const {
            sku_code,
            price,
            stock_quantity,
            is_active
        } = req.body;

        // Check SKU
        const [skus] = await pool.query(
            "SELECT id FROM skus WHERE id = ?",
            [skuId]
        );

        if (skus.length === 0) {
            return res.status(404).json({
                success: false,
                message: "SKU does not exist."
            });
        }

        if (
            price !== undefined &&
            Number(price) < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Price cannot be negative."
            });
        }

        if (
            stock_quantity !== undefined &&
            Number(stock_quantity) < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Stock quantity cannot be negative."
            });
        }

        // Duplicate SKU code
        if (sku_code !== undefined) {
            const [existing] = await pool.query(
                `SELECT id
                 FROM skus
                 WHERE sku_code = ?
                 AND id != ?`,
                [sku_code, skuId]
            );

            if (existing.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: "SKU code already exists."
                });
            }
        }

        const fields = [];
        const values = [];

        if (sku_code !== undefined) {
            fields.push("sku_code = ?");
            values.push(sku_code);
        }

        if (price !== undefined) {
            fields.push("price = ?");
            values.push(price);
        }

        if (stock_quantity !== undefined) {
            fields.push("stock_quantity = ?");
            values.push(stock_quantity);
        }

        if (is_active !== undefined) {
            fields.push("is_active = ?");
            values.push(is_active);
        }

        if (fields.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No fields provided for update."
            });
        }

        values.push(skuId);

        await pool.query(
            `UPDATE skus
             SET ${fields.join(", ")}
             WHERE id = ?`,
            values
        );

        res.status(200).json({
            success: true,
            message: "SKU updated successfully."
        });

    } catch (error) {
        console.error("Update SKU error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to update SKU."
        });
    }
});


// ==========================================
// EXPORT ROUTER
// ==========================================

module.exports = router;