const request = require("http");

const BASE_HOST = "localhost";
const BASE_PORT = 5000;

function apiRequest(method, path, token, body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: BASE_HOST,
            port: BASE_PORT,
            path,
            method,
            headers: {
                "Content-Type": "application/json"
            }
        };

        if (token) {
            options.headers.Authorization = `Bearer ${token}`;
        }

        const req = request.request(options, (res) => {
            let data = "";

            res.on("data", chunk => {
                data += chunk;
            });

            res.on("end", () => {
                let json = {};

                try {
                    json = JSON.parse(data);
                } catch {
                    json = { raw: data };
                }

                resolve({
                    status: res.statusCode,
                    body: json
                });
            });
        });

        req.on("error", reject);

        if (body) {
            req.write(JSON.stringify(body));
        }

        req.end();
    });
}

describe("Sprint 2 - Catalog Data Foundation", () => {

    let token;

    beforeAll(async () => {
        const response = await apiRequest(
            "POST",
            "/api/v1/auth/login",
            null,
            {
                email: "admin@stylecart.local",
                password: "Admin@123"
            }
        );

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        token = response.body.token;
    });

    test("Admin should be able to retrieve categories", async () => {
        const response = await apiRequest(
            "GET",
            "/api/v1/admin/categories",
            token
        );

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.count).toBeGreaterThanOrEqual(2);
    });

    test("Admin should be able to retrieve products", async () => {
        const response = await apiRequest(
            "GET",
            "/api/v1/admin/products",
            token
        );

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.count).toBeGreaterThanOrEqual(3);
    });

    test("Admin should be able to retrieve Denim Jeans SKUs", async () => {
        const response = await apiRequest(
            "GET",
            "/api/v1/admin/products/2/skus",
            token
        );

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.count).toBeGreaterThanOrEqual(4);
    });

    test("Duplicate category slug should be rejected", async () => {
        const response = await apiRequest(
            "POST",
            "/api/v1/admin/categories",
            token,
            {
                name: "Duplicate Clothing",
                slug: "clothing",
                parent_id: null
            }
        );

        expect(response.status).toBe(409);
        expect(response.body.success).toBe(false);
    });

    test("Invalid parent category should be rejected", async () => {
        const response = await apiRequest(
            "POST",
            "/api/v1/admin/categories",
            token,
            {
                name: "Invalid Parent Category",
                slug: "invalid-parent-category",
                parent_id: 999999
            }
        );

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });

    test("Duplicate SKU code should be rejected", async () => {
        const response = await apiRequest(
            "POST",
            "/api/v1/admin/products/2/skus",
            token,
            {
                variant_id: 2,
                sku_code: "DENIM-BLUE-32",
                price: 2999,
                stock_quantity: 10,
                is_active: true
            }
        );

        expect(response.status).toBe(409);
        expect(response.body.success).toBe(false);
    });

    test("Negative stock should be rejected", async () => {
        const response = await apiRequest(
            "POST",
            "/api/v1/admin/products/2/skus",
            token,
            {
                variant_id: 2,
                sku_code: "TEST-NEGATIVE-STOCK",
                price: 2999,
                stock_quantity: -5,
                is_active: true
            }
        );

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });

    test("Negative price should be rejected", async () => {
        const response = await apiRequest(
            "POST",
            "/api/v1/admin/products/2/skus",
            token,
            {
                variant_id: 2,
                sku_code: "TEST-NEGATIVE-PRICE",
                price: -100,
                stock_quantity: 5,
                is_active: true
            }
        );

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });

    test("Admin API should reject requests without authentication", async () => {
        const response = await apiRequest(
            "GET",
            "/api/v1/admin/categories"
        );

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
    });

}); 
