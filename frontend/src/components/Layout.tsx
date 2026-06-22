import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'

interface LayoutProps {
  children: ReactNode
}

type NavItem = {
  name: string
  href: string
  description: string
  icon: ReactNode
}

function Icon({ path }: { path: string }) {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={path} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const navigation: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    description: 'Research overview and quick actions',
    icon: <Icon path="M4 13h7V4H4v9Zm9 7h7V4h-7v16ZM4 20h7v-5H4v5Z" />,
  },
  {
    name: 'Quantum Debugger',
    href: '/dashboard/debugger',
    description: 'Analyze structure, noise, and risk',
    icon: <Icon path="m14.5 14.5 5 5M10.5 17a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13Z" />,
  },
  {
    name: 'Circuit Visualizer',
    href: '/dashboard/circuit-visualizer',
    description: 'Compose and simulate quantum circuits',
    icon: <Icon path="M4 7h4m8 0h4M8 7a2 2 0 1 0 4 0 2 2 0 0 0-4 0Zm4 0h4M4 17h8m4 0h4m-8 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z" />,
  },
  {
    name: 'Research Sandbox',
    href: '/dashboard/sandbox',
    description: 'Version experiments and benchmark backends',
    icon: <Icon path="M9 3v5l-5 8.5A3 3 0 0 0 6.6 21h10.8a3 3 0 0 0 2.6-4.5L15 8V3M8 3h8M7 15h10" />,
  },
]

const secondaryNavigation: NavItem[] = [
  {
    name: 'Documentation',
    href: '/about',
    description: 'Platform mission and architecture',
    icon: <Icon path="M6 4h9l3 3v13H6V4Zm8 0v4h4M9 12h6M9 16h6" />,
  },
  {
    name: 'FAQ',
    href: '/faq',
    description: 'Answers for researchers and teams',
    icon: <Icon path="M12 18h.01M9.5 9.5a2.5 2.5 0 1 1 3.9 2.05c-.9.58-1.4 1.06-1.4 2.45M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />,
  },
  {
    name: 'Support',
    href: '/contact',
    description: 'Talk to the QuantaLab team',
    icon: <Icon path="M4 5h16v11H8l-4 4V5Zm4 5h8M8 13h5" />,
  },
]

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const { user, signOut } = useAuth()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const [query, setQuery] = useState('')

  const allCommands = useMemo(() => [...navigation, ...secondaryNavigation], [])
  const filteredCommands = allCommands.filter((item) => {
    const haystack = `${item.name} ${item.description}`.toLowerCase()
    return haystack.includes(query.toLowerCase())
  })

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setCommandOpen(true)
      }
      if (event.key === 'Escape') {
        setCommandOpen(false)
        setMobileOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setCommandOpen(false)
    setQuery('')
  }, [location.pathname])

  const isActive = (href: string) =>
    location.pathname === href || location.pathname.startsWith(`${href}/`)

  const handleLogout = async () => {
    await signOut()
    navigate('/', { replace: true })
  }

  const renderNav = (items: NavItem[]) => (
    <nav className="space-y-1">
      {items.map((item) => {
        const active = isActive(item.href)
        return (
          <Link
            key={item.name}
            to={item.href}
            className={`group flex items-center gap-3 rounded-md border px-3 py-2.5 text-sm transition duration-200 ${
              active
                ? 'border-accent-green/40 bg-accent-green/10 text-white'
                : 'border-transparent text-text-secondary hover:border-border-default hover:bg-raised hover:text-text-primary'
            }`}
            title={sidebarCollapsed ? item.name : undefined}
          >
            <span className={active ? 'text-accent-green' : 'text-text-muted group-hover:text-accent-green'}>
              {item.icon}
            </span>
            {!sidebarCollapsed && (
              <span className="min-w-0">
                <span className="block truncate font-medium">{item.name}</span>
                <span className="block truncate text-[11px] text-text-muted">{item.description}</span>
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <div className="min-h-screen bg-base font-body text-text-primary md:flex">
      {mobileOpen && (
        <button
          aria-label="Close mobile navigation"
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex border-r border-border-default bg-base transition-all duration-300 md:sticky md:top-0 md:shrink-0 ${
          sidebarCollapsed ? 'w-[76px]' : 'w-[292px]'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="flex h-screen w-full flex-col">
          <div className="relative flex h-[72px] items-center border-b border-border-default px-4">
            <Link to="/dashboard" className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden pr-1">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-accent-green/40 bg-accent-green/10 text-accent-green">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M13 2 5 13h6l-1 9 9-13h-6l1-7Z" fill="currentColor" />
                </svg>
              </span>
              {!sidebarCollapsed && (
                <span className="min-w-0 overflow-hidden">
                  <span className="block text-lg font-semibold tracking-[-0.02em] text-white">QuantaLab</span>
                  <span className="block truncate font-mono text-[11px] text-text-muted">quantum research operating system</span>
                </span>
              )}
            </Link>
            <button
              type="button"
              onClick={() => setSidebarCollapsed((value) => !value)}
              className="absolute -right-4 top-1/2 z-50 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md border border-border-default bg-raised text-text-muted shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition hover:text-white md:inline-flex"
              aria-label="Toggle sidebar"
            >
              <Icon path={sidebarCollapsed ? 'M9 6l6 6-6 6' : 'M15 6l-6 6 6 6'} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
            {!sidebarCollapsed && <div className="ql-eyebrow mb-3 px-2 text-[10px]">Core tools</div>}
            {renderNav(navigation)}

            <div className="my-6 border-t border-dashed border-border-default" />

            {!sidebarCollapsed && <div className="ql-eyebrow mb-3 px-2 text-[10px] text-text-muted">Resources</div>}
            {renderNav(secondaryNavigation)}
          </div>

          <div className="border-t border-border-default p-3">
            <div className={`rounded-md border border-border-default bg-raised p-3 ${sidebarCollapsed ? 'text-center' : ''}`}>
              <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'justify-center' : ''}`}>
                <span className="relative grid h-9 w-9 place-items-center rounded-full border border-border-bright bg-base font-mono text-[11px] text-accent-green">
                  QR
                  <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-accent-green ring-2 ring-raised" />
                </span>
                {!sidebarCollapsed && (
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-white">{user?.user_metadata?.full_name || user?.email || 'Researcher User'}</div>
                    <div className="truncate font-mono text-[11px] text-text-muted">{user?.email || 'Live workspace'}</div>
                  </div>
                )}
              </div>
              {!sidebarCollapsed && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-3 w-full rounded-md border border-border-default bg-base px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-text-muted transition hover:border-accent-rose/40 hover:text-accent-rose"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1 transition-all duration-300">
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-border-default bg-base/92 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-md border border-border-default bg-raised p-2 text-text-secondary md:hidden"
              aria-label="Open mobile navigation"
            >
              <Icon path="M4 7h16M4 12h16M4 17h16" />
            </button>
            <div className="hidden font-mono text-[12px] text-text-muted sm:block">
              workspace / <span className="text-text-secondary">default-project</span> /{' '}
              <span className="text-accent-green">{location.pathname.replace(/^\//, '') || 'dashboard'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCommandOpen(true)}
              className="hidden min-w-[240px] items-center justify-between rounded-md border border-border-default bg-raised px-3 py-2 text-left text-sm text-text-muted transition hover:border-border-bright hover:text-text-secondary sm:flex"
            >
              <span>Search everything</span>
              <span className="font-mono text-[11px]">Ctrl K</span>
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-md border border-border-default bg-raised px-3 py-2 font-mono text-[11px] text-text-secondary transition hover:border-border-bright hover:text-white"
              aria-label="Toggle theme mode"
            >
              {theme === 'dark' ? 'FOCUS' : 'DARK'}
            </button>
            <Link to="/dashboard/debugger" className="ql-button-primary hidden sm:inline-flex">
              Run diagnostics
            </Link>
          </div>
        </header>

        <main className="min-w-0">{children}</main>
      </div>

      {commandOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 px-4 pt-24 backdrop-blur-md">
          <div className="w-full max-w-2xl overflow-hidden rounded-md border border-border-bright bg-base shadow-[0_20px_60px_rgba(0,0,0,0.7)]">
            <div className="border-b border-border-default p-3">
              <label className="sr-only" htmlFor="command-search">Search commands</label>
              <input
                id="command-search"
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search tools, pages, and actions..."
                className="w-full bg-transparent px-2 py-2 text-base text-white placeholder:text-text-muted focus:ring-0"
              />
            </div>
            <div className="max-h-[420px] overflow-y-auto p-2 custom-scrollbar">
              {filteredCommands.length === 0 ? (
                <div className="m-2 rounded-md border border-dashed border-border-default p-8 text-center text-text-muted">
                  No command found for "{query}".
                </div>
              ) : (
                filteredCommands.map((item) => (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => navigate(item.href)}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-left transition hover:bg-raised"
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-md border border-border-default bg-raised text-accent-green">
                      {item.icon}
                    </span>
                    <span>
                      <span className="block text-sm font-medium text-white">{item.name}</span>
                      <span className="block text-xs text-text-muted">{item.description}</span>
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
