const tokensConf = {
  refresh: {
    name: 'REFRESH',
    expiresIn: 864000,
  },
  access: {
    name: 'ACCESS',
    expiresIn: 600,
  },
} as const;

export default tokensConf;
