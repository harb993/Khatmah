import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="auth-page">
      <SignUp
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
