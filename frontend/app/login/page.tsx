
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;

      if (!API_URL) {
        throw new Error("Backend API URL is not configured");
      }

      const response = await fetch(
        `${API_URL.replace(/\/+$/, "")}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Invalid email or password"
        );
      }

      if (!data.token) {
        throw new Error("Login response did not include a token");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user ?? null));

      router.push("/");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="smartcrm-login-page">
      {/* BACKGROUND DECORATION */}
      <div className="smartcrm-login-bg">
        <div className="smartcrm-bg-grid" />
        <div className="smartcrm-bg-circle circle-one" />
        <div className="smartcrm-bg-circle circle-two" />
        <div className="smartcrm-bg-circle circle-three" />
        <div className="smartcrm-bg-line line-one" />
        <div className="smartcrm-bg-line line-two" />
      </div>

      {/* LEFT BRANDING */}
      <section className="smartcrm-login-brand">
        <div className="smartcrm-brand-content">
          <div className="nexora-logo">
            <div className="nexora-logo-shape">
              <span />
              <span />
              <span />
            </div>
          </div>

          <div className="nexora-brand-name">NEXORA</div>

          <div className="nexora-brand-subtitle">
            CUSTOMER RELATIONSHIP PLATFORM
          </div>

          <div className="smartcrm-brand-heading">
            Build stronger
            <br />
            <span>customer relationships.</span>
          </div>

          <p className="smartcrm-brand-description">
            Manage your customers, leads, deals and
            daily tasks through one intelligent business
            workspace.
          </p>

          {/* FEATURE CARDS */}
          <div className="smartcrm-login-features">
            <div className="smartcrm-login-feature">
              <div className="feature-icon">◈</div>
              <div>
                <strong>Customer Management</strong>
                <small>
                  Everything about your customers in one place.
                </small>
              </div>
            </div>

            <div className="smartcrm-login-feature">
              <div className="feature-icon">↗</div>
              <div>
                <strong>Sales Pipeline</strong>
                <small>
                  Track opportunities from lead to deal.
                </small>
              </div>
            </div>

            <div className="smartcrm-login-feature">
              <div className="feature-icon">✦</div>
              <div>
                <strong>Smart Insights</strong>
                <small>
                  Turn business activity into useful insights.
                </small>
              </div>
            </div>
          </div>
        </div>

        <div className="smartcrm-login-footer">
          © 2026 Nexora Technologies
        </div>
      </section>

      {/* LOGIN CARD */}
      <section className="smartcrm-login-form-section">
        <div className="smartcrm-login-card">
          {/* MOBILE LOGO */}
          <div className="mobile-nexora-logo">
            <div className="nexora-logo-shape">
              <span />
              <span />
              <span />
            </div>
          </div>

          <div className="login-heading">
            <span className="login-eyebrow">WELCOME BACK</span>
            <h1>Sign in to your account</h1>
            <p>
              Enter your credentials to access your
              workspace.
            </p>
          </div>

          {/* ERROR */}
          {error && (
            <div className="login-error" role="alert">
              <div className="error-symbol">!</div>
              <div>
                <strong>Unable to sign in</strong>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* FORM */}
          <form
            onSubmit={handleLogin}
            className="nexora-login-form"
          >
            {/* EMAIL */}
            <div className="login-field">
              <label htmlFor="email">Email address</label>

              <div className="login-input-wrapper">
                <span className="login-input-icon">@</span>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="login-field">
              <div className="password-label-row">
                <label htmlFor="password">Password</label>

                <Link
                  href="/forgot-password"
                  className="forgot-password"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="login-input-wrapper">
                <span className="login-input-icon">•</span>

                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* REMEMBER */}
            <label className="remember-me">
              <input type="checkbox" name="remember" />
              <span>Keep me signed in</span>
            </label>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              className="nexora-login-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="login-spinner" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <span className="login-arrow">→</span>
                </>
              )}
            </button>
          </form>

          {/* DIVIDER */}
          <div className="login-divider">
            <span />
            <p>SECURE ACCESS</p>
            <span />
          </div>

          {/* REGISTER */}
          <div className="create-account">
            <span>Don&apos;t have an account?</span>
            <Link href="/register">Create account</Link>
          </div>

          <div className="security-note">
            <span>🔒</span>
            <span>
              Your connection and credentials are protected.
            </span>
          </div>
        </div>
      </section>

      {/* PAGE CSS */}
      <style jsx>{`
        .smartcrm-login-page {
          min-height: 100vh;
          width: 100%;
          display: flex;
          position: relative;
          overflow: hidden;
          background: #f7f9fc;
          font-family: Arial, Helvetica, sans-serif;
        }

        .smartcrm-login-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .smartcrm-bg-grid {
          position: absolute;
          inset: 0;
          opacity: 0.28;
          background-image:
            linear-gradient(
              rgba(37, 99, 235, 0.05) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(37, 99, 235, 0.05) 1px,
              transparent 1px
            );
          background-size: 42px 42px;
        }

        .smartcrm-bg-circle {
          position: absolute;
          border-radius: 50%;
          filter: blur(1px);
        }

        .circle-one {
          width: 500px;
          height: 500px;
          left: -220px;
          top: -180px;
          background: rgba(37, 99, 235, 0.07);
        }

        .circle-two {
          width: 400px;
          height: 400px;
          right: -160px;
          bottom: -160px;
          background: rgba(124, 58, 237, 0.06);
        }

        .circle-three {
          width: 180px;
          height: 180px;
          right: 42%;
          top: 10%;
          border: 1px solid rgba(37, 99, 235, 0.1);
        }

        .smartcrm-bg-line {
          position: absolute;
          width: 500px;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(37, 99, 235, 0.15),
            transparent
          );
          transform: rotate(-35deg);
        }

        .line-one {
          left: 5%;
          top: 30%;
        }

        .line-two {
          right: 2%;
          top: 65%;
          transform: rotate(35deg);
        }

        /* LEFT SIDE */
        .smartcrm-login-brand {
          width: 52%;
          min-height: 100vh;
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 64px 8%;
          color: white;
          background:
            radial-gradient(
              circle at 15% 15%,
              rgba(37, 99, 235, 0.35),
              transparent 30%
            ),
            linear-gradient(
              145deg,
              #071426,
              #0d1b32 55%,
              #101b35
            );
        }

        .smartcrm-login-brand::after {
          content: "";
          position: absolute;
          inset: 0;
          opacity: 0.08;
          background-image: linear-gradient(
            135deg,
            transparent 40%,
            white 40%,
            white 41%,
            transparent 41%
          );
          background-size: 70px 70px;
          pointer-events: none;
        }

        .smartcrm-brand-content {
          position: relative;
          z-index: 3;
          max-width: 590px;
          margin: auto 0;
        }

        /* LOGO */
        .nexora-logo {
          width: 58px;
          height: 58px;
          border-radius: 17px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 22px;
          background: linear-gradient(145deg, #3b82f6, #2563eb);
          box-shadow: 0 14px 35px rgba(37, 99, 235, 0.35);
        }

        .nexora-logo-shape {
          width: 30px;
          height: 30px;
          position: relative;
          transform: rotate(45deg);
        }

        .nexora-logo-shape span {
          position: absolute;
          display: block;
          border-radius: 4px;
          background: white;
        }

        .nexora-logo-shape span:nth-child(1) {
          width: 11px;
          height: 30px;
          left: 0;
          top: 0;
        }

        .nexora-logo-shape span:nth-child(2) {
          width: 11px;
          height: 30px;
          right: 0;
          top: 0;
          opacity: 0.72;
        }

        .nexora-logo-shape span:nth-child(3) {
          width: 11px;
          height: 11px;
          left: 9px;
          top: 9px;
          background: #bfdbfe;
        }

        .nexora-brand-name {
          font-size: 26px;
          font-weight: 800;
          letter-spacing: 3px;
        }

        .nexora-brand-subtitle {
          margin-top: 7px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 3px;
          color: #93c5fd;
        }

        .smartcrm-brand-heading {
          margin-top: 72px;
          font-size: clamp(38px, 4vw, 60px);
          line-height: 1.08;
          font-weight: 700;
          letter-spacing: -2px;
        }

        .smartcrm-brand-heading span {
          color: #60a5fa;
        }

        .smartcrm-brand-description {
          max-width: 500px;
          margin-top: 24px;
          font-size: 16px;
          line-height: 1.8;
          color: #a8b5c9;
        }

        /* FEATURES */
        .smartcrm-login-features {
          margin-top: 42px;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .smartcrm-login-feature {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .feature-icon {
          width: 39px;
          height: 39px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.09);
          color: #60a5fa;
        }

        .smartcrm-login-feature strong {
          display: block;
          font-size: 13px;
          margin-bottom: 3px;
        }

        .smartcrm-login-feature small {
          color: #8290a5;
          font-size: 11px;
        }

        .smartcrm-login-footer {
          position: relative;
          z-index: 3;
          color: #64748b;
          font-size: 11px;
        }

        /* RIGHT SIDE */
        .smartcrm-login-form-section {
          width: 48%;
          min-height: 100vh;
          position: relative;
          z-index: 3;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 50px;
        }

        .smartcrm-login-card {
          width: 100%;
          max-width: 455px;
          padding: 44px;
          background: rgba(255, 255, 255, 0.94);
          border: 1px solid #e5e7eb;
          border-radius: 24px;
          box-shadow: 0 25px 70px rgba(15, 23, 42, 0.09);
        }

        .mobile-nexora-logo {
          display: none;
        }

        /* HEADING */
        .login-eyebrow {
          display: inline-block;
          margin-bottom: 12px;
          color: #2563eb;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .login-heading h1 {
          margin: 0;
          color: #111827;
          font-size: 30px;
          line-height: 1.2;
          letter-spacing: -0.8px;
        }

        .login-heading p {
          margin: 10px 0 0;
          color: #6b7280;
          font-size: 14px;
          line-height: 1.6;
        }

        /* ERROR */
        .login-error {
          display: flex;
          gap: 12px;
          margin-top: 25px;
          padding: 13px;
          border-radius: 12px;
          border: 1px solid #fecaca;
          background: #fef2f2;
        }

        .error-symbol {
          width: 25px;
          height: 25px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 50%;
          background: #dc2626;
          color: white;
          font-weight: 800;
          font-size: 12px;
        }

        .login-error strong {
          color: #991b1b;
          font-size: 12px;
        }

        .login-error p {
          margin: 3px 0 0;
          color: #b91c1c;
          font-size: 11px;
          overflow-wrap: anywhere;
        }

        /* FORM */
        .nexora-login-form {
          margin-top: 30px;
        }

        .login-field {
          margin-bottom: 22px;
        }

        .login-field label {
          display: block;
          margin-bottom: 8px;
          color: #374151;
          font-size: 12px;
          font-weight: 700;
        }

        .password-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .password-label-row label {
          margin-bottom: 0;
        }

        .forgot-password {
          border: 0;
          padding: 0;
          background: transparent;
          color: #2563eb;
          font-size: 11px;
          cursor: pointer;
          text-decoration: none;
        }

        .forgot-password:hover {
          text-decoration: underline;
        }

        .login-input-wrapper {
          position: relative;
        }

        .login-input-wrapper input {
          width: 100%;
          height: 50px;
          padding: 0 15px 0 44px;
          border: 1px solid #dbe1ea;
          border-radius: 11px;
          outline: none;
          background: white;
          color: #111827;
          font-size: 13px;
          transition: 0.2s;
          box-sizing: border-box;
        }

        .login-input-wrapper input::placeholder {
          color: #a1a9b5;
        }

        .login-input-wrapper input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .login-input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          font-size: 15px;
          z-index: 2;
        }

        /* REMEMBER */
        .remember-me {
          display: flex;
          align-items: center;
          gap: 9px;
          margin: 4px 0 24px;
          color: #6b7280;
          font-size: 11px;
          cursor: pointer;
        }

        .remember-me input {
          width: 14px;
          height: 14px;
          accent-color: #2563eb;
        }

        /* BUTTON */
        .nexora-login-button {
          width: 100%;
          min-height: 51px;
          border: 0;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: white;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 10px 25px rgba(37, 99, 235, 0.22);
          transition: 0.2s;
        }

        .nexora-login-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 14px 30px rgba(37, 99, 235, 0.28);
        }

        .nexora-login-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .login-arrow {
          font-size: 19px;
        }

        .login-spinner {
          width: 15px;
          height: 15px;
          border: 2px solid rgba(255, 255, 255, 0.4);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* DIVIDER */
        .login-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 30px 0 22px;
        }

        .login-divider span {
          flex: 1;
          height: 1px;
          background: #e5e7eb;
        }

        .login-divider p {
          margin: 0;
          color: #9ca3af;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        /* REGISTER */
        .create-account {
          text-align: center;
          font-size: 12px;
          color: #6b7280;
        }

        .create-account a {
          margin-left: 5px;
          color: #2563eb;
          font-weight: 700;
          text-decoration: none;
        }

        .create-account a:hover {
          text-decoration: underline;
        }

        .security-note {
          margin-top: 24px;
          padding-top: 18px;
          border-top: 1px solid #f0f1f3;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          color: #9ca3af;
          font-size: 10px;
          text-align: center;
        }

        /* RESPONSIVE */
        @media (max-width: 1050px) {
          .smartcrm-login-brand {
            width: 48%;
            padding: 50px;
          }

          .smartcrm-login-form-section {
            width: 52%;
            padding: 35px;
          }

          .smartcrm-brand-heading {
            font-size: 43px;
          }

          .smartcrm-login-card {
            padding: 32px;
          }
        }

        @media (max-width: 800px) {
          .smartcrm-login-page {
            display: block;
            min-height: 100vh;
          }

          .smartcrm-login-brand {
            width: 100%;
            min-height: 260px;
            padding: 35px 25px;
            box-sizing: border-box;
          }

          .smartcrm-brand-heading {
            margin-top: 30px;
            font-size: 35px;
          }

          .smartcrm-brand-description,
          .smartcrm-login-features,
          .smartcrm-login-footer {
            display: none;
          }

          .smartcrm-login-form-section {
            width: 100%;
            min-height: auto;
            padding: 30px 18px 50px;
            box-sizing: border-box;
          }

          .smartcrm-login-card {
            max-width: 500px;
            padding: 30px 25px;
          }
        }

        @media (max-width: 480px) {
          .smartcrm-login-brand {
            min-height: 210px;
          }

          .smartcrm-brand-heading {
            font-size: 29px;
          }

          .smartcrm-login-card {
            padding: 25px 20px;
            border-radius: 18px;
          }

          .login-heading h1 {
            font-size: 25px;
          }

          .password-label-row {
            gap: 10px;
          }
        }
      `}</style>
    </main>
  );
}
