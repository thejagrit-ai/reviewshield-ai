import React from 'react'
import { renderHook, act, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../../src/lib/AuthContext'
import { vi, describe, it, expect, beforeEach } from 'vitest'

const fetchMock = vi.fn()

vi.stubGlobal('fetch', fetchMock)

function wrapper({ children }: any) {
  return <AuthProvider>{children}</AuthProvider>
}

describe('AuthContext', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    window.localStorage.clear()
  })

  it('does not restore a user session when the token is missing', async () => {
    window.localStorage.setItem('rs_auth_user', JSON.stringify({ id: 'u1', email: 'stale@example.com', name: 'Stale User', role: 'user' }))

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.user).toBeNull()
    expect(window.localStorage.getItem('rs_auth_user')).toBeNull()
  })

  it('logs in and signs up with the custom auth backend', async () => {
    fetchMock.mockImplementation(async (path: string, init?: RequestInit) => {
      const body = init?.body ? JSON.parse(String(init.body)) : {}
      if (path === '/api/auth/login') {
        return {
          ok: true,
          json: async () => ({ token: 'token-login', user: { id: 'u1', email: body.email, name: 'Existing User', role: 'user' } })
        } as Response
      }
      if (path === '/api/auth/signup') {
        return {
          ok: true,
          json: async () => ({ token: 'token-signup', user: { id: 'u2', email: body.email, name: body.name, role: 'user' } })
        } as Response
      }
      return { ok: true, json: async () => ({ user: null }) } as Response
    })

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      const user = await result.current.login('a@a.com', 'pass')
      expect(user).toMatchObject({ id: 'u1', email: 'a@a.com' })
    })

    expect(result.current.user?.id).toBe('u1')
    expect(window.localStorage.getItem('rs_auth_token')).toBe('token-login')

    await act(async () => {
      const newUser = await result.current.signup('b@b.com', 'pass', 'Name')
      expect(newUser).toMatchObject({ id: 'u2', name: 'Name' })
    })

    expect(result.current.user?.id).toBe('u2')
    expect(window.localStorage.getItem('rs_auth_token')).toBe('token-signup')
  })
})
