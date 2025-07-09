'use client';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
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
            }, 200);
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
        <CardContent className="p-5 flex justify-center items-center">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full max-w-md p-5 flex flex-col space-y-6"
            >
              <FormField
                control={form.control}
                name="pin"
                render={({ field }) => (
                  <FormItem className="w-full flex flex-col items-center space-y-2">
                    <FormLabel>One-Time Password</FormLabel>
                    <FormControl>
                      <InputOTP maxLength={6} {...field}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormDescription>
                      Please enter the one-time password sent to your phone.
                    </FormDescription>
                    <FormMessage />{' '}
                    {/* ✅ This shows the error below the PIN input */}
                  </FormItem>
                )}
              />
            </form>
          </Form>
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
