import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { TrendingUp, Users, Star, MessageSquare } from 'lucide-react';
import TeacherSidebar from '../../components/teacher/TeacherSidebar';
import { fetchTeacherStats } from '../../api/teacher.api';
import './TeacherPortal.css';
import './TeacherStats.css';

const COLORS = ['#8b1425', '#D4AF37', '#a6192e', '#10B981', '#F59E0B', '#6366F1'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="ts-custom-tooltip">
        <p className="ts-tooltip-title">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color, fontWeight: 600 }}>
            {entry.name}: {entry.value} {entry.name === 'Rating' ? 'Stars' : ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const TeacherStats = () => {
    const [stats, setStats] = useState({
        overall: { totalCourses: 0, totalStudents: 0, totalReviews: 0, averageRating: 0 },
        courses: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const response = await fetchTeacherStats();
                if (response.success) {
                    setStats({
                        overall: response.data,
                        courses: response.data.individualCourseStats || []
                    });
                }
            } catch (error) {
                console.error('Error fetching teacher stats:', error);
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);

    if (loading) {
        return (
            <div className="tp-container">
                <TeacherSidebar />
                <div className="ts-main-content">
                    <div className="ts-loading-state">
                        <div className="ts-spinner"></div>
                        <p>Loading Course Analytics...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Prepare data for the pie chart (Status Distribution)
    const statusData = stats.courses.reduce((acc, course) => {
        const status = course.status || 'draft';
        const existing = acc.find(item => item.name === status);
        if (existing) {
            existing.value += 1;
        } else {
            acc.push({ name: status, value: 1 });
        }
        return acc;
    }, []);

    return (
        <div className="tp-container">
            <TeacherSidebar />
            <div className="ts-main-content">
            <div className="ts-dashboard-wrapper">
                
                {/* Header Section */}
                <div className="ts-header">
                    <div>
                        <div className="ts-badge">
                            <TrendingUp size={14} /> Analytics Hub
                        </div>
                        <h1>Course Statistics & Engagement</h1>
                        <p>Graphical breakdown of your student enrollments, course feedback, and overall performance metrics.</p>
                    </div>
                </div>

                {/* Overall KPI Cards */}
                <div className="ts-kpi-grid">
                    <div className="ts-kpi-card">
                        <div className="ts-kpi-icon" style={{ backgroundColor: 'rgba(166, 25, 46, 0.1)', color: '#8b1425' }}>
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <h3>{stats.overall.totalCourses}</h3>
                            <p>Total Courses</p>
                        </div>
                    </div>
                    <div className="ts-kpi-card">
                        <div className="ts-kpi-icon" style={{ backgroundColor: 'rgba(139, 20, 37, 0.1)', color: '#8b1425' }}>
                            <Users size={24} />
                        </div>
                        <div>
                            <h3>{stats.overall.totalStudents}</h3>
                            <p>Total Enrolled</p>
                        </div>
                    </div>
                    <div className="ts-kpi-card">
                        <div className="ts-kpi-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
                            <MessageSquare size={24} />
                        </div>
                        <div>
                            <h3>{stats.overall.totalReviews}</h3>
                            <p>Total Reviews</p>
                        </div>
                    </div>
                    <div className="ts-kpi-card">
                        <div className="ts-kpi-icon" style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)', color: '#D4AF37' }}>
                            <Star size={24} />
                        </div>
                        <div>
                            <h3>{stats.overall.averageRating ? stats.overall.averageRating.toFixed(1) : 0}</h3>
                            <p>Average Rating</p>
                        </div>
                    </div>
                </div>

                {/* Primary Chart: Enrollment & Reviews */}
                {stats.courses.length > 0 ? (
                    <>
                        <div className="ts-chart-section">
                            <div className="ts-chart-card full-width">
                                <h2>Enrollment & Engagement per Course</h2>
                                <div className="ts-chart-wrapper" style={{ height: 400 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={stats.courses}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                            <XAxis 
                                                dataKey="name" 
                                                tick={{ fill: '#6b7280', fontSize: 12 }} 
                                                tickMargin={15}
                                                angle={-35}
                                                textAnchor="end"
                                                interval={0}
                                            />
                                            <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                                            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6' }} />
                                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                            <Bar dataKey="students" name="Students" fill="#8b1425" radius={[4, 4, 0, 0]} maxBarSize={60} />
                                            <Bar dataKey="reviews" name="Reviews" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={60} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Secondary Charts: Ratings & Status */}
                        <div className="ts-chart-grid">
                            <div className="ts-chart-card">
                                <h2>Average Rating Distribution</h2>
                                <div className="ts-chart-wrapper">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart
                                            data={stats.courses}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                            <XAxis 
                                                dataKey="name" 
                                                tick={{ fill: '#6b7280', fontSize: 11 }}
                                                tickFormatter={(value) => value.length > 12 ? value.substring(0, 10) + '...' : value}
                                                angle={-25}
                                                textAnchor="end"
                                            />
                                            <YAxis domain={[0, 5]} tickCount={6} tick={{ fill: '#6b7280', fontSize: 12 }} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Line type="monotone" dataKey="rating" name="Rating" stroke="#8b1425" strokeWidth={3} activeDot={{ r: 8 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="ts-chart-card">
                                <h2>Course Status Breakdown</h2>
                                <div className="ts-chart-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={statusData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={5}
                                                dataKey="value"
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            >
                                                {statusData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => [value, 'Courses']} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="ts-empty-state">
                        <TrendingUp size={48} color="#d1d5db" />
                        <h3>No Analytics Data Available</h3>
                        <p>Create and publish courses to start tracking student enrollments and performance metrics.</p>
                    </div>
                )}
            </div>
        </div>
    </div>
);
};

export default TeacherStats;
