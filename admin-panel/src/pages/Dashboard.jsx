import React, { useState, useEffect } from 'react';
import {
  Treemap, Tooltip, Legend,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from 'recharts';
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

      if (!token) {
        setError("No token found. Please login again.");
        setLoading(false);
        return;
      }

      const res = await fetch('http://localhost:5000/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to fetch stats");

      // ✅ SAFE SET (IMPORTANT FIX)
      setStats({
        totalPatients: data.totalPatients || 0,
        totalDoctors: data.totalDoctors || 0,
        pendingApprovals: data.pendingApprovals || 0,
        specializationStats: data.specializationStats || [],
        registrationStats: data.registrationStats || []
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Teal/white brand palette for the specialization tiles (matches app icon)
  const COLORS = ['#14B8A6', '#0D9488', '#5EEAD4', '#0F766E', '#99F6E4', '#134E4A'];

  // Custom rounded, colored tile for the treemap — falls back to no
  // label when a tile is too small to hold text legibly.
  const TreemapTile = (props) => {
    const { x, y, width, height, index, name, value } = props;
    const fill = COLORS[index % COLORS.length];
    const showLabel = width > 70 && height > 44;
    const showValueOnly = !showLabel && width > 36 && height > 24;

    return (
      <g>
        <rect
          x={x} y={y} width={width} height={height}
          rx={10} ry={10}
          style={{ fill, stroke: '#ffffff', strokeWidth: 3 }}
        />
        {showLabel && (
          <>
            <text x={x + width / 2} y={y + height / 2 - 7} textAnchor="middle"
              fill="#ffffff" fontSize={14} fontWeight={700}>
              {name}
            </text>
            <text x={x + width / 2} y={y + height / 2 + 13} textAnchor="middle"
              fill="rgba(255,255,255,0.85)" fontSize={12}>
              {value} doctor{value !== 1 ? "s" : ""}
            </text>
          </>
        )}
        {showValueOnly && (
          <text x={x + width / 2} y={y + height / 2 + 4} textAnchor="middle"
            fill="#ffffff" fontSize={13} fontWeight={700}>
            {value}
          </text>
        )}
      </g>
    );
  };

  const CustomTooltipTreemap = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const node = payload[0].payload ?? payload[0];
      const total = (stats.specializationStats || []).reduce(
        (sum, entry) => sum + entry.value,
        0
      );
      const percent = total ? ((node.value / total) * 100).toFixed(1) : 0;

      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{node.name}</p>
          <p>{`${percent}% of our doctors`}</p>
          <p>{`Count: ${node.value}`}</p>
        </div>
      );
    }
    return null;
  };

  const CustomTooltipArea = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry) => (
            <p key={entry.dataKey} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
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

      {/* 🔹 SUMMARY CARDS */}
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

      {/* 🔹 CHARTS */}
      <div className="charts-container">

        {/* TREEMAP */}
        <div className="chart-card pie-chart-card">
          <h3>Doctor Specializations</h3>

          {stats.specializationStats &&
          stats.specializationStats.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={260}>
                <Treemap
                  data={stats.specializationStats}
                  dataKey="value"
                  nameKey="name"
                  stroke="#ffffff"
                  content={<TreemapTile />}
                  isAnimationActive={false}
                >
                  <Tooltip content={<CustomTooltipTreemap />} />
                </Treemap>
              </ResponsiveContainer>

              {/* Custom legend — Treemap doesn't render one on its own */}
              <div className="treemap-legend">
                {stats.specializationStats.map((entry, index) => (
                  <div key={entry.name} className="treemap-legend-item">
                    <span
                      className="treemap-legend-swatch"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    {entry.name}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="no-data">No specialization data</div>
          )}
        </div>

        {/* GLOWING GRADIENT AREA CHART */}
        <div className="chart-card area-chart-card">
          <h3>Monthly Growth</h3>

          {stats.registrationStats &&
          stats.registrationStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats.registrationStats} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  {/* Gradient fills */}
                  <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.55} />
                    <stop offset="95%" stopColor="#14B8A6" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="colorDoctors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F766E" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#0F766E" stopOpacity={0.02} />
                  </linearGradient>

                  {/* Glow filters for the line strokes */}
                  <filter id="glowPatients" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id="glowDoctors" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-very-light)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} axisLine={{ stroke: 'var(--color-border-very-light)' }} tickLine={false} />
                <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltipArea />} />
                <Legend />

                <Area
                  type="monotone"
                  dataKey="patients"
                  name="Patients"
                  stroke="#14B8A6"
                  strokeWidth={3}
                  fill="url(#colorPatients)"
                  fillOpacity={1}
                  filter="url(#glowPatients)"
                  activeDot={{ r: 5, fill: '#14B8A6', stroke: '#ffffff', strokeWidth: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="doctors"
                  name="Doctors"
                  stroke="#0F766E"
                  strokeWidth={3}
                  fill="url(#colorDoctors)"
                  fillOpacity={1}
                  filter="url(#glowDoctors)"
                  activeDot={{ r: 5, fill: '#0F766E', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">No registration data</div>
          )}
        </div>

      </div>
    </div>
  );
}
