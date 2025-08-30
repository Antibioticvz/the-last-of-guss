export interface Config {
  port: number;
  jwtSecret: string;
  databaseUrl: string;
  roundDuration: number;
  cooldownDuration: number;
}

export default (): Config => ({
  port: parseInt(process.env.PORT || '3000', 10),
  jwtSecret: process.env.JWT_SECRET || 'default-secret',
  databaseUrl:
    process.env.DATABASE_URL || 'postgresql://localhost:5432/the_last_of_guss',
  roundDuration: parseInt(process.env.ROUND_DURATION || '30000', 10),
  cooldownDuration: parseInt(process.env.COOLDOWN_DURATION || '10000', 10),
});
