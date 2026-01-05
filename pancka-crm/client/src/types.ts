export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'user';
}

export interface Item {
    id?: string;
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

export interface Lead {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: 'new' | 'contacted' | 'qualified' | 'lost';
    createdAt?: string;
    updatedAt?: string;
}

export interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Product {
    id: string;
    name: string;
    sku: string;
    price: number | string;
    description: string;
    stock: number;
    sizes: string[];
    colors: string[];
    createdAt?: string;
    updatedAt?: string;
}

export interface Order {
    id: string;
    orderNumber: string;
    customerId: string;
    totalAmount: number | string;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    createdAt?: string;
    updatedAt?: string;
}

export interface Invoice {
    id: string;
    invoiceNumber: string;
    customerId: string;
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
    createdAt?: string;
    updatedAt?: string;
}

export interface Quotation {
    id: string;
    quotationNumber: string;
    customerId: string;
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
    createdAt?: string;
    updatedAt?: string;
}
