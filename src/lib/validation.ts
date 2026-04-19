import { z } from 'zod'

export const signUpSchema = z.object({
  firstName: z.string().min(1,'First name is required').max(50,'First name is too long').regex(/^[a-zA-Z\s'-]+$/,'First name contains invalid characters'),
  lastName:  z.string().max(50,'Last name is too long').regex(/^[a-zA-Z\s'-]*$/,'Last name contains invalid characters').optional(),
  email:     z.string().min(1,'Email is required').email('Please enter a valid email address').max(255,'Email is too long').toLowerCase(),
  password:  z.string().min(8,'Password must be at least 8 characters').max(128,'Password is too long').regex(/[A-Z]/,'Password must contain at least one uppercase letter').regex(/[0-9]/,'Password must contain at least one number'),
  plan:      z.enum(['free','pro']).default('free'),
})

export const signInSchema = z.object({
  email:    z.string().email('Please enter a valid email address').toLowerCase(),
  password: z.string().min(1,'Password is required'),
})

export const chatMessageSchema = z.object({
  messages: z.array(z.object({
    role:    z.enum(['user','assistant']),
    content: z.string().min(1,'Message cannot be empty').max(4000,'Message is too long'),
  })).min(1,'At least one message is required').max(50,'Conversation is too long'),
})

export const plaidExchangeSchema = z.object({
  public_token:     z.string().min(1),
  institution_name: z.string().min(1).max(100),
  institution_id:   z.string().min(1).max(100),
})

export function formatZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Validation failed'
}

export function sanitize(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // remove script blocks including content
    .replace(/<[^>]*>/g, '')           // remove remaining HTML tags
    .replace(/javascript:/gi, '')      // remove javascript: protocol
    .replace(/on\w+\s*=/gi, '')        // remove event handlers
    .trim()
}
