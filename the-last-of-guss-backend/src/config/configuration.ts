export interface Config {
  port: number;
  jwtSecret: string;
  databaseUrl: string;
  roundDuration: number;
  cooldownDuration: number;
}

export default (): Config => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  jwtSecret: process.env.JWT_SECRET || 'default-secret',
  databaseUrl: process.env.DATABASE_URL,
  roundDuration: parseInt(process.env.ROUND_DURATION, 10) || 30000,
  cooldownDuration: parseInt(process.env.COOLDOWN_DURATION, 10) || 10000,
});