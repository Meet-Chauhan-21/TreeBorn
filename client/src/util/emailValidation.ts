export const DISPOSABLE_OR_DUMMY_DOMAINS = new Set([
  'a.com', 'b.com', 'c.com', 'd.com', 'e.com', 'f.com', 'g.com', 'h.com',
  'i.com', 'j.com', 'k.com', 'l.com', 'm.com', 'n.com', 'o.com', 'p.com',
  'q.com', 'r.com', 's.com', 't.com', 'u.com', 'v.com', 'w.com', 'x.com',
  'y.com', 'z.com',
  'abc.com', 'xyz.com', '123.com', 'test.com', 'testing.com', 'dummy.com',
  'sample.com', 'example.com', 'temp.com', 'fake.com', 'invalid.com',
  'domain.com', 'testing.in', 'test.in', 'dummy.in', 'asdf.com', 'qwer.com',
  'foo.com', 'bar.com',
  'tempmail.com', 'temp-mail.org', 'tempmail.net', 'temp-mail.io',
  '10minutemail.com', '10minutemail.net', 'mailinator.com', 'dispostable.com',
  'guerrillamail.com', 'guerrillamail.block', 'trashmail.com', 'trashmail.net',
  'yopmail.com', 'yopmail.fr', 'yopmail.net', 'sharklasers.com',
  'fakeinbox.com', 'throwawaymail.com', 'getnada.com', 'maildrop.cc',
  'disposable.com', 'crazymailing.com', 'boun.cr', 'inboxkitten.com',
  'mytemp.email', 'generator.email', 'emailondeck.com', 'tempail.com',
  'dropmail.me', 'mohmal.com', 'disposableemail.org', 'nada.ltd',
  'getairmail.com'
]);

export const validateEmailAddress = (email: string): { valid: boolean; reason?: string } => {
  if (!email || typeof email !== 'string') {
    return { valid: false, reason: 'Email address is required.' };
  }

  const trimmedEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(trimmedEmail)) {
    return { valid: false, reason: 'Please enter a valid email address format (e.g. name@gmail.com).' };
  }

  const parts = trimmedEmail.split('@');
  if (parts.length !== 2) {
    return { valid: false, reason: 'Invalid email address structure.' };
  }

  const localPart = parts[0];
  const fullDomain = parts[1];

  if (localPart.length < 2) {
    return { valid: false, reason: 'Email username must be at least 2 characters long.' };
  }

  if (DISPOSABLE_OR_DUMMY_DOMAINS.has(fullDomain)) {
    return {
      valid: false,
      reason: `The email domain '@${fullDomain}' is a temporary or dummy address. Please use a valid email address.`
    };
  }

  const domainParts = fullDomain.split('.');
  const domainName = domainParts[0];
  const tld = domainParts[domainParts.length - 1];

  if (domainName.length < 2) {
    return {
      valid: false,
      reason: `The domain name '@${fullDomain}' is invalid or too short. Please enter a valid email address (e.g. gmail.com, yahoo.com).`
    };
  }

  const dummyDomainNames = ['test', 'testing', 'dummy', 'sample', 'example', 'temp', 'fake', 'invalid', 'asdf', 'qwer', 'zxcv', 'foo', 'bar'];
  if (dummyDomainNames.includes(domainName)) {
    return {
      valid: false,
      reason: `The email domain '@${fullDomain}' appears to be a dummy test address. Please use a permanent, valid email address.`
    };
  }

  if (tld.length < 2) {
    return { valid: false, reason: 'Invalid top-level domain extension.' };
  }

  const typoDomains = ['gmai.com', 'gmal.com', 'gamil.com', 'yaho.com', 'outlok.com', 'hotmal.com'];
  if (typoDomains.includes(fullDomain)) {
    return {
      valid: false,
      reason: `Did you mean @${fullDomain === 'yaho.com' ? 'yahoo.com' : fullDomain.includes('outlok') ? 'outlook.com' : fullDomain.includes('hotmal') ? 'hotmail.com' : 'gmail.com'}? Please check your email.`
    };
  }

  return { valid: true };
};
