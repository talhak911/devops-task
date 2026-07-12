const swaggerJSDoc = require("swagger-jsdoc");
const path = require("path");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Tea Shop E-Commerce API",
      version: "1.0.0",
      description:
        "A production-ready REST API for the Tea Shop e-commerce platform with JWT authentication, MongoDB persistence, and cloud image uploads.",
      contact: {},
    },
    // servers array is omitted so Swagger UI will automatically use the current host (works for both localhost and Vercel)
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "Enter your JWT token (obtained from /api/auth/login or /api/auth/register)",
        },
      },
      schemas: {
        AuthResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: {
              type: "object",
              properties: {
                token: {
                  type: "string",
                  example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                },
                user: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    name: { type: "string", example: "John Doe" },
                    email: { type: "string", example: "john@example.com" },
                    role: { type: "string", example: "user" },
                    createdAt: { type: "string", format: "date-time" },
                  },
                },
              },
            },
            message: { type: "string", example: "Logged in successfully" },
          },
        },
        Category: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string", example: "Green Tea" },
            slug: { type: "string", example: "green-tea" },
            imageUrl: { type: "string" },
            isActive: { type: "boolean" },
          }
        },
        Variant: {
          type: "object",
          properties: {
            _id: { type: "string" },
            sku: { type: "string" },
            label: { type: "string" },
            weightGrams: { type: "number" },
            priceDelta: { type: "number" },
            stockQuantity: { type: "number" },
            isActive: { type: "boolean" },
          }
        },
        Product: {
          type: "object",
          properties: {
            _id: { type: "string" },
            title: { type: "string" },
            slug: { type: "string" },
            description: { type: "string" },
            categoryId: { oneOf: [{ type: "string" }, { $ref: "#/components/schemas/Category" }] },
            images: { type: "array", items: { type: "string" } },
            basePrice: { type: "number" },
            origin: { type: "string" },
            isOrganic: { type: "boolean" },
            isVegan: { type: "boolean" },
            rating: { type: "number" },
            variants: { type: "array", items: { $ref: "#/components/schemas/Variant" } },
            isActive: { type: "boolean" },
          }
        },
        Order: {
          type: "object",
          properties: {
            _id: { type: "string" },
            userId: { type: "string" },
            items: { type: "array", items: { type: "object" } },
            subtotal: { type: "number" },
            delivery: { type: "number" },
            total: { type: "number" },
            status: { type: "string", enum: ["pending", "paid", "shipped", "delivered", "cancelled"] },
            paymentMethod: { type: "string" },
            shippingAddress: { type: "object" },
          }
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            data: { type: "null", example: null },
            message: { type: "string", example: "An error occurred" },
          },
        },
        ValidationErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            data: { type: "null", example: null },
            message: { type: "string", example: "Validation failed" },
            errors: {
              type: "array",
              items: { type: "string" }
            },
          },
        },
      },
    },
  },
  apis: [path.join(__dirname, "../routes/*.js")], // Safe absolute path for Vercel
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
