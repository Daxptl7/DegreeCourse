const courses = [];

export const getCourseBySlug = (slug) => {
  return courses.find(course => course.slug === slug);
};

export const getCourseById = (id) => {
  return courses.find(course => course.id === id);
};

export const getSimilarCourses = (courseId) => {
  const course = getCourseById(courseId);
  if (!course) return [];
  // Ensure similarCourses exists before mapping
  const similarIds = course.similarCourses || [];
  return similarIds.map(id => getCourseById(id)).filter(Boolean);
};
