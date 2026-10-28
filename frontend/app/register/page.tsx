"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;

      if (!API_URL) {
        throw new Error("Backend API URL is not configured.");
      }

      const response = await fetch(
        `${API_URL.replace(/\/+$/, "")}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Registration failed"
        );
      }

      router.push("/login");
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
    <main className="smartcrm-register-page">

      {/* BACKGROUND */}

      <div className="smartcrm-register-bg">

        <div className="register-grid" />

        <div className="register-orb orb-one" />
        <div className="register-orb orb-two" />

      </div>

      {/* LEFT BRAND PANEL */}

      <section className="smartcrm-register-brand">

        <div className="register-brand-content">

          {/* LOGO */}

          <div className="register-logo">

            <div className="register-logo-shape">
              <span />
              <span />
              <span />
            </div>

          </div>

          <div className="register-brand-name">
            NEXORA
          </div>

          <div className="register-brand-subtitle">
            CUSTOMER RELATIONSHIP PLATFORM
          </div>

          <h1>
            Start managing
            <br />
            <span>your business smarter.</span>
          </h1>

          <p>
            Create your workspace and bring customers,
            leads, deals and tasks together in one
            organized platform.
          </p>

          {/* BENEFITS */}

          <div className="register-benefits">

            <div className="register-benefit">
              <div>01</div>
              <span>
                Organize your customer data
              </span>
            </div>

            <div className="register-benefit">
              <div>02</div>
              <span>
                Track your sales pipeline
              </span>
            </div>

            <div className="register-benefit">
              <div>03</div>
              <span>
                Manage your daily tasks
              </span>
            </div>

          </div>

        </div>

        <div className="register-brand-footer">
          © 2026 Nexora Technologies
        </div>

      </section>

      {/* REGISTER FORM */}

      <section className="smartcrm-register-form-section">

        <div className="smartcrm-register-card">

          <div className="register-heading">

            <span>
              GET STARTED
            </span>

            <h2>
              Create your account
            </h2>

            <p>
              Set up your SmartCRM workspace in a few
              simple steps.
            </p>

          </div>

          {/* ERROR */}

          {error && (
            <div className="register-error">

              <div className="register-error-icon">
                !
              </div>

              <div>
                <strong>
                  Registration failed
                </strong>

                <p>
                  {error}
                </p>
              </div>

            </div>
          )}

          <form
            onSubmit={handleRegister}
            className="register-form"
          >

            {/* NAME */}

            <div className="register-field">

              <label htmlFor="name">
                Full name
              </label>

              <div className="register-input-wrapper">

                <span>
                  ◎
                </span>

                <input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  required
                />

              </div>

            </div>

            {/* EMAIL */}

            <div className="register-field">

              <label htmlFor="email">
                Email address
              </label>

              <div className="register-input-wrapper">

                <span>
                  @
                </span>

                <input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  required
                />

              </div>

            </div>

            {/* PASSWORD */}

            <div className="register-field">

              <label htmlFor="password">
                Password
              </label>

              <div className="register-input-wrapper">

                <span>
                  •
                </span>

                <input
                  id="password"
                  type="password"
                  placeholder="Create a secure password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  minLength={6}
                  required
                />

              </div>

              <div className="password-hint">
                Use at least 6 characters.
              </div>

            </div>

            {/* TERMS */}

            <label className="register-terms">

              <input
                type="checkbox"
                required
              />

              <span>
                I agree to the{" "}
                <strong>
                  Terms of Service
                </strong>{" "}
                and{" "}
                <strong>
                  Privacy Policy
                </strong>
              </span>

            </label>

            {/* BUTTON */}

            <button
              type="submit"
              className="register-button"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="register-spinner" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <span>→</span>
                </>
              )}

            </button>

          </form>

          {/* DIVIDER */}

          <div className="register-divider">
            <span />
            <small>
              ALREADY HAVE AN ACCOUNT?
            </small>
            <span />
          </div>

          <div className="register-login-link">

            <Link href="/login">
              ← Back to sign in
            </Link>

          </div>

          <div className="register-security">
            🔒 Your account information is securely
            transmitted.
          </div>

        </div>

      </section>

      {/* PAGE CSS */}

      <style jsx>{`

        .smartcrm-register-page {
          min-height: 100vh;
          width: 100%;
          display: flex;
          position: relative;
          overflow: hidden;
          background: #f7f9fc;
          font-family: Arial, Helvetica, sans-serif;
        }

        /* BACKGROUND */

        .smartcrm-register-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .register-grid {
          position: absolute;
          inset: 0;
          opacity: 0.3;

          background-image:
            linear-gradient(
              rgba(37, 99, 235, 0.045) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(37, 99, 235, 0.045) 1px,
              transparent 1px
            );

          background-size: 45px 45px;
        }

        .register-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(2px);
        }

        .orb-one {
          width: 450px;
          height: 450px;
          left: -200px;
          bottom: -200px;
          background: rgba(37, 99, 235, 0.07);
        }

        .orb-two {
          width: 300px;
          height: 300px;
          right: -120px;
          top: -100px;
          background: rgba(99, 102, 241, 0.07);
        }

        /* BRAND */

        .smartcrm-register-brand {
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
              circle at 80% 20%,
              rgba(37,99,235,0.3),
              transparent 28%
            ),
            linear-gradient(
              145deg,
              #071426,
              #0d1b32 55%,
              #111c35
            );
        }

        .register-brand-content {
          max-width: 570px;
          margin: auto 0;
        }

        /* LOGO */

        .register-logo {
          width: 58px;
          height: 58px;
          border-radius: 17px;

          display: flex;
          align-items: center;
          justify-content: center;

          background: linear-gradient(
            145deg,
            #3b82f6,
            #2563eb
          );

          box-shadow:
            0 15px 35px rgba(37,99,235,0.35);

          margin-bottom: 20px;
        }

        .register-logo-shape {
          width: 30px;
          height: 30px;
          position: relative;
          transform: rotate(45deg);
        }

        .register-logo-shape span {
          position: absolute;
          display: block;
          border-radius: 4px;
          background: white;
        }

        .register-logo-shape span:nth-child(1) {
          width: 11px;
          height: 30px;
          left: 0;
          top: 0;
        }

        .register-logo-shape span:nth-child(2) {
          width: 11px;
          height: 30px;
          right: 0;
          top: 0;
          opacity: 0.7;
        }

        .register-logo-shape span:nth-child(3) {
          width: 11px;
          height: 11px;
          left: 9px;
          top: 9px;
          background: #bfdbfe;
        }

        .register-brand-name {
          font-size: 26px;
          font-weight: 800;
          letter-spacing: 3px;
        }

        .register-brand-subtitle {
          margin-top: 7px;
          color: #93c5fd;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 3px;
        }

        .register-brand-content h1 {
          margin-top: 65px;
          margin-bottom: 22px;

          font-size: clamp(38px, 4vw, 57px);
          line-height: 1.08;
          letter-spacing: -2px;
        }

        .register-brand-content h1 span {
          color: #60a5fa;
        }

        .register-brand-content > p {
          max-width: 500px;
          color: #a8b5c9;
          font-size: 15px;
          line-height: 1.8;
        }

        /* BENEFITS */

        .register-benefits {
          margin-top: 40px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .register-benefit {
          display: flex;
          align-items: center;
          gap: 15px;
          color: #dbeafe;
          font-size: 13px;
        }

        .register-benefit div {
          width: 36px;
          height: 36px;

          display: flex;
          align-items: center;
          justify-content: center;

          border: 1px solid rgba(96,165,250,0.25);
          border-radius: 9px;

          color: #60a5fa;
          background: rgba(255,255,255,0.04);

          font-size: 10px;
          font-weight: 800;
        }

        .register-brand-footer {
          color: #64748b;
          font-size: 11px;
        }

        /* FORM SIDE */

        .smartcrm-register-form-section {
          width: 48%;
          min-height: 100vh;

          position: relative;
          z-index: 3;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 45px;
        }

        .smartcrm-register-card {
          width: 100%;
          max-width: 455px;

          padding: 42px;

          background: rgba(255,255,255,0.95);

          border: 1px solid #e5e7eb;
          border-radius: 24px;

          box-shadow:
            0 25px 70px rgba(15,23,42,0.09);
        }

        /* HEADING */

        .register-heading > span {
          display: inline-block;
          margin-bottom: 11px;

          color: #2563eb;

          font-size: 10px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .register-heading h2 {
          margin: 0;

          color: #111827;

          font-size: 30px;
          line-height: 1.2;
          letter-spacing: -0.8px;
        }

        .register-heading p {
          margin-top: 10px;

          color: #6b7280;

          font-size: 13px;
          line-height: 1.6;
        }

        /* ERROR */

        .register-error {
          display: flex;
          gap: 12px;

          margin-top: 22px;
          padding: 13px;

          border: 1px solid #fecaca;
          border-radius: 12px;

          background: #fef2f2;
        }

        .register-error-icon {
          width: 25px;
          height: 25px;
          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background: #dc2626;
          color: white;

          font-size: 12px;
          font-weight: 800;
        }

        .register-error strong {
          color: #991b1b;
          font-size: 12px;
        }

        .register-error p {
          margin: 3px 0 0;

          color: #b91c1c;
          font-size: 11px;
        }

        /* FORM */

        .register-form {
          margin-top: 27px;
        }

        .register-field {
          margin-bottom: 18px;
        }

        .register-field label {
          display: block;
          margin-bottom: 8px;

          color: #374151;

          font-size: 12px;
          font-weight: 700;
        }

        .register-input-wrapper {
          position: relative;
        }

        .register-input-wrapper span {
          position: absolute;

          left: 15px;
          top: 50%;

          transform: translateY(-50%);

          color: #94a3b8;
          font-size: 15px;

          z-index: 2;
        }

        .register-input-wrapper input {
          width: 100%;
          height: 49px;

          box-sizing: border-box;

          padding: 0 15px 0 43px;

          border: 1px solid #dbe1ea;
          border-radius: 11px;

          outline: none;

          background: white;
          color: #111827;

          font-size: 13px;

          transition: 0.2s;
        }

        .register-input-wrapper input::placeholder {
          color: #a1a9b5;
        }

        .register-input-wrapper input:focus {
          border-color: #3b82f6;

          box-shadow:
            0 0 0 3px rgba(59,130,246,0.1);
        }

        .password-hint {
          margin-top: 6px;

          color: #9ca3af;
          font-size: 10px;
        }

        /* TERMS */

        .register-terms {
          display: flex;
          align-items: flex-start;
          gap: 9px;

          margin: 5px 0 22px;

          color: #6b7280;

          font-size: 10px;
          line-height: 1.6;

          cursor: pointer;
        }

        .register-terms input {
          width: 14px;
          height: 14px;
          margin-top: 1px;

          accent-color: #2563eb;
        }

        .register-terms strong {
          color: #374151;
        }

        /* BUTTON */

        .register-button {
          width: 100%;
          height: 51px;

          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;

          border: 0;
          border-radius: 11px;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #1d4ed8
            );

          color: white;

          font-size: 13px;
          font-weight: 700;

          cursor: pointer;

          box-shadow:
            0 10px 25px rgba(37,99,235,0.22);

          transition: 0.2s;
        }

        .register-button:hover:not(:disabled) {
          transform: translateY(-1px);

          box-shadow:
            0 14px 30px rgba(37,99,235,0.28);
        }

        .register-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .register-button > span {
          font-size: 19px;
        }

        .register-spinner {
          width: 15px;
          height: 15px;

          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: white;

          border-radius: 50%;

          animation: registerSpin 0.7s linear infinite;
        }

        @keyframes registerSpin {
          to {
            transform: rotate(360deg);
          }
        }

        /* DIVIDER */

        .register-divider {
          display: flex;
          align-items: center;
          gap: 10px;

          margin: 28px 0 18px;
        }

        .register-divider span {
          flex: 1;
          height: 1px;
          background: #e5e7eb;
        }

        .register-divider small {
          color: #9ca3af;

          font-size: 8px;
          font-weight: 800;
          letter-spacing: 1.3px;
        }

        /* LOGIN */

        .register-login-link {
          text-align: center;
        }

        .register-login-link a {
          color: #2563eb;

          font-size: 12px;
          font-weight: 700;

          text-decoration: none;
        }

        .register-login-link a:hover {
          text-decoration: underline;
        }

        .register-security {
          margin-top: 21px;
          padding-top: 17px;

          border-top: 1px solid #f0f1f3;

          text-align: center;

          color: #9ca3af;
          font-size: 10px;
        }

        /* RESPONSIVE */

        @media (max-width: 1050px) {

          .smartcrm-register-brand {
            width: 48%;
            padding: 50px;
          }

          .smartcrm-register-form-section {
            width: 52%;
            padding: 30px;
          }

          .register-brand-content h1 {
            font-size: 42px;
          }

        }

        @media (max-width: 800px) {

          .smartcrm-register-page {
            display: block;
          }

          .smartcrm-register-brand {
            width: 100%;
            min-height: 240px;
            padding: 35px 25px;
          }

          .register-brand-content h1 {
            margin-top: 30px;
            font-size: 32px;
          }

          .register-brand-content > p,
          .register-benefits,
          .register-brand-footer {
            display: none;
          }

          .smartcrm-register-form-section {
            width: 100%;
            min-height: auto;
            padding: 30px 18px 50px;
          }

          .smartcrm-register-card {
            max-width: 500px;
            padding: 30px 25px;
          }

        }

        @media (max-width: 480px) {

          .smartcrm-register-card {
            padding: 25px 20px;
            border-radius: 18px;
          }

          .register-heading h2 {
            font-size: 25px;
          }

        }

      `}</style>

    </main>
  );
}
