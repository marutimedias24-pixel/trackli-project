// ─────────────────────────────────────────────────────────
//  PASTE THIS FILE as:  src/PrivacyTermsPages.jsx
//  Then in App.jsx add routes or show conditionally
// ─────────────────────────────────────────────────────────

const PageWrapper = ({ children }) => (
  <div
    style={{
      minHeight: "100vh",
      background: "#050709",
      color: "#eef2ff",
      fontFamily: "'DM Sans',sans-serif",
      padding: "60px 20px",
    }}
  >
    <div style={{ maxWidth: 740, margin: "0 auto" }}>
      <a
        href="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          color: "#00e676",
          textDecoration: "none",
          fontSize: 14,
          fontWeight: 600,
          marginBottom: 40,
        }}
      >
        ← Back to Trackli
      </a>
      {children}
    </div>
  </div>
);

const H1 = ({ children }) => (
  <h1
    style={{
      fontFamily: "'Syne',sans-serif",
      fontSize: 36,
      fontWeight: 900,
      color: "#eef2ff",
      letterSpacing: "-0.03em",
      marginBottom: 8,
    }}
  >
    {children}
  </h1>
);
const H2 = ({ children }) => (
  <h2
    style={{
      fontFamily: "'Syne',sans-serif",
      fontSize: 20,
      fontWeight: 700,
      color: "#eef2ff",
      marginTop: 36,
      marginBottom: 12,
    }}
  >
    {children}
  </h2>
);
const P = ({ children }) => (
  <p
    style={{
      fontSize: 15,
      color: "#5a6a8a",
      lineHeight: 1.8,
      marginBottom: 12,
    }}
  >
    {children}
  </p>
);

// ── PRIVACY POLICY ──────────────────────────────────────
export const PrivacyPage = () => (
  <PageWrapper>
    <H1>Privacy Policy</H1>
    <P style={{ color: "#2d3a50" }}>Last updated: April 2026</P>

    <H2>1. What We Collect</H2>
    <P>
      We collect your email address and password (encrypted) when you register.
      We also store the income/expense data you enter — client names, amounts,
      dates.
    </P>

    <H2>2. How We Store It</H2>
    <P>
      Your data is stored securely on Supabase servers (hosted on AWS). We never
      sell your data to anyone. Your financial data is private to your account
      only.
    </P>

    <H2>3. Cookies</H2>
    <P>
      We use browser localStorage to remember your login session. No advertising
      cookies. No third-party tracking cookies.
    </P>

    <H2>4. Analytics</H2>
    <P>
      We use Google Analytics 4 to understand how many people use the app (page
      views, button clicks). This data is anonymous — we cannot identify you
      from it.
    </P>

    <H2>5. Payments</H2>
    <P>
      Payments are handled via UPI / Razorpay. We do not store your card or bank
      details. Trackli only receives confirmation that payment was successful.
    </P>

    <H2>6. Your Rights</H2>
    <P>
      You can delete your account anytime by emailing us. All your data will be
      permanently deleted within 7 days.
    </P>

    <H2>7. Contact</H2>
    <P>
      For any privacy concerns:{" "}
      <a href="mailto:support@trackli.in" style={{ color: "#00e676" }}>
        support@trackli.in
      </a>
    </P>
  </PageWrapper>
);

// ── TERMS OF SERVICE ────────────────────────────────────
export const TermsPage = () => (
  <PageWrapper>
    <H1>Terms of Service</H1>
    <P style={{ color: "#2d3a50" }}>Last updated: April 2026</P>

    <H2>1. Service</H2>
    <P>
      Trackli is a freelance income tracking tool. It is provided "as-is". We do
      not guarantee 100% uptime but aim for 99%+ availability.
    </P>

    <H2>2. Subscription & Payment</H2>
    <P>
      Trackli offers a 30-day free trial. After that, the subscription is
      ₹60/month. Payment is manual via UPI — you receive an unlock code after
      payment confirmation.
    </P>

    <H2>3. Refund Policy</H2>
    <P>
      Due to the digital nature of the service, we do not offer refunds. If you
      have an issue, contact us at support@trackli.in and we will resolve it.
    </P>

    <H2>4. Acceptable Use</H2>
    <P>
      You may not use Trackli to store illegal financial information, share your
      account with others, or attempt to hack the platform.
    </P>

    <H2>5. Data</H2>
    <P>
      You own your data. We will not access it without your permission. If you
      cancel, your data is retained for 30 days then deleted.
    </P>

    <H2>6. Changes</H2>
    <P>We may update these terms. Major changes will be notified via email.</P>

    <H2>7. Contact</H2>
    <P>
      Questions? Email:{" "}
      <a href="mailto:support@trackli.in" style={{ color: "#00e676" }}>
        support@trackli.in
      </a>
    </P>
  </PageWrapper>
);
