const tokensConf = {
  types: {
    refresh: 'REFRESH',
    access: 'ACCESS',
    verification: 'VERIFICATION',
    password: 'PASSWORD_RESET',
    email: 'CHANCE_EMAIL',
  },
  expires: {
    refresh: 864000,
    access: 600,
  },
} as const;

export default tokensConf;
