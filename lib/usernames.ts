// Usernames nobody can claim: they would let someone pretend to be Butsó, its staff, a bank or the government.
// Mirrored in the database by is_reserved_username() (see reserved-usernames-update.sql). Keep the two lists the same.
export const RESERVED_USERNAMES = new Set([
  'about', 'abuse', 'access', 'account', 'accounts', 'admin', 'administrator', 'airforce',
  'amazon', 'anonymous', 'api', 'app', 'apple', 'apply', 'army', 'assets',
  'auth', 'billing', 'block', 'blocked', 'blog', 'book', 'booking', 'bookings',
  'browse', 'butso', 'careers', 'cbn', 'cdn', 'ceo', 'chat', 'client',
  'compliance', 'config', 'contact', 'contactus', 'cto', 'customer', 'customercare', 'customers',
  'customerservice', 'dashboard', 'demo', 'discover', 'docs', 'download', 'downloads', 'efcc',
  'email', 'employer', 'employers', 'escrow', 'example', 'explore', 'facebook', 'faq',
  'feedback', 'fgn', 'fidelity', 'finance', 'firstbank', 'flutterwave', 'founder', 'founders',
  'founding', 'frsc', 'google', 'gov', 'government', 'gtbank', 'gtco', 'hello',
  'help', 'helpcenter', 'helpdesk', 'hire', 'hired', 'hiring', 'home', 'hostmaster',
  'inbox', 'index', 'info', 'instagram', 'interswitch', 'job', 'jobs', 'kuda',
  'legal', 'linkedin', 'login', 'logout', 'mail', 'marketing', 'media', 'member',
  'members', 'message', 'messages', 'meta', 'microsoft', 'ministry', 'mod', 'moderator',
  'moniepoint', 'nafdac', 'naija', 'navy', 'news', 'nigeria', 'noreply', 'notifications',
  'null', 'oauth', 'official', 'opay', 'owner', 'paga', 'palmpay', 'pay',
  'payment', 'payments', 'paystack', 'people', 'police', 'postmaster', 'press', 'privacy',
  'private', 'profile', 'public', 'register', 'report', 'reports', 'requests', 'root',
  'safety', 'sales', 'search', 'secret', 'security', 'service', 'services', 'settings',
  'shop', 'shops', 'signup', 'snapchat', 'spam', 'staff', 'stanbic', 'static',
  'status', 'sterling', 'support', 'system', 'team', 'telegram', 'terms', 'test',
  'tester', 'testing', 'tiktok', 'token', 'trust', 'twitter', 'uba', 'undefined',
  'user', 'users', 'verification', 'verified', 'verify', 'wallet', 'webmaster', 'wema',
  'whatsapp', 'worker', 'workers', 'www', 'youtube', 'zenith',
])

// Anything starting with one of these is held back too (admin_john, support247, officialbutso...)
const RESERVED_PREFIXES = ['admin', 'support', 'official']

/** True if the username is held back. Ignores case and underscores (ad_min = admin). */
export function isReservedUsername(username: string): boolean {
  const u = (username ?? '').trim().toLowerCase().replace(/_/g, '')
  if (!u) return false
  return RESERVED_USERNAMES.has(u) || u.includes('butso') || RESERVED_PREFIXES.some(p => u.startsWith(p))
}
