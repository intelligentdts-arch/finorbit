# fix-tests.ps1
# Run this from your project root: C:\Users\tajio\finorbit
# It does two things:
#   1. Adds data-testid to AuthModal submit buttons
#   2. Writes the complete fixed test file

Write-Host "Step 1 - Patching AuthModal submit buttons..." -ForegroundColor Cyan

$modalPath = "src\components\auth\AuthModal.tsx"
$modal = Get-Content $modalPath -Raw

# Add data-testid to signin submit button
$modal = $modal -replace `
  '(\{loading \? .Signing in.*?\. : .Sign In.*?\})', `
  '$1" data-testid="signin-submit'

# If the above regex doesn't match, do a simpler find/replace on the button onClick
if ($modal -notmatch 'signin-submit') {
  $modal = $modal -replace `
    'onClick\={handleSignIn\}', `
    'data-testid="signin-submit" onClick={handleSignIn}'
}

# Add data-testid to signup submit button
if ($modal -notmatch 'signup-submit') {
  $modal = $modal -replace `
    'onClick\={handleSignUp\}', `
    'data-testid="signup-submit" onClick={handleSignUp}'
}

[System.IO.File]::WriteAllText("$PWD\$modalPath", $modal, [System.Text.Encoding]::UTF8)

# Verify
if ((Get-Content $modalPath -Raw) -match 'signin-submit') {
  Write-Host "  [OK] signin-submit testid added" -ForegroundColor Green
} else {
  Write-Host "  [WARN] signin-submit not found - add manually" -ForegroundColor Yellow
}

if ((Get-Content $modalPath -Raw) -match 'signup-submit') {
  Write-Host "  [OK] signup-submit testid added" -ForegroundColor Green
} else {
  Write-Host "  [WARN] signup-submit not found - add manually" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 2 - Writing complete test file..." -ForegroundColor Cyan

$testContent = @"
import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"

const mockPush = jest.fn()
jest.mock("next/navigation", () => ({ useRouter: () => ({ push: mockPush }) }))

jest.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
    },
  },
}))

const mockRefreshUser = jest.fn()
const mockSignOut = jest.fn()
const mockSetLoading = jest.fn()
const mockSetUser = jest.fn()

jest.mock("@/store/authStore", () => ({ useAuthStore: jest.fn() }))
jest.mock("@/store/financialStore", () => ({
  useFinancialStore: jest.fn(() => ({ data: null, loading: false, fetchFinancialData: jest.fn() })),
}))

jest.mock("@/components/auth/AuthModal", () =>
  function MockAuthModal({ isOpen, onClose, defaultTab }) {
    if (!isOpen) return null
    return React.createElement("div", { "data-testid": "auth-modal" },
      React.createElement("span", { "data-testid": "auth-tab" }, defaultTab),
      React.createElement("button", { "data-testid": "modal-close", onClick: onClose }, "Close")
    )
  }
)

jest.mock("@/components/onboarding/OnboardingFlow", () =>
  function MockOnboarding() {
    return React.createElement("div", { "data-testid": "onboarding-flow" }, "Onboarding")
  }
)

import { useAuthStore } from "@/store/authStore"
import Home from "@/app/page"

const mockGetState = jest.fn(() => ({ signOut: mockSignOut, setUser: mockSetUser, setLoading: mockSetLoading }))

function setupAuth(overrides) {
  useAuthStore.mockReturnValue({
    user: null, loading: false, refreshUser: mockRefreshUser,
    signOut: mockSignOut, setLoading: mockSetLoading, setUser: mockSetUser,
    ...overrides,
  })
  useAuthStore.getState = mockGetState
}

// ── SIGNED OUT ────────────────────────────────────────────────────────────────
describe("Landing page - signed out", () => {
  beforeEach(() => { jest.clearAllMocks(); setupAuth() })

  it("renders without crashing", () => {
    render(React.createElement(Home))
    expect(screen.getAllByText("FinOrbit").length).toBeGreaterThan(0)
  })
  it("shows Sign In button", () => {
    render(React.createElement(Home))
    expect(screen.getAllByRole("button", { name: /sign in/i }).length).toBeGreaterThan(0)
  })
  it("shows Get Started button", () => {
    render(React.createElement(Home))
    expect(screen.getAllByRole("button", { name: /get started/i }).length).toBeGreaterThan(0)
  })
  it("shows Start Free Today button", () => {
    render(React.createElement(Home))
    expect(screen.getAllByRole("button", { name: /start free today/i }).length).toBeGreaterThan(0)
  })
  it("clicking Sign In opens modal on signin tab", () => {
    render(React.createElement(Home))
    fireEvent.click(screen.getAllByRole("button", { name: /sign in/i })[0])
    expect(screen.getByTestId("auth-modal")).toBeInTheDocument()
    expect(screen.getByTestId("auth-tab")).toHaveTextContent("signin")
  })
  it("clicking Get Started opens modal on signup tab", () => {
    render(React.createElement(Home))
    fireEvent.click(screen.getAllByRole("button", { name: /get started/i })[0])
    expect(screen.getByTestId("auth-modal")).toBeInTheDocument()
    expect(screen.getByTestId("auth-tab")).toHaveTextContent("signup")
  })
  it("clicking Start Free Today opens modal on signup tab", () => {
    render(React.createElement(Home))
    fireEvent.click(screen.getAllByRole("button", { name: /start free today/i })[0])
    expect(screen.getByTestId("auth-modal")).toBeInTheDocument()
    expect(screen.getByTestId("auth-tab")).toHaveTextContent("signup")
  })
  it("modal closes when X is clicked", () => {
    render(React.createElement(Home))
    fireEvent.click(screen.getAllByRole("button", { name: /sign in/i })[0])
    expect(screen.getByTestId("auth-modal")).toBeInTheDocument()
    fireEvent.click(screen.getByTestId("modal-close"))
    expect(screen.queryByTestId("auth-modal")).not.toBeInTheDocument()
  })
  it("does not show My Dashboard when signed out", () => {
    render(React.createElement(Home))
    expect(screen.queryByRole("button", { name: /my dashboard/i })).not.toBeInTheDocument()
  })
  it("does not redirect when signed out", () => {
    render(React.createElement(Home))
    expect(mockPush).not.toHaveBeenCalled()
  })
  it("pricing Start Free Trial opens signup modal", () => {
    render(React.createElement(Home))
    fireEvent.click(screen.getAllByRole("button", { name: /start free trial/i })[0])
    expect(screen.getByTestId("auth-modal")).toBeInTheDocument()
    expect(screen.getByTestId("auth-tab")).toHaveTextContent("signup")
  })
  it("Get Started Free opens signup modal", () => {
    render(React.createElement(Home))
    fireEvent.click(screen.getByRole("button", { name: /get started free/i }))
    expect(screen.getByTestId("auth-modal")).toBeInTheDocument()
    expect(screen.getByTestId("auth-tab")).toHaveTextContent("signup")
  })
  it("Businesses tab shows business content", () => {
    render(React.createElement(Home))
    fireEvent.click(screen.getByRole("button", { name: /businesses/i }))
    expect(screen.getByText(/replace your finance team/i)).toBeInTheDocument()
  })
  it("Governments tab shows government content", () => {
    render(React.createElement(Home))
    fireEvent.click(screen.getByRole("button", { name: /governments/i }))
    expect(screen.getByText(/future of/i)).toBeInTheDocument()
  })
  it("Individuals tab shows personal content", () => {
    render(React.createElement(Home))
    fireEvent.click(screen.getByRole("button", { name: /businesses/i }))
    fireEvent.click(screen.getByRole("button", { name: /individuals/i }))
    expect(screen.getAllByText(/personal cfo/i).length).toBeGreaterThan(0)
  })
})

// ── SIGNED IN ─────────────────────────────────────────────────────────────────
describe("Landing page - signed in", () => {
  const user = { id:"u1", email:"t@t.com", first_name:"Alex", last_name:"M", plan:"pro", onboarding_complete:true, risk_profile:"balanced", primary_goal:"grow_investments" }
  beforeEach(() => { jest.clearAllMocks(); setupAuth({ user }) })

  it("shows My Dashboard button", () => {
    render(React.createElement(Home))
    expect(screen.getAllByRole("button", { name: /my dashboard/i }).length).toBeGreaterThan(0)
  })
  it("does not show Get Started button", () => {
    render(React.createElement(Home))
    expect(screen.queryByRole("button", { name: /^get started$/i })).not.toBeInTheDocument()
  })
  it("shows Sign Out button", () => {
    render(React.createElement(Home))
    expect(screen.getAllByRole("button", { name: /sign out/i }).length).toBeGreaterThan(0)
  })
  it("does NOT auto-redirect on load", () => {
    render(React.createElement(Home))
    expect(mockPush).not.toHaveBeenCalledWith("/dashboard")
  })
  it("clicking My Dashboard navigates to /dashboard", () => {
    render(React.createElement(Home))
    fireEvent.click(screen.getAllByRole("button", { name: /my dashboard/i })[0])
    expect(mockPush).toHaveBeenCalledWith("/dashboard")
  })
  it("shows Go to My Dashboard button in hero", () => {
    render(React.createElement(Home))
    expect(screen.getAllByRole("button", { name: /go to my dashboard/i }).length).toBeGreaterThan(0)
  })
  it("clicking Go to My Dashboard navigates to /dashboard", () => {
    render(React.createElement(Home))
    fireEvent.click(screen.getAllByRole("button", { name: /go to my dashboard/i })[0])
    expect(mockPush).toHaveBeenCalledWith("/dashboard")
  })
  it("does not show Sign In button when signed in", () => {
    render(React.createElement(Home))
    expect(screen.queryByRole("button", { name: /^sign in$/i })).not.toBeInTheDocument()
  })
})

// ── ONBOARDING ────────────────────────────────────────────────────────────────
describe("Landing page - onboarding incomplete", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setupAuth({ user: { id:"u2", email:"n@n.com", first_name:"N", last_name:"U", plan:"free", onboarding_complete:false, risk_profile:"balanced", primary_goal:"grow_investments" } })
  })
  it("shows onboarding flow", () => {
    render(React.createElement(Home))
    expect(screen.getByTestId("onboarding-flow")).toBeInTheDocument()
  })
  it("does not show nav buttons during onboarding", () => {
    render(React.createElement(Home))
    expect(screen.queryByRole("button", { name: /sign in/i })).not.toBeInTheDocument()
  })
})

// ── LOADING ───────────────────────────────────────────────────────────────────
describe("Landing page - loading state", () => {
  beforeEach(() => { jest.clearAllMocks(); setupAuth({ loading: true, user: null }) })
  it("does not show buttons while loading", () => {
    render(React.createElement(Home))
    expect(screen.queryByRole("button", { name: /sign in/i })).not.toBeInTheDocument()
  })
})

// ── AUTH MODAL ────────────────────────────────────────────────────────────────
jest.unmock("@/components/auth/AuthModal")
const AuthModal = require("@/components/auth/AuthModal").default
const { supabase } = require("@/lib/supabase")

describe("AuthModal - sign in tab", () => {
  const onClose = jest.fn()
  beforeEach(() => { jest.clearAllMocks(); useAuthStore.mockReturnValue({ refreshUser: mockRefreshUser }) })

  it("renders email input", () => {
    render(React.createElement(AuthModal, { isOpen: true, onClose, defaultTab: "signin" }))
    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument()
  })
  it("renders password input", () => {
    render(React.createElement(AuthModal, { isOpen: true, onClose, defaultTab: "signin" }))
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument()
  })
  it("shows error for empty email", async () => {
    render(React.createElement(AuthModal, { isOpen: true, onClose, defaultTab: "signin" }))
    fireEvent.click(screen.getByTestId("signin-submit"))
    await waitFor(() => expect(screen.getByText(/valid email/i)).toBeInTheDocument())
  })
  it("shows error for missing password", async () => {
    render(React.createElement(AuthModal, { isOpen: true, onClose, defaultTab: "signin" }))
    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), { target: { value: "t@t.com" } })
    fireEvent.click(screen.getByTestId("signin-submit"))
    await waitFor(() => expect(screen.getByText(/password is required/i)).toBeInTheDocument())
  })
  it("calls supabase signIn with correct credentials", async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({ error: null })
    render(React.createElement(AuthModal, { isOpen: true, onClose, defaultTab: "signin" }))
    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), { target: { value: "t@t.com" } })
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), { target: { value: "Password1" } })
    fireEvent.click(screen.getByTestId("signin-submit"))
    await waitFor(() => expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({ email: "t@t.com", password: "Password1" }))
  })
  it("shows error on bad credentials", async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({ error: { message: "Invalid" } })
    render(React.createElement(AuthModal, { isOpen: true, onClose, defaultTab: "signin" }))
    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), { target: { value: "t@t.com" } })
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), { target: { value: "Password1" } })
    fireEvent.click(screen.getByTestId("signin-submit"))
    await waitFor(() => expect(screen.getByText(/incorrect email or password/i)).toBeInTheDocument())
  })
  it("does not render when closed", () => {
    render(React.createElement(AuthModal, { isOpen: false, onClose, defaultTab: "signin" }))
    expect(screen.queryByPlaceholderText(/you@example.com/i)).not.toBeInTheDocument()
  })
  it("switches to signup tab", () => {
    render(React.createElement(AuthModal, { isOpen: true, onClose, defaultTab: "signin" }))
    fireEvent.click(screen.getByRole("button", { name: /create account/i }))
    expect(screen.getByPlaceholderText(/alex/i)).toBeInTheDocument()
  })
})

describe("AuthModal - sign up tab", () => {
  const onClose = jest.fn()
  beforeEach(() => { jest.clearAllMocks(); useAuthStore.mockReturnValue({ refreshUser: mockRefreshUser }) })

  it("renders signup form", () => {
    render(React.createElement(AuthModal, { isOpen: true, onClose, defaultTab: "signup" }))
    expect(screen.getByPlaceholderText(/alex/i)).toBeInTheDocument()
  })
  it("shows error for missing first name", async () => {
    render(React.createElement(AuthModal, { isOpen: true, onClose, defaultTab: "signup" }))
    fireEvent.click(screen.getByTestId("signup-submit"))
    await waitFor(() => expect(screen.getByText(/first name is required/i)).toBeInTheDocument())
  })
  it("shows error for short password", async () => {
    render(React.createElement(AuthModal, { isOpen: true, onClose, defaultTab: "signup" }))
    fireEvent.change(screen.getByPlaceholderText(/alex/i), { target: { value: "Alex" } })
    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), { target: { value: "a@a.com" } })
    fireEvent.change(screen.getByPlaceholderText(/min 8 chars/i), { target: { value: "abc" } })
    fireEvent.click(screen.getByTestId("signup-submit"))
    await waitFor(() => expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument())
  })
  it("shows error for no uppercase", async () => {
    render(React.createElement(AuthModal, { isOpen: true, onClose, defaultTab: "signup" }))
    fireEvent.change(screen.getByPlaceholderText(/alex/i), { target: { value: "Alex" } })
    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), { target: { value: "a@a.com" } })
    fireEvent.change(screen.getByPlaceholderText(/min 8 chars/i), { target: { value: "password1" } })
    fireEvent.click(screen.getByTestId("signup-submit"))
    await waitFor(() => expect(screen.getByText(/uppercase letter/i)).toBeInTheDocument())
  })
  it("shows error for no number", async () => {
    render(React.createElement(AuthModal, { isOpen: true, onClose, defaultTab: "signup" }))
    fireEvent.change(screen.getByPlaceholderText(/alex/i), { target: { value: "Alex" } })
    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), { target: { value: "a@a.com" } })
    fireEvent.change(screen.getByPlaceholderText(/min 8 chars/i), { target: { value: "PasswordNoNum" } })
    fireEvent.click(screen.getByTestId("signup-submit"))
    await waitFor(() => expect(screen.getByText(/one number/i)).toBeInTheDocument())
  })
  it("calls supabase signUp", async () => {
    supabase.auth.signUp.mockResolvedValue({ error: null })
    render(React.createElement(AuthModal, { isOpen: true, onClose, defaultTab: "signup" }))
    fireEvent.change(screen.getByPlaceholderText(/alex/i), { target: { value: "Alex" } })
    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), { target: { value: "a@a.com" } })
    fireEvent.change(screen.getByPlaceholderText(/min 8 chars/i), { target: { value: "SecurePass1" } })
    fireEvent.click(screen.getByTestId("signup-submit"))
    await waitFor(() => expect(supabase.auth.signUp).toHaveBeenCalled())
  })
  it("shows success message", async () => {
    supabase.auth.signUp.mockResolvedValue({ error: null })
    render(React.createElement(AuthModal, { isOpen: true, onClose, defaultTab: "signup" }))
    fireEvent.change(screen.getByPlaceholderText(/alex/i), { target: { value: "Alex" } })
    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), { target: { value: "a@a.com" } })
    fireEvent.change(screen.getByPlaceholderText(/min 8 chars/i), { target: { value: "SecurePass1" } })
    fireEvent.click(screen.getByTestId("signup-submit"))
    await waitFor(() => expect(screen.getByText(/check your email/i)).toBeInTheDocument())
  })
  it("shows duplicate email error", async () => {
    supabase.auth.signUp.mockResolvedValue({ error: { message: "User already registered" } })
    render(React.createElement(AuthModal, { isOpen: true, onClose, defaultTab: "signup" }))
    fireEvent.change(screen.getByPlaceholderText(/alex/i), { target: { value: "Alex" } })
    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), { target: { value: "existing@e.com" } })
    fireEvent.change(screen.getByPlaceholderText(/min 8 chars/i), { target: { value: "SecurePass1" } })
    fireEvent.click(screen.getByTestId("signup-submit"))
    await waitFor(() => expect(screen.getByText(/already exists/i)).toBeInTheDocument())
  })
})
"@

[System.IO.File]::WriteAllText("$PWD\src\__tests__\buttons.test.tsx", $testContent, [System.Text.Encoding]::UTF8)
Write-Host "  [OK] Test file written" -ForegroundColor Green

Write-Host ""
Write-Host "Done. Now run: npm test -- buttons.test.tsx" -ForegroundColor Yellow
