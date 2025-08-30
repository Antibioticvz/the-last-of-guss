export interface Config {
  port: number;
  database: {
    url: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  game: {
    roundDuration: number;
    cooldownDuration: number;
  };
}

export default (): Config => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
  game: {
    roundDuration: parseInt(process.env.ROUND_DURATION, 10) || 60000, // 1 minute in ms
    cooldownDuration: parseInt(process.env.COOLDOWN_DURATION, 10) || 30000, // 30 seconds in ms
  },
});
