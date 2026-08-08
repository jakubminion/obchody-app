'use client';

import { useActionState } from 'react';
import { login } from './actions';

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50">
      <form action={formAction} className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-xl font-semibold text-neutral-900">Obchody Admin</h1>
        <p className="mb-6 text-sm text-neutral-500">Zadejte heslo pro pokračování.</p>
        <input
          type="password"
          name="password"
          autoFocus
          placeholder="Heslo"
          className="mb-3 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        />
        {state?.error && <p className="mb-3 text-sm text-red-600">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {pending ? 'Přihlašuji…' : 'Přihlásit se'}
        </button>
      </form>
    </div>
  );
}
