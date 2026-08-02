"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Circle,
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
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import Nav from "@/components/gtm/Nav";
import { cn } from "@/lib/utils";

const FOUNDATION_SECTIONS = ["ICP", "Personas", "USPs", "Use-Cases", "Messaging", "Positioning"];
const PLAYBOOK_CHIPS = [
  { label: "Activity Targets", done: true },
  { label: "SOPs", done: true },
  { label: "Cadences", done: false },
  { label: "Qualification", done: false },
];
const SAMPLE_TASKS = [
  { type: "email", count: 40, label: "Send 40 emails" },
  { type: "dm", count: 20, label: "Send 20 DMs" },
  { type: "call", count: 30, label: "Make 30 calls" },
];
const SAMPLE_DOCS = [
  { title: "Mid-Market SaaS Security Buyers", type: "ICP", updated: "Today" },
  { title: "CISO Persona v2", type: "Persona", updated: "Today" },
  { title: "Outbound Cadence A", type: "Playbook", updated: "Yesterday" },
];
const METRICS = [
  { label: "Assets exported", value: "12", sub: "this week" },
  { label: "Meetings booked", value: "8", sub: "this month" },
  { label: "Reply rate", value: "24%", sub: "avg last 30d" },
];

function TaskIcon({ type }: { type: string }) {
  const map: Record<string, React.ElementType> = {
    email: Mail,
    dm: MessageSquare,
    call: Users,
  };
  const Icon = map[type] || Target;
  return (
    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#635BFF]/20">
      <Icon className="h-4 w-4 text-[#635BFF]" />
    </div>
  );
}

export default function GTMDashboardPage() {
  const [assistantInput, setAssistantInput] = useState("");
  const [researchUrl, setResearchUrl] = useState("");
  const foundationComplete = 0.67;
  const hasICP = true;

  return (
    <div className="min-h-screen bg-[#0B1020]">
      <Nav />
      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="mt-1 text-slate-400">Your GTM at a glance.</p>
          </div>
          {hasICP ? (
            <Link
              href="/playbook"
              className="inline-flex items-center gap-2 rounded-xl bg-[#635BFF] px-4 py-2 text-sm font-medium text-white hover:bg-[#5046e5] transition-colors shadow-lg shadow-[#635BFF]/20"
            >
              Open Playbook
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <Link
              href="/wizard"
              className="inline-flex items-center gap-2 rounded-xl bg-[#635BFF] px-4 py-2 text-sm font-medium text-white hover:bg-[#5046e5] transition-colors"
            >
              Start the GTM Wizard
              <Sparkles className="h-4 w-4" />
            </Link>
          )}
        </div>

        {/* New user checklist */}
        {!hasICP && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-2xl border border-[#635BFF]/30 bg-[#635BFF]/10 p-6"
          >
            <h3 className="font-semibold text-white">Get started in 3 steps</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                { label: "Connect CRM", desc: "Sync with HubSpot or Salesforce" },
                { label: "Create ICP", desc: "Define your ideal customer" },
                { label: "Add first template", desc: "Start with email or DM" },
              ].map((step) => (
                <div key={step.label} className="flex items-start gap-3 rounded-xl bg-slate-900/50 p-4">
                  <Circle className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-600" />
                  <div>
                    <p className="text-sm font-medium text-white">{step.label}</p>
                    <p className="text-xs text-slate-400">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Progress Overview */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* GTM Foundation */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">GTM Foundation</h3>
              <span className="text-sm text-[#10B981]">{Math.round(foundationComplete * 100)}%</span>
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-slate-800">
              <div
                className="h-1.5 rounded-full bg-[#10B981] transition-all"
                style={{ width: `${foundationComplete * 100}%` }}
              />
            </div>
            <ul className="mt-4 space-y-2">
              {FOUNDATION_SECTIONS.map((s, i) => (
                <li key={s} className="flex items-center gap-2 text-sm">
                  {i < 4 ? (
                    <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
                  ) : (
                    <Circle className="h-4 w-4 text-slate-700" />
                  )}
                  <span className={i < 4 ? "text-slate-300" : "text-slate-500"}>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Playbook Readiness */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <h3 className="font-semibold text-white">Playbook Readiness</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {PLAYBOOK_CHIPS.map((chip) => (
                <span
                  key={chip.label}
                  className={cn(
                    "rounded-full px-3 py-1 text-sm flex items-center gap-1",
                    chip.done
                      ? "bg-[#10B981]/20 text-[#10B981]"
                      : "bg-slate-800 text-slate-400"
                  )}
                >
                  {chip.done && <CheckCircle2 className="h-3 w-3" />}
                  {chip.label}
                </span>
              ))}
            </div>
            <p className="mt-4 text-sm text-slate-500">
              Framework: <span className="text-white">MEDDICC</span>
            </p>
            <Link
              href="/playbook"
              className="mt-4 inline-flex items-center gap-1 text-sm text-[#635BFF] hover:underline"
            >
              Edit Playbook <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Integrations */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <h3 className="font-semibold text-white">Integrations</h3>
            <div className="mt-4 space-y-3">
              {[
                { name: "HubSpot", connected: true },
                { name: "S3 Storage", connected: true },
                { name: "Clearbit / Enrichment", connected: false },
                { name: "Salesforce", connected: false, soon: true },
              ].map((integration) => (
                <div key={integration.name} className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">{integration.name}</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs",
                      integration.connected
                        ? "bg-[#10B981]/20 text-[#10B981]"
                        : integration.soon
                        ? "bg-slate-800 text-slate-500 italic"
                        : "bg-slate-800 text-slate-500"
                    )}
                  >
                    {integration.connected ? "Connected" : integration.soon ? "Coming soon" : "Not connected"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Today's Focus + Recent Docs */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Today's Focus */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">Today&apos;s Focus</h3>
              <span className="text-sm text-slate-500">
                {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
              </span>
            </div>
            <ul className="mt-4 space-y-3">
              {SAMPLE_TASKS.map((task) => (
                <li
                  key={task.type}
                  className="flex items-center justify-between rounded-xl bg-slate-800/50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <TaskIcon type={task.type} />
                    <span className="text-sm text-slate-300">{task.label}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-700 hover:text-white transition-colors">
                      <Play className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Recent Documents */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">Recent Documents</h3>
              <button className="text-sm text-[#635BFF] hover:underline">View all</button>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-left text-xs text-slate-500">
                    <th className="pb-2 font-medium">Title</th>
                    <th className="pb-2 font-medium">Type</th>
                    <th className="pb-2 font-medium">Updated</th>
                    <th className="pb-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {SAMPLE_DOCS.map((doc) => (
                    <tr key={doc.title} className="border-b border-slate-800/50">
                      <td className="py-3 pr-3 text-white text-xs">{doc.title}</td>
                      <td className="py-3 pr-3">
                        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
                          {doc.type}
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-xs text-slate-400">{doc.updated}</td>
                      <td className="py-3">
                        <div className="flex gap-1">
                          <button className="rounded p-1 text-slate-500 hover:text-white transition-colors">
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button className="rounded p-1 text-slate-500 hover:text-white transition-colors">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </button>
                          <button className="rounded p-1 text-slate-500 hover:text-white transition-colors">
                            <Pin className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-700 py-3 text-sm text-slate-500 hover:border-slate-600 hover:text-slate-400 transition-colors">
              <Plus className="h-4 w-4" />
              Generate new document
            </button>
          </div>
        </div>

        {/* Assistant + Research */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Assistant Shortcut */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#635BFF]/20">
                <Bot className="h-5 w-5 text-[#635BFF]" />
              </div>
              <div>
                <h3 className="font-semibold text-white">GTM Assistant</h3>
                <p className="text-sm text-slate-400">Knows your ICP, Playbook &amp; leads</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <input
                type="text"
                value={assistantInput}
                onChange={(e) => setAssistantInput(e.target.value)}
                placeholder="Draft a cadence for my CISO persona..."
                className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-[#635BFF] focus:outline-none transition-colors"
              />
              <Link
                href={`/assistant${assistantInput ? `?q=${encodeURIComponent(assistantInput)}` : ""}`}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#635BFF] text-white hover:bg-[#5046e5] transition-colors"
              >
                <Send className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {["Draft email sequence", "Analyze this lead", "Refine my ICP"].map((chip) => (
                <button
                  key={chip}
                  onClick={() => setAssistantInput(chip)}
                  className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-400 hover:border-[#635BFF]/50 hover:text-white transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Research Quick Add */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#10B981]/20">
                <Globe className="h-5 w-5 text-[#10B981]" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Research Quick Add</h3>
                <p className="text-sm text-slate-400">Enter a domain for instant snapshot</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <input
                type="text"
                value={researchUrl}
                onChange={(e) => setResearchUrl(e.target.value)}
                placeholder="acme.com"
                className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-[#10B981] focus:outline-none transition-colors"
              />
              <button
                disabled={!researchUrl}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#10B981] text-white hover:bg-[#059669] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
            <button
              disabled={!researchUrl}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 py-2.5 text-sm text-slate-400 hover:border-[#10B981]/50 hover:text-[#10B981] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Mail className="h-4 w-4" />
              Draft Email from Triggers
            </button>
          </div>
        </div>

        {/* Metrics */}
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {METRICS.map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6"
            >
              <p className="text-sm text-slate-400">{metric.label}</p>
              <p className="mt-2 text-3xl font-bold text-white">{metric.value}</p>
              <p className="mt-1 text-xs text-slate-500">{metric.sub}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}
