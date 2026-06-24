export const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

export const buildPaginatedResponse = (data, total, page, limit) => ({
  items: data,
  pagination: {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
    hasNext: page * limit < total,
    hasPrev: page > 1,
  },
});

export const buildSearchFilter = (search, fields) => {
  if (!search) return {};
  const regex = { $regex: search, $options: 'i' };
  return { $or: fields.map((field) => ({ [field]: regex })) };
};

export const buildSort = (sortBy = 'createdAt', order = 'desc') => ({
  [sortBy]: order === 'asc' ? 1 : -1,
});
