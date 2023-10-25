import Form from './form';
import SigninProviders from './signin-providers';

export default async function Page() {
  return (
    <div className="min-h-screen flex justify-center items-center bg-base-200">
      <div className="w-full max-w-md bg-base-100 rounded-box p-5 flex flex-col gap-5">
        <Form />
        <div className="flex justify-center mt !text-concrete">OR</div>
        <SigninProviders />
      </div>
    </div>
  );
}
