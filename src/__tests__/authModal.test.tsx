import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"

jest.mock("next/navigation", () => ({ useRouter: () => ({ push: jest.fn() }) }))
jest.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
    },
  },
}))
jest.mock("@/store/authStore", () => ({ useAuthStore: jest.fn(() => ({ refreshUser: jest.fn() })) }))
jest.mock("@/store/financialStore", () => ({ useFinancialStore: jest.fn(() => ({ data: null, loading: false, fetchFinancialData: jest.fn() })) }))

import AuthModal from "@/components/auth/AuthModal"
import { useAuthStore } from "@/store/authStore"
const { supabase } = require("@/lib/supabase")

const onClose = jest.fn()
beforeEach(() => { jest.clearAllMocks(); useAuthStore.mockReturnValue({ refreshUser: jest.fn() }) })

describe("AuthModal - sign in tab", () => {
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
  it("calls supabase signIn", async () => {
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