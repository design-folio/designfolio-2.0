import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, ArrowLeft, Check } from "lucide-react"
import TrustedBySection from "@/components/TrustedBySection"
import { motion, AnimatePresence } from "framer-motion"
import Logo from "../../public/assets/svgs/logo.svg"
import Link from "next/link"
import { useRouter } from "next/router"
import { useGoogleLogin } from "@react-oauth/google"
import { _signupEmail, _signupGmail } from "@/network/post-request"
import { setToken } from "@/lib/cooikeManager"
import * as Yup from "yup"
import { useMeasuredHeight } from "@/hooks/useMeasuredHeight"

const SignupValidationSchema = Yup.object().shape({
    name: Yup.string()
        .max(100, "Name is too long")
        .required("Full name is required"),
    email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
    password: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .required("Password is required")
})

export default function Signup() {
    const router = useRouter()
    const [signupStep, setSignupStep] = useState("domain")
    const [domain, setDomain] = useState(router.query.username || "")
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    })
    const [verificationCode, setVerificationCode] = useState("")
    const [timeLeft, setTimeLeft] = useState(30)
    const [fieldErrors, setFieldErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const [isAvailable, setIsAvailable] = useState(false)
    const [isCheckingDomain, setIsCheckingDomain] = useState(false)
    const [contentRef, contentHeight] = useMeasuredHeight()
    useEffect(() => {
        if (signupStep === "verify" && timeLeft > 0) {
            const timer = setTimeout(() => {
                setTimeLeft(timeLeft - 1)
            }, 1000)
            return () => clearTimeout(timer)
        }
    }, [signupStep, timeLeft])

    useEffect(() => {
        if (router.query.username && !domain) {
            const urlDomain = router.query.username
            setDomain(urlDomain)
            // If domain is provided via URL, skip to method selection
            if (urlDomain.trim()) {
                setSignupStep("method")
            }
        }
    }, [router.query.username, domain])

    const handleDomainSubmit = e => {
        e.preventDefault()
        const errors = {}

        if (!domain.trim()) {
            errors.domain = "Domain is required"
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors)
            return
        }

        setFieldErrors({})
        console.log("Domain claimed:", domain)
        setSignupStep("method")
    }

    const handleEmailSignup = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            await SignupValidationSchema.validate(formData, { abortEarly: false })
            setFieldErrors({})

            const signupData = {
                username: domain,
                loginMethod: 0,
                firstName: formData.name.split(' ')[0] || formData.name,
                lastName: formData.name.split(' ').slice(1).join(' ') || "",
                email: formData.email,
                password: formData.password,
            }

            const { data } = await _signupEmail(signupData)
            const { token } = data
            setToken(token)
            router.push("/email-verify")

        } catch (error) {
            if (error.inner) {
                // Yup validation errors
                const errors = {}
                error.inner.forEach(err => {
                    errors[err.path] = err.message
                })
                setFieldErrors(errors)
            } else {
                // API errors
                console.error("Signup error:", error)
                setFieldErrors({
                    general: error.response?.data?.message || "An error occurred during signup"
                })
            }
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyEmail = e => {
        e.preventDefault()
        console.log("Verification code:", verificationCode)
    }

    const handleResendCode = () => {
        console.log("Resending code")
        setTimeLeft(30)
    }

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setLoading(true)
            try {
                const response = await fetch(
                    "https://www.googleapis.com/oauth2/v2/userinfo",
                    {
                        headers: {
                            Authorization: `Bearer ${tokenResponse.access_token}`,
                        },
                    }
                )
                const userData = await response.json()

                const data = {
                    loginMethod: 1,
                    googleID: userData.id,
                    username: domain,
                    firstName: userData.given_name,
                    lastName: userData.family_name,
                    email: userData.email,
                }

                const { data: signupData } = await _signupGmail(data)
                const { token } = signupData
                setToken(token)
                router.push("/builder")

            } catch (error) {
                console.error("Error with Google signup:", error)
                setFieldErrors({
                    general: "Google signup failed. Please try again."
                })
            } finally {
                setLoading(false)
            }
        },
        onError: () => {
            console.log("Google login failed")
            setFieldErrors({
                general: "Google login failed. Please try again."
            })
        },
    })

    const handleGoogleSignup = () => {
        googleLogin()
    }

    return (
        <div className="min-h-screen bg-background-landing flex flex-col relative overflow-hidden">
            {/* Simple 3x3 Grid Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none grid grid-cols-3 grid-rows-3 gap-8 p-8">
                {/* Row 1 */}
                <div className="bg-muted/25 rounded-[4rem]" />
                <div className="bg-muted/30 rounded-[5rem]" />
                <div className="bg-muted/25 rounded-[4rem]" />

                {/* Row 2 */}
                <div className="bg-muted/30 rounded-[5rem]" />
                <div className="bg-muted/25 rounded-[4rem]" />
                <div className="bg-muted/30 rounded-[5rem]" />

                {/* Row 3 */}
                <div className="bg-muted/25 rounded-[4rem]" />
                <div className="bg-muted/30 rounded-[5rem]" />
                <div className="bg-muted/25 rounded-[4rem]" />
            </div>

            <div className="flex-1 flex flex-col relative z-10">
                <div className="pt-8 pb-4 flex justify-center">
                    <Link href="/" className="cursor-pointer" data-testid="link-home">
                        <Logo className="text-df-icon-color" />
                    </Link>
                </div>

                <div className="flex-1 flex items-center justify-center px-6">
                    <motion.div
                        className="w-full max-w-md"
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                    >
                        <Card className="bg-white/95 backdrop-blur-sm py-8 px-6 sm:px-8 border-0 rounded-3xl shadow-2xl overflow-hidden">
                            <motion.div
                                initial={false}
                                animate={{ height: contentHeight || "auto" }}
                                transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                            >
                                <div ref={contentRef}>
                                    <AnimatePresence mode="wait" initial={false}>
                                        {signupStep === "verify" ? (
                                            <motion.div
                                                key="verify"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSignupStep("email")
                                                        setFormData({ name: "", email: "", password: "" })
                                                        setVerificationCode("")
                                                    }}
                                                    className="flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground -ml-2 mb-6 hover-elevate px-2 py-1 rounded-md"
                                                    data-testid="button-back-to-signup"
                                                >
                                                    <ArrowLeft className="w-4 h-4" />
                                                    Go Back
                                                </button>

                                                <div className="mb-8">
                                                    <h1
                                                        className="font-semibold text-2xl mb-2 text-foreground"
                                                        data-testid="text-verify-headline"
                                                    >
                                                        Verify Email
                                                    </h1>
                                                    <p
                                                        className="text-sm text-foreground/60"
                                                        data-testid="text-verify-description"
                                                    >
                                                        We have sent an email to with a verification code.
                                                        Please enter it below confirm your email.
                                                    </p>
                                                </div>

                                                <form
                                                    onSubmit={handleVerifyEmail}
                                                    className="space-y-6"
                                                >
                                                    <div className="space-y-2">
                                                        <Label
                                                            htmlFor="verification-code"
                                                            className="text-sm font-medium text-foreground"
                                                        >
                                                            Verification code
                                                            <span className="text-red-500">*</span>
                                                        </Label>
                                                        <div className="bg-white dark:bg-white border-2 border-border rounded-full hover:border-foreground/20 focus-within:border-foreground/30 focus-within:shadow-[0_0_0_4px_hsl(var(--foreground)/0.12)] transition-all duration-300 ease-out">
                                                            <Input
                                                                id="verification-code"
                                                                type="text"
                                                                placeholder="Enter one time code"
                                                                value={verificationCode}
                                                                onChange={e =>
                                                                    setVerificationCode(e.target.value)
                                                                }
                                                                required
                                                                className="border-0 bg-transparent h-11 px-4 focus-visible:ring-0 focus-visible:ring-offset-0 text-base text-foreground placeholder:text-base placeholder:text-muted-foreground/60"
                                                                data-testid="input-verification-code"
                                                            />
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm pt-1">
                                                            {timeLeft > 0 ? (
                                                                <>
                                                                    <span className="text-foreground/70">
                                                                        Time left: {timeLeft} sec
                                                                    </span>
                                                                    <button
                                                                        type="button"
                                                                        disabled
                                                                        className="text-red-400 font-medium opacity-50 cursor-not-allowed"
                                                                        data-testid="button-resend-code"
                                                                    >
                                                                        Resend code
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <span className="text-foreground/70">
                                                                        Didn't received the code?
                                                                    </span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={handleResendCode}
                                                                        className="text-red-400 hover:text-red-500 font-medium"
                                                                        data-testid="button-resend-code"
                                                                    >
                                                                        Resend code
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <Button
                                                        variant="darker"
                                                        type="submit"
                                                        className="w-full rounded-full h-11 px-6 text-base font-semibold no-default-hover-elevate no-default-active-elevate transition-colors"
                                                        data-testid="button-confirm"
                                                    >
                                                        Confirm
                                                    </Button>

                                                    <div className="text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setSignupStep("email")
                                                                setFormData({
                                                                    name: "",
                                                                    email: "",
                                                                    password: ""
                                                                })
                                                                setVerificationCode("")
                                                            }}
                                                            className="text-sm text-foreground/70 hover:text-foreground font-medium hover:underline"
                                                            data-testid="button-change-email"
                                                        >
                                                            Change email address
                                                        </button>
                                                    </div>
                                                </form>
                                            </motion.div>
                                        ) : signupStep === "domain" ? (
                                            <motion.div
                                                key="domain"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                                            >
                                                <div className="text-center mb-8">
                                                    <h1
                                                        className="font-semibold text-2xl mb-2 text-foreground"
                                                        data-testid="text-signup-headline"
                                                    >
                                                        First, claim your unique link
                                                    </h1>
                                                    <p
                                                        className="text-sm text-foreground/60"
                                                        data-testid="text-signup-description"
                                                    >
                                                        Choose your personal domain to get started
                                                    </p>
                                                </div>

                                                <form
                                                    onSubmit={handleDomainSubmit}
                                                    className="space-y-6"
                                                >
                                                    <div className="space-y-2">
                                                        <Label
                                                            htmlFor="domain"
                                                            className="text-sm font-medium text-foreground"
                                                        >
                                                            Your Domain
                                                        </Label>
                                                        <div className="flex items-center bg-white dark:bg-white border-2 border-border rounded-full hover:border-foreground/20 focus-within:border-foreground/30 focus-within:shadow-[0_0_0_4px_hsl(var(--foreground)/0.12)] transition-all duration-300 ease-out overflow-hidden">
                                                            <Input
                                                                id="domain"
                                                                type="text"
                                                                placeholder="yourname"
                                                                value={domain}
                                                                onChange={e =>
                                                                    setDomain(
                                                                        e.target.value
                                                                            .toLowerCase()
                                                                            .replace(/[^a-z0-9-]/g, "")
                                                                    )
                                                                }
                                                                required
                                                                className="border-0 bg-transparent h-11 px-4 focus-visible:ring-0 focus-visible:ring-offset-0 text-base text-foreground placeholder:text-base placeholder:text-muted-foreground/60 flex-1"
                                                                data-testid="input-domain"
                                                            />
                                                            <span className="text-sm text-muted-foreground/60 pr-4 whitespace-nowrap">
                                                                .designfolio.me
                                                            </span>
                                                        </div>
                                                        <AnimatePresence>
                                                            {domain && (
                                                                <motion.div
                                                                    initial={{
                                                                        opacity: 0,
                                                                        height: 0,
                                                                        marginTop: 0
                                                                    }}
                                                                    animate={{
                                                                        opacity: 1,
                                                                        height: "auto",
                                                                        marginTop: 8
                                                                    }}
                                                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                                                    transition={{
                                                                        duration: 0.3,
                                                                        ease: "easeOut"
                                                                    }}
                                                                    className="overflow-hidden"
                                                                >
                                                                    <div className="flex items-center gap-2 text-sm text-green-600">
                                                                        <Check className="w-4 h-4" />
                                                                        <span>
                                                                            {domain}.designfolio.me is available!
                                                                        </span>
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>

                                                    <Button
                                                        type="submit"
                                                        variant="darker"
                                                        className="w-full rounded-full h-11 px-6 text-base font-semibold no-default-hover-elevate no-default-active-elevate transition-colors"
                                                        disabled={!domain.trim()}
                                                        data-testid="button-claim-domain"
                                                    >
                                                        Continue
                                                    </Button>

                                                    <p className="text-center text-sm text-foreground/70 mt-6">
                                                        Already have an account?{" "}
                                                        <Link
                                                            href="/login"
                                                            className="hover:underline font-medium"
                                                            style={{ color: "#FF553E" }}
                                                            data-testid="link-login"
                                                        >
                                                            Log in
                                                        </Link>
                                                    </p>
                                                </form>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="account"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        signupStep === "email"
                                                            ? setSignupStep("method")
                                                            : setSignupStep("domain")
                                                    }
                                                    className="flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground -ml-2 mb-6 hover-elevate px-2 py-1 rounded-md"
                                                    data-testid={
                                                        signupStep === "email"
                                                            ? "button-back"
                                                            : "button-back-to-domain"
                                                    }
                                                >
                                                    <ArrowLeft className="w-4 h-4" />
                                                    Back
                                                </button>

                                                <div className="text-center mb-6">
                                                    <h1
                                                        className="font-semibold text-2xl mb-2 text-foreground"
                                                        data-testid="text-signup-headline"
                                                    >
                                                        Now, create your account.
                                                    </h1>
                                                    <p
                                                        className="text-sm text-foreground/60"
                                                        data-testid="text-signup-description"
                                                    >
                                                        Just a step away from claiming{" "}
                                                        <span
                                                            className="font-medium"
                                                            style={{ color: "#FF553E" }}
                                                        >
                                                            {domain}.designfolio.me
                                                        </span>
                                                    </p>
                                                </div>

                                                <AnimatePresence mode="wait">
                                                    {signupStep === "method" ? (
                                                        <motion.div
                                                            key="method-content"
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -10 }}
                                                            transition={{
                                                                duration: 0.25,
                                                                ease: [0.4, 0, 0.2, 1]
                                                            }}
                                                            className="space-y-4"
                                                        >
                                                            {fieldErrors.general && (
                                                                <div className="text-center">
                                                                    <p className="text-sm text-red-500 mb-4" data-testid="error-general">
                                                                        {fieldErrors.general}
                                                                    </p>
                                                                </div>
                                                            )}
                                                            <div
                                                                className={`bg-white border border-border rounded-full px-5 py-3 flex items-center justify-center gap-3 hover-elevate cursor-pointer ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                onClick={loading ? undefined : handleGoogleSignup}
                                                                data-testid="button-signup-google"
                                                            >
                                                                <img
                                                                    src="/assets/svgs/google.svg"
                                                                    alt=""
                                                                    className="w-5 h-5"
                                                                />
                                                                <span className="text-base font-medium text-foreground">
                                                                    {loading ? "Signing up..." : "Sign up with Google"}
                                                                </span>
                                                            </div>

                                                            <div className="relative my-6">
                                                                <div className="absolute inset-0 flex items-center">
                                                                    <span className="w-full border-t border-border" />
                                                                </div>
                                                                <div className="relative flex justify-center text-xs uppercase">
                                                                    <span className="bg-white px-3 text-muted-foreground font-medium">
                                                                        OR
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div
                                                                className="bg-white border border-border rounded-full px-5 py-3 flex items-center justify-center gap-3 hover-elevate cursor-pointer"
                                                                onClick={() => setSignupStep("email")}
                                                                data-testid="button-signup-email"
                                                            >
                                                                <Mail className="w-5 h-5 text-foreground" />
                                                                <span className="text-base font-medium text-foreground">
                                                                    Sign up with Email
                                                                </span>
                                                            </div>
                                                        </motion.div>
                                                    ) : (
                                                        <motion.div
                                                            key="email-content"
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -10 }}
                                                            transition={{
                                                                duration: 0.25,
                                                                ease: [0.4, 0, 0.2, 1]
                                                            }}
                                                        >
                                                            <form
                                                                onSubmit={handleEmailSignup}
                                                                className="space-y-5"
                                                            >
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: 10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    transition={{ duration: 0.3, delay: 0.1 }}
                                                                    className="space-y-2"
                                                                >
                                                                    <Label
                                                                        htmlFor="name"
                                                                        className="text-sm font-medium text-foreground"
                                                                    >
                                                                        Full name
                                                                        <span className="text-red-500">*</span>
                                                                    </Label>
                                                                    <div
                                                                        className={`bg-white dark:bg-white border-2 rounded-full transition-all duration-300 ease-out ${fieldErrors.name
                                                                            ? "border-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.12)]"
                                                                            : "border-border hover:border-foreground/20 focus-within:border-foreground/30 focus-within:shadow-[0_0_0_4px_hsl(var(--foreground)/0.12)]"
                                                                            }`}
                                                                    >
                                                                        <Input
                                                                            id="name"
                                                                            type="text"
                                                                            placeholder="John Doe"
                                                                            value={formData.name}
                                                                            onChange={e => {
                                                                                setFormData({
                                                                                    ...formData,
                                                                                    name: e.target.value
                                                                                })
                                                                                if (fieldErrors.name) {
                                                                                    setFieldErrors({
                                                                                        ...fieldErrors,
                                                                                        name: ""
                                                                                    })
                                                                                }
                                                                            }}
                                                                            className="border-0 bg-transparent h-11 px-4 focus-visible:ring-0 focus-visible:ring-offset-0 text-base text-foreground placeholder:text-base placeholder:text-muted-foreground/60"
                                                                            data-testid="input-name"
                                                                        />
                                                                    </div>
                                                                    {fieldErrors.name && (
                                                                        <p
                                                                            className="text-sm text-red-500 mt-1"
                                                                            data-testid="error-name"
                                                                        >
                                                                            {fieldErrors.name}
                                                                        </p>
                                                                    )}
                                                                </motion.div>

                                                                <motion.div
                                                                    initial={{ opacity: 0, y: 10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    transition={{ duration: 0.3, delay: 0.2 }}
                                                                    className="space-y-2"
                                                                >
                                                                    <Label
                                                                        htmlFor="email"
                                                                        className="text-sm font-medium text-foreground"
                                                                    >
                                                                        Email address
                                                                        <span className="text-red-500">*</span>
                                                                    </Label>
                                                                    <div
                                                                        className={`bg-white dark:bg-white border-2 rounded-full transition-all duration-300 ease-out ${fieldErrors.email
                                                                            ? "border-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.12)]"
                                                                            : "border-border hover:border-foreground/20 focus-within:border-foreground/30 focus-within:shadow-[0_0_0_4px_hsl(var(--foreground)/0.12)]"
                                                                            }`}
                                                                    >
                                                                        <Input
                                                                            id="email"
                                                                            type="email"
                                                                            placeholder="john@example.com"
                                                                            value={formData.email}
                                                                            onChange={e => {
                                                                                setFormData({
                                                                                    ...formData,
                                                                                    email: e.target.value
                                                                                })
                                                                                if (fieldErrors.email) {
                                                                                    setFieldErrors({
                                                                                        ...fieldErrors,
                                                                                        email: ""
                                                                                    })
                                                                                }
                                                                            }}
                                                                            className="border-0 bg-transparent h-11 px-4 focus-visible:ring-0 focus-visible:ring-offset-0 text-base text-foreground placeholder:text-base placeholder:text-muted-foreground/60"
                                                                            data-testid="input-email"
                                                                        />
                                                                    </div>
                                                                    {fieldErrors.email && (
                                                                        <p
                                                                            className="text-sm text-red-500 mt-1"
                                                                            data-testid="error-email"
                                                                        >
                                                                            {fieldErrors.email}
                                                                        </p>
                                                                    )}
                                                                </motion.div>

                                                                <motion.div
                                                                    initial={{ opacity: 0, y: 10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    transition={{ duration: 0.3, delay: 0.3 }}
                                                                    className="space-y-2"
                                                                >
                                                                    <Label
                                                                        htmlFor="password"
                                                                        className="text-sm font-medium text-foreground"
                                                                    >
                                                                        Password
                                                                        <span className="text-red-500">*</span>
                                                                    </Label>
                                                                    <div
                                                                        className={`bg-white dark:bg-white border-2 rounded-full transition-all duration-300 ease-out ${fieldErrors.password
                                                                            ? "border-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.12)]"
                                                                            : "border-border hover:border-foreground/20 focus-within:border-foreground/30 focus-within:shadow-[0_0_0_4px_hsl(var(--foreground)/0.12)]"
                                                                            }`}
                                                                    >
                                                                        <Input
                                                                            id="password"
                                                                            type="password"
                                                                            placeholder="Create a strong password"
                                                                            value={formData.password}
                                                                            onChange={e => {
                                                                                setFormData({
                                                                                    ...formData,
                                                                                    password: e.target.value
                                                                                })
                                                                                if (fieldErrors.password) {
                                                                                    setFieldErrors({
                                                                                        ...fieldErrors,
                                                                                        password: ""
                                                                                    })
                                                                                }
                                                                            }}
                                                                            className="border-0 bg-transparent h-11 px-4 focus-visible:ring-0 focus-visible:ring-offset-0 text-base text-foreground placeholder:text-base placeholder:text-muted-foreground/60"
                                                                            data-testid="input-password"
                                                                        />
                                                                    </div>
                                                                    {fieldErrors.password && (
                                                                        <p
                                                                            className="text-sm text-red-500 mt-1"
                                                                            data-testid="error-password"
                                                                        >
                                                                            {fieldErrors.password}
                                                                        </p>
                                                                    )}
                                                                    {!fieldErrors.password && (
                                                                        <p className="text-xs text-muted-foreground pt-1">
                                                                            Must be at least 8 characters long
                                                                        </p>
                                                                    )}
                                                                </motion.div>

                                                                <Button
                                                                    variant="darker"
                                                                    type="submit"
                                                                    className="w-full rounded-full h-11 px-6 text-base font-semibold no-default-hover-elevate no-default-active-elevate transition-colors"
                                                                    disabled={loading}
                                                                    data-testid="button-create-account"
                                                                >
                                                                    {loading ? "Creating account..." : "Create account"}
                                                                </Button>

                                                                {fieldErrors.general && (
                                                                    <div className="text-center">
                                                                        <p className="text-sm text-red-500 mt-2" data-testid="error-general">
                                                                            {fieldErrors.general}
                                                                        </p>
                                                                    </div>
                                                                )}

                                                                <p className="text-center text-xs text-muted-foreground">
                                                                    By continuing, you agree to Designfolio's{" "}
                                                                    <Link href="/terms-and-conditions" className="hover:underline" style={{ color: "#FF553E" }} data-testid="link-terms">
                                                                        Terms and Conditions
                                                                    </Link>{" "}
                                                                    and{" "}
                                                                    <Link href="/privacy-policy" className="hover:underline" style={{ color: "#FF553E" }} data-testid="link-privacy">
                                                                        Privacy Policy
                                                                    </Link>
                                                                </p>

                                                                <div className="relative my-5">
                                                                    <div className="absolute inset-0 flex items-center">
                                                                        <span className="w-full border-t border-border" />
                                                                    </div>
                                                                    <div className="relative flex justify-center text-xs uppercase">
                                                                        <span className="bg-white px-3 text-muted-foreground font-medium">
                                                                            OR
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                <div
                                                                    className={`bg-white border border-border rounded-full px-5 py-3 flex items-center justify-center gap-3 hover-elevate cursor-pointer ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                    onClick={loading ? undefined : handleGoogleSignup}
                                                                    data-testid="button-signup-google-alt"
                                                                >
                                                                    <img
                                                                        src="/assets/svgs/google.svg"
                                                                        alt=""
                                                                        className="w-5 h-5"
                                                                    />
                                                                    <span className="text-base font-medium text-foreground">
                                                                        {loading ? "Signing up..." : "Sign up with Google"}
                                                                    </span>
                                                                </div>
                                                            </form>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        </Card>
                    </motion.div>
                </div>

                <TrustedBySection backgroundColor="transparent" />
            </div>
        </div>
    )
}
