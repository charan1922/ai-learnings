export default function IntroductionPage() {
  return (
    <div className="space-y-8">
      {/* Definition */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border-2 border-blue-200 dark:border-blue-800/50 rounded-xl p-8">
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-3">
              What is Responsible AI?
            </h1>
            <p className="text-lg text-blue-800 dark:text-blue-200 leading-relaxed">
              Responsible AI refers to designing, developing, and using artificial intelligence in ways that are <strong>ethical, transparent, fair, and aligned with human values</strong>. It's a concept that focuses not just on what AI can do, but what it <strong>should</strong> do.
            </p>
          </div>

          <div className="border-t border-blue-200 dark:border-blue-700 pt-4">
            <div className="bg-white dark:bg-blue-950/60 rounded-lg p-4 border border-blue-200 dark:border-blue-700/50">
              <p className="text-base font-semibold text-blue-900 dark:text-blue-100">
                In simple terms:
              </p>
              <p className="text-lg mt-2 text-blue-800 dark:text-blue-200 font-semibold">
                ✨ Responsible AI means building and using AI systems that people can trust.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4-Stage Framework */}
      <div>
        <h2 className="text-2xl font-bold mb-4">4-Stage Responsible AI Lifecycle</h2>

        {/* Stage 1: Map */}
        <div className="space-y-4 mb-6 border-l-4 border-blue-500 pl-4">
          <div>
            <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">
              1️⃣ Map Potential Harms (Risk Identification)
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Identify risks across three dimensions:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded border border-blue-200/50">
                <p className="font-semibold text-sm mb-1">🔓 Security Risks</p>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• Prompt injection attacks</li>
                  <li>• Data leakage</li>
                  <li>• Jailbreak attempts</li>
                </ul>
              </div>
              <div className="bg-purple-50 dark:bg-purple-950/30 p-3 rounded border border-purple-200/50">
                <p className="font-semibold text-sm mb-1">🤖 AI Risks</p>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• Hallucinations</li>
                  <li>• Bias in responses</li>
                  <li>• Toxic content</li>
                </ul>
              </div>
              <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded border border-amber-200/50">
                <p className="font-semibold text-sm mb-1">📊 Business Risks</p>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• Wrong decisions</li>
                  <li>• Compliance issues</li>
                  <li>• Legal liability</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Stage 2: Measure */}
        <div className="space-y-4 mb-6 border-l-4 border-purple-500 pl-4">
          <div>
            <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400 mb-2">
              2️⃣ Measure Harms (Evaluation Layer)
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Evaluate using automated and manual testing:
            </p>
            <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded border border-purple-200/50">
              <ul className="text-sm space-y-2">
                <li>✓ <strong>Red Teaming:</strong> Simulate attacks and jailbreaks</li>
                <li>✓ <strong>Metrics:</strong> Toxicity score, hallucination rate, bias detection</li>
                <li>✓ <strong>Tools:</strong> Content safety APIs, custom evaluation pipelines</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Stage 3: Mitigate */}
        <div className="space-y-4 mb-6 border-l-4 border-green-500 pl-4">
          <div>
            <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">
              3️⃣ Mitigate Harms (4-Layer Defense Strategy)
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Apply mitigation techniques at each layer of your AI solution:
            </p>

            {/* Layer 1: Model */}
            <div className="space-y-3 mb-4">
              <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded border border-green-200/50">
                <div className="flex gap-2 mb-2">
                  <span className="text-lg">🤖</span>
                  <div>
                    <p className="font-semibold text-sm">Layer 1: Model Selection & Fine-tuning</p>
                  </div>
                </div>
                <ul className="text-xs space-y-1 text-muted-foreground pl-6">
                  <li>• <strong>Model Selection:</strong> Choose models appropriate for your use case (e.g., simpler models for classification reduce harm risk)</li>
                  <li>• <strong>Fine-tuning:</strong> Train on your domain data to produce more relevant, scoped responses</li>
                </ul>
              </div>
            </div>

            {/* Layer 2: Safety System */}
            <div className="space-y-3 mb-4">
              <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded border border-green-200/50">
                <div className="flex gap-2 mb-2">
                  <span className="text-lg">🛡️</span>
                  <div>
                    <p className="font-semibold text-sm">Layer 2: Safety System & Guardrails</p>
                  </div>
                </div>
                <ul className="text-xs space-y-1 text-muted-foreground pl-6">
                  <li>• <strong>Content Filters:</strong> Classify content by severity (safe, low, medium, high) across harm categories: prompt injection, harmful content, sensitive data, hallucinations, protected material</li>
                  <li>• <strong>Guardrails:</strong> Suppress prompts/responses based on harm classification</li>
                  <li>• <strong>Prompt Shields:</strong> Detect systematic abuse attempts & jailbreak patterns</li>
                </ul>
              </div>
            </div>

            {/* Layer 3: System Message & Grounding */}
            <div className="space-y-3 mb-4">
              <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded border border-green-200/50">
                <div className="flex gap-2 mb-2">
                  <span className="text-lg">💬</span>
                  <div>
                    <p className="font-semibold text-sm">Layer 3: System Message & Grounding</p>
                  </div>
                </div>
                <ul className="text-xs space-y-1 text-muted-foreground pl-6">
                  <li>• <strong>System Prompts:</strong> Define behavioral parameters & boundaries for the model</li>
                  <li>• <strong>Prompt Engineering:</strong> Structure inputs to minimize harmful outputs</li>
                  <li>• <strong>RAG (Retrieval-Augmented Generation):</strong> Ground responses in trusted data sources to reduce hallucination</li>
                </ul>
              </div>
            </div>

            {/* Layer 4: User Experience */}
            <div className="space-y-3">
              <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded border border-green-200/50">
                <div className="flex gap-2 mb-2">
                  <span className="text-lg">👤</span>
                  <div>
                    <p className="font-semibold text-sm">Layer 4: User Experience & Transparency</p>
                  </div>
                </div>
                <ul className="text-xs space-y-1 text-muted-foreground pl-6">
                  <li>• <strong>Input Constraints:</strong> Restrict user inputs to specific subjects/types via UI design</li>
                  <li>• <strong>Input/Output Validation:</strong> Validate and sanitize data at application boundaries</li>
                  <li>• <strong>Documentation:</strong> Be transparent about system capabilities, limitations, and remaining risks</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Stage 4: Manage */}
        <div className="space-y-4 border-l-4 border-red-500 pl-4">
          <div>
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
              4️⃣ Manage Responsibly (Deployment & Monitoring)
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Ensure safe production usage:
            </p>
            <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded border border-red-200/50">
              <ul className="text-sm space-y-2">
                <li>📊 <strong>Monitoring:</strong> Track unsafe outputs, detect anomalies</li>
                <li>📝 <strong>Logging:</strong> Audit all prompts and responses</li>
                <li>👤 <strong>Human-in-Loop:</strong> Critical decisions require approval</li>
                <li>⚡ <strong>Fallback:</strong> Block or provide safe alternative responses</li>
                <li>💬 <strong>Transparency:</strong> Show disclaimers and limitations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-800/50 rounded-lg p-4">
        <p className="text-sm text-muted-foreground">
          <strong>💼 For Interviews:</strong> This framework demonstrates enterprise-grade AI governance. Use it to explain how you implement guardrails, mitigate risks, handle bias, and ensure responsible deployment in production systems.
        </p>
      </div>
    </div>
  )
}
