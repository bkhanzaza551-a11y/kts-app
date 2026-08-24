import client from './client';

export const educationApi = {
  getCourses: (params) => client.get('/courses', { params }),
  getCourseDetail: (id) => client.get(`/courses/${id}`),
  getCategories: () => client.get('/education/categories'),
};
