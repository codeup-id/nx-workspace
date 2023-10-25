'use client';

import { signIn } from 'next-auth/react';

export default function SigninProviders() {
  return (
    <button
      onClick={() => {
        signIn('google');
      }}
      className="relative transition duration-75 ease-out w-full py-2 rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black antialiased text-black mt-sm bg-white border hover:bg-base-200 hover:border-base-300 active:bg-chalk active:border-chalk"
    >
      <span className="flex items-center justify-center">
        <span className="block pr-xs">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className=" "
            role="img"
            aria-hidden="true"
            aria-labelledby=" "
          >
            <g clipPath="url(#clip0_1_14)">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M21.6 12.2271C21.6 11.5181 21.5363 10.8362 21.4182 10.1817H12V14.0499H17.3818C17.15 15.2999 16.4454 16.359 15.3863 17.0681V19.5771H18.6182C20.5091 17.8362 21.6 15.2726 21.6 12.2271Z"
                fill="#4285F4"
              ></path>
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 22C14.7 22 16.9637 21.1046 18.6182 19.5772L15.3863 17.0681C14.4909 17.6681 13.3454 18.0227 12 18.0227C9.39545 18.0227 7.1909 16.2636 6.40453 13.9H3.06363V16.4909C4.70908 19.759 8.0909 22 12 22Z"
                fill="#34A853"
              ></path>
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.40454 13.9001C6.20454 13.3001 6.09091 12.6592 6.09091 12.0001C6.09091 11.341 6.20454 10.7001 6.40454 10.1001V7.50917H3.06364C2.38636 8.85917 2 10.3864 2 12.0001C2 13.6137 2.38636 15.141 3.06364 16.491L6.40454 13.9001Z"
                fill="#FBBC05"
              ></path>
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 5.97728C13.4682 5.97728 14.7863 6.48182 15.8228 7.47272L18.6909 4.60454C16.9591 2.99091 14.6954 2 12 2C8.0909 2 4.70908 4.24091 3.06363 7.50909L6.40453 10.1C7.1909 7.73637 9.39545 5.97728 12 5.97728Z"
                fill="#EA4335"
              ></path>
            </g>
            <defs>
              <clipPath id="clip0_1_14">
                <rect
                  width="20"
                  height="20"
                  fill="white"
                  transform="translate(2 2)"
                ></rect>
              </clipPath>
            </defs>
          </svg>
        </span>
        <span className="pl-1 block font-semibold text-md">
          Continue with Google
        </span>
      </span>
    </button>
  );
}
