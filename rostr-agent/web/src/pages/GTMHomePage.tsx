import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
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
  Plug,
  Shield,
  Sparkles,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@nous-research/ui/ui/components/button";
import { cn } from "@/lib/utils";

const OUTCOMES = [
  { icon: Clock, stat: "<15 min", label: "to first ICP" },
  { icon: FileText, stat: "3+", label: "exportable assets on Day 1" },
  { icon: Mail, stat: "30 min", label: "to first cadence live" },
  { icon: Database, stat: "1 session", label: "CRM sync" },
];

const WIZARD_STEPS = [
  { label: "ICP", description: "Define your ideal customer profile" },
  { label: "Personas", description: "Build buyer personas" },
  { label: "USPs", description: "Articulate unique selling points" },
  { label: "Use-Cases", description: "Map customer use cases" },
  { label: "Messaging", description: "Generate messaging templates" },
  { label: "Positioning", description: "Refine your market positioning" },
];

const INTEGRATIONS = [
  { name: "HubSpot", status: "connected", icon: Globe },
  { name: "S3", status: "connected", icon: Database },
  { name: "Clearbit", status: "connected", icon: Users },
  { name: "Salesforce", status: "coming soon", icon: Target },
];

const SECURITY_BULLETS = [
  "Row-level auth by workspace",
  "Encrypted integration secrets",
  "Signed S3 uploads",
  "Upstash rate limiting",
];

const TRUST_LOGOS = [
  "Y Combinator",
  "Techstars",
  "500 Startups",
  "AngelList",
];

export default function GTMHomePage() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B1020] to-[#0F172A]">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-20 md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,91,255,0.15),transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
            <div className="flex flex-col justify-center">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl"
              >
                Ship your GTM in days,{" "}
                <span className="text-[#635BFF]">not months.</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mt-6 text-lg text-slate-400 md:text-xl"
              >
                Define ICPs, write playbooks, generate outreach, and sync to
                CRM—backed by a memory-aware assistant.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-8 flex flex-wrap gap-4"
              >
                <Link to="/wizard">
                  <Button
                    className="bg-[#635BFF] px-6 py-3 text-white hover:bg-[#5046e5] hover:-translate-y-0.5 transition-all shadow-lg shadow-[#635BFF]/25"
                  >
                    Start the GTM Wizard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button
                    ghost
                    className="border border-slate-700 px-6 py-3 text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    Explore the Demo Workspace
                  </Button>
                </Link>
              </motion.div>
              {/* Trust logos */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-12 flex items-center gap-6"
              >
                <span className="text-xs text-slate-500 uppercase tracking-wider">
                  Trusted by teams at
                </span>
                <div className="flex gap-4">
                  {TRUST_LOGOS.map((logo) => (
                    <span
                      key={logo}
                      className="text-sm text-slate-500 hover:text-slate-400 transition-colors cursor-default"
                      title={logo}
                    >
                      {logo}
                    </span>
                  ))}
                </div>
              </motion.div>
            </div>
            {/* Hero visual - Dashboard preview cards */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative hidden lg:block"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#635BFF]/20 to-transparent rounded-2xl blur-3xl" />
              <div className="relative grid gap-4">
                <DashboardPreviewCard
                  title="ICP Preview"
                  subtitle="Mid-Market SaaS Security Buyers"
                  icon={Target}
                />
                <DashboardPreviewCard
                  title="Playbook Progress"
                  subtitle="72% complete"
                  icon={FileText}
                  progress={72}
                />
                <DashboardPreviewCard
                  title="Assistant"
                  subtitle="Ready to help with your GTM"
                  icon={Bot}
                  isChat
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Outcomes Section */}
      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-2xl font-semibold text-white md:text-3xl">
            Why teams choose us
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {OUTCOMES.map((outcome, i) => (
              <motion.div
                key={outcome.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-6 hover:border-[#635BFF]/50 hover:shadow-lg hover:shadow-[#635BFF]/5 transition-all"
              >
                <outcome.icon className="h-8 w-8 text-[#635BFF]" />
                <p className="mt-4 text-3xl font-bold text-white">
                  {outcome.stat}
                </p>
                <p className="mt-1 text-slate-400">{outcome.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Guided Wizard Section */}
      <section className="px-6 py-16 md:py-24 bg-slate-900/30">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-white md:text-3xl">
              Build your GTM foundation in 6 steps
            </h2>
            <p className="mt-4 text-slate-400">
              Our guided wizard walks you through everything you need
            </p>
          </div>
          <div className="mt-12">
            {/* Stepper */}
            <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4">
              {WIZARD_STEPS.map((step, i) => (
                <button
                  key={step.label}
                  onClick={() => setActiveStep(i)}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
                    activeStep === i
                      ? "bg-[#635BFF] text-white shadow-lg shadow-[#635BFF]/25"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                  )}
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs">
                    {i + 1}
                  </span>
                  {step.label}
                </button>
              ))}
            </div>
            {/* Active step description */}
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-center"
            >
              <Sparkles className="mx-auto h-12 w-12 text-[#10B981]" />
              <h3 className="mt-4 text-xl font-semibold text-white">
                {WIZARD_STEPS[activeStep].label}
              </h3>
              <p className="mt-2 text-slate-400">
                {WIZARD_STEPS[activeStep].description}
              </p>
              <Link to="/wizard" className="mt-6 inline-block">
                <Button className="bg-[#635BFF] text-white hover:bg-[#5046e5]">
                  Start with {WIZARD_STEPS[activeStep].label}
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Sales Bible & Messaging Section */}
      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8">
              <BarChart3 className="h-10 w-10 text-[#635BFF]" />
              <h3 className="mt-4 text-xl font-semibold text-white">
                Activity Targets / SOPs / Cadences
              </h3>
              <p className="mt-2 text-slate-400">
                Set daily targets, define your SOPs, and build email cadences
                that convert.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">
                  40 emails/day
                </span>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">
                  20 DMs/day
                </span>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">
                  30 calls/day
                </span>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8">
              <MessageSquare className="h-10 w-10 text-[#10B981]" />
              <h3 className="mt-4 text-xl font-semibold text-white">
                Template Generator
              </h3>
              <p className="mt-2 text-slate-400">
                Generate personalized templates with dynamic variables.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-full bg-[#635BFF]/20 px-3 py-1 text-sm text-[#635BFF]">
                  {"{{first_name}}"}
                </span>
                <span className="rounded-full bg-[#10B981]/20 px-3 py-1 text-sm text-[#10B981]">
                  {"{{pain_point}}"}
                </span>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">
                  {"{{company}}"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Research & Enrichment Section */}
      <section className="px-6 py-16 md:py-24 bg-slate-900/30">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8">
            <div className="flex items-start justify-between">
              <div>
                <Globe className="h-10 w-10 text-[#635BFF]" />
                <h3 className="mt-4 text-xl font-semibold text-white">
                  Research & Enrichment
                </h3>
                <p className="mt-2 text-slate-400 max-w-xl">
                  Enter a company domain and get an instant snapshot with
                  triggers for outreach.
                </p>
              </div>
              <Button className="bg-[#10B981] text-white hover:bg-[#059669]">
                <Mail className="mr-2 h-4 w-4" />
                Generate Email
              </Button>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-800/50 p-4">
                <p className="text-sm text-slate-500">Company</p>
                <p className="text-lg font-medium text-white">Acme Corp</p>
              </div>
              <div className="rounded-xl bg-slate-800/50 p-4">
                <p className="text-sm text-slate-500">Industry</p>
                <p className="text-lg font-medium text-white">SaaS / B2B</p>
              </div>
              <div className="rounded-xl bg-slate-800/50 p-4">
                <p className="text-sm text-slate-500">Trigger</p>
                <p className="text-lg font-medium text-[#10B981]">
                  Recent funding round
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Assistant Section */}
      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-2 items-center">
            <div>
              <Bot className="h-12 w-12 text-[#635BFF]" />
              <h2 className="mt-4 text-2xl font-semibold text-white md:text-3xl">
                Assistant with Memory
              </h2>
              <p className="mt-4 text-slate-400">
                Chat with an AI that remembers your ICP, Playbook, and current
                leads. Get personalized suggestions with citations.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-300">
                  ICP Context
                </span>
                <span className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-300">
                  Playbook Context
                </span>
                <span className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-300">
                  Current Lead
                </span>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#635BFF]">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 rounded-xl bg-slate-800/50 p-4">
                  <p className="text-slate-300">
                    Based on your ICP targeting mid-market security buyers, I'd
                    recommend leading with the compliance angle. Here's a
                    suggested opener...
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    Source: ICP Definition, Playbook v2
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="px-6 py-16 md:py-24 bg-slate-900/30">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-2xl font-semibold text-white md:text-3xl">
            Integrations
          </h2>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            {INTEGRATIONS.map((integration) => (
              <div
                key={integration.name}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-6 py-4",
                  integration.status === "connected"
                    ? "border-[#10B981]/50 bg-[#10B981]/10"
                    : "border-slate-700 bg-slate-800/50"
                )}
              >
                <integration.icon
                  className={cn(
                    "h-6 w-6",
                    integration.status === "connected"
                      ? "text-[#10B981]"
                      : "text-slate-500"
                  )}
                />
                <div>
                  <p className="font-medium text-white">{integration.name}</p>
                  <p
                    className={cn(
                      "text-xs",
                      integration.status === "connected"
                        ? "text-[#10B981]"
                        : "text-slate-500 italic"
                    )}
                  >
                    {integration.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="px-6 py-16 md:py-24">
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
              <h4 className="font-semibold text-white">Product</h4>
              <ul className="mt-4 space-y-2 text-slate-400">
                <li><Link to="/wizard" className="hover:text-white transition-colors">Wizard</Link></li>
                <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link to="/playbook" className="hover:text-white transition-colors">Playbook</Link></li>
                <li><Link to="/messaging" className="hover:text-white transition-colors">Messaging</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white">Company</h4>
              <ul className="mt-4 space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white">Resources</h4>
              <ul className="mt-4 space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white">Legal</h4>
              <ul className="mt-4 space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 flex items-center justify-between border-t border-slate-800 pt-8">
            <p className="text-slate-500">
              &copy; {new Date().getFullYear()} Enably. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-slate-500 hover:text-white transition-colors">
                Twitter
              </a>
              <a href="#" className="text-slate-500 hover:text-white transition-colors">
                LinkedIn
              </a>
              <a href="#" className="text-slate-500 hover:text-white transition-colors">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function DashboardPreviewCard({
  title,
  subtitle,
  icon: Icon,
  progress,
  isChat,
}: {
  title: string;
  subtitle: string;
  icon: typeof Target;
  progress?: number;
  isChat?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#635BFF]/20">
          <Icon className="h-5 w-5 text-[#635BFF]" />
        </div>
        <div>
          <p className="font-medium text-white">{title}</p>
          <p className="text-sm text-slate-400">{subtitle}</p>
        </div>
      </div>
      {progress !== undefined && (
        <div className="mt-4">
          <div className="h-2 rounded-full bg-slate-800">
            <div
              className="h-2 rounded-full bg-[#10B981]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      {isChat && (
        <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
          <Zap className="h-4 w-4 text-[#10B981]" />
          Powered by Bedrock
        </div>
      )}
    </div>
  );
}
