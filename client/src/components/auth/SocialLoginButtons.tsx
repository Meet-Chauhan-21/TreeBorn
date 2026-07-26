import React, { useEffect, useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';

export function FacebookIcon({ className = "w-4.5 h-4.5 flex-shrink-0" }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" className={className}>
      <path
        d="M6.68 15.92C2.88 15.24 0 11.96 0 8C0 3.6 3.6 0 8 0C12.4 0 16 3.6 16 8C16 11.96 13.12 15.24 9.32 15.92L8.88 15.56H7.12L6.68 15.92Z"
        fill="url(#paint0_linear_795_116_comp)"
      />
      <path
        d="M11.12 10.2391L11.48 7.99914H9.36V6.43914C9.36 5.79914 9.6 5.31914 10.56 5.31914H11.6V3.27914C11.04 3.19914 10.4 3.11914 9.84 3.11914C8 3.11914 6.72 4.23914 6.72 6.23914V7.99914H4.72V10.2391H6.72V15.8791C7.16 15.9591 7.6 15.9991 8.04 15.9991C8.48 15.9991 8.92 15.9591 9.36 15.8791V10.2391H11.12Z"
        fill="white"
      />
      <defs>
        <linearGradient
          id="paint0_linear_795_116_comp"
          x1="8"
          y1="0"
          x2="8"
          y2="15.9991"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#1AAFFF" />
          <stop offset="1" stopColor="#0163E0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function GoogleIcon({ className = "w-4.5 h-4.5 flex-shrink-0" }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" className={className}>
      <path
        d="M15.68 8.18182C15.68 7.61455 15.6291 7.06909 15.5345 6.54545H8V9.64364H12.3055C12.1164 10.64 11.5491 11.4836 10.6982 12.0509V14.0655H13.2945C14.8073 12.6691 15.68 10.6182 15.68 8.18182Z"
        fill="#4285F4"
      />
      <path
        d="M8 16C10.16 16 11.9709 15.2873 13.2945 14.0655L10.6982 12.0509C9.98545 12.5309 9.07636 12.8218 8 12.8218C5.92 12.8218 4.15273 11.4182 3.52 9.52727H0.858182V11.5927C2.17455 14.2036 4.87273 16 8 16Z"
        fill="#34A853"
      />
      <path
        d="M3.52 9.52C3.36 9.04 3.26545 8.53091 3.26545 8C3.26545 7.46909 3.36 6.96 3.52 6.48V4.41455H0.858182C0.312727 5.49091 0 6.70545 0 8C0 9.29455 0.312727 10.5091 0.858182 11.5855L2.93091 9.97091L3.52 9.52Z"
        fill="#FBBC05"
      />
      <path
        d="M8 3.18545C9.17818 3.18545 10.2255 3.59273 11.0618 4.37818L13.3527 2.08727C11.9636 0.792727 10.16 0 8 0C4.87273 0 2.17455 1.79636 0.858182 4.41455L3.52 6.48C4.15273 4.58909 5.92 3.18545 8 3.18545Z"
        fill="#EA4335"
      />
    </svg>
  );
}

interface SocialLoginButtonsProps {
  redirectPage?: 'login' | 'register';
}

interface GoogleButtonProps {
  disabled: boolean;
  onStartLoading: () => void;
  onEndLoading: () => void;
  isLoading: boolean;
}

function LiveGoogleButton({ disabled, onStartLoading, onEndLoading, isLoading }: GoogleButtonProps) {
  const { googleLogin } = useAuth();

  const handleGoogleClick = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      if (tokenResponse.access_token) {
        try {
          await googleLogin(tokenResponse.access_token, true);
        } finally {
          onEndLoading();
        }
      } else {
        onEndLoading();
      }
    },
    onError: () => {
      toast.error('Google Sign-In failed.');
      onEndLoading();
    },
  });

  const handleClick = () => {
    onStartLoading();
    handleGoogleClick();
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className={`w-full h-[44px] px-3 bg-white hover:bg-gray-50 active:scale-[0.98] text-gray-700 rounded-xl text-xs font-sans font-medium flex items-center justify-center gap-2 shadow-2xs hover:shadow-xs transition-all border border-border-gray/80 hover:border-gray-350 ${
        disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
      ) : (
        <GoogleIcon />
      )}
      <span className="whitespace-nowrap">{isLoading ? 'Signing in...' : 'Google'}</span>
    </button>
  );
}

function FallbackGoogleButton({ disabled, onStartLoading, onEndLoading, isLoading }: GoogleButtonProps) {
  const openMockPopup = () => {
    onStartLoading();
    const width = 450;
    const height = 580;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    const popup = window.open(
      '/google-login-mock',
      'GoogleLoginMock',
      `width=${width},height=${height},left=${left},top=${top}`
    );
    if (!popup) {
      toast.info('Google Client ID is not set in .env. Please configure VITE_GOOGLE_CLIENT_ID.');
      onEndLoading();
    }
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={openMockPopup}
      className={`w-full h-[44px] px-3 bg-white hover:bg-gray-50 active:scale-[0.98] text-gray-700 rounded-xl text-xs font-sans font-medium flex items-center justify-center gap-2 shadow-2xs hover:shadow-xs transition-all border border-border-gray/80 hover:border-gray-350 ${
        disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
      ) : (
        <GoogleIcon />
      )}
      <span className="whitespace-nowrap">{isLoading ? 'Signing in...' : 'Google'}</span>
    </button>
  );
}

export const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({ redirectPage = 'login' }) => {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const [socialLoading, setSocialLoading] = useState(false);
  const [activePlatform, setActivePlatform] = useState<'google' | 'facebook' | null>(null);

  // Listen for mock popup postMessage if used
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'GOOGLE_LOGIN_SUCCESS') {
        const email = event.data?.user?.email;
        if (email) {
          toast.success(`Signed in as ${event.data.user.name || email}!`);
          window.location.href = '/profile';
        }
      }
      setSocialLoading(false);
      setActivePlatform(null);
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleFacebookClick = () => {
    const fbAppId = import.meta.env.VITE_FACEBOOK_APP_ID;
    if (!fbAppId) {
      toast.info('Facebook App ID not configured in .env yet. Set VITE_FACEBOOK_APP_ID to activate live Facebook authentication.');
      return;
    }
    
    setSocialLoading(true);
    setActivePlatform('facebook');

    const redirectUri = encodeURIComponent(`${window.location.origin}/${redirectPage}`);
    // Introduce a short delay to render the button loading state visually before redirection freezes the DOM
    setTimeout(() => {
      window.location.href = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${fbAppId}&redirect_uri=${redirectUri}&scope=public_profile,email`;
    }, 350);
  };

  const handleStartGoogleLoading = () => {
    setSocialLoading(true);
    setActivePlatform('google');
  };

  const handleEndGoogleLoading = () => {
    setSocialLoading(false);
    setActivePlatform(null);
  };

  return (
    <div className="grid grid-cols-2 gap-3 items-center w-full">
      {googleClientId ? (
        <LiveGoogleButton
          disabled={socialLoading}
          onStartLoading={handleStartGoogleLoading}
          onEndLoading={handleEndGoogleLoading}
          isLoading={socialLoading && activePlatform === 'google'}
        />
      ) : (
        <FallbackGoogleButton
          disabled={socialLoading}
          onStartLoading={handleStartGoogleLoading}
          onEndLoading={handleEndGoogleLoading}
          isLoading={socialLoading && activePlatform === 'google'}
        />
      )}

      <button
        type="button"
        disabled={socialLoading}
        onClick={handleFacebookClick}
        className={`w-full h-[44px] px-3 bg-white hover:bg-gray-50 active:scale-[0.98] text-gray-700 rounded-xl text-xs font-sans font-medium flex items-center justify-center gap-2 shadow-2xs hover:shadow-xs transition-all border border-border-gray/80 hover:border-gray-350 ${
          socialLoading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        {socialLoading && activePlatform === 'facebook' ? (
          <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
        ) : (
          <FacebookIcon />
        )}
        <span className="whitespace-nowrap">
          {socialLoading && activePlatform === 'facebook' ? 'Redirecting...' : 'Facebook'}
        </span>
      </button>
    </div>
  );
};

export default SocialLoginButtons;
