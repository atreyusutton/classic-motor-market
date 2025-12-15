"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { signIn } from "@/auth"
import { AuthError } from "next-auth"

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9._-]+$/, "Use only letters, numbers, and ._-"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: "You must accept the Terms of Service and Privacy Policy." }),
  }),
  membershipPaymentConfirmed: z.literal(true, {
    errorMap: () => ({ message: "Confirm membership payment before creating an account." }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export async function registerAction(formData: z.infer<typeof registerSchema>) {
  const validatedFields = registerSchema.safeParse(formData)

  if (!validatedFields.success) {
    return { error: "Invalid fields" }
  }

  const { email, password, name, username } = validatedFields.data
  const normalizedUsername = username.trim().toLowerCase()

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    return { error: "Email already in use" }
  }

  const existingUsername = await prisma.user.findUnique({
    where: { username: normalizedUsername }
  })

  if (existingUsername) {
    return { error: "Username already in use" }
  }

  const passwordHash = await bcrypt.hash(password, 10)

  try {
    await prisma.user.create({
      data: {
        email,
        name,
        username: normalizedUsername,
        passwordHash,
        membershipStatus: "member",
        membershipPaymentStatus: "placeholder_confirmed",
        membershipPaidAt: new Date(),
      }
    })
    
    // Attempt to sign in immediately after registration
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    })

    // This part might not be reached if signIn redirects
    return { success: "Account created!" }

  } catch (error) {
    if (error instanceof AuthError) {
        return { error: "Account created, but failed to auto-login." }
    }
    // Allow Next.js redirects to pass through
    throw error
  }
}

export async function loginAction(prevState: string | undefined, formData: FormData) {
  try {
    await signIn("credentials", {
      ...Object.fromEntries(formData),
      redirectTo: "/", // Send to home after login
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials."
        default:
          return "Something went wrong."
      }
    }
    throw error
  }
}

