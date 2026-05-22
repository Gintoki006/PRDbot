export default function AuthLayout({ children }) {
  return (
    <div className="w-full min-h-screen flex flex-col md:flex-row bg-gh-bg">
      {/* Left Side: Abstract Geometric Background */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden split-bg-image border-r border-gh-border">
        <div className="absolute inset-0 bg-gradient-to-br from-gh-bg/90 to-gh-blue/20 backdrop-blur-[2px]"></div>
        <div className="relative z-10 p-[64px] flex flex-col justify-between h-full w-full">
          <div className="flex items-center gap-2 text-[40px] leading-[48px] tracking-[-0.02em] font-bold text-white">
            <span className="material-symbols-outlined text-5xl">terminal</span>
            PRDbot
          </div>
          <div className="max-w-md">
            <h1 className="font-display-hero text-[72px] leading-[80px] tracking-tight font-[800] text-white mb-6">
              Automate<br/>the <span className="text-gh-blue">Frontier</span>.
            </h1>
            <p className="text-[18px] leading-[28px] font-normal text-gh-text-secondary">High-precision AI orchestration for developers who demand speed and authority. Seamlessly manage your compliance and deployment pipelines.</p>
          </div>
        </div>
      </div>
      {/* Right Side: Authentication Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-[64px] bg-gh-bg">
        <div className="w-full max-w-md space-y-8 flex flex-col items-center">
          {/* Mobile Logo (hidden on md) */}
          <div className="md:hidden flex justify-center mb-12 w-full text-center items-center gap-2">
            <span className="material-symbols-outlined text-4xl text-white">terminal</span>
            <div className="text-[32px] leading-[40px] font-bold text-white tracking-tight">PRDbot</div>
          </div>
          
          {children}
          
          <div className="mt-12 text-center w-full">
            <p className="text-[13px] leading-[20px] font-normal text-gh-text-secondary flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-[14px]">lock</span>
              Secured by automated precision
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
