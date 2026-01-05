import { pgTable, text, varchar, timestamp, decimal, integer, uuid, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: text('password').notNull(),
    role: varchar('role', { length: 50 }).default('user'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const leads = pgTable('leads', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    email: varchar('email', { length: 255 }),
    phone: varchar('phone', { length: 50 }),
    status: varchar('status', { length: 50 }).default('new'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const customers = pgTable('customers', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    email: varchar('email', { length: 255 }),
    phone: varchar('phone', { length: 50 }),
    address: text('address'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const products = pgTable('products', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    sku: varchar('sku', { length: 100 }),
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    description: text('description'),
    stock: integer('stock').default(0),
    sizes: jsonb('sizes'), // Array of strings
    colors: jsonb('colors'), // Array of strings
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const orders = pgTable('orders', {
    id: uuid('id').primaryKey().defaultRandom(),
    orderNumber: varchar('order_number', { length: 50 }).notNull().unique(),
    customerId: uuid('customer_id').references(() => customers.id),
    totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
    status: varchar('status', { length: 50 }).default('pending'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const invoices = pgTable('invoices', {
    id: uuid('id').primaryKey().defaultRandom(),
    invoiceNumber: varchar('invoice_number', { length: 50 }).notNull().unique(),
    customerId: uuid('customer_id').references(() => customers.id),
    taxRate: decimal('tax_rate', { precision: 5, scale: 2 }).default('0.00'),
    discount: decimal('discount', { precision: 10, scale: 2 }).default('0.00'),
    discountType: varchar('discount_type', { length: 20 }).default('flat'),
    currency: varchar('currency', { length: 10 }).default('USD'),
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
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const quotations = pgTable('quotations', {
    id: uuid('id').primaryKey().defaultRandom(),
    quotationNumber: varchar('quotation_number', { length: 50 }).notNull().unique(),
    customerId: uuid('customer_id').references(() => customers.id),
    taxRate: decimal('tax_rate', { precision: 5, scale: 2 }).default('0.00'),
    discount: decimal('discount', { precision: 10, scale: 2 }).default('0.00'),
    discountType: varchar('discount_type', { length: 20 }).default('flat'),
    currency: varchar('currency', { length: 10 }).default('USD'),
    notes: jsonb('notes'), // Array of strings
    terms: jsonb('terms'), // Array of strings
    status: varchar('status', { length: 50 }).default('draft'),
    validUntil: timestamp('valid_until'),
    salesPersonId: uuid('sales_person_id').references(() => users.id),
    shippingAddress: text('shipping_address'),
    signature: text('signature'), // Path to signature image
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const invoiceItems = pgTable('invoice_items', {
    id: uuid('id').primaryKey().defaultRandom(),
    invoiceId: uuid('invoice_id').references(() => invoices.id),
    quotationId: uuid('quotation_id').references(() => quotations.id),
    orderId: uuid('order_id').references(() => orders.id),
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
