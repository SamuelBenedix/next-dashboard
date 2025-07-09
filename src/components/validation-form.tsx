'use client';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';

const FormSchema = z.object({
  pin: z.string().min(6, {
    message: 'Your one-time password must be 6 characters.',
  }),
});

const correctPin = '123456';

export function ValidationForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const [showModal, setShowModal] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(5 * 60); // 4m 13s

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pin: '',
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    toast('You submitted the following values', {
      description: (
        <pre className="mt-2 w-[320px] rounded-md bg-neutral-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  // Countdown logic
  useEffect(() => {
    if (secondsLeft <= 0) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft]);

  // Format time mm:ss
  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}m ${s.toString().padStart(2, '0')}s`;
  };

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'pin') {
        const inputPin = value.pin || '';

        // Wrong PIN
        if (inputPin.length === 6 && inputPin !== correctPin) {
          const currentError = form.getFieldState('pin').error;
          if (!currentError) {
            form.setError('pin', {
              type: 'manual',
              message: 'Incorrect PIN. Please try again.',
            });

            setTimeout(() => {
              form.resetField('pin');
            }, 500);
          }
        }

        // ✅ Correct PIN
        else if (inputPin.length === 6 && inputPin === correctPin) {
          setShowModal(true);
          form.clearErrors('pin');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="p-5 md:px-8">
          <div className="flex justify-between w-full  py-5 items-center">
            <Image
              src="/BNI_logo.svg"
              width={120}
              height={120}
              alt="BNI Logo"
            />
            <Image
              src="/Visa_Logo.png"
              width={100}
              height={100}
              alt="BNI Logo"
            />
          </div>

          <div>
            <h4 className="font-bold">Transaction Authentication</h4>
            <p className="text-sm text-gray-600 ">
              To Authorized this transaction, we have sent a one time password
              to
            </p>
            <p className="text-sm text-gray-600">*************87</p>
            <div className="flex justify-between w-full  py-5 items-center">
              <div>
                <p className="text-sm text-gray-600">From card number :</p>
                <span className="text-sm text-gray-600 font-bold">
                  {' '}
                  xxxx xxxx xxxx 280
                </span>
              </div>

              <p className="text-xs md:text-sm text-gray-600">
                Wed, 09 July 2025
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 bg-gray-100 rounded-md p-2 md:p-4 gap-4 mb-7">
            <div className="pl-2">
              <span className="text-xs text-gray-600">Transaction Amount</span>
              <p className="text-sm font-bold text-gray-900">23,000,000 IDR</p>
            </div>
            <div className="text-right pr-2">
              <span className="text-xs text-gray-600">Merchant</span>
              <p className="text-sm font-bold text-gray-900">SHOPEE.CO.ID</p>
            </div>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full flex justify-center"
            >
              <FormField
                control={form.control}
                name="pin"
                render={({ field }) => {
                  const hasError = form.getFieldState('pin').error;

                  return (
                    <FormItem className="w-full max-w-md flex flex-col items-center space-y-4">
                      <FormControl>
                        <InputOTP maxLength={6} {...field}>
                          <InputOTPGroup className="flex gap-3 justify-center">
                            {[0, 1, 2, 3, 4, 5].map((index) => (
                              <InputOTPSlot
                                key={index}
                                index={index}
                                className={cn(
                                  'w-8 h-8 text-md md:w-11 md:h-11 md:text-2xl border rounded-md',
                                  hasError
                                    ? 'border-red-500 ring-1 ring-red-500'
                                    : 'border-gray-300'
                                )}
                              />
                            ))}
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </form>
          </Form>
          <div className="flex justify-between w-full text-sm text-gray-600 mt-6">
            <div>
              {secondsLeft > 0
                ? `Remaining ${formatTime(secondsLeft)}`
                : `OTP expired`}
            </div>
            <div
              className={`${
                secondsLeft > 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-blue-600 cursor-pointer hover:underline'
              }`}
              onClick={() => {
                if (secondsLeft <= 0) {
                  console.log('Resend OTP clicked');
                  setSecondsLeft(5 * 60);
                }
              }}
            >
              Resend OTP
            </div>
          </div>
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96 text-center">
            <h2 className="text-xl font-semibold mb-4">PIN Verified</h2>
            <p className="mb-4">Your one-time password is correct.</p>
            <Button className="w-full" onClick={() => setShowModal(false)}>
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
