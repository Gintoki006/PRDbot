import TopNavBar from "../_components/landing/TopNavBar";
import Footer from "../_components/landing/Footer";

export default function DocsPage() {
  return (
    <>
      <TopNavBar />
      <main className="flex-grow pt-24 pb-16 px-4 md:px-8 max-w-[900px] mx-auto text-gh-text-main min-h-screen">
        <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">PRDBot Documentation</h1>
        <p className="text-lg text-gh-text-secondary mb-12">
          Learn how to leverage PRDBot's advanced Multi-Agent architecture to enforce your Product Requirements Documents automatically.
        </p>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-4 border-b border-gh-border pb-2">The Three-Pass Architecture</h2>
          <p className="mb-6 leading-relaxed">
            PRDBot V2 operates using a rigorous "Three-Pass" evaluation system. Every issue or pull request created in your GitHub repository is processed sequentially by three specialized agents, mimicking a real-world product review process.
          </p>
          <div className="space-y-4">
            <div className="p-5 border border-cyan-500/30 bg-cyan-500/5 rounded-xl">
              <h3 className="text-lg font-medium text-cyan-400 mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined">explore</span>
                Pass 1: The Drift Assessment
              </h3>
              <p className="text-sm">
                Evaluates if the requested feature aligns with the core product vision, target audience, and out-of-scope boundaries defined in your PRD metadata. High drift scores indicate "scope creep."
              </p>
            </div>
            
            <div className="p-5 border border-indigo-500/30 bg-indigo-500/5 rounded-xl">
              <h3 className="text-lg font-medium text-indigo-400 mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined">assignment</span>
                Pass 2: Quality Review (PM Agent)
              </h3>
              <p className="text-sm">
                Reads the raw PRD text deeply to ensure that the new issue strategically aligns with business goals and includes all necessary context. It flags any missing information required for developers to start work.
              </p>
            </div>

            <div className="p-5 border border-emerald-500/30 bg-emerald-500/5 rounded-xl">
              <h3 className="text-lg font-medium text-emerald-400 mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined">fact_check</span>
                Pass 3: Rule Enforcement (QA Agent)
              </h3>
              <p className="text-sm">
                Strictly enforces explicit PRD formatting rules (e.g., "Must include acceptance criteria," "Never use the word 'maybe'"). Suggests direct rewrites for any broken rules.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-4 border-b border-gh-border pb-2">Connecting a Repository</h2>
          <ol className="list-decimal pl-5 space-y-3">
            <li>Navigate to your <strong>Dashboard</strong>.</li>
            <li>Click <strong>Connect Repository</strong> and enter your public GitHub repository name (e.g., <code>facebook/react</code>).</li>
            <li>Once connected, click <strong>Upload PRD</strong> on the repository card to upload your Markdown (<code>.md</code>) requirements document.</li>
            <li>PRDBot will instantly extract metadata (Target User, Core Focus, Anti-patterns) and store it securely for agent evaluations.</li>
          </ol>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-4 border-b border-gh-border pb-2">Interpreting Results</h2>
          <p className="mb-4 leading-relaxed">
            When an evaluation finishes, you will see a detailed <strong>Final Assessment Report</strong> grid. The overall Verdict determines the GitHub action PRDBot will take:
          </p>
          <ul className="list-disc pl-5 space-y-3 text-sm text-gh-text-secondary">
            <li><strong className="text-green-400 font-medium">Compliant:</strong> The issue perfectly matches the PRD. No automated action is taken on GitHub.</li>
            <li><strong className="text-yellow-400 font-medium">Flagged (Warning):</strong> The issue is borderline or missing minor context. PRDBot automatically adds a <code>prdbot-review</code> label on GitHub.</li>
            <li><strong className="text-red-400 font-medium">Violation:</strong> A severe drift or rule break. PRDBot automatically comments on the GitHub issue detailing why it was rejected.</li>
          </ul>
        </section>
      </main>
      <Footer />
    </>
  );
}
