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
  oneOf: [
    { required: ['title', 'createdAt', 'lastModifiedAt', 'status', 'username'] },
    { required: ['description', 'createdAt', 'lastModifiedAt', 'status', 'username'] },
  ],
};

export default {
  create,
};
