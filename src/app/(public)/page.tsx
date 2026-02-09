import { PRE_LAUNCH_MODE } from "@/lib/config";
import { PreLaunchLanding } from "@/components/landing/pre-launch-landing";
import { MainLanding } from "@/components/landing/main-landing";

/** Query param to bypass pre-launch and show main landing (e.g. ?view=main) */
const BYPASS_PRELAUNCH_PARAM = "view";
const BYPASS_PRELAUNCH_VALUE = "main";

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const bypassPreLaunch = params[BYPASS_PRELAUNCH_PARAM] === BYPASS_PRELAUNCH_VALUE;

  if (PRE_LAUNCH_MODE && !bypassPreLaunch) {
    return <PreLaunchLanding />;
  }

  return <MainLanding />;
}
