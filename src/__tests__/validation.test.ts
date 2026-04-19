import { signUpSchema, signInSchema, chatMessageSchema, sanitize } from '@/lib/validation'

describe('signUpSchema', () => {
  const valid = {
    firstName: 'Alex', lastName: 'Morgan',
    email: 'alex@example.com', password: 'SecurePass1', plan: 'pro' as const,
  }

  it('accepts valid input',             () => expect(signUpSchema.safeParse(valid).success).toBe(true))
  it('rejects empty first name',        () => expect(signUpSchema.safeParse({ ...valid, firstName: '' }).success).toBe(false))
  it('rejects invalid email',           () => expect(signUpSchema.safeParse({ ...valid, email: 'notanemail' }).success).toBe(false))
  it('rejects short password',          () => expect(signUpSchema.safeParse({ ...valid, password: 'abc' }).success).toBe(false))
  it('rejects password without number', () => expect(signUpSchema.safeParse({ ...valid, password: 'NoNumbers!' }).success).toBe(false))
  it('rejects password without uppercase', () => expect(signUpSchema.safeParse({ ...valid, password: 'nouppercase1' }).success).toBe(false))
  it('lowercases email',                () => {
    const r = signUpSchema.safeParse({ ...valid, email: 'ALEX@EXAMPLE.COM' })
    expect(r.success && r.data.email).toBe('alex@example.com')
  })
})

describe('signInSchema', () => {
  it('accepts valid credentials', () =>
    expect(signInSchema.safeParse({ email: 'a@b.com', password: 'pass' }).success).toBe(true))
  it('rejects missing password', () =>
    expect(signInSchema.safeParse({ email: 'a@b.com', password: '' }).success).toBe(false))
})

describe('chatMessageSchema', () => {
  const valid = { messages: [{ role: 'user' as const, content: 'Hello' }] }

  it('accepts valid message',         () => expect(chatMessageSchema.safeParse(valid).success).toBe(true))
  it('rejects empty content',         () => expect(chatMessageSchema.safeParse({ messages: [{ role: 'user', content: '' }] }).success).toBe(false))
  it('rejects invalid role',          () => expect(chatMessageSchema.safeParse({ messages: [{ role: 'system', content: 'x' }] }).success).toBe(false))
  it('rejects empty messages array',  () => expect(chatMessageSchema.safeParse({ messages: [] }).success).toBe(false))
  it('rejects message over 4000 chars', () =>
    expect(chatMessageSchema.safeParse({ messages: [{ role: 'user', content: 'x'.repeat(4001) }] }).success).toBe(false))
})

describe('sanitize', () => {
  it('strips HTML tags',                  () => expect(sanitize('<script>alert(1)</script>hello')).toBe('hello'))
  it('strips javascript: protocol',       () => expect(sanitize('javascript:void(0)')).toBe('void(0)'))
  it('strips inline event handlers',      () => expect(sanitize('onclick=evil()')).toBe('evil()'))
  it('trims whitespace',                  () => expect(sanitize('  hello  ')).toBe('hello'))
  it('leaves clean strings unchanged',    () => expect(sanitize('Alex Morgan')).toBe('Alex Morgan'))
})