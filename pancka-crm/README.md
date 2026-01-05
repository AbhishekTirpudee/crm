# Pancka CRM - T-Shirt E-Commerce Management System

A comprehensive Customer Relationship Management (CRM) system built with React and Vite for managing T-shirt e-commerce operations.

## Features

### 🎯 Core Modules

- **Dashboard**: Real-time statistics and overview of leads, customers, orders, and revenue
- **Leads Management**: Track and manage sales leads with status tracking (new, contacted, qualified, proposal, won, lost)
- **Customers**: Maintain a complete customer database with contact information
- **Products**: Manage T-shirt catalog with sizes, colors, and pricing
- **Orders**: Track customer orders with status management
- **Quotations**: Generate quotations with PDF export capability
- **Invoices**: Create and manage invoices with PDF generation
- **Authentication**: Secure login and registration system

### 🔧 Technical Features

- **React + Vite**: Fast, modern development environment
- **Context API**: State management for authentication and CRM data
- **React Router**: Client-side routing for navigation
- **PDF Generation**: jsPDF for creating quotations and invoices
- **Responsive Design**: Mobile-friendly interface
- **Local Storage**: Data persistence across sessions

## Project Structure

```
pancka-crm/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   └── DashboardLayout.jsx
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx
│   │   │   └── CRMContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Leads.jsx
│   │   │   ├── Customers.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── Orders.jsx
│   │   │   ├── Quotations.jsx
│   │   │   └── Invoices.jsx
│   │   ├── styles/
│   │   │   ├── index.css
│   │   │   ├── Auth.css
│   │   │   ├── Dashboard.css
│   │   │   ├── DashboardLayout.css
│   │   │   └── CRUDPages.css
│   │   ├── utils/
│   │   │   └── pdfGenerator.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── index.html
├── vite.config.js
├── package.json
└── README.md
```

## Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager

### Steps

1. **Navigate to project directory**
   ```bash
   cd pancka-crm
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

## Usage

### First Time Login

1. Go to the **Register** page and create a new account
2. Fill in your details (Name, Email, Password)
3. Click "Register" to create your account
4. You'll be automatically logged in and redirected to the Dashboard

### Dashboard

The dashboard displays:
- Total Leads count
- Total Customers count
- Total Orders count
- Total Revenue
- Recent leads and orders
- Conversion metrics

### Managing Leads

1. Click on **Leads** in the sidebar
2. Click **+ Add Lead** to create a new lead
3. Fill in the form with lead details
4. Select a status (new, contacted, qualified, proposal, won, lost)
5. Click "Add Lead" to save

### Managing Customers

1. Click on **Customers** in the sidebar
2. Click **+ Add Customer** to add a new customer
3. Fill in customer information (name, email, phone, address, city, country)
4. Click "Add Customer" to save

### Managing Products

1. Click on **Products** in the sidebar
2. Click **+ Add Product** to create a new product
3. Enter product details:
   - Product Name
   - SKU (Stock Keeping Unit)
   - Price
   - Available Sizes (comma-separated)
   - Available Colors (comma-separated)
   - Description
4. Click "Add Product" to save

### Creating Orders

1. Click on **Orders** in the sidebar
2. Click **+ Add Order** to create a new order
3. Select a customer from the dropdown
4. Set the order date and status
5. Enter the total amount
6. Click "Add Order" to save

### Generating Quotations

1. Click on **Quotations** in the sidebar
2. Click **+ Add Quotation** to create a new quotation
3. Select a customer
4. Set the valid until date
5. Enter the total amount
6. Click "Add Quotation" to save
7. Click the **PDF** button to download the quotation as a PDF

### Generating Invoices

1. Click on **Invoices** in the sidebar
2. Click **+ Add Invoice** to create a new invoice
3. Optionally select an order (auto-fills customer and amount)
4. Or manually select a customer
5. Set the due date and status
6. Enter the total amount
7. Click "Add Invoice" to save
8. Click the **PDF** button to download the invoice as a PDF

## Available Scripts

### Development
```bash
npm run dev
```
Starts the development server with hot module replacement.

### Build
```bash
npm run build
```
Creates an optimized production build.

### Preview
```bash
npm run preview
```
Preview the production build locally.

## Data Persistence

The application uses **localStorage** to persist data:
- User authentication data is stored in localStorage
- All CRM data (leads, customers, orders, etc.) is stored in React Context
- Data persists across browser sessions

**Note**: For a production application, you should connect this frontend to a backend database (MongoDB, PostgreSQL, etc.).

## Customization

### Changing Colors

Edit the CSS variables in `client/src/index.css`:
```css
:root {
  --primary: #2563eb;
  --primary-light: #3b82f6;
  --primary-dark: #1d4ed8;
  /* ... other colors ... */
}
```

### Adding New Pages

1. Create a new file in `client/src/pages/`
2. Import and add a new route in `client/src/App.jsx`
3. Add navigation item in `client/src/components/DashboardLayout.jsx`

### Modifying Forms

Edit the respective page component (e.g., `Leads.jsx`) to add or remove form fields.

## Future Enhancements

- Backend API integration (Node.js/Express)
- Database integration (MongoDB and PostgreSQL)
- Email notifications
- Advanced reporting and analytics
- Bulk operations
- User roles and permissions
- Payment gateway integration
- Multi-language support

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues, questions, or suggestions, please create an issue in the project repository.

---

**Built with ❤️ using React + Vite**
