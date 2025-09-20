const mailsConf = {
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

export default mailsConf;
