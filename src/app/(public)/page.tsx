import { PRE_LAUNCH_MODE } from "@/lib/config";
import { PreLaunchLanding } from "@/components/landing/pre-launch-landing";
import { MainLanding } from "@/components/landing/main-landing";

export default function LandingPage() {
  if (PRE_LAUNCH_MODE) {
    return <PreLaunchLanding />;
  }

  return <MainLanding />;
}
