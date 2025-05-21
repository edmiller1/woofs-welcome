import { Metadata } from "next";
import { WelcomeLoader } from "./components/welcome-loader";

export const metadata: Metadata = {
  title: "Signing in",
  description: "Signing you into your account",
};

const WelcomePage = () => {
  return (
    <div className="min-h-screen flex w-full flex-1 items-center justify-center px-4">
      <WelcomeLoader />
    </div>
  );
};

export default WelcomePage;
