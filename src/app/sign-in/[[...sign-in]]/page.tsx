import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="auth-page">
      <SignIn
        appearance={{
          elements: {
            footer: { display: "none" },
            footerAction: { display: "none" },
            poweredByClerk: { display: "none" },
          },
        }}
      />
    </div>
  );
}
