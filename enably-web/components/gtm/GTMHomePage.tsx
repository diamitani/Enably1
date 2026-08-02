"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  Clock,
  Database,
  FileText,
  Globe,
  Lock,
  Mail,
  MessageSquare,
  Shield,
  Sparkles,
  Target,
  Users,
  Zap,
} from "lucide-react";
import Nav from "./Nav";

const OUTCOMES = [
  { icon: Clock, stat: "<15 min", label: "to first ICP" },
  { icon: FileText, stat: "3+", label: "exportable assets on Day 1" },
  { icon: Mail, stat: "30 min", label: "to first cadence live" },
  { icon: Database, stat: "Day 1", label: "CRM sync" },
];

const WIZARD_STEPS = [
  { label: "ICP", description: "Define your ideal customer profile — who you sell to, why they buy, and what pain you solve." },
  { label: "Personas", description: "Build detailed buyer personas with job titles, challenges, goals, and buying triggers." },
  { label: "USPs", description: "Articulate your unique selling points in clear, compelling language that resonates with each persona." },
  { label: "Use-Cases", description: "Map your product to real customer scenarios. Make it easy for buyers to see themselves in your solution." },
  { label: "Messaging", description: "Generate email templates, DM snippets, phone scripts, and LinkedIn messages tailored to each ICP." },
  { label: "Positioning", description: "Refine your market positioning and competitive differentiation to win against alternatives." },
];

const INTEGRATIONS = [
  { name: "HubSpot", status: "available", icon: Globe },
  { name: "S3 Storage", status: "available", icon: Database },
  { name: "Clearbit", status: "available", icon: Users },
  { name: "Salesforce", status: "coming soon", icon: Target },
];

const SECURITY_BULLETS = [
  "Row-level auth by workspace",
  "Encrypted integration secrets",
  "Signed S3 uploads",
  "Rate limiting & abuse protection",
];

function DashboardPreviewCard({
  title,
  subtitle,
  icon: Icon,
  progress,
  isChat,
}: {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  progress?: number;
  isChat?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/80 p-4 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#635BFF]/20">
          <Icon className="h-4 w-4 text-[#635BFF]" />
        </div>
        <div>
          <p className="text-sm font-medium text-white">{title}</p>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </div>
      </div>
      {progress !== undefined && (
        <div className="mt-3">
          <div className="h-1.5 rounded-full bg-slate-800">
            <div
              className="h-1.5 rounded-full bg-[#10B981] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      {isChat && (
        <div className="mt-3 rounded-lg bg-slate-800/50 px-3 py-2">
          <p className="text-xs text-slate-300">
            Based on your ICP, I&apos;d lead with the compliance angle...
          </p>
        </div>
      )}
    </div>
  );
}

export default function GTMHomePage() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="min-h-screen bg-[#0B1020]">
      <Nav />

      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-24 md:py-36">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,91,255,0.18),transparent_55%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#635BFF]/30 bg-[#635BFF]/10 px-3 py-1 text-xs text-[#635BFF]"
              >
                <Zap className="h-3 w-3" />
                GTM Operating System
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 }}
                className="text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl"
              >
                Ship your GTM in days,{" "}
                <span className="text-[#635BFF]">not months.</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mt-6 text-lg text-slate-400 md:text-xl leading-relaxed"
              >
                Define ICPs, write playbooks, generate outreach, and sync to
                CRM — backed by a memory-aware GTM assistant.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="mt-8 flex flex-wrap gap-4"
              >
                <Link
                  href="/wizard"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#635BFF] px-6 py-3 font-medium text-white shadow-lg shadow-[#635BFF]/25 transition-all hover:bg-[#5046e5] hover:-translate-y-0.5"
                >
                  Start the GTM Wizard
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-6 py-3 font-medium text-slate-300 transition-all hover:bg-slate-800 hover:text-white"
                >
                  Explore Demo Workspace
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-10 flex items-center gap-4"
              >
                <span className="text-xs uppercase tracking-wider text-slate-500">
                  Trusted by teams at
                </span>
                <div className="flex gap-4 text-sm text-slate-500">
                  {["Y Combinator", "Techstars", "500 Startups"].map((logo) => (
                    <span key={logo} className="hover:text-slate-400 transition-colors cursor-default">
                      {logo}
                    </span>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Hero visual */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#635BFF]/15 to-transparent rounded-3xl blur-3xl" />
              <div className="relative space-y-4">
                <DashboardPreviewCard
                  title="ICP: Mid-Market SaaS Security"
                  subtitle="72% complete — 3 personas defined"
                  icon={Target}
                />
                <DashboardPreviewCard
                  title="Playbook Progress"
                  subtitle="Activity targets set · Cadences live"
                  icon={FileText}
                  progress={72}
                />
                <DashboardPreviewCard
                  title="GTM Assistant"
                  subtitle="Memory-aware · ICP + Playbook context"
                  icon={Bot}
                  isChat
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Outcomes */}
      <section className="px-6 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-2xl font-semibold text-white md:text-3xl">
            From zero to outbound in one afternoon.
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {OUTCOMES.map((outcome, i) => (
              <motion.div
                key={outcome.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                viewport={{ once: true }}
                className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-6 hover:border-[#635BFF]/50 hover:shadow-lg hover:shadow-[#635BFF]/5 transition-all"
              >
                <outcome.icon className="h-8 w-8 text-[#635BFF]" />
                <p className="mt-4 text-3xl font-bold text-white">{outcome.stat}</p>
                <p className="mt-1 text-slate-400">{outcome.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Wizard Stepper */}
      <section className="bg-slate-900/30 px-6 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-white md:text-3xl">
              Build your GTM foundation in 6 steps
            </h2>
            <p className="mt-3 text-slate-400">
              Our guided wizard walks you through everything — ICP to live cadence.
            </p>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
            {WIZARD_STEPS.map((step, i) => (
              <button
                key={step.label}
                onClick={() => setActiveStep(i)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  activeStep === i
                    ? "bg-[#635BFF] text-white shadow-lg shadow-[#635BFF]/25"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                }`}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-xs">
                  {i + 1}
                </span>
                {step.label}
              </button>
            ))}
          </div>
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-center"
          >
            <Sparkles className="mx-auto h-10 w-10 text-[#10B981]" />
            <h3 className="mt-4 text-xl font-semibold text-white">
              {WIZARD_STEPS[activeStep].label}
            </h3>
            <p className="mt-2 max-w-lg mx-auto text-slate-400">
              {WIZARD_STEPS[activeStep].description}
            </p>
            <Link
              href="/wizard"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#635BFF] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#5046e5] transition-colors"
            >
              Start with {WIZARD_STEPS[activeStep].label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Sales Bible + Messaging */}
      <section className="px-6 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8">
              <BarChart3 className="h-10 w-10 text-[#635BFF]" />
              <h3 className="mt-4 text-xl font-semibold text-white">
                Sales Bible & Activity Targets
              </h3>
              <p className="mt-2 text-slate-400">
                Set daily targets, define SOPs, and build email cadences that convert. Everything your SDR team needs to execute.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["40 emails/day", "20 DMs/day", "30 calls/day"].map((tag) => (
                  <span key={tag} className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8">
              <MessageSquare className="h-10 w-10 text-[#10B981]" />
              <h3 className="mt-4 text-xl font-semibold text-white">
                Template Generator
              </h3>
              <p className="mt-2 text-slate-400">
                Generate personalized email templates, DM snippets, and phone scripts with dynamic variable chips.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {[["{{first_name}}", "#635BFF"], ["{{pain_point}}", "#10B981"], ["{{company}}", null]].map(([tag, color]) => (
                  <span
                    key={tag as string}
                    className="rounded-full px-3 py-1 text-sm"
                    style={color ? { backgroundColor: `${color}20`, color } : { backgroundColor: "#1e293b", color: "#cbd5e1" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Research & Enrichment */}
      <section className="bg-slate-900/30 px-6 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <Globe className="h-10 w-10 text-[#635BFF]" />
                <h3 className="mt-4 text-xl font-semibold text-white">
                  Research & Enrichment
                </h3>
                <p className="mt-2 max-w-lg text-slate-400">
                  Enter a company domain and get an instant snapshot with buying signals and triggers for personalized outreach.
                </p>
              </div>
              <Link
                href="/research"
                className="inline-flex items-center gap-2 rounded-xl bg-[#10B981] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#059669] transition-colors whitespace-nowrap"
              >
                <Mail className="h-4 w-4" />
                Generate Email
              </Link>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { label: "Company", value: "Acme Corp" },
                { label: "Industry", value: "SaaS / B2B" },
                { label: "Trigger", value: "Recent funding round", highlight: true },
              ].map(({ label, value, highlight }) => (
                <div key={label} className="rounded-xl bg-slate-800/50 p-4">
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className={`mt-1 text-lg font-medium ${highlight ? "text-[#10B981]" : "text-white"}`}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Assistant with Memory */}
      <section className="px-6 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <Bot className="h-12 w-12 text-[#635BFF]" />
              <h2 className="mt-4 text-2xl font-semibold text-white md:text-3xl">
                Assistant with Memory
              </h2>
              <p className="mt-4 text-slate-400 leading-relaxed">
                Chat with an AI that remembers your ICP, Playbook, and current leads. Get personalized suggestions grounded in your actual GTM context.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["ICP Context", "Playbook Context", "Current Lead"].map((tag) => (
                  <span key={tag} className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-300">
                    {tag}
                  </span>
                ))}
              </div>
              <Link
                href="/assistant"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#635BFF] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#5046e5] transition-colors"
              >
                Open Assistant
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#635BFF]">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 rounded-xl bg-slate-800/50 p-4">
                  <p className="text-slate-300">
                    Based on your ICP targeting mid-market security buyers, I&apos;d recommend leading with the compliance angle. Here&apos;s a suggested opener for your email sequence...
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    Source: ICP Definition v2 · Playbook · Messaging Templates
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="bg-slate-900/30 px-6 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-2xl font-semibold text-white md:text-3xl">
            Integrations
          </h2>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            {INTEGRATIONS.map((integration) => (
              <div
                key={integration.name}
                className={`flex items-center gap-3 rounded-xl border px-6 py-4 transition-all ${
                  integration.status === "available"
                    ? "border-[#10B981]/40 bg-[#10B981]/10 hover:border-[#10B981]/60"
                    : "border-slate-700 bg-slate-800/50"
                }`}
              >
                <integration.icon
                  className={`h-6 w-6 ${integration.status === "available" ? "text-[#10B981]" : "text-slate-500"}`}
                />
                <div>
                  <p className="font-medium text-white">{integration.name}</p>
                  <p className={`text-xs ${integration.status === "available" ? "text-[#10B981]" : "italic text-slate-500"}`}>
                    {integration.status === "available" ? "Available" : "Coming soon"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="px-6 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8">
            <Shield className="h-10 w-10 text-[#635BFF]" />
            <h3 className="mt-4 text-xl font-semibold text-white">
              Security & Compliance
            </h3>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {SECURITY_BULLETS.map((bullet) => (
                <li key={bullet} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#10B981]" />
                  <span className="text-slate-300">{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#635BFF]">
                  <Zap className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="font-bold text-white">Enably</span>
              </div>
              <p className="mt-3 text-sm text-slate-400">
                The GTM operating system for modern sales teams.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white">Product</h4>
              <ul className="mt-4 space-y-2 text-sm text-slate-400">
                {[["Wizard", "/wizard"], ["Dashboard", "/dashboard"], ["Playbook", "/playbook"], ["Messaging", "/messaging"]].map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="hover:text-white transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white">Company</h4>
              <ul className="mt-4 space-y-2 text-sm text-slate-400">
                {["About", "Blog", "Careers"].map((label) => (
                  <li key={label}>
                    <a href="#" className="hover:text-white transition-colors">{label}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white">Resources</h4>
              <ul className="mt-4 space-y-2 text-sm text-slate-400">
                {["Documentation", "Help Center", "Privacy", "Terms"].map((label) => (
                  <li key={label}>
                    <a href="#" className="hover:text-white transition-colors">{label}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-10 flex items-center justify-between border-t border-slate-800 pt-8">
            <p className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} Enably. All rights reserved.
            </p>
            <div className="flex gap-4 text-sm text-slate-500">
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
