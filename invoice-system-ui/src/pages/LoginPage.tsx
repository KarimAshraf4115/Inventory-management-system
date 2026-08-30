import { useState, type FormEvent } from 'react';
import { ArrowLeft, Boxes, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!identifier.trim()) {
      setError('اكتب البريد الإلكتروني أو اسم المستخدم.');
      return;
    }
    if (password.length < 4) {
      setError('يجب أن تتكون كلمة المرور من 4 أحرف على الأقل.');
      return;
    }

    setLoading(true);
    window.setTimeout(() => {
      const success = login(identifier, password);
      if (!success) setError('تعذر تسجيل الدخول. راجع البيانات وحاول مرة أخرى.');
      setLoading(false);
    }, 350);
  };

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-canvas">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(35,74,111,0.12),transparent_32%),radial-gradient(circle_at_85%_86%,rgba(192,96,47,0.09),transparent_30%)]" />

      <section className="relative hidden flex-1 overflow-hidden bg-navy-600 px-12 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -left-28 top-20 h-72 w-72 rounded-full border border-white/10" />
        <div className="absolute -bottom-36 right-12 h-96 w-96 rounded-full border border-white/10" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
            <Boxes size={24} />
          </div>
          <div>
            <p className="font-kufi text-base font-bold">نظام المخزون</p>
            <p className="font-kufi text-xs text-navy-200">والفواتير</p>
          </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <p className="mb-4 font-kufi text-sm font-semibold text-navy-200">إدارة أذكى. قرارات أسرع.</p>
          <h1 className="font-kufi text-4xl font-bold leading-[1.35]">
            كل تفاصيل مخزونك وفواتيرك في مكان واحد.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-7 text-navy-100">
            تابع المبيعات والمشتريات والمدفوعات وحركة الأصناف من لوحة تحكم واضحة ومصممة لتناسب يوم عملك.
          </p>
          <div className="mt-8 flex items-center gap-2 text-sm text-navy-100">
            <ShieldCheck size={17} className="text-emerald-300" />
            دخول آمن لحسابك وبيانات متجرك
          </div>
        </div>

        <p className="relative z-10 text-xs text-navy-200">© 2026 نظام إدارة المخزون والفواتير</p>
      </section>

      <section className="relative z-10 flex w-full items-center justify-center px-5 py-10 sm:px-10 lg:w-[520px] lg:shrink-0 lg:px-14">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-600 text-white shadow-card">
              <Boxes size={24} />
            </div>
            <p className="font-kufi text-sm font-bold text-navy-600">نظام المخزون والفواتير</p>
          </div>

          <div className="mb-8">
            <p className="mb-2 font-kufi text-sm font-semibold text-rust-600">مرحبًا بعودتك</p>
            <h2 className="font-kufi text-3xl font-bold text-ink">تسجيل الدخول</h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">أدخل بياناتك للوصول إلى لوحة التحكم.</p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label htmlFor="identifier" className="label-base">البريد الإلكتروني أو اسم المستخدم</label>
              <div className="relative">
                <Mail size={17} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="identifier"
                  type="text"
                  autoComplete="username"
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  placeholder="مثال: محمد عبد الله"
                  className="input-base h-12 pr-10"
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="label-base mb-0">كلمة المرور</label>
                <button type="button" className="text-xs font-semibold text-navy-600 hover:text-rust-600">
                  نسيت كلمة المرور؟
                </button>
              </div>
              <div className="relative">
                <LockKeyhole size={17} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="أدخل كلمة المرور"
                  className="input-base h-12 px-10"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 transition hover:bg-gray-100 hover:text-ink"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {error && (
              <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-navy-600 font-kufi text-sm font-bold text-white shadow-sm transition hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'جارٍ التحقق...' : 'دخول إلى الحساب'}
              {!loading && <ArrowLeft size={17} />}
            </button>
          </form>

          <div className="mt-8 flex items-center gap-2 rounded-lg border border-navy-100 bg-navy-50 px-3 py-2.5 text-xs leading-5 text-navy-700">
            <ShieldCheck size={16} className="shrink-0 text-navy-600" />
            اكتب اسمك أو بريدك وكلمة مرور من 4 أحرف على الأقل للمتابعة.
          </div>
        </div>
      </section>
    </main>
  );
}
