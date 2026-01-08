// User interface - SRS Section 22 & 30.1
export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    mobile?: string;
    countryCode?: string;
    address?: string;
    role: 'admin' | 'employee' | 'super_admin';
    discountCap?: number | string;
    leadsGenerated?: number;
    status?: 'invited' | 'active' | 'suspended';
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface Item {
    id?: string;
    productId?: string;
    name: string;
    quantity: number;
    price: number | string;
    chargeTypes?: string[];
    chargeAmounts?: number[];
    designName?: string;
    size?: string;
    color?: string;
    fabric?: string;
    printType?: string;
}

// Lead interface - SRS Section 7.1
export interface Lead {
    id: string;
    name: string;
    companyName?: string;
    contactPerson?: string;
    email: string;
    phone: string;
    // Address fields
    billingAddress?: string;
    shippingAddress?: string;
    country?: string;
    state?: string;
    city?: string;
    pin?: string;
    // Lead type for discount eligibility - SRS 7.2
    leadType?: 'regular' | 'bulk_buyer' | 'dealer' | 'special';
    discountApplied?: number | string;
    // Employee tracking - SRS Section 27
    generatedBy?: string;
    employeeRoleAtCreation?: string;
    employeeDiscountSlabAtCreation?: number | string;
    salesPersonId?: string;
    status: 'new' | 'contacted' | 'qualified' | 'lost' | 'won';
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

// Product interface - SRS Section 9.1
export interface Product {
    id: string;
    name: string;
    sku: string;
    price: number | string;
    priceSlabs?: any[];
    description: string;
    stock: number;
    sizes: string[];
    colors: string[];
    packingSize?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

// Order interface - SRS Section 10
export interface Order {
    id: string;
    orderNumber: string;
    leadId: string; // Changed from customerId
    lead?: Lead;
    totalAmount: number | string;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    inventoryReserved?: boolean;
    dispatchedAt?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

// Invoice interface - SRS Section 11
export interface Invoice {
    id: string;
    invoiceNumber: string;
    leadId: string; // Changed from customerId
    lead?: Lead;
    orderId?: string;
    items: Item[];
    taxRate: number | string;
    discount: number | string;
    discountType: 'flat' | 'percentage';
    currency: string;
    notes: string[];
    terms: string[];
    status: 'unpaid' | 'paid' | 'overdue' | 'cancelled';
    dueDate?: string;
    paymentTerms?: string;
    paymentMethod?: string;
    paymentReference?: string;
    paidAmount?: number | string;
    balanceDue?: number | string;
    bankDetails?: any;
    gstin?: string;
    pan?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

// Quotation interface - SRS Section 11
export interface Quotation {
    id: string;
    quotationNumber: string;
    leadId: string; // Changed from customerId
    lead?: Lead;
    items: Item[];
    taxRate: number | string;
    discount: number | string;
    discountType: 'flat' | 'percentage';
    currency: string;
    notes: string[];
    terms: string[];
    status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
    validUntil?: string;
    salesPersonId?: string;
    shippingAddress?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

// Inventory Transaction interface - SRS Section 13
export interface InventoryTransaction {
    id: string;
    productId: string;
    quantity: number;
    balanceBefore: number;
    balanceAfter: number;
    referenceType?: 'lead' | 'order' | 'invoice' | 'adjustment';
    referenceId?: string;
    notes?: string;
    createdBy?: string;
    createdAt?: string;
}

// Audit Log interface - SRS Section 29
export interface AuditLog {
    id: string;
    action: string;
    performedBy?: string;
    affectedEntity?: string;
    affectedEntityId?: string;
    oldValue?: any;
    newValue?: any;
    ipAddress?: string;
    timestamp?: string;
}
