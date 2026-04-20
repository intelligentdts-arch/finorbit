import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession:        jest.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
      signInWithPassword:jest.fn(),
      signUp:            jest.fn(),
      signOut:           jest.fn(),
    },
  },
}))

const mockRefreshUser = jest.fn()
const mockSignOut     = jest.fn()
const mockSetLoading  = jest.fn()
const mockSetUser     = jest.fn()

jest.mock('@/store/authStore', () => ({
  useAuthStore: jest.fn(),
}))

jest.mock('@/store/financialStore', () => ({
  useFinancialStore: jest.fn(() => ({
    data:               null,
    loading:            false,
    fetchFinancialData: jest.fn(),
  })),
}))

jest.mock('@/components/auth/AuthModal', () =>
  function MockAuthModal({ isOpen, onClose, defaultTab }: { isOpen: boolean; onClose: () => void; defaultTab: string }) {
    if (!isOpen) return null
    return (
      <div data-testid="auth-modal">
        <div data-testid="auth-tab">{defaultTab}</div>
        <button onClick={onClose} data-testid="modal-close">Close</button>
      </div>
    )
  }
)

jest.mock('@/components/onboarding/OnboardingFlow', () =>
  function MockOnboarding() {
    return <div data-testid="onboarding-flow">Onboarding</div>
  }
)

// ─── Import after mocks ───────────────────────────────────────────────────────
import { useAuthStore } from '@/store/authStore'
import Home            from '@/app/page'

// ─── Helper to configure auth state ─────────────────────────────────────────
const setupAuth = (overrides: Record<string, unknown> = {}) => {
  ;(useAuthStore as jest.Mock).mockReturnValue({
    user:        null,
    loading:     false,
    refreshUser: mockRefreshUser,
    signOut:     mockSignOut,
    setLoading:  mockSetLoading,
    setUser:     mockSetUser,
    getState:    () => ({ signOut: mockSignOut, setUser: mockSetUser, setLoading: mockSetLoading }),
    ...overrides,
  })
  ;(useAuthStore as unknown as { getState: jest.Mock }).getState = jest.fn(() => ({
    signOut:     mockSignOut,
    setUser:     mockSetUser,
    setLoading:  mockSetLoading,
  }))
}

// ─────────────────────────────────────────────────────────────────────────────
//  LANDING PAGE — SIGNED OUT
// ─────────────────────────────────────────────────────────────────────────────
describe('Landing page — signed out', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setupAuth()
  })

  it('renders without crashing', () => {
    render(<Home />)
    expect(screen.getByText('FinOrbit')).toBeInTheDocument()
  })

  it('shows Sign In and Get Started buttons in nav', () => {
    render(<Home />)
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /get started/i })).toBeInTheDocument()
  })

  it('shows Start Free Today button in hero', () => {
    render(<Home />)
    expect(screen.getByRole('button', { name: /start free today/i })).toBeInTheDocument()
  })

  it('clicking Sign In opens auth modal on signin tab', () => {
    render(<Home />)
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    expect(screen.getByTestId('auth-modal')).toBeInTheDocument()
    expect(screen.getByTestId('auth-tab')).toHaveTextContent('signin')
  })

  it('clicking Get Started opens auth modal on signup tab', () => {
    render(<Home />)
    fireEvent.click(screen.getByRole('button', { name: /get started/i }))
    expect(screen.getByTestId('auth-modal')).toBeInTheDocument()
    expect(screen.getByTestId('auth-tab')).toHaveTextContent('signup')
  })

  it('clicking Start Free Today opens auth modal on signup tab', () => {
    render(<Home />)
    fireEvent.click(screen.getByRole('button', { name: /start free today/i }))
    expect(screen.getByTestId('auth-modal')).toBeInTheDocument()
    expect(screen.getByTestId('auth-tab')).toHaveTextContent('signup')
  })

  it('modal closes when close button is clicked', () => {
    render(<Home />)
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    expect(screen.getByTestId('auth-modal')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('modal-close'))
    expect(screen.queryByTestId('auth-modal')).not.toBeInTheDocument()
  })

  it('does NOT show My Dashboard button when signed out', () => {
    render(<Home />)
    expect(screen.queryByRole('button', { name: /my dashboard/i })).not.toBeInTheDocument()
  })

  it('does NOT redirect when signed out', () => {
    render(<Home />)
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('pricing buttons open signup modal', () => {
    render(<Home />)
    const startTrialBtns = screen.getAllByRole('button', { name: /start free trial/i })
    fireEvent.click(startTrialBtns[0])
    expect(screen.getByTestId('auth-modal')).toBeInTheDocument()
    expect(screen.getByTestId('auth-tab')).toHaveTextContent('signup')
  })

  it('Get Started Free button opens signup modal', () => {
    render(<Home />)
    const btn = screen.getByRole('button', { name: /get started free/i })
    fireEvent.click(btn)
    expect(screen.getByTestId('auth-modal')).toBeInTheDocument()
    expect(screen.getByTestId('auth-tab')).toHaveTextContent('signup')
  })

  it('segment tabs switch between Individuals, Businesses, Governments', () => {
    render(<Home />)
    const businessBtn = screen.getByRole('button', { name: /businesses/i })
    fireEvent.click(businessBtn)
    expect(screen.getByText(/replace your finance team/i)).toBeInTheDocument()

    const govBtn = screen.getByRole('button', { name: /governments/i })
    fireEvent.click(govBtn)
    expect(screen.getByText(/future of/i)).toBeInTheDocument()

    const individualBtn = screen.getByRole('button', { name: /individuals/i })
    fireEvent.click(individualBtn)
    expect(screen.getByText(/personal cfo/i)).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
//  LANDING PAGE — SIGNED IN (onboarding complete)
// ─────────────────────────────────────────────────────────────────────────────
describe('Landing page — signed in', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setupAuth({
      user: {
        id:                  'user-123',
        email:               'test@example.com',
        first_name:          'Alex',
        last_name:           'Morgan',
        plan:                'pro',
        onboarding_complete: true,
        risk_profile:        'balanced',
        primary_goal:        'grow_investments',
      },
    })
  })

  it('shows My Dashboard button instead of Get Started', () => {
    render(<Home />)
    expect(screen.getByRole('button', { name: /my dashboard/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /get started/i })).not.toBeInTheDocument()
  })

  it('shows Sign Out button', () => {
    render(<Home />)
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument()
  })

  it('does NOT auto-redirect to dashboard on load', () => {
    render(<Home />)
    expect(mockPush).not.toHaveBeenCalledWith('/dashboard')
  })

  it('clicking My Dashboard navigates to /dashboard', () => {
    render(<Home />)
    fireEvent.click(screen.getByRole('button', { name: /my dashboard/i }))
    expect(mockPush).toHaveBeenCalledWith('/dashboard')
  })

  it('hero shows Go to My Dashboard button when signed in', () => {
    render(<Home />)
    expect(screen.getByRole('button', { name: /go to my dashboard/i })).toBeInTheDocument()
  })

  it('clicking Go to My Dashboard navigates to /dashboard', () => {
    render(<Home />)
    fireEvent.click(screen.getByRole('button', { name: /go to my dashboard/i }))
    expect(mockPush).toHaveBeenCalledWith('/dashboard')
  })

  it('does not show Sign In button when signed in', () => {
    render(<Home />)
    expect(screen.queryByRole('button', { name: /^sign in$/i })).not.toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
//  LANDING PAGE — SIGNED IN (onboarding incomplete)
// ─────────────────────────────────────────────────────────────────────────────
describe('Landing page — onboarding incomplete', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setupAuth({
      user: {
        id:                  'user-456',
        email:               'new@example.com',
        first_name:          'New',
        last_name:           'User',
        plan:                'free',
        onboarding_complete: false,
        risk_profile:        'balanced',
        primary_goal:        'grow_investments',
      },
    })
  })

  it('shows onboarding flow instead of landing page', () => {
    render(<Home />)
    expect(screen.getByTestId('onboarding-flow')).toBeInTheDocument()
  })

  it('does not show nav buttons during onboarding', () => {
    render(<Home />)
    expect(screen.queryByRole('button', { name: /sign in/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /get started/i })).not.toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
//  LANDING PAGE — LOADING STATE
// ─────────────────────────────────────────────────────────────────────────────
describe('Landing page — loading state', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setupAuth({ loading: true, user: null })
  })

  it('shows loading spinner while auth is loading', () => {
    render(<Home />)
    // Loading state shows a spinner, not the full page
    expect(screen.queryByRole('button', { name: /sign in/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /get started/i })).not.toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
//  AUTH MODAL — internal buttons
// ─────────────────────────────────────────────────────────────────────────────

// Import the real AuthModal for deeper testing
jest.unmock('@/components/auth/AuthModal')
import AuthModal from '@/components/auth/AuthModal'
import { supabase } from '@/lib/supabase'

describe('AuthModal — sign in tab', () => {
  const onClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useAuthStore as jest.Mock).mockReturnValue({
      refreshUser: mockRefreshUser,
    })
  })

  it('renders sign in form by default', () => {
    render(<AuthModal isOpen={true} onClose={onClose} defaultTab="signin" />)
    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('switches to signup tab when Create Account is clicked', () => {
    render(<AuthModal isOpen={true} onClose={onClose} defaultTab="signin" />)
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))
    expect(screen.getByPlaceholderText(/alex/i)).toBeInTheDocument()
  })

  it('shows error for empty email on sign in', async () => {
    render(<AuthModal isOpen={true} onClose={onClose} defaultTab="signin" />)
    fireEvent.click(screen.getByRole('button', { name: /sign in →/i }))
    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeInTheDocument()
    })
  })

  it('shows error for missing password on sign in', async () => {
    render(<AuthModal isOpen={true} onClose={onClose} defaultTab="signin" />)
    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), { target: { value: 'test@test.com' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in →/i }))
    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
  })

  it('calls supabase signIn with correct credentials', async () => {
    ;(supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({ error: null })
    render(<AuthModal isOpen={true} onClose={onClose} defaultTab="signin" />)
    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), { target: { value: 'Password1' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in →/i }))
    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email:    'test@example.com',
        password: 'Password1',
      })
    })
  })

  it('shows generic error on bad credentials', async () => {
    ;(supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({ error: { message: 'Invalid credentials' } })
    render(<AuthModal isOpen={true} onClose={onClose} defaultTab="signin" />)
    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), { target: { value: 'Password1' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in →/i }))
    await waitFor(() => {
      expect(screen.getByText(/incorrect email or password/i)).toBeInTheDocument()
    })
  })

  it('toggles password visibility', () => {
    render(<AuthModal isOpen={true} onClose={onClose} defaultTab="signin" />)
    const passwordInput = screen.getByPlaceholderText(/enter your password/i)
    expect(passwordInput).toHaveAttribute('type', 'password')
    fireEvent.click(screen.getByText('👁'))
    expect(passwordInput).toHaveAttribute('type', 'text')
    fireEvent.click(screen.getByText('🙈'))
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('closes when backdrop is clicked', () => {
    render(<AuthModal isOpen={true} onClose={onClose} defaultTab="signin" />)
    // Click the close button (✕)
    fireEvent.click(screen.getByText('✕'))
    expect(onClose).toHaveBeenCalled()
  })

  it('does not render when isOpen is false', () => {
    render(<AuthModal isOpen={false} onClose={onClose} defaultTab="signin" />)
    expect(screen.queryByPlaceholderText(/you@example.com/i)).not.toBeInTheDocument()
  })
})

describe('AuthModal — sign up tab', () => {
  const onClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useAuthStore as jest.Mock).mockReturnValue({
      refreshUser: mockRefreshUser,
    })
  })

  it('renders signup form', () => {
    render(<AuthModal isOpen={true} onClose={onClose} defaultTab="signup" />)
    expect(screen.getByPlaceholderText(/alex/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create my account/i })).toBeInTheDocument()
  })

  it('shows error for missing first name', async () => {
    render(<AuthModal isOpen={true} onClose={onClose} defaultTab="signup" />)
    fireEvent.click(screen.getByRole('button', { name: /create my account/i }))
    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument()
    })
  })

  it('shows error for invalid email', async () => {
    render(<AuthModal isOpen={true} onClose={onClose} defaultTab="signup" />)
    fireEvent.change(screen.getByPlaceholderText(/alex/i), { target: { value: 'Alex' } })
    fireEvent.change(screen.getAllByPlaceholderText(/you@example.com/i)[0], { target: { value: 'notanemail' } })
    fireEvent.click(screen.getByRole('button', { name: /create my account/i }))
    await waitFor(() => {
      expect(screen.getByText(/valid email address/i)).toBeInTheDocument()
    })
  })

  it('shows error for weak password — too short', async () => {
    render(<AuthModal isOpen={true} onClose={onClose} defaultTab="signup" />)
    fireEvent.change(screen.getByPlaceholderText(/alex/i), { target: { value: 'Alex' } })
    fireEvent.change(screen.getAllByPlaceholderText(/you@example.com/i)[0], { target: { value: 'alex@test.com' } })
    fireEvent.change(screen.getByPlaceholderText(/min 8 chars/i), { target: { value: 'abc' } })
    fireEvent.click(screen.getByRole('button', { name: /create my account/i }))
    await waitFor(() => {
      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument()
    })
  })

  it('shows error for password without uppercase', async () => {
    render(<AuthModal isOpen={true} onClose={onClose} defaultTab="signup" />)
    fireEvent.change(screen.getByPlaceholderText(/alex/i), { target: { value: 'Alex' } })
    fireEvent.change(screen.getAllByPlaceholderText(/you@example.com/i)[0], { target: { value: 'alex@test.com' } })
    fireEvent.change(screen.getByPlaceholderText(/min 8 chars/i), { target: { value: 'password1' } })
    fireEvent.click(screen.getByRole('button', { name: /create my account/i }))
    await waitFor(() => {
      expect(screen.getByText(/uppercase letter/i)).toBeInTheDocument()
    })
  })

  it('shows error for password without number', async () => {
    render(<AuthModal isOpen={true} onClose={onClose} defaultTab="signup" />)
    fireEvent.change(screen.getByPlaceholderText(/alex/i), { target: { value: 'Alex' } })
    fireEvent.change(screen.getAllByPlaceholderText(/you@example.com/i)[0], { target: { value: 'alex@test.com' } })
    fireEvent.change(screen.getByPlaceholderText(/min 8 chars/i), { target: { value: 'PasswordNoNum' } })
    fireEvent.click(screen.getByRole('button', { name: /create my account/i }))
    await waitFor(() => {
      expect(screen.getByText(/one number/i)).toBeInTheDocument()
    })
  })

  it('can select a plan', () => {
    render(<AuthModal isOpen={true} onClose={onClose} defaultTab="signup" />)
    // Pro plan is default — click Free
    fireEvent.click(screen.getByText(/launch/i))
    // Free plan card should now appear selected
    expect(screen.getByText(/free forever/i)).toBeInTheDocument()
  })

  it('calls supabase signUp with correct data', async () => {
    ;(supabase.auth.signUp as jest.Mock).mockResolvedValue({ error: null })
    render(<AuthModal isOpen={true} onClose={onClose} defaultTab="signup" />)
    fireEvent.change(screen.getByPlaceholderText(/alex/i), { target: { value: 'Alex' } })
    fireEvent.change(screen.getAllByPlaceholderText(/you@example.com/i)[0], { target: { value: 'alex@example.com' } })
    fireEvent.change(screen.getByPlaceholderText(/min 8 chars/i), { target: { value: 'SecurePass1' } })
    fireEvent.click(screen.getByRole('button', { name: /create my account/i }))
    await waitFor(() => {
      expect(supabase.auth.signUp).toHaveBeenCalledWith(
        expect.objectContaining({
          email:    'alex@example.com',
          password: 'SecurePass1',
        })
      )
    })
  })

  it('shows success message after account creation', async () => {
    ;(supabase.auth.signUp as jest.Mock).mockResolvedValue({ error: null })
    render(<AuthModal isOpen={true} onClose={onClose} defaultTab="signup" />)
    fireEvent.change(screen.getByPlaceholderText(/alex/i), { target: { value: 'Alex' } })
    fireEvent.change(screen.getAllByPlaceholderText(/you@example.com/i)[0], { target: { value: 'alex@example.com' } })
    fireEvent.change(screen.getByPlaceholderText(/min 8 chars/i), { target: { value: 'SecurePass1' } })
    fireEvent.click(screen.getByRole('button', { name: /create my account/i }))
    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument()
    })
  })

  it('shows duplicate email error', async () => {
    ;(supabase.auth.signUp as jest.Mock).mockResolvedValue({ error: { message: 'User already registered' } })
    render(<AuthModal isOpen={true} onClose={onClose} defaultTab="signup" />)
    fireEvent.change(screen.getByPlaceholderText(/alex/i), { target: { value: 'Alex' } })
    fireEvent.change(screen.getAllByPlaceholderText(/you@example.com/i)[0], { target: { value: 'existing@example.com' } })
    fireEvent.change(screen.getByPlaceholderText(/min 8 chars/i), { target: { value: 'SecurePass1' } })
    fireEvent.click(screen.getByRole('button', { name: /create my account/i }))
    await waitFor(() => {
      expect(screen.getByText(/already exists/i)).toBeInTheDocument()
    })
  })
})
