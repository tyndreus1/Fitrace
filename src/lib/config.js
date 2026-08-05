// Uygulamanın tek kullanıcısı ve temel ayarları.
export const PROFILE = {
  id: 'ozge',
  name: 'Özge',
  age: 26,
  gender: 'female',
  heightCm: 162,
  startWeightKg: 47,
  goalWeightKg: 53,
  // Haftalık hedef kilo artışı (kas + sağlıklı yağ dokusu)
  weeklyGainKg: 0.25,
  waterGoalMl: 2200,
  color: '#ec4899',
  accent: '#f9a8d4',
}

// Giriş şifresi. Bu bir "kilit ekranı"dır, gerçek bir kimlik doğrulama değildir:
// istemci tarafında tutulduğu için siteyi meraklı gözlerden korur, ciddi
// saldırılardan korumaz. Değiştirmek için burayı güncellemek yeterli.
export const SITE_PASSWORD = 'pembeinci'

export const SESSION_KEY = 'ozge_session'
