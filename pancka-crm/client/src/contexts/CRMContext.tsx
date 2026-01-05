import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import API from "../services/api";
import { Lead, Customer, Product, Order, Quotation, Invoice } from "../types";
import { useAuth } from "./AuthContext";

interface CRMContextType {
  leads: Lead[];
  customers: Customer[];
  products: Product[];
  orders: Order[];
  quotations: Quotation[];
  invoices: Invoice[];
  addLead: (data: Partial<Lead>) => Promise<void>;
  updateLead: (id: string, data: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  addCustomer: (data: Partial<Customer>) => Promise<void>;
  updateCustomer: (id: string, data: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  addProduct: (data: Partial<Product>) => Promise<void>;
  updateProduct: (id: string, data: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addOrder: (data: Partial<Order>) => Promise<void>;
  updateOrder: (id: string, data: Partial<Order>) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  addQuotation: (data: Partial<Quotation>) => Promise<void>;
  updateQuotation: (id: string, data: Partial<Quotation>) => Promise<void>;
  deleteQuotation: (id: string) => Promise<void>;
  addInvoice: (data: Partial<Invoice>) => Promise<void>;
  updateInvoice: (id: string, data: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const CRMProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const { isAuthenticated } = useAuth();

  const handleError = (error: any, message: string) => {
    console.error(message, error);
    alert(`${message}: ${error.response?.data?.message || error.message}`);
  };

  /* ================= FETCH ================= */

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [l, c, p, o, q, i] = await Promise.all([
          API.get("/leads"),
          API.get("/customers"),
          API.get("/products"),
          API.get("/orders"),
          API.get("/quotations"),
          API.get("/invoices"),
        ]);
        setLeads(l.data);
        setCustomers(c.data);
        setProducts(p.data);
        setOrders(o.data);
        setQuotations(q.data);
        setInvoices(i.data);
      } catch (err) {
        console.error("Initial fetch failed:", err);
      }
    };

    if (isAuthenticated) {
      fetchData();
    } else {
      // Clear data on logout
      setLeads([]);
      setCustomers([]);
      setProducts([]);
      setOrders([]);
      setQuotations([]);
      setInvoices([]);
    }
  }, [isAuthenticated]);

  /* ================= LEADS ================= */

  const addLead = async (data: Partial<Lead>) => {
    try {
      const res = await API.post("/leads", data);
      setLeads(prev => [...prev, res.data]);
    } catch (err) {
      handleError(err, "Failed to add lead");
    }
  };

  const updateLead = async (id: string, data: Partial<Lead>) => {
    try {
      const res = await API.put(`/leads/${id}`, data);
      setLeads(prev => prev.map(l => l.id === id ? res.data : l));
    } catch (err) {
      handleError(err, "Failed to update lead");
    }
  };

  const deleteLead = async (id: string) => {
    try {
      await API.delete(`/leads/${id}`);
      setLeads(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      handleError(err, "Failed to delete lead");
    }
  };

  /* ================= CUSTOMERS ================= */

  const addCustomer = async (data: Partial<Customer>) => {
    try {
      const res = await API.post("/customers", data);
      setCustomers(prev => [...prev, res.data]);
    } catch (err) {
      handleError(err, "Failed to add customer");
    }
  };

  const updateCustomer = async (id: string, data: Partial<Customer>) => {
    try {
      const res = await API.put(`/customers/${id}`, data);
      setCustomers(prev => prev.map(c => c.id === id ? res.data : c));
    } catch (err) {
      handleError(err, "Failed to update customer");
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      await API.delete(`/customers/${id}`);
      setCustomers(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      handleError(err, "Failed to delete customer");
    }
  };

  /* ================= PRODUCTS ================= */

  const addProduct = async (data: Partial<Product>) => {
    try {
      const res = await API.post("/products", data);
      setProducts(prev => [...prev, res.data]);
    } catch (err) {
      handleError(err, "Failed to add product");
    }
  };

  const updateProduct = async (id: string, data: Partial<Product>) => {
    try {
      const res = await API.put(`/products/${id}`, data);
      setProducts(prev => prev.map(p => p.id === id ? res.data : p));
    } catch (err) {
      handleError(err, "Failed to update product");
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await API.delete(`/products/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      handleError(err, "Failed to delete product");
    }
  };

  /* ================= ORDERS ================= */

  const addOrder = async (data: Partial<Order>) => {
    try {
      const res = await API.post("/orders", data);
      setOrders(prev => [...prev, res.data]);
    } catch (err) {
      handleError(err, "Failed to add order");
    }
  };

  const updateOrder = async (id: string, data: Partial<Order>) => {
    try {
      const res = await API.put(`/orders/${id}`, data);
      setOrders(prev => prev.map(o => o.id === id ? res.data : o));
    } catch (err) {
      handleError(err, "Failed to update order");
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      await API.delete(`/orders/${id}`);
      setOrders(prev => prev.filter(o => o.id !== id));
    } catch (err) {
      handleError(err, "Failed to delete order");
    }
  };

  /* ================= QUOTATIONS ================= */

  const addQuotation = async (data: any) => {
    try {
      const res = await API.post("/quotations", data, {
        headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}
      });
      setQuotations(prev => [...prev, res.data.quotation || res.data]);
    } catch (err) {
      handleError(err, "Failed to add quotation");
    }
  };

  const updateQuotation = async (id: string, data: Partial<Quotation>) => {
    try {
      const res = await API.put(`/quotations/${id}`, data);
      setQuotations(prev => prev.map(q => q.id === id ? res.data : q));
    } catch (err) {
      handleError(err, "Failed to update quotation");
    }
  };

  const deleteQuotation = async (id: string) => {
    try {
      await API.delete(`/quotations/${id}`);
      setQuotations(prev => prev.filter(q => q.id !== id));
    } catch (err) {
      handleError(err, "Failed to delete quotation");
    }
  };

  /* ================= INVOICES ================= */

  const addInvoice = async (data: any) => {
    try {
      const res = await API.post("/invoices", data, {
        headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}
      });
      setInvoices(prev => [...prev, res.data.invoice || res.data]);
    } catch (err) {
      handleError(err, "Failed to add invoice");
    }
  };

  const updateInvoice = async (id: string, data: Partial<Invoice>) => {
    try {
      const res = await API.put(`/invoices/${id}`, data);
      setInvoices(prev => prev.map(i => i.id === id ? res.data : i));
    } catch (err) {
      handleError(err, "Failed to update invoice");
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      await API.delete(`/invoices/${id}`);
      setInvoices(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      handleError(err, "Failed to delete invoice");
    }
  };

  return (
    <CRMContext.Provider value={{
      leads, customers, products, orders, quotations, invoices,
      addLead, updateLead, deleteLead,
      addCustomer, updateCustomer, deleteCustomer,
      addProduct, updateProduct, deleteProduct,
      addOrder, updateOrder, deleteOrder,
      addQuotation, updateQuotation, deleteQuotation,
      addInvoice, updateInvoice, deleteInvoice
    }}>
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (context === undefined) {
    throw new Error("useCRM must be used within a CRMProvider");
  }
  return context;
};
