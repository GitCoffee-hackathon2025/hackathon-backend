const tokensConf = {
  refresh: {
    name: 'REFRESH',
    expiresIn: 864000,
  },
  access: {
    name: 'ACCESS',
    expiresIn: 600,
  },
  verification: {
    name: 'VERIFICATION',
    expiresIn: 900,
  },
  password: {
    name: 'PASSWORD_RESET',
    expiresIn: 1800,
  },
  email: {
    name: 'CHANCE_EMAIL',
    expiresIn: 1200,
  },
} as const;

export default tokensConf;
