# StyleCart — Online Fashion & Accessories Store

StyleCart is an academic E-Commerce project for an online fashion and accessories store. The system allows customers to browse products, manage their shopping cart, place orders, and view order history.

## Project Information

* **Course:** E-Commerce
* **Roll Number:** 2K23-CSM-35
* **Current Sprint:** Sprint 2 — Catalog Data Foundation
* **Domain:** Fashion & Accessories
* **Project Type:** Individual Project
* **Repository:** `e-commerce-2k23-csm-35`

## Sprint Documentation

### Sprint 1 — System Architecture & Scope Definition

The complete Sprint 1 architecture, scope, target audience, MVP features, technology stack, and database design are available here:

[SPRINT 1 — System Architecture & Scope Definition](docs/SPRINT_1.md)

### Sprint 2 — Catalog Data Foundation

Sprint 2 establishes the catalog data foundation of StyleCart. It includes category management, product management, product variants, SKU management, stock and price validation, authenticated admin APIs, demo catalog data, and automated API tests.

The complete Sprint 2 implementation and test documentation is available here:

[SPRINT 2 — Catalog Data Foundation](docs/SPRINT_2.md)

### Sprint 2 Test Result

```text
Test Suites: 1 passed, 1 total
Tests:       9 passed, 9 total
```

## Technology Stack

* React.js
* Node.js + Express.js
* MySQL
* Redis (Optional)
* Git & GitHub

## Project Scope

The initial MVP focuses on user authentication, product browsing and search, shopping cart management, checkout, order processing, order history, and basic admin product and inventory management.

## Repository Structure

```text
e-commerce-2k23-csm-35/
│
├── backend/
│   ├── admin-routes.js
│   ├── auth-routes.js
│   ├── auth.js
│   ├── db.js
│   ├── middleware.js
│   ├── package.json
│   └── tests/
│       └── sprint2.test.js
│
├── docs/
│   ├── SPRINT_1.md
│   └── SPRINT_2.md
│
├── .gitignore
└── README.md
```

