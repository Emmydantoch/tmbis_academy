import { useState } from 'react';
import SidebarLayout from './SidebarLayout';

export default function AdminPayments() {
    const [filterStatus, setFilterStatus] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");

    const payments = [
    {
        id: "INV-2023-9021",
        student: "Julian Alvarez",
        level: "Graduate",
        description: "Tuition Fee - Semester 1",
        date: "Oct 24, 2023",
        status: "Paid",
        amount: "4500.00"
    },
    {
        id: "INV-2023-9044",
        student: "Sarah Chen",
        level: "Undergrad",
        description: "Library Late Fees",
        date: "Oct 26, 2023",
        status: "Overdue",
        amount: "45.00"
    },
    {
        id: "INV-2023-9088",
        student: "Marcus Wright",
        level: "Undergrad",
        description: "Lab Materials (Chemistry)",
        date: "Oct 28, 2023",
        status: "Pending",
        amount: "120.00"
    },
    {
        id: "INV-2023-9102",
        student: "Elena Lopez",
        level: "Doctorate",
        description: "Thesis Publication Fee",
        date: "Oct 29, 2023",
        status: "Paid",
        amount: "350.00"
    }
    ];

    const filteredPayments = payments.filter(payment => 
    (filterStatus === "All" || payment.status === filterStatus) &&
    (payment.student.toLowerCase().includes(searchTerm.toLowerCase()) || 
        payment.id.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const navItems = [
        { icon: 'home', label: 'Home', to: '/' },
        { icon: 'dashboard', label: 'Dashboard', to: '/admin/dashboard' },
        { icon: 'people', label: 'Users', to: '/admin/users' },
        { icon: 'school', label: 'Courses', to: '/admin/courses' },
        { icon: 'account_balance_wallet', label: 'Payments', to: '/admin/payments', active: true },
        { icon: 'assessment', label: 'Reports', to: '/admin/reports' },
    ];

    return (
    <SidebarLayout
        title="TMBIS Academy"
        subtitle="Admin Portal"
        headerTitle="Payment History"
        navItems={navItems}
        showSearch
        searchPlaceholder="Search students or invoice..."
        headerActions={
            <div className="relative hidden sm:block">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search students or invoice..." 
                    className="w-72 rounded-full border border-outline-variant bg-surface-container-lowest py-2 pl-10 pr-4 focus:border-primary focus:outline-none"
                />
            </div>
        }
    >
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
            {/* KPI Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-surface-container p-8 rounded-3xl border-l-4 border-primary">
                <p className="text-on-surface-variant uppercase tracking-widest text-sm">Total Revenue</p>
                <p className="text-4xl font-bold text-primary mt-2">$1,248,300</p>
                <p className="text-primary text-sm mt-2">+12.5% from last year</p>
            </div>
            <div className="bg-surface-container p-8 rounded-3xl border-l-4 border-error">
                <p className="text-on-surface-variant uppercase tracking-widest text-sm">Overdue</p>
                <p className="text-4xl font-bold text-primary mt-2">$12,800</p>
                <p className="text-error text-sm mt-2">8 critical payments</p>
            </div>
            <div className="bg-surface-container p-8 rounded-3xl border-l-4 border-secondary">
                <p className="text-on-surface-variant uppercase tracking-widest text-sm">Pending</p>
                <p className="text-4xl font-bold text-primary mt-2">$42,150</p>
                <p className="text-secondary text-sm mt-2">24 active invoices</p>
            </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-8">
            {["All", "Paid", "Pending", "Overdue"].map(status => (
                <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-6 py-3 rounded-2xl text-sm font-medium transition-all ${
                    filterStatus === status 
                    ? 'bg-primary text-on-primary' 
                    : 'bg-surface-container border border-outline-variant hover:border-primary'
                }`}
                >
                {status}
                </button>
            ))}
            </div>

            {/* Payment Table */}
            <div className="bg-surface-container rounded-3xl overflow-hidden border border-outline-variant">
            <table className="w-full">
                <thead>
                <tr className="border-b border-outline-variant">
                    <th className="text-left px-8 py-5 font-label-md text-on-surface-variant uppercase text-xs tracking-widest">Student</th>
                    <th className="text-left px-8 py-5 font-label-md text-on-surface-variant uppercase text-xs tracking-widest">Invoice #</th>
                    <th className="text-left px-8 py-5 font-label-md text-on-surface-variant uppercase text-xs tracking-widest">Description</th>
                    <th className="text-left px-8 py-5 font-label-md text-on-surface-variant uppercase text-xs tracking-widest">Date</th>
                    <th className="text-left px-8 py-5 font-label-md text-on-surface-variant uppercase text-xs tracking-widest">Status</th>
                    <th className="text-right px-8 py-5 font-label-md text-on-surface-variant uppercase text-xs tracking-widest">Amount</th>
                    <th></th>
                </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-surface-container-high transition-colors">
                    <td className="px-8 py-6">
                        <div className="font-medium text-on-surface">{payment.student}</div>
                        <div className="text-xs text-on-surface-variant">{payment.level}</div>
                    </td>
                    <td className="px-8 py-6 font-mono text-on-surface-variant">{payment.id}</td>
                    <td className="px-8 py-6 text-on-surface">{payment.description}</td>
                    <td className="px-8 py-6 text-on-surface-variant text-sm">{payment.date}</td>
                    <td className="px-8 py-6">
                        <span className={`inline-flex px-4 py-1 rounded-full text-xs font-medium ${
                        payment.status === "Paid" ? "bg-primary/10 text-primary" :
                        payment.status === "Overdue" ? "bg-error/10 text-error" : 
                        "bg-secondary/10 text-secondary"
                        }`}>
                        {payment.status}
                        </span>
                    </td>
                    <td className="px-8 py-6 text-right font-bold text-primary">${payment.amount}</td>
                    <td className="px-8 py-6 text-right">
                        <button className="p-2 hover:bg-surface-container rounded-xl transition-colors">
                        <span className="material-symbols-outlined">more_vert</span>
                        </button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        </div>
    </SidebarLayout>
    );
}