export default function LogoCloud() {
  return (
    <section className="border-y border-gh-border bg-gh-header py-8">
      <div className="max-w-[1280px] mx-auto px-4 flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-2xl">account_tree</span>
          <span className="font-bold text-lg text-white">GitLab</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-2xl">code_blocks</span>
          <span className="font-bold text-lg text-white">Bitbucket</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-2xl">hub</span>
          <span className="font-bold text-lg text-white">Azure DevOps</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-2xl">rocket_launch</span>
          <span className="font-bold text-lg text-white">Linear</span>
        </div>
      </div>
    </section>
  );
}
