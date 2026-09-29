import { Link } from "@tanstack/react-router";
import { useCiris } from "@/lib/ciris/store";

/** Global emergency banner, shown on every app page while a safety event is active. */
export function SafetyBanner() {
  const { sim, cancelSOS, resolveSafety, triggerSOS, contacts } = useCiris();
  if (sim.safety === "fall_detected") {
    return (
      <div role="alert" className="border border-critical/60 bg-critical/10 p-4 md:flex md:items-center md:justify-between md:gap-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-critical">Fall detected · Emergency response initiated</p>
          <p className="mt-1 text-sm">SOS will be sent in <span className="font-mono text-lg text-critical tabular">{sim.countdown}s</span> unless cancelled. Haptic alert pulsing (simulated).</p>
        </div>
        <div className="mt-3 flex gap-2 md:mt-0">
          <button onClick={cancelSOS} className="min-h-11 rounded-sm bg-foreground px-5 text-sm font-medium text-background">I'm OK — cancel</button>
          <button onClick={() => triggerSOS("Safety / Countdown override")} className="min-h-11 rounded-sm border border-critical px-4 text-sm text-critical">Send SOS now</button>
        </div>
      </div>
    );
  }
  if (sim.safety === "sos_active") {
    const primary = contacts.find((c) => c.is_primary) ?? contacts[0];
    return (
      <div role="alert" className="border border-critical/60 bg-critical/10 p-4 md:flex md:items-center md:justify-between md:gap-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-critical">SOS active · simulated</p>
          <p className="mt-1 text-sm">
            {primary ? <>Would notify <b>{primary.name}</b> ({primary.phone}){contacts.length > 1 ? ` and ${contacts.length - 1} more` : ""}. </> : <>No emergency contacts configured. <Link to="/safety" className="underline">Add contacts</Link>. </>}
            No real messages are sent in this prototype.
          </p>
        </div>
        <div className="mt-3 flex gap-2 md:mt-0">
          <button onClick={cancelSOS} className="min-h-11 rounded-sm border border-border px-4 text-sm">Cancel SOS</button>
          <button onClick={resolveSafety} className="min-h-11 rounded-sm bg-foreground px-4 text-sm font-medium text-background">Mark resolved</button>
        </div>
      </div>
    );
  }
  return null;
}
