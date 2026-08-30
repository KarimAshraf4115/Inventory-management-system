import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export interface AuthUser {
  name: string;
  role: string;
  avatarInitial: string;
  avatarUrl?: string;
  identifier: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (identifier: string, password: string) => boolean;
  logout: () => void;
  updateUser: (fields: Partial<AuthUser>) => void;
}

const AUTH_STORAGE_KEY = 'inventory-auth-user';
const AuthContext = createContext<AuthContextValue | null>(null);

// بيانات الأدمن المسموح له بالدخول (يمكنك تعديلها)
const ADMIN_CREDENTIALS = {
  username: 'fatma',
  password: '123456admin', // كلمة المرور المطلوبة
};

function readStoredUser(): AuthUser | null {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) return null;

  try {
    const parsed: unknown = JSON.parse(stored);
    if (!parsed || typeof parsed !== 'object') return null;
    const candidate = parsed as Partial<AuthUser>;
    if (
      typeof candidate.name !== 'string' ||
      typeof candidate.role !== 'string' ||
      typeof candidate.avatarInitial !== 'string' ||
      typeof candidate.identifier !== 'string'
    ) {
      return null;
    }
    return candidate as AuthUser;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      login: (identifier, password) => {
        const cleanIdentifier = identifier.trim().toLowerCase();
        
        if (
          cleanIdentifier === ADMIN_CREDENTIALS.username.toLowerCase() &&
          password === ADMIN_CREDENTIALS.password
        ) {
          const nextUser: AuthUser = {
            name: 'Fatma Mamdouh',
            role: 'مدير النظام',
            avatarInitial: 'F',
            avatarUrl: user?.avatarUrl || '',
            identifier: cleanIdentifier,
          };

          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
          setUser(nextUser);
          return true;
        }

        return false; 
      },
      logout: () => {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        setUser(null);
      },
      updateUser: (fields) => {
        setUser((prev) => {
          if (!prev) return null;
          const updated = { ...prev, ...fields };
          if (fields.name) {
            updated.avatarInitial = fields.name.trim().charAt(0).toUpperCase();
          }
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}