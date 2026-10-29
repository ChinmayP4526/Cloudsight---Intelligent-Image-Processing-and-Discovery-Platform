import { useState } from "react";
import { signIn, signUp, confirmSignUp } from "aws-amplify/auth";

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    background: "#101522",
    color: "#f4f6fb",
    fontFamily: "system-ui, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    padding: "32px",
    borderRadius: "18px",
    background: "#1a2232",
    border: "1px solid #303c50",
  },
  input: {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    marginTop: "7px",
    marginBottom: "17px",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #43516a",
    background: "#101522",
    color: "white",
    fontSize: "15px",
  },
  button: {
    width: "100%",
    padding: "13px",
    border: 0,
    borderRadius: "8px",
    background: "#38a9ff",
    color: "#081321",
    fontWeight: 700,
    cursor: "pointer",
  },
};

export default function AuthPage({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      if (mode === "signup") {
        const result = await signUp({
          username: email.trim().toLowerCase(),
          password,
          options: {
            userAttributes: {
              email: email.trim().toLowerCase(),
              phone_number: phone.trim(),
            },
          },
        });

        if (result.isSignUpComplete) {
          setMode("login");
          setMessage("Account created. You can now sign in.");
        } else {
          setMode("verify");
          setMessage("Check your email for the verification code.");
        }
      } else if (mode === "verify") {
        await confirmSignUp({
          username: email.trim().toLowerCase(),
          confirmationCode: code.trim(),
        });

        setMode("login");
        setCode("");
        setMessage("Email verified successfully. Please sign in.");
      } else {
        await signIn({
          username: email.trim().toLowerCase(),
          password,
        });

        await onAuthenticated();
      }
    } catch (error) {
      setMessage(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const isSignup = mode === "signup";
  const isVerify = mode === "verify";

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div
          style={{
            fontSize: 13,
            color: "#70c2ff",
            fontWeight: 700,
            letterSpacing: 2,
          }}
        >
          CLOUDSIGHT
        </div>

        <h1 style={{ marginTop: 18, fontSize: 28 }}>
          {isVerify
            ? "Verify your email"
            : isSignup
              ? "Create your account"
              : "Welcome back"}
        </h1>

        <p style={{ color: "#aab6ca", lineHeight: 1.6 }}>
          {isVerify
            ? "Enter the verification code sent to your email."
            : "Intelligent image processing and discovery, in your own workspace."}
        </p>

        <form onSubmit={handleSubmit}>
          {isSignup && (
            <>
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                style={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
                required
              />

              <label htmlFor="phone">Phone number</label>
              <input
                id="phone"
                style={styles.input}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+919876543210"
                autoComplete="tel"
                required
              />
            </>
          )}

          {!isVerify && (
            <>
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                style={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />

              <label htmlFor="password">Password</label>

              <div style={{ position: "relative", marginBottom: 17 }}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  style={{ ...styles.input, marginBottom: 0, paddingRight: 48 }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  required
                  minLength={8}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((previous) => !previous)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: 0,
                    color: "#70c2ff",
                    cursor: "pointer",
                    padding: 6,
                  }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </>
          )}

          {isVerify && (
            <>
              <label htmlFor="code">Verification code</label>
              <input
                id="code"
                style={styles.input}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter email code"
                autoComplete="one-time-code"
                required
              />
            </>
          )}

          {message && (
            <div
              role="status"
              style={{
                marginBottom: 16,
                padding: 12,
                borderRadius: 8,
                background: "#26364a",
                color: "#dcecff",
                overflowWrap: "anywhere",
                fontSize: 14,
              }}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
            }}
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : isVerify
                ? "Verify email"
                : isSignup
                  ? "Create account"
                  : "Sign in"}
          </button>
        </form>

        {!isVerify && (
          <p
            style={{
              marginTop: 22,
              textAlign: "center",
              color: "#aab6ca",
            }}
          >
            {isSignup ? "Already registered? " : "New to CloudSight? "}

            <button
              type="button"
              onClick={() => {
                setMode(isSignup ? "login" : "signup");
                setMessage("");
              }}
              style={{
                border: 0,
                padding: 0,
                background: "transparent",
                color: "#70c2ff",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              {isSignup ? "Sign in" : "Create account"}
            </button>
          </p>
        )}

        {isVerify && (
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setMessage("");
            }}
            style={{
              marginTop: 18,
              background: "transparent",
              border: 0,
              color: "#70c2ff",
              cursor: "pointer",
            }}
          >
            Back to sign in
          </button>
        )}
      </div>
    </div>
  );
}
