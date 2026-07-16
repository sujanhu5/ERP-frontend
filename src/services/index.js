import api from './api';

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  signup: (payload) => api.post('/auth/signup', payload),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
  getMe: () => api.get('/auth/me'),
  register: (payload) => api.post('/auth/register', payload),
  changePassword: (payload) => api.put('/auth/change-password', payload),
};

/** Platform Owner (Super Admin) — cross-organization endpoints. */
export const platformService = {
  summary: () => api.get('/platform/summary'),
  analytics: (days = 30, months = 6) => api.get(`/platform/analytics?days=${days}&months=${months}`),
  health: () => api.get('/platform/health'),
  companies: (params) => api.get('/platform/companies', { params }),
  company: (id) => api.get(`/platform/companies/${id}`),
  setStatus: (id, status) => api.patch(`/platform/companies/${id}/status`, { status }),
  resetPassword: (id) => api.post(`/platform/companies/${id}/reset-password`),
  remove: (id) => api.delete(`/platform/companies/${id}`),
  auditLogs: (params) => api.get('/platform/audit-logs', { params }),
};

export const activityService = {
  list: (params) => api.get('/activity', { params }),
  notifications: () => api.get('/activity/notifications'),
};

export const dashboardService = {
  summary: () => api.get('/dashboard/summary'),
  salesGraph: (days = 30) => api.get(`/dashboard/sales-graph?days=${days}`),
  revenueGraph: (months = 6) => api.get(`/dashboard/revenue-graph?months=${months}`),
  topProducts: (limit = 5) => api.get(`/dashboard/top-products?limit=${limit}`),
};

export const productService = {
  list: (params) => api.get('/products', { params }),
  get: (id) => api.get(`/products/${id}`),
  create: (formData) => api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) => api.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  remove: (id) => api.delete(`/products/${id}`),
  lowStock: () => api.get('/products/low-stock'),
};

export const categoryService = {
  list: () => api.get('/categories'),
  create: (payload) => api.post('/categories', payload),
  update: (id, payload) => api.put(`/categories/${id}`, payload),
  remove: (id) => api.delete(`/categories/${id}`),
};

export const customerService = {
  list: (params) => api.get('/customers', { params }),
  get: (id) => api.get(`/customers/${id}`),
  create: (payload) => api.post('/customers', payload),
  update: (id, payload) => api.put(`/customers/${id}`, payload),
  remove: (id) => api.delete(`/customers/${id}`),
};

export const supplierService = {
  list: (params) => api.get('/suppliers', { params }),
  get: (id) => api.get(`/suppliers/${id}`),
  create: (payload) => api.post('/suppliers', payload),
  update: (id, payload) => api.put(`/suppliers/${id}`, payload),
  remove: (id) => api.delete(`/suppliers/${id}`),
};

export const invoiceService = {
  list: (params) => api.get('/invoices', { params }),
  get: (id) => api.get(`/invoices/${id}`),
  create: (payload) => api.post('/invoices', payload),
  addPayment: (id, payload) => api.post(`/invoices/${id}/payments`, payload),
};

export const employeeService = {
  list: (params) => api.get('/employees', { params }),
  get: (id) => api.get(`/employees/${id}`),
  create: (payload) => api.post('/employees', payload),
  update: (id, payload) => api.put(`/employees/${id}`, payload),
  remove: (id) => api.delete(`/employees/${id}`),
  markAttendance: (id, payload) => api.post(`/employees/${id}/attendance`, payload),
  getAttendance: (id, month, year) => api.get(`/employees/${id}/attendance?month=${month}&year=${year}`),
  requestLeave: (id, payload) => api.post(`/employees/${id}/leaves`, payload),
  updateLeaveStatus: (id, leaveId, status) => api.put(`/employees/${id}/leaves/${leaveId}`, { status }),
};

export const reportService = {
  dailySales: (date) => api.get('/reports/daily-sales', { params: { date } }),
  monthlySales: (month, year) => api.get('/reports/monthly-sales', { params: { month, year } }),
  revenue: (fromDate, toDate) => api.get('/reports/revenue', { params: { fromDate, toDate } }),
  inventory: () => api.get('/reports/inventory'),
  customers: () => api.get('/reports/customers'),
  topProducts: (limit) => api.get('/reports/top-products', { params: { limit } }),
  exportCSV: (type) => api.get('/reports/export', { params: { type }, responseType: 'blob' }),
};

export const settingsService = {
  get: () => api.get('/settings'),
  update: (formData) => api.put('/settings', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export const userService = {
  list: (params) => api.get('/users', { params }),
  get: (id) => api.get(`/users/${id}`),
  update: (id, payload) => api.put(`/users/${id}`, payload),
  remove: (id) => api.delete(`/users/${id}`),
};

// ── Blog CMS ──────────────────────────────────────────────────────────────────
export const blogPublicService = {
  posts: (params) => api.get('/blog/public/posts', { params }),
  post: (slug) => api.get(`/blog/public/posts/${slug}`),
  like: (slug) => api.post(`/blog/public/posts/${slug}/like`),
  categories: () => api.get('/blog/public/categories'),
  tags: () => api.get('/blog/public/tags'),
  comments: (slug) => api.get(`/blog/public/posts/${slug}/comments`),
  addComment: (slug, payload) => api.post(`/blog/public/posts/${slug}/comments`, payload),
};

export const blogAdminService = {
  stats: () => api.get('/blog/admin/stats'),
  // Posts
  posts: (params) => api.get('/blog/admin/posts', { params }),
  post: (id) => api.get(`/blog/admin/posts/${id}`),
  create: (formData) => api.post('/blog/admin/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) => api.put(`/blog/admin/posts/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  remove: (id) => api.delete(`/blog/admin/posts/${id}`),
  bulk: (action, ids) => api.post('/blog/admin/posts/bulk', { action, ids }),
  // Categories
  categories: () => api.get('/blog/admin/categories'),
  createCategory: (payload) => api.post('/blog/admin/categories', payload),
  updateCategory: (id, payload) => api.put(`/blog/admin/categories/${id}`, payload),
  deleteCategory: (id) => api.delete(`/blog/admin/categories/${id}`),
  // Tags
  tags: () => api.get('/blog/admin/tags'),
  deleteTag: (id) => api.delete(`/blog/admin/tags/${id}`),
  // Comments
  postComments: (postId) => api.get(`/blog/admin/posts/${postId}/comments`),
  deleteComment: (commentId) => api.delete(`/blog/admin/comments/${commentId}`),
  // Media
  images: (params) => api.get('/blog/admin/images', { params }),
  uploadImage: (formData) => api.post('/blog/admin/images', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteImage: (id) => api.delete(`/blog/admin/images/${id}`),
};
