import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock,
  Copy,
  ExternalLink,
  Eye,
  FileText,
  Globe,
  Mail,
  MessageSquare,
  Pin,
  Play,
  Plus,
  Search,
  Send,
  Settings,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@nous-research/ui/ui/components/button";
import { cn } from "@/lib/utils";

const FOUNDATION_SECTIONS = ["ICP", "Personas", "USPs", "Use-Cases", "Messaging", "Positioning"];
const PLAYBOOK_CHIPS = ["Activity Targets", "SOPs", "Cadences", "Qualification"];
const INTEGRATION_STATUS = {
  hubspot: true,
  s3: true,
  enrichment: false,
};

const SAMPLE_TASKS = [
  { type: "email", count: 40, label: "Send 40 emails" },
  { type: "dm", count: 20, label: "Send 20 DMs" },
  { type: "call", count: 30, label: "Make 30 calls" },
];

const SAMPLE_DOCS = [
  { title: "Mid-Market SaaS Security Buyers", type: "ICP", updated: "2025-08-09" },
  { title: "CISO Persona v2", type: "Persona", updated: "2025-08-09" },
  { title: "Outbound Cadence A", type: "Playbook", updated: "2025-08-08" },
];

const METRICS = [
  { label: "Assets exported this week", value: "12" },
  { label: "Meetings booked", value: "8" },
  { label: "Reply rate", value: "24%" },
];

export default function GTMDashboardPage() {
  const [assistantInput, setAssistantInput] = useState("");
  const [researchUrl, setResearchUrl] = useState("");
  const foundationComplete = 0.72;
  const hasICP = true;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B1020] to-[#0F172A] p-6">
      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-slate-400">Your GTM at a glance.</p>
          </div>
          {hasICP ? (
            <Link to="/playbook">
              <Button className="bg-[#635BFF] text-white hover:bg-[#5046e5]">
                Open Playbook
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Link to="/wizard">
              <Button className="bg-[#635BFF] text-white hover:bg-[#5046e5]">
                Start the GTM Wizard
                <Sparkles className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>

        {/* Setup Checklist for new users */}
        {!hasICP && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-2xl border border-[#635BFF]/30 bg-[#635BFF]/10 p-6"
          >
            <h3 className="font-semibold text-white">Get started in 3 steps</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <SetupStep
                done={false}
                label="Connect CRM"
                description="Sync with HubSpot or Salesforce"
              />
              <SetupStep
                done={false}
                label="Create ICP"
                description="Define your ideal customer"
              />
              <SetupStep
                done={false}
                label="Add first template"
                description="Start with email or DM"
              />
            </div>
          </motion.div>
        )}

        {/* Progress Overview */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* GTM Foundation */}
          <ProgressCard
            title="GTM Foundation"
            progress={foundationComplete}
            items={FOUNDATION_SECTIONS.map((s, i) => ({
              label: s,
              done: i < 4,
            }))}
          />

          {/* Playbook Readiness */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <h3 className="font-semibold text-white">Playbook Readiness</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {PLAYBOOK_CHIPS.map((chip, i) => (
                <span
                  key={chip}
                  className={cn(
                    "rounded-full px-3 py-1 text-sm",
                    i < 2
                      ? "bg-[#10B981]/20 text-[#10B981]"
                      : "bg-slate-800 text-slate-400"
                  )}
                >
                  {i < 2 && <CheckCircle2 className="mr-1 inline h-3 w-3" />}
                  {chip}
                </span>
              ))}
            </div>
            <p className="mt-4 text-sm text-slate-500">
              Qualification: <span className="text-white">MEDDICC</span>
            </p>
          </div>

          {/* Integrations */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <h3 className="font-semibold text-white">Integrations</h3>
            <div className="mt-4 space-y-3">
              <IntegrationRow
                name="HubSpot"
                connected={INTEGRATION_STATUS.hubspot}
              />
              <IntegrationRow name="S3" connected={INTEGRATION_STATUS.s3} />
              <IntegrationRow
                name="Enrichment"
                connected={INTEGRATION_STATUS.enrichment}
              />
            </div>
          </div>
        </div>

        {/* Today's Focus + Recent Documents */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Today's Focus */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">Today's Focus</h3>
              <span className="text-sm text-slate-500">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            {SAMPLE_TASKS.length > 0 ? (
              <ul className="mt-4 space-y-3">
                {SAMPLE_TASKS.map((task) => (
                  <li
                    key={task.type}
                    className="flex items-center justify-between rounded-xl bg-slate-800/50 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <TaskIcon type={task.type} />
                      <span className="text-slate-300">{task.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        ghost
                        size="sm"
                        className="text-slate-400 hover:text-white"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        ghost
                        size="sm"
                        className="text-slate-400 hover:text-white"
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={Target}
                message="No tasks yet—set Activity Targets in your Playbook."
              />
            )}
          </div>

          {/* Recent Documents */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">Recent Documents</h3>
              <Link
                to="/files"
                className="text-sm text-[#635BFF] hover:underline"
              >
                View all
              </Link>
            </div>
            {SAMPLE_DOCS.length > 0 ? (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-left text-slate-500">
                      <th className="pb-2 font-medium">Title</th>
                      <th className="pb-2 font-medium">Type</th>
                      <th className="pb-2 font-medium">Updated</th>
                      <th className="pb-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SAMPLE_DOCS.map((doc) => (
                      <tr
                        key={doc.title}
                        className="border-b border-slate-800/50"
                      >
                        <td className="py-3 text-white">{doc.title}</td>
                        <td className="py-3">
                          <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
                            {doc.type}
                          </span>
                        </td>
                        <td className="py-3 text-slate-400">{doc.updated}</td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            <Button
                              ghost
                              size="sm"
                              className="text-slate-400 hover:text-white"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              ghost
                              size="sm"
                              className="text-slate-400 hover:text-white"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            <Button
                              ghost
                              size="sm"
                              className="text-slate-400 hover:text-white"
                            >
                              <Pin className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                icon={FileText}
                message="No recent docs yet. Create your first ICP."
                actionLabel="Generate your first ICP"
                actionLink="/wizard"
              />
            )}
          </div>
        </div>

        {/* Assistant Shortcut + Research Quick Add */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Assistant Shortcut */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#635BFF]/20">
                <Bot className="h-5 w-5 text-[#635BFF]" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Assistant</h3>
                <p className="text-sm text-slate-400">
                  Ask anything about your GTM
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <input
                type="text"
                value={assistantInput}
                onChange={(e) => setAssistantInput(e.target.value)}
                placeholder="Ask the assistant to draft a cadence..."
                className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder:text-slate-500 focus:border-[#635BFF] focus:outline-none focus:ring-1 focus:ring-[#635BFF]"
              />
              <Button
                className="bg-[#635BFF] text-white hover:bg-[#5046e5]"
                disabled={!assistantInput}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <SuggestionChip label="Draft email sequence" />
              <SuggestionChip label="Analyze this lead" />
              <SuggestionChip label="Refine my ICP" />
            </div>
          </div>

          {/* Research Quick Add */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#10B981]/20">
                <Globe className="h-5 w-5 text-[#10B981]" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Research Quick Add</h3>
                <p className="text-sm text-slate-400">
                  Enter a domain to create a snapshot
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <input
                type="text"
                value={researchUrl}
                onChange={(e) => setResearchUrl(e.target.value)}
                placeholder="acme.com"
                className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder:text-slate-500 focus:border-[#10B981] focus:outline-none focus:ring-1 focus:ring-[#10B981]"
              />
              <Button
                className="bg-[#10B981] text-white hover:bg-[#059669]"
                disabled={!researchUrl}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <Button
              ghost
              className="mt-3 w-full justify-center border border-slate-700 text-slate-400 hover:border-[#10B981] hover:text-[#10B981]"
              disabled={!researchUrl}
            >
              <Mail className="mr-2 h-4 w-4" />
              Draft Email from Triggers
            </Button>
          </div>
        </div>

        {/* Right Rail Metrics (xl+ screens) */}
        <div className="mt-8 hidden xl:block">
          <div className="grid grid-cols-3 gap-6">
            {METRICS.map((metric) => (
              <div
                key={metric.label}
                className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6"
              >
                <p className="text-sm text-slate-400">{metric.label}</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {metric.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgressCard({
  title,
  progress,
  items,
}: {
  title: string;
  progress: number;
  items: { label: string; done: boolean }[];
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">{title}</h3>
        <span className="text-sm text-[#10B981]">
          {Math.round(progress * 100)}%
        </span>
      </div>
      <div className="mt-3 h-2 rounded-full bg-slate-800">
        <div
          className="h-2 rounded-full bg-[#10B981] transition-all"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-2 text-sm">
            {item.done ? (
              <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
            ) : (
              <Circle className="h-4 w-4 text-slate-600" />
            )}
            <span className={item.done ? "text-slate-300" : "text-slate-500"}>
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function IntegrationRow({
  name,
  connected,
}: {
  name: string;
  connected: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-300">{name}</span>
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-xs",
          connected
            ? "bg-[#10B981]/20 text-[#10B981]"
            : "bg-slate-800 text-slate-500"
        )}
      >
        {connected ? "Connected" : "Not connected"}
      </span>
    </div>
  );
}

function TaskIcon({ type }: { type: string }) {
  const icons: Record<string, typeof Mail> = {
    email: Mail,
    dm: MessageSquare,
    call: Users,
  };
  const Icon = icons[type] || Target;
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#635BFF]/20">
      <Icon className="h-4 w-4 text-[#635BFF]" />
    </div>
  );
}

function EmptyState({
  icon: Icon,
  message,
  actionLabel,
  actionLink,
}: {
  icon: typeof FileText;
  message: string;
  actionLabel?: string;
  actionLink?: string;
}) {
  return (
    <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 py-8 text-center">
      <Icon className="h-10 w-10 text-slate-600" />
      <p className="mt-3 text-slate-400">{message}</p>
      {actionLabel && actionLink && (
        <Link to={actionLink} className="mt-4">
          <Button className="bg-[#635BFF] text-white hover:bg-[#5046e5]">
            {actionLabel}
          </Button>
        </Link>
      )}
    </div>
  );
}

function SetupStep({
  done,
  label,
  description,
}: {
  done: boolean;
  label: string;
  description: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        done
          ? "border-[#10B981]/50 bg-[#10B981]/10"
          : "border-slate-700 bg-slate-800/50"
      )}
    >
      <div className="flex items-center gap-2">
        {done ? (
          <CheckCircle2 className="h-5 w-5 text-[#10B981]" />
        ) : (
          <Circle className="h-5 w-5 text-slate-600" />
        )}
        <span className="font-medium text-white">{label}</span>
      </div>
      <p className="mt-1 text-sm text-slate-400">{description}</p>
    </div>
  );
}

function SuggestionChip({ label }: { label: string }) {
  return (
    <button className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-400 hover:border-[#635BFF] hover:text-[#635BFF] transition-colors">
      {label}
    </button>
  );
}
