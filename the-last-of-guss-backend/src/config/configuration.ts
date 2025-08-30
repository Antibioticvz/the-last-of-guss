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
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    url: process.env.DATABASE_URL || '',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
  game: {
    roundDuration: parseInt(process.env.ROUND_DURATION || '60000', 10),
    cooldownDuration: parseInt(process.env.COOLDOWN_DURATION || '30000', 10),
  },
});
