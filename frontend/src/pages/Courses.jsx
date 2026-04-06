import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchPublicCourses } from '../api/course.api';
import './Courses.css';

const DEFAULT_FILTERS = ['All', 'SOT', 'SOET', 'SLS', 'SOL'];
const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'ratingHighToLow', label: 'Top Rated' },
    { value: 'priceLowToHigh', label: 'Price: Low to High' },
    { value: 'priceHighToLow', label: 'Price: High to Low' }
];

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 9,
        totalPages: 0,
        hasPrev: false,
        hasNext: false
    });

    const { user } = useAuth();

    const filters = useMemo(() => {
        if (user?.role === 'student' && user.school) {
            return ['All', user.school];
        }

        return DEFAULT_FILTERS;
    }, [user]);

    useEffect(() => {
        const timerId = setTimeout(() => {
            setSearchTerm(searchInput.trim());
            setCurrentPage(1);
        }, 350);

        return () => clearTimeout(timerId);
    }, [searchInput]);

    useEffect(() => {
        const loadCourses = async () => {
            try {
                setLoading(true);
                setError('');

                const params = {
                    page: currentPage,
                    limit: 9,
                    sort: sortBy
                };

                if (activeFilter !== 'All') {
                    params.category = activeFilter;
                }

                if (searchTerm) {
                    params.search = searchTerm;
                }

                if (user?.role === 'student' && user.school) {
                    params.school = user.school;
                }

                const response = await fetchPublicCourses(params);
                if (response.success) {
                    const courseList = Array.isArray(response.data) ? response.data : [];
                    const paginationData = response.pagination || {
                        total: courseList.length,
                        page: 1,
                        limit: courseList.length || 9,
                        totalPages: courseList.length ? 1 : 0,
                        hasPrev: false,
                        hasNext: false
                    };

                    setCourses(courseList);
                    setPagination(paginationData);
                } else {
                    setError(response.message || 'Unable to load courses right now.');
                }
            } catch (err) {
                console.error('Error fetching courses:', err);
                setError('Failed to load courses. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        loadCourses();
    }, [activeFilter, searchTerm, sortBy, currentPage, user]);

    const clearAllFilters = () => {
        setActiveFilter('All');
        setSearchInput('');
        setSearchTerm('');
        setSortBy('newest');
        setCurrentPage(1);
    };

    const handleFilterChange = (filter) => {
        setActiveFilter(filter);
        setCurrentPage(1);
    };

    const handleSortChange = (event) => {
        setSortBy(event.target.value);
        setCurrentPage(1);
    };

    if (loading && courses.length === 0) {
        return <div className="courses-loading">Loading courses...</div>;
    }

    return (
        <div className="courses-page">
            <header className="courses-header">
                <h1>All Courses</h1>
                <p>Explore our wide range of courses and start learning today.</p>

                {/* Search Bar */}
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search for courses, technologies..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="search-input"
                    />
                </div>

                {/* Filter Buttons */}
                <div className="filter-container">
                    {filters.map(filter => (
                        <button
                            key={filter}
                            className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
                            onClick={() => handleFilterChange(filter)}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </header>

            <div className="courses-grid-container">
                <div className="catalog-toolbar">
                    <p className="results-count">
                        {pagination.total} course{pagination.total === 1 ? '' : 's'} found
                    </p>

                    <div className="catalog-actions">
                        <select
                            value={sortBy}
                            onChange={handleSortChange}
                            className="sort-select"
                        >
                            {SORT_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>

                        <button type="button" className="clear-filters-btn" onClick={clearAllFilters}>
                            Clear Filters
                        </button>
                    </div>
                </div>

                {error ? (
                    <p className="no-courses">{error}</p>
                ) : courses.length === 0 ? (
                    <p className="no-courses">No courses match your current filters.</p>
                ) : (
                    <div className="courses-grid">
                        {courses.map((course) => (
                            <Link key={course._id} to={`/course/${course.slug}`} className="course-card-item">
                                <div
                                    className="course-thumb"
                                    style={course.thumbnail ? { backgroundImage: `url(${course.thumbnail})` } : {}}
                                ></div>
                                <div className="course-info">
                                    <h3>{course.name}</h3>
                                    <p className="instructor">By {course.instructor?.name || 'Instructor'}</p>
                                    <div className="course-meta">
                                        <span className="price">{course.price > 0 ? `₹${course.price}` : 'Free'}</span>
                                        <span className="rating">★ {course.stats?.rating?.toFixed?.(1) || '0.0'}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {pagination.totalPages > 1 && (
                    <div className="pagination-controls">
                        <button
                            type="button"
                            className="pagination-btn"
                            disabled={!pagination.hasPrev || loading}
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        >
                            Previous
                        </button>

                        <span className="page-indicator">
                            Page {pagination.page} of {pagination.totalPages}
                        </span>

                        <button
                            type="button"
                            className="pagination-btn"
                            disabled={!pagination.hasNext || loading}
                            onClick={() => setCurrentPage((prev) => prev + 1)}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Courses;
