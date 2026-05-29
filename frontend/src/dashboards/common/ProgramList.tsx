import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronDown, Plus, Minus, ArrowUp } from 'lucide-react';
import axios from 'axios';
import { config } from '../../config';
import { programCurriculumList } from '../../data/programCurriculums';
import './ProgramList.css';

const ProgramList = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedIndex, setExpandedIndex] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [degreeFilter, setDegreeFilter] = useState('');
    const [pathwayFilter, setPathwayFilter] = useState('');

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                // Fetch public approved courses
                const res = await axios.get(`${config.API_URL}/courses`);
                const payload = res.data;
                setCourses(Array.isArray(payload.data) ? payload.data : Array.isArray(payload) ? payload : []);
            } catch (error) {
                console.error("Error fetching courses:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    const toggleAccordion = (index) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Group courses by category
    const groupedCourses = courses.reduce((acc, course) => {
        const cat = course.category || "General";
        if (!acc[cat]) {
            acc[cat] = [];
        }
        acc[cat].push(course);
        return acc;
    }, {});

    // Filter categories and courses based on search term + dropdowns
    const filterTerm = searchTerm.toLowerCase();

    // Degree filter keywords map
    const degreeKeywords = {
        bcom: ['bcom', 'b.com', 'bachelor of commerce'],
        bba: ['bba', 'bachelor of business administration'],
    };

    const matchesDegree = (text) => {
        if (!degreeFilter) return true;
        const keywords = degreeKeywords[degreeFilter] || [];
        const lower = text.toLowerCase();
        return keywords.some(k => lower.includes(k));
    };

    const matchesPathway = (text) => {
        if (!pathwayFilter) return true;
        return text.toLowerCase().includes(pathwayFilter.toLowerCase());
    };

    const curriculumCategories = programCurriculumList
        .filter(program => {
            const searchable = `${program.title} ${program.shortTitle} curriculum ${program.description}`;
            // Search filter
            if (filterTerm && !searchable.toLowerCase().includes(filterTerm)) return false;
            // Degree filter
            if (!matchesDegree(searchable)) return false;
            // Pathway filter — check specializations if they exist, or title/description
            if (pathwayFilter) {
                const specNames = (program.specializations || []).map(s => s.name).join(' ');
                const allText = `${searchable} ${specNames}`;
                if (!matchesPathway(allText)) return false;
            }
            return true;
        })
        .map(program => ({
            title: program.title,
            programs: [
                {
                    name: `${program.shortTitle} Course Curriculum (${program.batch})`,
                    link: `/academics/programs/${program.slug}`,
                    description: `${program.semesters.length} semesters - ${program.totalCredits} credits`,
                },
            ],
            available: 1,
        }));

    const filteredCategories = [
        ...curriculumCategories,
        ...Object.keys(groupedCourses)
        .filter(cat => {
            const catLower = cat.toLowerCase();
            const coursesInCat = groupedCourses[cat];
            // Search: category matches OR any course inside matches
            const searchMatch = !filterTerm || catLower.includes(filterTerm) ||
                coursesInCat.some(c => c.name.toLowerCase().includes(filterTerm));
            if (!searchMatch) return false;
            // Degree: category name should match
            if (degreeFilter && !matchesDegree(cat)) {
                // Also check if any course name matches the degree
                const anyMatch = coursesInCat.some(c => matchesDegree(c.name));
                if (!anyMatch) return false;
            }
            // Pathway
            if (pathwayFilter) {
                const anyMatch = coursesInCat.some(c => matchesPathway(c.name));
                if (!matchesPathway(cat) && !anyMatch) return false;
            }
            return true;
        })
        .map(cat => {
            const catLower = cat.toLowerCase();
            const catMatches = catLower.includes(filterTerm);
            let filteredProgs = groupedCourses[cat];

            // Narrow down courses by search
            if (!catMatches && filterTerm) {
                filteredProgs = filteredProgs.filter(c => c.name.toLowerCase().includes(filterTerm));
            }
            // Narrow down by pathway
            if (pathwayFilter) {
                filteredProgs = filteredProgs.filter(c => matchesPathway(c.name));
            }

            return {
                title: cat,
                programs: filteredProgs,
                available: filteredProgs.length
            };
        })
        .filter(cat => cat.programs.length > 0)
    ];

    return (
        <div className="programs-page">
            {/* Hero Section */}
            <div className="programs-hero">
                <div className="programs-hero-content">
                    <h1>Programs and Courses</h1>
                </div>
            </div>

            {/* Main Content */}
            <div className="programs-content-wrapper">
                <p className="programs-intro-text">
                    Explore SLS online degree programs, semester-wise course curriculum, credit structure, and available courses. Open a program below to view the complete curriculum in a clean semester-by-semester format.
                </p>

                {/* Filter Bar */}
                <div className="programs-filter-bar">
                    <div className="search-group">
                        <input 
                            type="text" 
                            placeholder="Search by keyword or program name..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search size={18} className="search-icon" />
                    </div>
                    <button className="find-btn" onClick={() => setExpandedIndex(null)}>Find</button>
                    
                    <div className="select-group">
                        <select value={degreeFilter} onChange={(e) => { setDegreeFilter(e.target.value); setExpandedIndex(null); }}>
                            <option value="">All Degrees</option>
                            <option value="bcom">B.Com</option>
                            <option value="bba">BBA</option>
                        </select>
                        <ChevronDown size={18} className="select-icon" />
                    </div>

                    <div className="select-group">
                        <select value={pathwayFilter} onChange={(e) => { setPathwayFilter(e.target.value); setExpandedIndex(null); }}>
                            <option value="">All Pathways</option>
                            <option value="business">Business</option>
                            <option value="finance">Finance</option>
                            <option value="marketing">Marketing</option>
                            <option value="human resource">Human Resource</option>
                        </select>
                        <ChevronDown size={18} className="select-icon" />
                    </div>
                </div>

                {/* Accordion List */}
                <div className="programs-accordion-list">
                    {filteredCategories.length === 0 ? (
                        <p style={{textAlign: 'center', padding: '40px', color: '#666'}}>No programs match your search.</p>
                    ) : (
                        filteredCategories.map((item, index) => {
                            const isExpanded = expandedIndex === index;
                            return (
                                <div className={`accordion-item ${isExpanded ? 'expanded' : ''}`} key={index}>
                                    <div className="accordion-header" onClick={() => toggleAccordion(index)}>
                                        <h2>{item.title}</h2>
                                        <button className="toggle-btn">
                                            {isExpanded ? <Minus size={24} /> : <Plus size={24} />}
                                        </button>
                                    </div>
                                    {isExpanded && (
                                        <div className="accordion-content">
                                            <h4 className="programs-subtitle">Courses & Programs</h4>
                                            <ul className="programs-sublist">
                                                {item.programs.map((prog, pIndex) => (
                                                    <li key={pIndex}>
                                                        {prog.link ? (
                                                            prog.isAnchor ? (
                                                            <a href={prog.link} className="program-link">
                                                                {prog.name} ↗
                                                            </a>
                                                            ) : (
                                                                <Link to={prog.link} className="program-link">
                                                                    {prog.name} ↗
                                                                </Link>
                                                            )
                                                        ) : (
                                                            <Link to={`/course/${prog.slug}`} className="program-link">
                                                                {prog.name} ↗
                                                            </Link>
                                                        )}
                                                        {prog.description && (
                                                            <p className="program-link-description">{prog.description}</p>
                                                        )}
                                                    </li>
                                                ))}
                                                {item.programs.length === 0 && (
                                                    <li style={{color: '#666', fontStyle: 'italic'}}>No specific courses currently available under this category.</li>
                                                )}
                                            </ul>
                                            {item.available > 0 && (
                                                <div className="program-badge">
                                                    {item.available} PROGRAM(S) AVAILABLE
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                    {loading && (
                        <p className="programs-loading-note">Loading additional approved courses...</p>
                    )}
                </div>

            </div>
            
            {/* Scroll to Top */}
            <button className="scroll-to-top" onClick={scrollToTop}>
                <ArrowUp size={24} />
            </button>
        </div>
    );
};

export default ProgramList;
