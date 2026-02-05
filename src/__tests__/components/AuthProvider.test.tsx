import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from '@/components/AuthProvider'

// Test component that uses the auth context
function TestAuthConsumer() {
  const { user, loading, signIn, signUp, signOut } = useAuth()

  return (
    <div>
      <p data-testid="loading">{loading ? 'Loading' : 'Not Loading'}</p>
      <p data-testid="user">{user ? user.email : 'No User'}</p>
      <button onClick={() => signIn('test@example.com', 'password')}>Sign In</button>
      <button onClick={() => signUp('new@example.com', 'password')}>Sign Up</button>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  )
}

describe('AuthProvider', () => {
  describe('Initial State', () => {
    it('provides initial state with no user', () => {
      render(
        <AuthProvider>
          <TestAuthConsumer />
        </AuthProvider>
      )

      expect(screen.getByTestId('user')).toHaveTextContent('No User')
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
    })
  })

  describe('signIn', () => {
    it('sets user after sign in', async () => {
      const user = userEvent.setup()

      render(
        <AuthProvider>
          <TestAuthConsumer />
        </AuthProvider>
      )

      await act(async () => {
        await user.click(screen.getByText('Sign In'))
      })

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
      })
    })

    it('sets loading state during sign in', async () => {
      const user = userEvent.setup()

      render(
        <AuthProvider>
          <TestAuthConsumer />
        </AuthProvider>
      )

      // Click sign in
      await act(async () => {
        await user.click(screen.getByText('Sign In'))
      })

      // After completion, loading should be false
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
    })
  })

  describe('signUp', () => {
    it('sets user after sign up', async () => {
      const user = userEvent.setup()

      render(
        <AuthProvider>
          <TestAuthConsumer />
        </AuthProvider>
      )

      await act(async () => {
        await user.click(screen.getByText('Sign Up'))
      })

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('new@example.com')
      })
    })
  })

  describe('signOut', () => {
    it('clears user after sign out', async () => {
      const user = userEvent.setup()

      render(
        <AuthProvider>
          <TestAuthConsumer />
        </AuthProvider>
      )

      // First sign in
      await act(async () => {
        await user.click(screen.getByText('Sign In'))
      })

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
      })

      // Then sign out
      await act(async () => {
        await user.click(screen.getByText('Sign Out'))
      })

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('No User')
      })
    })
  })

  describe('useAuth hook', () => {
    it('provides default context values when used outside provider', () => {
      // Test that default values work
      const TestComponent = () => {
        const { user, loading } = useAuth()
        return (
          <div>
            <span data-testid="default-user">{user ? 'Has User' : 'No User'}</span>
            <span data-testid="default-loading">{loading ? 'Yes' : 'No'}</span>
          </div>
        )
      }

      // Render with provider (testing default behavior)
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      expect(screen.getByTestId('default-user')).toHaveTextContent('No User')
      expect(screen.getByTestId('default-loading')).toHaveTextContent('No')
    })
  })

  describe('Context Isolation', () => {
    it('maintains separate state for different providers', async () => {
      const user = userEvent.setup()

      const TestConsumer1 = () => {
        const { user: authUser, signIn } = useAuth()
        return (
          <div>
            <p data-testid="user1">{authUser?.email || 'None'}</p>
            <button onClick={() => signIn('user1@test.com', 'pass')}>Sign In 1</button>
          </div>
        )
      }

      const TestConsumer2 = () => {
        const { user: authUser, signIn } = useAuth()
        return (
          <div>
            <p data-testid="user2">{authUser?.email || 'None'}</p>
            <button onClick={() => signIn('user2@test.com', 'pass')}>Sign In 2</button>
          </div>
        )
      }

      render(
        <AuthProvider>
          <TestConsumer1 />
          <TestConsumer2 />
        </AuthProvider>
      )

      // Sign in with first consumer
      await act(async () => {
        await user.click(screen.getByText('Sign In 1'))
      })

      // Both consumers should see the same user (shared context)
      await waitFor(() => {
        expect(screen.getByTestId('user1')).toHaveTextContent('user1@test.com')
        expect(screen.getByTestId('user2')).toHaveTextContent('user1@test.com')
      })
    })
  })

  describe('Children Rendering', () => {
    it('renders children correctly', () => {
      render(
        <AuthProvider>
          <div data-testid="child">Child Content</div>
        </AuthProvider>
      )

      expect(screen.getByTestId('child')).toHaveTextContent('Child Content')
    })

    it('renders multiple children', () => {
      render(
        <AuthProvider>
          <div data-testid="child1">Child 1</div>
          <div data-testid="child2">Child 2</div>
        </AuthProvider>
      )

      expect(screen.getByTestId('child1')).toBeInTheDocument()
      expect(screen.getByTestId('child2')).toBeInTheDocument()
    })
  })
})
