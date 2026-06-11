export default function PromptDebuggingPage() {
  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="bg-gradient-to-r from-rose-50 to-red-50 dark:from-rose-950/40 dark:to-red-950/40 border-2 border-rose-200 dark:border-rose-800/50 rounded-xl p-8">
        <div className="flex items-start gap-4">
          <span className="text-4xl">🐛</span>
          <div>
            <h1 className="text-3xl font-bold text-rose-900 dark:text-rose-100 mb-3">
              Prompt Debugging
            </h1>
            <p className="text-lg text-rose-800 dark:text-rose-200 leading-relaxed">
              Prompt debugging is the process of <strong>analyzing and refining prompts</strong> to improve the quality
              and reliability of AI-generated output. Where traditional debugging fixes errors in code, prompt debugging
              diagnoses <em>why</em> an AI output is flawed, misleading, or insecure — and iterates on the input to fix it.
            </p>
          </div>
        </div>
        <div className="mt-5 bg-white dark:bg-rose-950/60 rounded-lg p-4 border border-rose-200 dark:border-rose-700/50">
          <p className="text-sm font-semibold text-rose-900 dark:text-rose-100">Source</p>
          <p className="text-sm text-rose-800 dark:text-rose-200 mt-1">
            CodeStringers Insights — &quot;Prompt Debugging: A New Skillset for Modern Developers&quot; · Christian Schraga · May 13, 2025
          </p>
        </div>
      </div>

      {/* Core idea */}
      <div className="bg-rose-50/60 dark:bg-rose-950/20 border-l-4 border-rose-400 rounded-r-lg p-5">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Unlike deterministic code, AI output depends heavily on how the prompt is structured. A vague or poorly
          contextualized prompt may produce <strong>working code that is logically incorrect, inefficient, or insecure</strong>.
          Prompt debugging is the developer&apos;s way of steering AI — by thinking like both a <strong>linguist</strong> and an <strong>engineer</strong>.
        </p>
      </div>

      {/* Why it matters */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Why It Matters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: "⚠️", title: "AI code isn't always reliable", body: "Snyk (2023): over half of organizations had a security incident tied to AI-generated code, and 87% of developers worried about its security. Specific, grounded prompts mitigate this." },
            { icon: "⏳", title: "Cuts wasted time & tech debt", body: "An imprecise prompt yields code that looks fine but fails in the real world. Catching the issue at the prompt level avoids hours of testing, rewriting, and refactoring." },
            { icon: "🔒", title: "Security & compliance", body: "Prompts that don't state constraints (“sanitize input”, “use secure libraries”) produce non-compliant output. Debugging controls not just what the AI does, but how." },
          ].map((c) => (
            <div key={c.title} className="rounded-xl border border-border p-5 space-y-2">
              <div className="text-2xl">{c.icon}</div>
              <h3 className="font-semibold text-sm">{c.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Common failure scenarios */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Common Failure Scenarios</h2>
        <p className="text-sm text-muted-foreground mb-5">
          Knowing <em>where</em> prompts typically break is the foundation of a debugging mindset.
        </p>

        <div className="space-y-5">
          {/* 1 */}
          <div className="rounded-xl border border-border p-5 space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <span className="bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full">1</span>
              Incorrect logic in generated code
            </h3>
            <p className="text-sm text-muted-foreground">
              A retail analytics team asked the AI to <em>&quot;calculate customer lifetime value.&quot;</em> The code
              summed total spending but ignored time-value adjustments and churn probability — both critical to a true CLV.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200/50 rounded-lg p-3">
                <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1">❌ Vague prompt</p>
                <code className="text-xs text-muted-foreground">&quot;Write a function to process orders and return sales.&quot;</code>
              </div>
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200/50 rounded-lg p-3">
                <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1">✅ Debugged prompt</p>
                <code className="text-xs text-muted-foreground">Define the CLV formula explicitly and state the business context (discounts, taxes, churn) so the model can&apos;t oversimplify.</code>
              </div>
            </div>
          </div>

          {/* 2 */}
          <div className="rounded-xl border border-border p-5 space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <span className="bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full">2</span>
              Output lacks structure or constraints
            </h3>
            <p className="text-sm text-muted-foreground">
              Asking for <em>&quot;a function to process user uploads&quot;</em> may produce code that works in isolation
              but skips rate limiting, size validation, and file-type checks.
            </p>
            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200/50 rounded-lg p-3">
              <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1">✅ Debugged prompt</p>
              <p className="text-xs text-muted-foreground">
                &quot;Implement a secure file upload handler with strict file-type validation (allow only .jpg, .png, .pdf),
                size limits (max 5MB), and rate limiting (max 10 uploads per minute per user).&quot;
              </p>
            </div>
          </div>

          {/* 3 */}
          <div className="rounded-xl border border-border p-5 space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <span className="bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full">3</span>
              Non-deterministic / inconsistent output
            </h3>
            <p className="text-sm text-muted-foreground">
              The same prompt yields different solutions across runs. Fine for ideation, problematic in production.
              Tune parameters (e.g. lower <code className="bg-muted px-1 rounded">temperature</code>) and add explicit
              requirements: <em>&quot;Generate a sorting algorithm following these exact requirements and optimization priorities…&quot;</em>
            </p>
          </div>
        </div>
      </div>

      {/* Techniques */}
      <div>
        <h2 className="text-2xl font-bold mb-2">5 Prompt Debugging Techniques</h2>
        <p className="text-sm text-muted-foreground mb-5">Concrete moves to take a flawed output and converge on the right one.</p>

        <div className="space-y-5">
          {/* Technique 1 */}
          <div className="border-l-4 border-rose-500 pl-5 space-y-3">
            <h3 className="text-lg font-semibold text-rose-700 dark:text-rose-300">1️⃣ Incremental Prompt Refinement</h3>
            <p className="text-sm text-muted-foreground">
              Don&apos;t aim for a perfect prompt in one shot. Start basic, test, then layer specificity — each pass reveals
              which specifications move the needle most.
            </p>
            <div className="bg-muted/40 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex gap-2"><span className="text-muted-foreground">1.</span><span>&quot;Write a function that validates email addresses&quot;</span></div>
              <div className="flex gap-2"><span className="text-muted-foreground">2.</span><span className="text-muted-foreground">test the output, identify gaps →</span></div>
              <div className="flex gap-2"><span className="text-muted-foreground">3.</span><span>&quot;Ensure it handles international domains and special characters&quot;</span></div>
              <div className="flex gap-2"><span className="text-muted-foreground">4.</span><span>&quot;Follow RFC 5322 and reject disposable email domains&quot;</span></div>
            </div>
          </div>

          {/* Technique 2 */}
          <div className="border-l-4 border-orange-500 pl-5 space-y-3">
            <h3 className="text-lg font-semibold text-orange-700 dark:text-orange-300">2️⃣ Role &amp; Context Setting</h3>
            <p className="text-sm text-muted-foreground">
              Framing the AI&apos;s role activates relevant patterns in its training and produces more specialized code.
            </p>
            <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground italic">
                &quot;Act as a senior security engineer who specializes in API authentication. Review and improve this OAuth
                implementation with a focus on preventing token leakage and implementing proper PKCE.&quot;
              </p>
            </div>
          </div>

          {/* Technique 3 */}
          <div className="border-l-4 border-amber-500 pl-5 space-y-3">
            <h3 className="text-lg font-semibold text-amber-700 dark:text-amber-300">3️⃣ Test-Driven Prompting</h3>
            <p className="text-sm text-muted-foreground">
              Borrow from TDD — put the expected test cases directly in the prompt to constrain the solution space.
            </p>
            <pre className="bg-zinc-900 text-zinc-100 rounded-lg p-4 text-xs overflow-x-auto"><code>{`Write a temperature converter (Celsius/Fahrenheit/Kelvin).
It must pass these cases:
  convertTemp(32,  'F', 'C')  === 0
  convertTemp(100, 'C', 'F')  === 212
  convertTemp(0,   'K', 'C')  === -273.15`}</code></pre>
          </div>

          {/* Technique 4 */}
          <div className="border-l-4 border-yellow-500 pl-5 space-y-3">
            <h3 className="text-lg font-semibold text-yellow-700 dark:text-yellow-400">4️⃣ Prompt Logging &amp; Versioning</h3>
            <p className="text-sm text-muted-foreground">
              Prompts deserve version control just like code. A repository of proven prompts lets teams track which
              formulations work best, reuse patterns, and onboard new hires. Tools like <strong>PromptLayer</strong> or a
              project wiki make this knowledge shareable.
            </p>
            <p className="text-xs text-muted-foreground">
              → This is the bridge to the <strong>Prompt Versioning</strong> sub-section.
            </p>
          </div>

          {/* Technique 5 */}
          <div className="border-l-4 border-lime-500 pl-5 space-y-3">
            <h3 className="text-lg font-semibold text-lime-700 dark:text-lime-400">5️⃣ Zero-shot vs Few-shot Prompting</h3>
            <p className="text-sm text-muted-foreground">
              When the model struggles with a complex task, give it an example. Few-shot dramatically beats zero-shot on hard problems.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200/50 rounded-lg p-3">
                <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1">Zero-shot (often inadequate)</p>
                <code className="text-xs text-muted-foreground">&quot;Write a function to validate IBAN numbers.&quot;</code>
              </div>
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200/50 rounded-lg p-3">
                <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1">Few-shot (much better)</p>
                <code className="text-xs text-muted-foreground">Same request + a worked Luhn-checksum example, then: &quot;your IBAN validator should similarly handle formatting, country-specific length, and checksum digits.&quot;</code>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Culture of prompt review */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Build a Culture of Prompt Review</h2>
        <p className="text-sm text-muted-foreground mb-5">
          As AI scales, teams must treat prompts as <strong>production artifacts</strong> — not throwaway inputs.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon: "👀", title: "Prompt review as a practice", body: "Like code reviews: assess clarity, context coverage, constraints, and reproducibility before a prompt ships." },
            { icon: "📚", title: "Prompt repositories", body: "Maintain a prompt library per feature/module to improve maintainability and accelerate onboarding." },
            { icon: "🎓", title: "Onboard the skill", body: "Train new hires in prompt writing and debugging, not just the tech stack." },
            { icon: "🔮", title: "PromptOps is coming", body: "Prompt debugging will appear in job descriptions; managers will evaluate prompt design like system design today." },
          ].map((c) => (
            <div key={c.title} className="bg-muted/40 rounded-xl p-4 flex gap-4">
              <span className="text-2xl flex-shrink-0">{c.icon}</span>
              <div>
                <h4 className="font-semibold text-sm mb-1">{c.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{c.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Checklist */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="bg-rose-500/10 px-5 py-3 border-b border-border">
          <h3 className="font-semibold text-sm">✅ Prompt Design Checklist</h3>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {[
            "Does the prompt define context or a role?",
            "Are edge cases covered?",
            "Does it request a specific output format (JSON, testable function)?",
            "Is the behaviour deterministic or stochastic — and is that intended?",
          ].map((q) => (
            <div key={q} className="flex items-start gap-2">
              <span className="text-rose-500 mt-0.5">☐</span>
              <span className="text-muted-foreground">{q}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Closing */}
      <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-800/50 rounded-xl p-6">
        <blockquote className="text-base italic text-rose-900 dark:text-rose-100 leading-relaxed border-l-4 border-rose-400 pl-4">
          &quot;In a world where machines write code, the most valuable engineers will be those who understand how to guide
          those machines effectively. Debugging prompts is every bit as important as debugging code.&quot;
        </blockquote>
        <p className="text-xs text-muted-foreground mt-3 pl-4">— Christian Schraga, CodeStringers</p>
      </div>

      <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/50 rounded-lg p-4">
        <p className="text-sm text-muted-foreground">
          <strong>💼 For Interviews:</strong> Position prompt debugging as the shift from a <em>creation-first</em> to a
          <em> supervision-first</em> mindset — owning the quality, security, and maintainability of AI output, with a
          review process and prompt repository to back it up.
        </p>
      </div>
    </div>
  )
}
