const create = {
  type: 'object',
  properties: {
    title: { type: 'string', minLength: 1, maxLength: 100 },
    description: { type: 'string', minLength: 1, maxLength: 500 },
    createdAt: { type: 'number' },
    lastModifiedAt: { type: 'number' },
    status: { type: 'string', pattern: 'to_do' },
    username: { type: 'string', minLength: 3, maxLength: 100 },
  },
  additionalProperties: false,
  anyOf: [
    { required: ['title', 'createdAt', 'lastModifiedAt', 'status', 'username'] },
    { required: ['description', 'createdAt', 'lastModifiedAt', 'status', 'username'] },
  ],
};

const update = {
  type: 'object',
  properties: {
    title: { type: 'string', minLength: 1, maxLength: 100 },
    description: { type: 'string', minLength: 1, maxLength: 500 },
    status: { type: 'string', pattern: 'to_do|in_progress|done' },
    lastModifiedAt: { type: 'number' },
  },
  additionalProperties: false,
  anyOf: [
    { required: ['title', 'lastModifiedAt'] },
    { required: ['description', 'lastModifiedAt'] },
    { required: ['status', 'lastModifiedAt'] },
  ],
};

export default {
  create,
  update,
};
