import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronDown, Plus, Minus, ArrowUp } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../config';
import './ProgramList.css';

const ProgramList = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedIndex, setExpandedIndex] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                // Fetch public approved courses
                const res = await axios.get(`${API_URL}/courses`);
                setCourses(res.data);
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

    // Filter categories and courses based on search term
    const filterTerm = searchTerm.toLowerCase();
    
    const filteredCategories = Object.keys(groupedCourses)
        .filter(cat => {
            // Category matches OR any course inside matches
            return cat.toLowerCase().includes(filterTerm) || 
                   groupedCourses[cat].some(c => c.name.toLowerCase().includes(filterTerm));
        })
        .map(cat => {
            // Further filter the courses inside if the category itself doesn't match the search
            const catMatches = cat.toLowerCase().includes(filterTerm);
            let filteredProgs = groupedCourses[cat];
            
            if (!catMatches && filterTerm) {
                filteredProgs = filteredProgs.filter(c => c.name.toLowerCase().includes(filterTerm));
            }
            
            return {
                title: cat,
                programs: filteredProgs,
                available: filteredProgs.length
            };
        });

    // Hardcode B.Com for the SLS requirement if it matches search
    const bcomTitle = "Bachelor of Commerce (B.Com)";
    const bcomMatches = bcomTitle.toLowerCase().includes(filterTerm) || 
                        "b.com curriculum".includes(filterTerm);
    
    if (bcomMatches) {
        filteredCategories.push({
            title: bcomTitle,
            programs: [
                { name: "B.Com Curriculum (Batch 2026)", link: "/school/sls#bcom-curriculum-details", isAnchor: true },
                { name: "About the B.Com Course", link: "/school/sls#bcom-curriculum-details", isAnchor: true }
            ],
            available: 1
        });
    }

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
                    PDEU offers associate of arts (AA), associate of arts in teaching (AAT), associate of applied science (AAS), associate of science (AS), bachelor of science in nursing (BSN) and bachelor of applied technology (BAT) degrees in addition to a variety of certificates. Click on a subject below to learn more about what PDEU can teach you.
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
                    <button className="find-btn" onClick={() => {}}>Find</button>
                    
                    <div className="select-group">
                        <select defaultValue="">
                            <option value="" disabled hidden>All Degrees</option>
                            <option value="aa">Associate of Arts</option>
                            <option value="bcom">B.Com</option>
                        </select>
                        <ChevronDown size={18} className="select-icon" />
                    </div>

                    <div className="select-group">
                        <select defaultValue="">
                            <option value="" disabled hidden>All Pathways</option>
                            <option value="business">Business</option>
                            <option value="science">Science</option>
                        </select>
                        <ChevronDown size={18} className="select-icon" />
                    </div>
                </div>

                {/* Accordion List */}
                <div className="programs-accordion-list">
                    {loading ? (
                        <p style={{textAlign: 'center', padding: '40px', color: '#666'}}>Loading programs...</p>
                    ) : filteredCategories.length === 0 ? (
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
                                                        {prog.isAnchor ? (
                                                            <a href={prog.link} className="program-link">
                                                                {prog.name} ↗
                                                            </a>
                                                        ) : (
                                                            <Link to={`/course/${prog.slug}`} className="program-link">
                                                                {prog.name} ↗
                                                            </Link>
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
