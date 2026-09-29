import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/ciris/bits";

export const Route = createFileRoute("/engineering")({
  head: () => ({ meta: [
    { title: "Engineering — CIRIS" },
    { name: "description", content: "CIRIS Engineering section." },
    { property: "og:title", content: "Engineering — CIRIS" },
    { property: "og:description", content: "CIRIS Engineering section." },
  ] }),
  component: () => (
    <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-8 md:px-6">
      <PageHeader crumb="CIRIS / Engineering" title="Engineering" description="Coming soon. This section is being built in the next pass." />
      <Link to="/console" className="inline-flex rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Open Live Console</Link>
    </div>
  ),
});
