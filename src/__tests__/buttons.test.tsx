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
  useAuthStore.mockReturnValue({ user: null, loading: false, refreshUser: mockRefreshUser, signOut: mockSignOut, setLoading: mockSetLoading, setUser: mockSetUser, ...overrides })
  useAuthStore.getState = mockGetState
}

describe("Landing page - signed out", () => {
  beforeEach(() => { jest.clearAllMocks(); setupAuth() })
  it("renders without crashing", () => { render(React.createElement(Home)); expect(screen.getAllByText("FinOrbit").length).toBeGreaterThan(0) })
  it("shows Sign In button", () => { render(React.createElement(Home)); expect(screen.getAllByRole("button", { name: /sign in/i }).length).toBeGreaterThan(0) })
  it("shows Get Started button", () => { render(React.createElement(Home)); expect(screen.getAllByRole("button", { name: /get started/i }).length).toBeGreaterThan(0) })
  it("shows Start Free Today button", () => { render(React.createElement(Home)); expect(screen.getAllByRole("button", { name: /start free today/i }).length).toBeGreaterThan(0) })
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
    fireEvent.click(screen.getByTestId("modal-close"))
    expect(screen.queryByTestId("auth-modal")).not.toBeInTheDocument()
  })
  it("does not show My Dashboard when signed out", () => { render(React.createElement(Home)); expect(screen.queryByRole("button", { name: /my dashboard/i })).not.toBeInTheDocument() })
  it("does not redirect when signed out", () => { render(React.createElement(Home)); expect(mockPush).not.toHaveBeenCalled() })
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

describe("Landing page - signed in", () => {
  const user = { id:"u1", email:"t@t.com", first_name:"Alex", last_name:"M", plan:"pro", onboarding_complete:true, risk_profile:"balanced", primary_goal:"grow_investments" }
  beforeEach(() => { jest.clearAllMocks(); setupAuth({ user }) })
  it("shows My Dashboard button", () => { render(React.createElement(Home)); expect(screen.getAllByRole("button", { name: /my dashboard/i }).length).toBeGreaterThan(0) })
  it("does not show Get Started button", () => { render(React.createElement(Home)); expect(screen.queryByRole("button", { name: /^get started$/i })).not.toBeInTheDocument() })
  it("shows Sign Out button", () => { render(React.createElement(Home)); expect(screen.getAllByRole("button", { name: /sign out/i }).length).toBeGreaterThan(0) })
  it("does NOT auto-redirect on load", () => { render(React.createElement(Home)); expect(mockPush).not.toHaveBeenCalledWith("/dashboard") })
  it("clicking My Dashboard navigates to /dashboard", () => {
    render(React.createElement(Home))
    fireEvent.click(screen.getAllByRole("button", { name: /my dashboard/i })[0])
    expect(mockPush).toHaveBeenCalledWith("/dashboard")
  })
  it("shows Go to My Dashboard button", () => { render(React.createElement(Home)); expect(screen.getAllByRole("button", { name: /go to my dashboard/i }).length).toBeGreaterThan(0) })
  it("clicking Go to My Dashboard navigates", () => {
    render(React.createElement(Home))
    fireEvent.click(screen.getAllByRole("button", { name: /go to my dashboard/i })[0])
    expect(mockPush).toHaveBeenCalledWith("/dashboard")
  })
  it("does not show Sign In button when signed in", () => { render(React.createElement(Home)); expect(screen.queryByRole("button", { name: /^sign in$/i })).not.toBeInTheDocument() })
})

describe("Landing page - onboarding incomplete", () => {
  beforeEach(() => { jest.clearAllMocks(); setupAuth({ user: { id:"u2", email:"n@n.com", first_name:"N", last_name:"U", plan:"free", onboarding_complete:false, risk_profile:"balanced", primary_goal:"grow_investments" } }) })
  it("shows onboarding flow", () => { render(React.createElement(Home)); expect(screen.getByTestId("onboarding-flow")).toBeInTheDocument() })
  it("does not show nav buttons during onboarding", () => { render(React.createElement(Home)); expect(screen.queryByRole("button", { name: /sign in/i })).not.toBeInTheDocument() })
})

describe("Landing page - loading state", () => {
  beforeEach(() => { jest.clearAllMocks(); setupAuth({ loading: true, user: null }) })
  it("does not show buttons while loading", () => { render(React.createElement(Home)); expect(screen.queryByRole("button", { name: /sign in/i })).not.toBeInTheDocument() })
})