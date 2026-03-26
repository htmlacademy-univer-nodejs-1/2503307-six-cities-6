export function getMongoURI(
  username: string,
  password: string,
  host: string,
  port: string,
  databaseName: string,
  authSource: string = 'admin',
): string {
  // Если нет имени пользователя или пароля, подключаемся без аутентификации
  if (!username || !password || username.trim() === '' || password.trim() === '') {
    return `mongodb://${host}:${port}/${databaseName}`;
  }

  // Экранируем логин/пароль, чтобы специальные символы не ломали URI
  const encodedUsername = encodeURIComponent(username);
  const encodedPassword = encodeURIComponent(password);
  const encodedAuthSource = encodeURIComponent(authSource || 'admin');

  return `mongodb://${encodedUsername}:${encodedPassword}@${host}:${port}/${databaseName}?authSource=${encodedAuthSource}`;
}
