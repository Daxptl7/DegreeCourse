import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Clock, GraduationCap, Layers } from 'lucide-react';
import { programCurriculums } from '../../data/programCurriculums';
import './ProgramCurriculum.css';

const ProgramCurriculum = () => {
    const { programSlug } = useParams();
    const program = programCurriculums[programSlug];

    if (!program) {
        return <Navigate to="/academics/programs" replace />;
    }

    return (
        <div className="curriculum-page">
            <section className="curriculum-hero">
                <div className="curriculum-wrap curriculum-hero-grid">
                    <div>
                        <Link to="/academics/programs" className="curriculum-back-link">
                            <ArrowLeft size={18} />
                            Programs and Courses
                        </Link>
                        <p className="curriculum-kicker">{program.school}</p>
                        <h1>{program.title}</h1>
                        <p className="curriculum-description">{program.description}</p>
                    </div>

                    <div className="curriculum-summary-card" aria-label="Program summary">
                        <div>
                            <GraduationCap size={28} />
                            <span>{program.batch}</span>
                        </div>
                        <div>
                            <Clock size={28} />
                            <span>{program.duration}</span>
                        </div>
                        <div>
                            <Layers size={28} />
                            <span>{program.totalCredits} Total Credits</span>
                        </div>
                    </div>
                </div>
            </section>

            <main className="curriculum-wrap curriculum-main">
                <section className="curriculum-highlights" aria-label="Program highlights">
                    {program.highlights.map((highlight) => (
                        <article key={highlight}>
                            <BookOpen size={22} />
                            <span>{highlight}</span>
                        </article>
                    ))}
                </section>

                <section className="curriculum-section">
                    <div className="curriculum-section-heading">
                        <p>Semester-wise curriculum</p>
                        <h2>Course Curriculum</h2>
                    </div>

                    <div className="curriculum-semester-grid">
                        {program.semesters.map((semester) => (
                            <article className="semester-card" key={semester.title}>
                                <header>
                                    <div>
                                        <span className="semester-label">{semester.title}</span>
                                        <h3>{semester.totalCredits} Credits</h3>
                                    </div>
                                    <span className="course-count">{semester.courses.length} Courses</span>
                                </header>

                                <div className="semester-course-list">
                                    {semester.courses.map((course, index) => (
                                        <div className="semester-course" key={`${semester.title}-${course.title}`}>
                                            <span className="course-number">{index + 1}</span>
                                            <div>
                                                <h4>{course.title}</h4>
                                                <p>{course.category}</p>
                                            </div>
                                            <strong>{course.credits}</strong>
                                        </div>
                                    ))}
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                {program.specializations && (
                    <section className="curriculum-section">
                        <div className="curriculum-section-heading">
                            <p>Choose your focus</p>
                            <h2>Specialization Tracks</h2>
                        </div>

                        <div className="specialization-grid">
                            {program.specializations.map((specialization) => (
                                <article className="specialization-card" key={specialization.name}>
                                    <h3>{specialization.name}</h3>
                                    <ul>
                                        {specialization.courses.map((course) => (
                                            <li key={course}>{course}</li>
                                        ))}
                                    </ul>
                                </article>
                            ))}
                        </div>
                    </section>
                )}

                <section className="curriculum-section">
                    <div className="curriculum-section-heading">
                        <p>Credit structure</p>
                        <h2>Minimum Credit Requirement</h2>
                    </div>

                    <div className="credit-grid">
                        {program.creditBreakdown.map((item) => (
                            <div className="credit-item" key={item.label}>
                                <span>{item.label}</span>
                                <strong>{item.credits}</strong>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default ProgramCurriculum;
