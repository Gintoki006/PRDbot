import { UserProfile } from "@clerk/nextjs";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gh-bg pt-24 px-4 sm:px-6 lg:px-8 flex justify-center">
      <UserProfile 
        routing="hash"
        appearance={{
          elements: {
            rootBox: "w-full max-w-4xl",
            card: "bg-[#0d1117] border border-[#30363d] shadow-2xl rounded-2xl",
            headerTitle: "text-white",
            headerSubtitle: "text-[#8b949e]",
            socialButtonsBlockButton: "border-[#30363d] hover:bg-[#21262d] text-[#c9d1d9]",
            navbarButton: "text-[#8b949e] hover:text-white hover:bg-[#21262d]",
            profileSectionTitleText: "text-white",
            profileSectionPrimaryButton: "text-[#58a6ff] hover:bg-[#58a6ff]/10",
            badge: "bg-[#238636] text-white",
            formButtonPrimary: "bg-[#238636] hover:bg-[#2ea043] text-white",
            formButtonReset: "text-[#8b949e] hover:bg-[#21262d]",
          }
        }}
      />
    </div>
  );
}
