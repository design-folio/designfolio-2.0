import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useGoogleLogin } from '@react-oauth/google';
import { _loginWithEmail, _loginWithGmail } from '@/network/post-request';
import { setToken } from '@/lib/cooikeManager';
import { Mail } from 'lucide-react';
import Link from 'next/link';
import { AuthLayout } from '@/components/ui/auth-layout';
import { FormInput } from '@/components/ui/form-input';
import { FormButton } from '@/components/ui/form-button';
import { GoogleButton } from '@/components/ui/google-button';
import { Divider } from '@/components/ui/divider';
import { motion } from 'framer-motion';
import { usePostHogEvent } from '@/hooks/usePostHogEvent';
import { usePostHogIdentify } from '@/hooks/usePostHogIdentify';
import { POSTHOG_EVENT_NAMES } from '@/lib/posthogEventNames';

const LoginValidationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string().required('Password is required'),
});

export default function Login() {
  const [loginStep, setLoginStep] = useState('method');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const event = usePostHogEvent();
  const identify = usePostHogIdentify();

  useEffect(() => {
    if (router) {
      router.prefetch('/builder');
      router.prefetch('/email-verify');
    }
  }, [router]);

  const googleLogin = useGoogleLogin({
    onSuccess: async tokenResponse => {
      try {
        setIsLoading(true);
        const response = await fetch(
          'https://www.googleapis.com/oauth2/v2/userinfo',
          {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          }
        );
        const userData = await response.json();

        const data = {
          loginMethod: 1,
          googleID: userData.id,
        };

        const res = await _loginWithGmail(data);
        const { token, emailVerification } = res.data;

        setToken(token);
        const redirect =
          router.query.redirect && typeof router.query.redirect === 'string'
            ? router.query.redirect
            : '/builder';
        router.push(emailVerification ? redirect : '/email-verify');

        identify(userData.email, {
          email: userData.email,
        });
        event(POSTHOG_EVENT_NAMES.LOGIN_SUCCESS, {
          method: 'google',
          email: userData.email,
        });
      } catch (err) {
        event(POSTHOG_EVENT_NAMES.LOGIN_FAILED, {
          method: 'google',
          error: err?.response?.data?.message || err.message,
        });
        console.error('Google login failed:', err);
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => console.log('Google login failed'),
  });

  const handleEmailLogin = async (values, actions) => {
    try {
      setIsLoading(true);
      const data = {
        loginMethod: 0,
        email: values.email,
        password: values.password,
      };
      const res = await _loginWithEmail(data);
      const { token, emailVerification } = res.data;
      setToken(token);
      const redirect =
        router.query.redirect && typeof router.query.redirect === 'string'
          ? router.query.redirect
          : '/builder';
      router.push(
        emailVerification ? redirect : `/email-verify?email=${values.email}`
      );

      identify(data.email, {
        email: data.email,
      });
      event(POSTHOG_EVENT_NAMES.LOGIN_SUCCESS, {
        method: 'email',
        email: data.email,
      });
    } catch (err) {
      event(POSTHOG_EVENT_NAMES.LOGIN_FAILED, {
        method: 'email',
        error: err?.response?.data?.message || err.message,
      });

      console.error('Email login error:', err);
    } finally {
      setIsLoading(false);
      actions.setSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    event(POSTHOG_EVENT_NAMES.LOGIN_STARTED);
    event(POSTHOG_EVENT_NAMES.LOGIN_METHOD_SELECTED, {
      method: 'google',
    });
    googleLogin();
  };

  if (loginStep === 'email') {
    return (
      <AuthLayout
        title="Log in with email"
        description="Enter your credentials to continue"
        showBackButton
        onBack={() => setLoginStep('method')}
      >
        <motion.div
          key="email"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        >
          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={LoginValidationSchema}
            onSubmit={handleEmailLogin}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form className="space-y-5">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="space-y-2"
                >
                  <FormInput
                    name="email"
                    type="email"
                    label="Email"
                    placeholder="you@example.com"
                    required
                    errors={errors}
                    touched={touched}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="space-y-2"
                >
                  <FormInput
                    name="password"
                    type="password"
                    label="Password"
                    placeholder="Enter your password"
                    required
                    errors={errors}
                    touched={touched}
                  />
                </motion.div>

                <div className="flex justify-end">
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium hover:underline text-[#FF553E]"
                  >
                    Forgot password?
                  </Link>
                </div>

                <FormButton
                  type="submit"
                  isLoading={isLoading}
                  disabled={isSubmitting}
                >
                  Log in
                </FormButton>

                <Divider />

                <GoogleButton onClick={handleGoogleLogin} isLoading={isLoading}>
                  Log in with Google
                </GoogleButton>

                <p className="text-center text-sm text-foreground/70 mt-6">
                  Don't have an account?{' '}
                  <Link
                    href="/claim-link"
                    className="hover:underline font-medium text-[#FF553E] cursor-pointer"
                  >
                    Sign up
                  </Link>
                </p>
              </Form>
            )}
          </Formik>
        </motion.div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Welcome back"
      description="Log in to your account to continue"
    >
      <motion.div
        key="method"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="space-y-4">
          <GoogleButton onClick={handleGoogleLogin} isLoading={isLoading}>
            Log in with Google
          </GoogleButton>

          <Divider />

          <div
            className="bg-white border border-border rounded-full px-5 py-3 flex items-center justify-center gap-3 hover-elevate cursor-pointer"
            onClick={() => {
              event(POSTHOG_EVENT_NAMES.LOGIN_STARTED);
              event(POSTHOG_EVENT_NAMES.LOGIN_METHOD_SELECTED, {
                method: 'email',
              });
              setLoginStep('email');
            }}
          >
            <Mail className="w-5 h-5 text-foreground" />
            <span className="text-base font-medium text-foreground">
              Log in with Email
            </span>
          </div>
        </div>

        <p className="text-center text-sm text-foreground/70 mt-8">
          Don't have an account?{' '}
          <Link
            href="/claim-link"
            className="hover:underline font-medium text-[#FF553E] cursor-pointer"
          >
            Sign up
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  );
}
