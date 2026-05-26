import { describe, it, expect } from 'vitest'
import { createAuthToken, hashPassword, verifyAuthToken, verifyPassword } from '../../auth-utils'

describe('custom auth helpers', () => {
  it('creates and verifies signed tokens', () => {
    const token = createAuthToken({ uid: 'test-uid', email: 'test@example.com', name: 'Tester', role: 'user' })
    const decoded = verifyAuthToken(token)

    expect(decoded).toMatchObject({
      uid: 'test-uid',
      email: 'test@example.com',
      name: 'Tester',
      role: 'user'
    })
  })

  it('hashes and verifies passwords', async () => {
    const { hash } = await hashPassword('secret-pass')

    expect(await verifyPassword('secret-pass', hash)).toBe(true)
    expect(await verifyPassword('wrong-pass', hash)).toBe(false)
  })
})
