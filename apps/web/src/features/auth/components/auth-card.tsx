import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export type AuthMode = 'login' | 'register';

export type AuthFormValues = {
  email: string;
  password: string;
  displayName?: string;
};

const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required.').email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
  displayName: z.string().optional(),
});

const registerSchema = loginSchema.extend({
  displayName: z
    .string()
    .trim()
    .min(1, 'Display name is required.')
    .max(80, 'Use 80 characters or fewer.'),
  password: z.string().min(10, 'Use at least 10 characters.'),
});

export type AuthCardProps = {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onSubmit: (values: AuthFormValues) => void;
  pending?: boolean;
  /** Chyba celého formuláře (špatné heslo, nedostupný server). */
  error?: string | null;
  /** Chyby polí z API (400 validation_failed). */
  fieldErrors?: Record<string, string[]>;
};

export function AuthCard({
  mode,
  onModeChange,
  onSubmit,
  pending = false,
  error,
  fieldErrors = {},
}: AuthCardProps) {
  const isRegister = mode === 'register';

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(isRegister ? registerSchema : loginSchema),
    defaultValues: { email: '', password: '', displayName: '' },
  });

  const serverError = (field: keyof AuthFormValues) => {
    const message = fieldErrors[field]?.[0];
    if (!message) {
      return form.formState.errors[field]?.message;
    }
    return message;
  };

  return (
    <Card className="mx-auto w-full max-w-md space-y-6 p-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">
          {isRegister ? 'Create your account' : 'Welcome back'}
        </h2>
        <p className="text-sm text-on-surface-variant">
          {isRegister
            ? 'Účet drží tvoje výlety, balicí seznamy a šablony.'
            : 'Přihlas se a pokračuj v balení.'}
        </p>
      </div>

      <form
        className="space-y-4"
        noValidate
        onSubmit={form.handleSubmit((values) => onSubmit(values))}
      >
        {isRegister ? (
          <Input
            label="Display name"
            autoComplete="name"
            placeholder="Martin"
            error={serverError('displayName')}
            {...form.register('displayName')}
          />
        ) : null}

        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={serverError('email')}
          {...form.register('email')}
        />

        <Input
          label="Password"
          type="password"
          autoComplete={isRegister ? 'new-password' : 'current-password'}
          placeholder={isRegister ? 'At least 10 characters' : '••••••••••'}
          error={serverError('password')}
          {...form.register('password')}
        />

        {error ? (
          <p role="alert" className="rounded-input bg-danger-bg px-3 py-2 text-sm text-danger-fg">
            {error}
          </p>
        ) : null}

        <Button type="submit" fullWidth disabled={pending}>
          {pending ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}
        </Button>
      </form>

      <p className="text-center text-sm text-on-surface-variant">
        {isRegister ? 'Already have an account?' : 'New to Packer?'}{' '}
        <button
          type="button"
          className="font-semibold text-primary hover:underline"
          onClick={() => onModeChange(isRegister ? 'login' : 'register')}
        >
          {isRegister ? 'Sign in' : 'Create an account'}
        </button>
      </p>
    </Card>
  );
}
