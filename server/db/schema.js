import { pgTable, text, varchar, timestamp, decimal, integer, uuid, jsonb, boolean } from 'drizzle-orm/pg-core';

// Users table - SRS Section 22 & 30.1
export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    mobile: varchar('mobile', { length: 20 }).unique(),
    countryCode: varchar('country_code', { length: 5 }).default('+91'),
    aadhaarHash: text('aadhaar_hash'), // Stored hashed/encrypted
    address: text('address'),
    password: text('password').notNull(),
    role: varchar('role', { length: 50 }).default('employee'), // super_admin, admin, employee
    discountCap: decimal('discount_cap', { precision: 5, scale: 2 }).default('0.00'),
    assignedTaxRules: jsonb('assigned_tax_rules'),
    leadsGenerated: integer('leads_generated').default(0),
    isLocked: boolean('is_locked').default(false),
    loginAttempts: integer('login_attempts').default(0),
    status: varchar('status', { length: 50 }).default('invited'), // invited, active, suspended
    isActive: boolean('is_active').default(true),
    inviteToken: text('invite_token'),
    inviteTokenExpiry: timestamp('invite_token_expiry'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// System Settings table
export const systemSettings = pgTable('system_settings', {
    id: uuid('id').primaryKey().defaultRandom(),
    key: varchar('key', { length: 100 }).notNull().unique(),
    value: jsonb('value').notNull(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// Leads table - SRS Section 7.1 (Core of System)
export const leads = pgTable('leads', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(), // Customer/Company Name
    companyName: text('company_name'),
    contactPerson: text('contact_person'),
    email: varchar('email', { length: 255 }),
    phone: varchar('phone', { length: 50 }),
    // Address fields - SRS 7.2
    billingAddress: text('billing_address'),
    shippingAddress: text('shipping_address'),
    country: varchar('country', { length: 100 }),
    state: varchar('state', { length: 100 }),
    city: varchar('city', { length: 100 }),
    pin: varchar('pin', { length: 10 }),
    // Lead Type for discount eligibility - SRS 7.2
    leadType: varchar('lead_type', { length: 50 }).default('regular'), // regular, bulk_buyer, dealer, special
    discountApplied: decimal('discount_applied', { precision: 5, scale: 2 }),
    // Employee tracking - SRS Section 27
    generatedBy: uuid('generated_by').references(() => users.id),
    employeeRoleAtCreation: varchar('employee_role_at_creation', { length: 50 }),
    employeeDiscountSlabAtCreation: decimal('employee_discount_slab', { precision: 5, scale: 2 }),
    status: varchar('status', { length: 50 }).default('new'), // new, contacted, qualified, lost, won
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// Products table - SRS Section 9.1
export const products = pgTable('products', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    sku: varchar('sku', { length: 100 }).unique(),
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    priceSlabs: jsonb('price_slabs'), // Array of price tiers
    description: text('description'),
    stock: integer('stock').default(0),
    sizes: jsonb('sizes'), // Array of strings
    colors: jsonb('colors'), // Array of strings
    packingSize: varchar('packing_size', { length: 100 }),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// Orders table - SRS Section 10 (Created from Leads)
export const orders = pgTable('orders', {
    id: uuid('id').primaryKey().defaultRandom(),
    orderNumber: varchar('order_number', { length: 50 }).notNull().unique(),
    leadId: uuid('lead_id').references(() => leads.id), // Changed from customerId
    totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
    status: varchar('status', { length: 50 }).default('pending'), // pending, processing, shipped, delivered, cancelled
    inventoryReserved: boolean('inventory_reserved').default(false),
    dispatchedAt: timestamp('dispatched_at'),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// Invoices table - SRS Section 11
export const invoices = pgTable('invoices', {
    id: uuid('id').primaryKey().defaultRandom(),
    invoiceNumber: varchar('invoice_number', { length: 50 }).notNull().unique(),
    leadId: uuid('lead_id').references(() => leads.id), // Changed from customerId
    orderId: uuid('order_id').references(() => orders.id), // One-to-One with Order
    taxRate: decimal('tax_rate', { precision: 5, scale: 2 }).default('0.00'),
    discount: decimal('discount', { precision: 10, scale: 2 }).default('0.00'),
    discountType: varchar('discount_type', { length: 20 }).default('flat'),
    currency: varchar('currency', { length: 10 }).default('INR'),
    notes: jsonb('notes'), // Array of strings
    terms: jsonb('terms'), // Array of strings
    status: varchar('status', { length: 50 }).default('unpaid'),
    dueDate: timestamp('due_date'),
    paymentTerms: varchar('payment_terms', { length: 100 }),
    paymentMethod: varchar('payment_method', { length: 50 }),
    paymentReference: varchar('payment_reference', { length: 100 }),
    paidAmount: decimal('paid_amount', { precision: 10, scale: 2 }).default('0.00'),
    balanceDue: decimal('balance_due', { precision: 10, scale: 2 }).default('0.00'),
    bankDetails: jsonb('bank_details'),
    gstin: varchar('gstin', { length: 20 }),
    pan: varchar('pan', { length: 20 }),
    signature: text('signature'), // Path to signature image
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// Quotations table - SRS Section 11
export const quotations = pgTable('quotations', {
    id: uuid('id').primaryKey().defaultRandom(),
    quotationNumber: varchar('quotation_number', { length: 50 }).notNull().unique(),
    leadId: uuid('lead_id').references(() => leads.id), // Changed from customerId
    taxRate: decimal('tax_rate', { precision: 5, scale: 2 }).default('0.00'),
    discount: decimal('discount', { precision: 10, scale: 2 }).default('0.00'),
    discountType: varchar('discount_type', { length: 20 }).default('flat'),
    currency: varchar('currency', { length: 10 }).default('INR'),
    notes: jsonb('notes'), // Array of strings
    terms: jsonb('terms'), // Array of strings
    status: varchar('status', { length: 50 }).default('draft'),
    validUntil: timestamp('valid_until'),
    salesPersonId: uuid('sales_person_id').references(() => users.id),
    shippingAddress: text('shipping_address'),
    signature: text('signature'), // Path to signature image
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// Invoice/Quotation Items table
export const invoiceItems = pgTable('invoice_items', {
    id: uuid('id').primaryKey().defaultRandom(),
    invoiceId: uuid('invoice_id').references(() => invoices.id),
    quotationId: uuid('quotation_id').references(() => quotations.id),
    orderId: uuid('order_id').references(() => orders.id),
    productId: uuid('product_id').references(() => products.id),
    name: text('name').notNull(),
    quantity: integer('quantity').notNull(),
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    chargeTypes: jsonb('charge_types'), // Array of strings
    chargeAmounts: jsonb('charge_amounts'), // Array of numbers
    designName: varchar('design_name', { length: 255 }),
    size: varchar('size', { length: 20 }),
    color: varchar('color', { length: 50 }),
    fabric: varchar('fabric', { length: 100 }),
    printType: varchar('print_type', { length: 100 }),
});

// Inventory Transactions table - SRS Section 13
export const inventoryTransactions = pgTable('inventory_transactions', {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: uuid('product_id').references(() => products.id).notNull(),
    quantity: integer('quantity').notNull(), // Positive for add, Negative for deduct
    balanceBefore: integer('balance_before').notNull(),
    balanceAfter: integer('balance_after').notNull(),
    referenceType: varchar('reference_type', { length: 50 }), // lead, order, invoice, adjustment
    referenceId: uuid('reference_id'),
    notes: text('notes'),
    createdBy: uuid('created_by').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow(),
});

// Audit Logs table - SRS Section 29
export const auditLogs = pgTable('audit_logs', {
    id: uuid('id').primaryKey().defaultRandom(),
    action: varchar('action', { length: 100 }).notNull(),
    performedBy: uuid('performed_by').references(() => users.id),
    affectedEntity: varchar('affected_entity', { length: 100 }),
    affectedEntityId: uuid('affected_entity_id'),
    oldValue: jsonb('old_value'),
    newValue: jsonb('new_value'),
    ipAddress: varchar('ip_address', { length: 50 }),
    timestamp: timestamp('timestamp').defaultNow(),
});
