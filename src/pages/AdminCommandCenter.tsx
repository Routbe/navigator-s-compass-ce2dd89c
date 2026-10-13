import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { AlertTriangle, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ControlHeader, ControlMetric, ControlTable, ControlError } from "@/components/admin/ControlCenterUI";
import { commandQuery } from "@/lib/admin-control.queries";
import { webhookHealth } from "@/lib/admin-control-rules";

export default function AdminCommandCenter() {
  const { data, refetch, isFetching, isRefetchError } = useSuspenseQuery(commandQuery);
  const actions = [
    { label: "Verificatie-aanvragen", count: data.verificationRequests, to: "/admin/verifications" },
    { label: "SEPA reviews", count: data.sepaReviews, to: "/admin/finance" },
    { label: "Mislukte webhooks", count: data.failedWebhooks, to: "/admin/infra" },
  ] as const;
  return <AppLayout width="wide"><ControlHeader title="Mission Control" subtitle="Leden, identiteit en operationele aandachtspunten." refreshing={isFetching} refresh={() => void refetch()} />
    <ControlError error={isRefetchError} />
    <div className="mb-10 grid grid-cols-2 gap-6 lg:grid-cols-4">
      <ControlMetric label="Actieve leden" value={data.activeMembers} detail={`${data.totalMembers} profielen totaal`} />
      <ControlMetric label="Uitgedeelde badges" value={data.standardBadges + data.customBadges} detail={`${data.customBadges} wapenschilden · ${data.standardBadges} platformbadges`} />
      <ControlMetric label="Open verificaties" value={data.verificationRequests} />
      <ControlMetric label="Mislukte webhooks" value={data.failedWebhooks} />
    </div>
    <section className="mb-10"><h2 className="mb-4 flex items-center gap-2 text-lg font-semibold"><AlertTriangle className="h-5 w-5 text-warning" /> Action Required</h2>
      <ul className="divide-y divide-border border-y border-border">{actions.map((a) => <li key={a.to}><Link to={a.to} className="flex items-center justify-between gap-4 py-4"><span className="flex items-center gap-3">{a.count ? <AlertTriangle className="h-4 w-4 text-warning" /> : <CheckCircle2 className="h-4 w-4 text-accent" />}{a.label}</span><span className="flex items-center gap-4"><b className="tabular-nums">{a.count}</b><ArrowUpRight className="h-4 w-4" /></span></Link></li>)}</ul>
    </section>
    <section><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold">Recente systeemevents</h2><Link to="/admin/infra" className="text-sm underline">Logboek</Link></div>
      <ControlTable headers={["Bron", "Event", "Status", "Ontvangen"]} empty={!data.events.length}>{data.events.map((e) => <tr key={e.id}><td className="px-3 py-3">{e.source}</td><td className="px-3 py-3">{e.kind ?? "—"}</td><td className={`px-3 py-3 ${webhookHealth(e.status) === "failed" ? "text-destructive" : "text-muted-foreground"}`}>{e.status}</td><td className="whitespace-nowrap px-3 py-3 text-xs">{new Date(e.createdAt).toLocaleString("nl-BE")}</td></tr>)}</ControlTable>
    </section><p className="mt-4 text-xs text-muted-foreground">Bijgewerkt {new Date(data.updatedAt).toLocaleString("nl-BE")}</p>
  </AppLayout>;
}