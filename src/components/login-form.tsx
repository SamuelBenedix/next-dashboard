'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Services } from '@/services/serviceapi';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Swal from 'sweetalert2';

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const router = useRouter();
  const apiService = new Services();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [ipAddress, setIpAddress] = useState('');
  const [browser, setBrowser] = useState('');
  const [os, setOS] = useState('');

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    getIPAddresses();
    detectBrowser();
  }, []);

  const getIPAddresses = async () => {
    try {
      const res = await apiService.getIPAddress({ format: 'json' });
      setIpAddress(res.ip);
      localStorage.setItem('ipAddress', res.ip);
    } catch (error) {
      console.error('Failed to fetch IP address:', error);
    }
  };

  const detectBrowser = () => {
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    let os = 'Unknown';

    if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Edg')) browser = 'Edge';
    else if (ua.includes('Trident')) browser = 'Internet Explorer';

    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'MacOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (/iPhone|iPad|iPod/.test(ua)) os = 'iOS';

    setBrowser(browser);
    setOS(os);
  };

  const validateLogin = async () => {
    if (!username || !password) {
      Swal.fire({
        icon: 'warning',
        title: 'Oops...',
        text: 'Please fill in both email and password!',
        confirmButtonColor: '#005D6B',
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await apiService.postLogin({
        username,
        password,
        ipAddress,
        browser,
        os,
      });

      if (res.data.code === 1) {
        const { jwT_Token, refresh_Token } = res.data.data;

        localStorage.setItem('jwT_Token', jwT_Token);
        localStorage.setItem('refresh_Token', refresh_Token);
        localStorage.setItem('message', JSON.stringify(res.data.message));

        const jwtParsed = await apiService.parseJwt(jwT_Token);
        localStorage.setItem('jwtParse', JSON.stringify(jwtParsed));

        router.push('/dashboard');
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: res.data.message || 'An unexpected error occurred',
          confirmButtonColor: '#005D6B',
        });

        formRef.current?.reset();
        setUsername('');
        setPassword('');
      }
    } catch (err) {
      console.error('Login error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Server Error',
        text: 'Something went wrong. Please try again later.',
        confirmButtonColor: '#005D6B',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validateLogin();
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          {/* Form Section */}
          <form ref={formRef} className="p-6 md:p-8" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground">
                  Login to your Acme Inc account
                </p>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Enter your NPP / ID"
                  required
                  value={username}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d*$/.test(val)) setUsername(val); // Only allow digits
                  }}
                />
              </div>

              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>

              <div className="text-center text-sm">
                Don&apos;t have an account?{' '}
                <a href="#" className="underline underline-offset-4">
                  Sign up
                </a>
              </div>
            </div>
          </form>

          {/* Image Section */}
          <div className="bg-muted relative hidden md:block">
            <Image
              src="/assets/images/email/ttdicon.png"
              alt="TTD Icon"
              fill
              className="object-cover p-8 absolute inset-0 dark:brightness-[0.2] dark:grayscale"
              priority
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
