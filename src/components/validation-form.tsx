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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
  const [showDanger, setShowDanger] = useState(false);
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

  useEffect(() => {
    if (secondsLeft === 0) {
      setShowDanger(true); // ✅ trigger modal
    }
  }, [secondsLeft]);

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

      <AlertDialog open={showModal} onOpenChange={setShowModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            {/* ✅ Optional Success Icon */}
            <div className="mx-auto  flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <AlertDialogTitle className="text-green-700 text-lg font-semibold text-center">
              Success
            </AlertDialogTitle>

            <AlertDialogDescription className="text-gray-600 text-center">
              Your operation has been completed successfully.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogAction
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              onClick={() => setShowModal(false)}
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDanger} onOpenChange={setShowDanger}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>

            <AlertDialogTitle className="text-red-700 text-lg font-semibold text-center">
              OTP Expired
            </AlertDialogTitle>

            <AlertDialogDescription className="text-gray-600 text-center">
              Your one-time password has expired. Please request a new one.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogAction
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                setShowDanger(false);
                setSecondsLeft(5 * 60);
              }}
            >
              Resend OTP
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
