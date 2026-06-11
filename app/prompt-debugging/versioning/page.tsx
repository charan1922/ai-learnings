export default function PromptVersioningPage() {
  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border-2 border-emerald-200 dark:border-emerald-800/50 rounded-xl p-8">
        <div className="flex items-start gap-4">
          <span className="text-4xl">🌿</span>
          <div>
            <h1 className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 mb-3">
              Prompt Versioning
            </h1>
            <p className="text-lg text-emerald-800 dark:text-emerald-200 leading-relaxed">
              Prompt versioning means <strong>tracking every change to an LLM prompt over time</strong> — so teams know
              which version is in production, who changed it, and can roll back instantly when something breaks.
            </p>
          </div>
        </div>
        <div className="mt-5 bg-white dark:bg-emerald-950/60 rounded-lg p-4 border border-emerald-200 dark:border-emerald-700/50">
          <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Source</p>
          <p className="text-sm text-emerald-800 dark:text-emerald-200 mt-1">
            Agenta Blog — &quot;Prompt Versioning: A Complete Guide&quot;
          </p>
        </div>
      </div>

      {/* Prompts vs code */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-border rounded-xl p-5">
          <h3 className="font-semibold mb-2">🧑‍💻 Code versioning</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Engineers only. Build-and-deploy cycles. Changes are infrequent and reviewed through PRs.
          </p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 rounded-xl p-5">
          <h3 className="font-semibold text-emerald-700 dark:text-emerald-300 mb-2">✍️ Prompt versioning</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong>Non-technical contributors</strong> (PMs, domain experts) iterate too. Demands rapid experimentation
            against live model outputs — not slow build-and-deploy.
          </p>
        </div>
      </div>

      {/* Why complex */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Why Versioning Gets Complex</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon: "👥", title: "Multi-person collaboration", body: "Engineers, PMs, and domain experts edit prompts at once — risking silent overwrites without proper versioning." },
            { icon: "🌍", title: "Multiple variants", body: "Language variants, model-specific versions, and segment-specific prompts each need independent histories." },
            { icon: "🔗", title: "Prompt dependencies", body: "In multi-step workflows and agents, one prompt change can break downstream steps — chains need dependency management." },
            { icon: "🏗️", title: "Organizational gaps", body: "Most teams lack CI/CD, evaluation frameworks, or observability for prompts." },
          ].map((c) => (
            <div key={c.title} className="rounded-xl border border-border p-4 flex gap-3">
              <span className="text-2xl flex-shrink-0">{c.icon}</span>
              <div>
                <h4 className="font-semibold text-sm mb-1">{c.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{c.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Three approaches */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Three Approaches</h2>
        <p className="text-sm text-muted-foreground mb-5">From simplest to most production-grade.</p>

        <div className="space-y-4">
          {/* Git */}
          <div className="rounded-xl border border-border p-5 space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2"><span className="text-xl">1️⃣</span> Git-based versioning</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200/50 rounded-lg p-3">
                <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1">✅ Strengths</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Familiar; free; universal</li>
                  <li>• Full commit history with diffs</li>
                </ul>
              </div>
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200/50 rounded-lg p-3">
                <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1">❌ Limits</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Excludes non-technical stakeholders</li>
                  <li>• Experiments happen outside Git (copy-paste)</li>
                  <li>• Mixing prompt + code changes hides what changed</li>
                  <li>• Slow PR-and-deploy cycles</li>
                </ul>
              </div>
            </div>
            <p className="text-xs text-muted-foreground"><strong>Verdict:</strong> fine for solo devs or teams with &lt; 5 prompts; scales poorly beyond that.</p>
          </div>

          {/* Custom DB */}
          <div className="rounded-xl border border-border p-5 space-y-2">
            <h3 className="text-lg font-semibold flex items-center gap-2"><span className="text-xl">2️⃣</span> Custom database solution</h3>
            <p className="text-sm text-muted-foreground">
              Building your own versioning layer means an ongoing maintenance burden — access controls, diffing,
              deployment logic, and audit trails. You end up <strong>rebuilding a product outside your core competency</strong>.
            </p>
          </div>

          {/* Purpose built */}
          <div className="rounded-xl border-2 border-emerald-300 dark:border-emerald-700/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-5 space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-emerald-700 dark:text-emerald-300"><span className="text-xl">3️⃣</span> Purpose-built prompt versioning system</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { t: "🌱 Branching / variants", b: "Experiment in isolation from production — safe for coders and non-coders alike." },
                { t: "🚦 Environments", b: "Dev → staging → production, mapping to your existing infra for end-to-end testing." },
                { t: "📜 Commit history & diffs", b: "Precise before/after comparisons with change explanations for auditability." },
                { t: "🧩 Prompt snippets", b: "Reusable components (safety rules, formatting, personas) prevent duplication and drift." },
                { t: "🎛️ Expert playground", b: "Jinja templating, test sets, side-by-side comparison — built for subject-matter experts." },
                { t: "🔭 Observability", b: "Every output traces to its exact prompt version: cost monitoring, regression detection, prod debugging." },
              ].map((f) => (
                <div key={f.t} className="bg-white dark:bg-emerald-950/40 rounded-lg p-3 border border-emerald-200/50">
                  <p className="text-xs font-semibold mb-1">{f.t}</p>
                  <p className="text-xs text-muted-foreground">{f.b}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Plus enterprise controls: role-based access, audit trails, SSO, compliance.</p>
          </div>
        </div>
      </div>

      {/* Integration paths */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Integration Paths</h2>
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-semibold text-xs">Path</th>
                <th className="text-left p-3 font-semibold text-xs">How it works</th>
                <th className="text-left p-3 font-semibold text-xs">Best for</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Live fetching", "App fetches the active prompt version at runtime. Changes deploy instantly, no code release.", "Fast prompt iteration independent of code"],
                ["Proxy / gateway", "App calls the versioning system, which resolves the prompt, calls the LLM, and returns the result.", "Offloading key mgmt, retries, observability (adds a dependency on the request path)"],
                ["CI/CD integration", "Webhooks open a PR when prompts deploy — changes flow through code review & release.", "Strict compliance; Git stays source of truth"],
              ].map((row, i) => (
                <tr key={row[0]} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                  <td className="p-3 font-medium text-emerald-700 dark:text-emerald-400 whitespace-nowrap">{row[0]}</td>
                  <td className="p-3 text-muted-foreground text-xs">{row[1]}</td>
                  <td className="p-3 text-muted-foreground text-xs">{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Setup workflow */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Setup Workflow</h2>
        <p className="text-sm text-muted-foreground mb-4">Typically a 1–2 day migration.</p>
        <div className="space-y-2">
          {[
            "Audit existing prompts across all locations; identify owners.",
            "Import prompts into a dedicated platform, organized by application.",
            "Establish staging and production environments.",
            "Configure team access with appropriate roles.",
            "Select an integration path and update applications.",
            "Iterate using the platform playground and comparison tools.",
          ].map((s, i) => (
            <div key={s} className="flex items-start gap-3">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-emerald-600 text-white text-xs font-semibold flex-shrink-0 mt-0.5">{i + 1}</span>
              <span className="text-sm text-muted-foreground leading-relaxed">{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Key distinctions */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Key Distinctions</h2>
        <div className="space-y-3">
          <div className="border-l-4 border-emerald-500 pl-4">
            <h4 className="font-semibold text-sm">Versioning vs. management</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Versioning tracks changes alone. <strong>Management</strong> = versioning + deployment, collaboration,
              evaluation, observability, and access control.
            </p>
          </div>
          <div className="border-l-4 border-teal-500 pl-4">
            <h4 className="font-semibold text-sm">Dependent prompts</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Treat each prompt as a separate versioned entity inside a shared project. Deploy entire chains together
              and test the whole chain in staging before promoting to production.
            </p>
          </div>
          <div className="border-l-4 border-cyan-500 pl-4">
            <h4 className="font-semibold text-sm">Prompt drift</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Behaviour changes <em>without</em> intentional edits — from provider model updates, shifting input patterns,
              or upstream prompt changes. Versioning + observability detects drift by linking each output to a specific version.
            </p>
          </div>
        </div>
      </div>

      {/* Closing */}
      <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/50 rounded-xl p-6">
        <blockquote className="text-base italic text-emerald-900 dark:text-emerald-100 leading-relaxed border-l-4 border-emerald-400 pl-4">
          &quot;Prompt versioning combined with observability helps detect drift by linking outputs to specific prompt versions.&quot;
        </blockquote>
        <p className="text-xs text-muted-foreground mt-3 pl-4">— Agenta, Prompt Versioning Guide</p>
      </div>

      <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/50 rounded-lg p-4">
        <p className="text-sm text-muted-foreground">
          <strong>💼 For Interviews:</strong> Frame versioning as the production backbone of prompt engineering — enabling
          safe rollback, A/B experiments, traceable outputs, and drift detection. It&apos;s what makes the debugging loop&apos;s
          final step (&quot;evaluate &amp; monitor&quot;) actually enforceable.
        </p>
      </div>
    </div>
  )
}
