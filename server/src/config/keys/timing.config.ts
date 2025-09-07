const timing = {
  rotates: 2592000000,
  expires: {
    refresh: '10d',
    access: '10min',
  },
} as const;

export default timing;