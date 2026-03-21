import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalPatients: 0,
        totalDoctors: 0,
        pendingApprovals: 0,
        specializationStats: [],
        registrationStats: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/admin/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Failed to fetch stats');

            setStats(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    const CustomTooltipPie = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const total = stats.specializationStats.reduce((sum, entry) => sum + entry.value, 0);
            const percent = ((payload[0].value / total) * 100).toFixed(1);
            return (
                <div className="custom-tooltip">
                    <p>{`${percent}% of our doctors are ${payload[0].name}`}</p>
                    <p>{`Calculated: ${payload[0].value} doctors`}</p>
                </div>
            );
        }
        return null;
    };

    if (loading) return <div className="loading">Loading dashboard...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="dashboard-container">
            <h2 className="page-title">Dashboard Overview</h2>

            {/* Summary Cards */}
            <div className="summary-cards">
                <div className="summary-card stat-card-1">
                    <div className="card-info">
                        <h4>Total Patients</h4>
                        <h2>{stats.totalPatients}</h2>
                    </div>
                    <div className="card-icon">👥</div>
                </div>
                <div className="summary-card stat-card-2">
                    <div className="card-info">
                        <h4>Total Doctors</h4>
                        <h2>{stats.totalDoctors}</h2>
                    </div>
                    <div className="card-icon">🩺</div>
                </div>
                <div className="summary-card stat-card-3">
                    <div className="card-info">
                        <h4>Pending Approvals</h4>
                        <h2>{stats.pendingApprovals}</h2>
                    </div>
                    <div className="card-icon">⏳</div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="charts-container">
                <div className="chart-card pie-chart-card"> 
                    <h3>Doctor Specializations</h3>
                    {stats.specializationStats.length > 0 ? (
                        <div className="chart-wrapper">
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={stats.specializationStats}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                        labelLine={false}
                                    >
                                        {stats.specializationStats.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltipPie />} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="no-data">No specialization data available</div>
                    )}
                </div>

                <div className="chart-card line-chart-card">
                    <h3>Monthly Growth</h3>
                    {stats.registrationStats.length > 0 ? (
                        <div className="chart-wrapper">
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={stats.registrationStats}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="patients" stroke="#8884d8" name="Patients" strokeWidth={3} activeDot={{ r: 8 }} />
                                    <Line type="monotone" dataKey="doctors" stroke="#82ca9d" name="Doctors" strokeWidth={3} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="no-data">No registration data available</div>
                    )}
                </div>
            </div>
        </div>
    );
}
