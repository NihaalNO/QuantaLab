import { type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/', icon: '📊' },
    { name: 'Quantum Debugger', href: '/debugger', icon: '🔍' },
    { name: 'Research Sandbox', href: '/experiments', icon: '🧪' },
  ]

  const secondaryNavigation = [
    { name: 'Documentation', href: '/about', icon: '📖' },
    { name: 'FAQ', href: '/faq', icon: '❓' },
    { name: 'Support', href: '/contact', icon: '💬' },
  ]

  return (
    <div className="min-h-screen bg-void font-body text-text-primary flex relative">
      {/* Sidebar Navigation */}
      <div className="w-[240px] flex-shrink-0 bg-base border-r border-border-dim hidden md:flex flex-col h-screen sticky top-0 z-20">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-raised rounded border border-border-default flex items-center justify-center text-accent-cyan">
              ⌬
            </div>
            <span className="font-semibold text-lg tracking-wide uppercase text-white">QuantaLab</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-8">
          {/* Main Navigation */}
          <div>
            <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest pl-2 mb-3">Core Tools</div>
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href ||
                  (item.href !== '/' && location.pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium ${isActive
                        ? 'bg-raised text-accent-cyan border-l-[3px] border-accent-cyan -ml-[3px]'
                        : 'text-text-secondary hover:bg-subtle hover:text-text-primary'
                      }`}
                  >
                    <span>{item.icon}</span>
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Secondary Navigation */}
          <div>
            <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest pl-2 mb-3">Resources</div>
            <nav className="space-y-1">
              {secondaryNavigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium ${isActive
                        ? 'bg-raised text-accent-cyan border-l-[3px] border-accent-cyan -ml-[3px]'
                        : 'text-text-secondary hover:bg-subtle hover:text-text-primary'
                      }`}
                  >
                    <span>{item.icon}</span>
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>

        <div className="p-4 border-t border-border-dim">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-raised border border-border-default flex items-center justify-center text-xs font-mono text-accent-cyan">
              ME
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-text-primary truncate">Researcher User</div>
              <div className="text-xs text-text-muted flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald"></span> Online
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-base">
        {/* Top Header */}
        <header className="h-[60px] bg-base border-b border-border-dim flex items-center px-6 sticky top-0 z-10 hidden md:flex justify-between">
          <div className="text-sm font-mono text-text-secondary tracking-wide">
            workspace / <span className="text-text-primary">default-project</span> / <span className="text-accent-cyan">{location.pathname}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-[11px] font-mono text-text-muted tracking-widest">v1.2.0-beta</div>
          </div>
        </header>

        {/* Mobile Header (Simplified) */}
        <header className="md:hidden bg-base border-b border-border-dim p-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-raised rounded border border-border-default flex items-center justify-center text-accent-cyan text-xs">
              ⌬
            </div>
            <span className="font-semibold tracking-wide uppercase text-white">QuantaLab</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
