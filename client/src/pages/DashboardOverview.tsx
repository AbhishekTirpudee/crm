import React from 'react';
import { useCRM } from '../contexts/CRMContext';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell
} from 'recharts';

export const DashboardOverview: React.FC = () => {
    const { leads, orders } = useCRM();

    // Mock data for demonstration - in real app, process 'leads' and 'orders' by date
    const monthlyData = [
        { name: 'Jan', orders: 40, leads: 24 },
        { name: 'Feb', orders: 30, leads: 13 },
        { name: 'Mar', orders: 20, leads: 98 },
        { name: 'Apr', orders: 27, leads: 39 },
        { name: 'May', orders: 18, leads: 48 },
        { name: 'Jun', orders: 23, leads: 38 },
    ];

    const pieData = [
        { name: 'Won', value: leads.filter(l => (l.status as string) === 'won').length || 1 },
        { name: 'New', value: leads.filter(l => (l.status as string) === 'new').length || 1 },
        { name: 'Lost', value: leads.filter(l => (l.status as string) === 'lost').length || 1 },
    ];

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    const todaysLeads = leads.slice(0, 5).map(l => l.name).join('  •  ');

    return (
        <div className="dashboard-overview space-y-6">
            {/* Running Line Ticker */}
            <div className="bg-blue-100 p-2 rounded-md overflow-hidden whitespace-nowrap">
                <div className="animate-marquee inline-block text-blue-800 font-semibold">
                    Today's Leads: {todaysLeads || "No new leads today"}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Performance */}
                <div className="bg-white p-4 rounded shadow">
                    <h3 className="text-lg font-bold mb-4">Monthly Performance</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="orders" stroke="#8884d8" activeDot={{ r: 8 }} />
                                <Line type="monotone" dataKey="leads" stroke="#82ca9d" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Lead Status Distribution */}
                <div className="bg-white p-4 rounded shadow">
                    <h3 className="text-lg font-bold mb-4">Lead Status Distribution</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Yearly Report (Histogram) */}
                <div className="bg-white p-4 rounded shadow col-span-1 lg:col-span-2">
                    <h3 className="text-lg font-bold mb-4">Yearly Sales Report</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="orders" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};
