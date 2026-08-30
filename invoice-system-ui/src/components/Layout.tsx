import { LogOut, Menu, X, ChevronLeft, Sun, Moon, Camera } from 'lucide-react';
import { useState, useEffect, useRef, type ReactNode, type ChangeEvent } from 'react';
import { navItems } from '@/components/nav';
import { useAuth } from '@/auth/AuthContext';
import type { PageKey } from '@/types';

interface LayoutProps {
  current: PageKey;
  onNavigate: (p: PageKey) => void;
  onLogout: () => void;
  children: ReactNode;
}

export function Layout({ current, onNavigate, onLogout, children }: LayoutProps) {
  const { user, updateUser } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result as string;
        updateUser({ avatarUrl: base64Image });
      };
      reader.readAsDataURL(file);
    }
  };

  const dynamicInitial = user?.name
    ? user.name.trim().charAt(0).toUpperCase()
    : 'F';

  const SidebarContent = (
    <div className="flex h-full flex-col bg-slate-900 text-slate-100 border-l border-slate-800/60 shadow-xl">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800/80">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-lg shadow-indigo-500/20">
          <BoxesIcon />
        </div>
        <div>
          <p className="font-kufi text-sm font-bold tracking-tight text-slate-100">نظام المخزون</p>
          <p className="font-kufi text-[11px] text-slate-400">والفواتير</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = current === item.key;
            return (
              <li key={item.key}>
                <button
                  onClick={() => {
                    onNavigate(item.key);
                    setMobileOpen(false);
                  }}
                  className={`group flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <Icon size={18} className={active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'} />
                  <span className="font-kufi">{item.label}</span>
                  {active && <ChevronLeft size={16} className="mr-auto text-white" />}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-slate-800/80 px-6 py-4 text-[11px] text-slate-500">
        © 2026 نظام إدارة المخزون
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0f172a] dark:text-slate-100 transition-colors duration-300">
      <aside className="fixed inset-y-0 right-0 z-30 hidden w-64 lg:block">
        {SidebarContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 right-0 w-64">{SidebarContent}</aside>
        </div>
      )}

      <div className="lg:pr-64">
        {/* Header بتصميم متناسق */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-md dark:border-slate-800/80 dark:bg-[#0f172a]/80 lg:px-8">
          <button
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="hidden items-center gap-2 text-sm text-slate-600 dark:text-slate-300 lg:flex">
            <span className="font-kufi font-semibold">أهلًا، {user?.name ?? 'فاطمة'}</span>
            <span className="text-lg">👋</span>
          </div>

          <div className="flex items-center gap-4">
            {/* زر التبديل الاحترافي */}
            <button
              type="button"
              onClick={() => setDarkMode((prev) => !prev)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-600 transition-all hover:bg-slate-200 dark:border-slate-700/60 dark:bg-slate-800/80 dark:text-amber-400 dark:hover:bg-slate-700"
              title={darkMode ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />

            {/* البروفايل */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="اضغطي لتغيير الصورة"
                className="group relative h-9 w-9 overflow-hidden rounded-full ring-2 ring-indigo-500/20 transition-all hover:ring-indigo-500 dark:ring-indigo-400/30"
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-indigo-600 font-kufi text-xs font-bold text-white shadow-inner">
                    {user?.avatarInitial ?? dynamicInitial}
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 opacity-0 transition group-hover:opacity-100 text-white">
                  <Camera size={13} />
                </div>
              </button>

              <div className="hidden text-right sm:block">
                <p className="font-kufi text-xs font-semibold text-slate-900 dark:text-slate-100">{user?.name ?? '—'}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{user?.role ?? 'مدير النظام'}</p>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:border-slate-800 dark:text-slate-300 dark:hover:border-red-900/40 dark:hover:bg-red-950/30 dark:hover:text-red-400"
            >
              <LogOut size={14} />
              <span className="font-kufi">خروج</span>
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

function BoxesIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 16.5c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5" />
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <path d="M7 10v6.5M17 10v6.5M7 13.5h10" />
    </svg>
  );
}