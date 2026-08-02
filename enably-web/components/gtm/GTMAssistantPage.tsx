"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import {
  useChatRuntime,
  AssistantChatTransport,
} from "@assistant-ui/react-ai-sdk";
import { Thread } from "@/components/assistant-ui/thread";
import Nav from "@/components/gtm/Nav";
import { Bot, Target, FileText, Users } from "lucide-react";

function ContextBadge({ label, icon: Icon }: { label: string; icon: React.ElementType }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/50 px-3 py-1 text-xs text-slate-300">
      <Icon className="h-3 w-3 text-[#635BFF]" />
      {label}
    </span>
  );
}

export default function GTMAssistantPage() {
  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: "/api/chat",
    }),
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="flex h-screen flex-col bg-[#0B1020]">
        <Nav />

        {/* Context strip */}
        <div className="border-b border-slate-800 bg-slate-900/50 px-6 py-3">
          <div className="mx-auto flex max-w-4xl items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#635BFF]/20">
              <Bot className="h-3.5 w-3.5 text-[#635BFF]" />
            </div>
            <span className="text-sm text-slate-400">GTM Assistant</span>
            <span className="text-slate-700">·</span>
            <span className="text-xs text-slate-500">Active context:</span>
            <div className="flex flex-wrap gap-2">
              <ContextBadge label="ICP: Mid-Market SaaS Security" icon={Target} />
              <ContextBadge label="Playbook v2" icon={FileText} />
              <ContextBadge label="CISO Persona" icon={Users} />
            </div>
          </div>
        </div>

        {/* Chat thread fills remaining height */}
        <div className="flex flex-1 overflow-hidden">
          <div className="mx-auto flex w-full max-w-4xl">
            <Thread
              components={{
                Welcome: () => (
                  <div className="flex flex-col items-center px-4 text-center mb-6">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#635BFF]/20 mb-4">
                      <Bot className="h-7 w-7 text-[#635BFF]" />
                    </div>
                    <h1 className="text-2xl font-semibold text-white">
                      Your GTM Assistant
                    </h1>
                    <p className="mt-2 max-w-sm text-slate-400">
                      Ask me to draft outreach, refine your ICP, analyze a lead, or build a cadence — I know your playbook.
                    </p>
                  </div>
                ),
              }}
            />
          </div>
        </div>
      </div>
    </AssistantRuntimeProvider>
  );
}
