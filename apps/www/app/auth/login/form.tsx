'use client';
import clsx from 'clsx';
import { signIn } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FormEventHandler, useState } from 'react';

export default function Form() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('su@codeup.id');
  const [password, setPassword] = useState('@P4ssword--');
  const [errorMsg, setErrorMsg] = useState('');
  const params = useSearchParams();
  const callbackUrl = params.get('callbackUrl');
  const router = useRouter();

  const isValidForm = (): boolean => {
    return email !== '' && password !== '';
  };
  const submit: FormEventHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
        callbackUrl: callbackUrl ?? `${window.location.origin}`,
      });
      if (res?.error) {
        setErrorMsg('Invalid user credentials');
      } else if (res?.ok) {
        router.push(res?.url ?? callbackUrl ?? `${window.location.origin}`);
      }
    } catch (e) {
      setErrorMsg('Invalid user credentials');
    } finally {
      setLoading(false);
    }
  };
  return (
    <form
      onSubmit={submit}
      method="POST"
      action={'/api/auth/callback/credentials'}
      className="flex flex-col gap-5"
    >
      {/* <input name="csrfToken" type="hidden" defaultValue={csrfToken} /> */}
      <div>
        <div className="relative">
          <input
            name="email"
            type="email"
            id="email"
            className={clsx(
              'hover:shadow-[0_0_0_1px_#e0e2d9] hover:focus-within:shadow-none',
              'block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900',
              'bg-transparent rounded-lg border border-gray-300 appearance-none',
              'focus:outline-none focus:ring-0 focus:border-primary peer'
            )}
            placeholder=" "
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label
            htmlFor="email"
            className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
          >
            Email
          </label>
        </div>
      </div>
      <div className="relative">
        <input
          name="password"
          type="password"
          id="password"
          className={clsx(
            'hover:shadow-[0_0_0_1px_#e0e2d9] hover:focus-within:shadow-none',
            'block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900',
            'bg-transparent rounded-lg border border-gray-300 appearance-none',
            'focus:outline-none focus:ring-0 focus:border-primary peer'
          )}
          placeholder=" "
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <label
          htmlFor="password"
          className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
        >
          Password
        </label>
      </div>
      <button
        type="submit"
        className="normal-case btn btn-primary rounded-3xl no-animation"
        disabled={loading || !isValidForm()}
      >
        {loading ? <span className="loading loading-spinner"></span> : 'Log in'}
      </button>
      <div className="text-error text-sm">{errorMsg}</div>
    </form>
  );
}
