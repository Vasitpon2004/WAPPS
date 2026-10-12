const REQUIRED_KEYS = ['DATABASE_URL', 'JWT_SECRET', 'FRONTEND_URL'] as const;

export function validateEnv(config: Record<string, unknown>) {
  const missing = REQUIRED_KEYS.filter((key) => !config[key]);

  if (missing.length > 0) {
    throw new Error(
      `ยังไม่ได้ตั้งค่าใน .env: ${missing.join(', ')} (ดูตัวอย่างใน .env.example)`,
    );
  }

  const jwtSecret = String(config.JWT_SECRET);
  if (jwtSecret.length < 32) {
    throw new Error('JWT_SECRET ต้องยาวอย่างน้อย 32 ตัวอักษร');
  }

  return config;
}