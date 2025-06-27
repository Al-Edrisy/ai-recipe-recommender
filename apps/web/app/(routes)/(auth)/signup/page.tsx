'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Mail, Eye, EyeOff, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AuthService } from '@/lib/auth/auth-service';
import { Icons } from '@/components/ui/icons';

const formSchema = z
  .object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
    email: z.string().email({ message: 'Please enter a valid email address' }),
    password: z.string()
      .min(6, { message: 'Password must be at least 6 characters' })
      .max(30, { message: 'Password must be at most 30 characters' })
      .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
      .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export default function SignUpPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [passwordLength, setPasswordLength] = useState(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const { watch } = form;
  const passwordValue = watch('password');

  React.useEffect(() => {
    setPasswordLength(passwordValue?.length || 0);
  }, [passwordValue]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await AuthService.register(values.email, values.password, values.name);
      toast.success('Account created successfully!');
      router.push('/');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        form.setError('email', { message: 'This email is already registered' });
      } else {
        toast.error(error.message || 'Registration failed');
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    try {
      await AuthService.loginWithGoogle();
      toast.success('Logged in with Google');
      router.push('/');
    } catch (error: any) {
      toast.error(error.message || 'Google login failed');
    } finally {
      setIsGoogleLoading(false);
    }
  }

  const getPasswordStrength = () => {
    if (!passwordValue) return 0;
    let strength = 0;
    strength += Math.min(passwordValue.length / 12 * 50, 50);
    if (/[A-Z]/.test(passwordValue)) strength += 20;
    if (/[0-9]/.test(passwordValue)) strength += 20;
    if (/[^A-Za-z0-9]/.test(passwordValue)) strength += 10;
    return Math.min(strength, 100);
  };

  const getStrengthColor = () => {
    const strength = getPasswordStrength();
    if (strength < 40) return 'bg-destructive';
    if (strength < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-sm border rounded-xl">
        <CardHeader className="space-y-2 text-center py-6">
          <Icons.logo className="mx-auto h-8 w-8 text-primary" />
          <CardTitle className="text-xl font-semibold">Create your account</CardTitle>
          <CardDescription className="text-muted-foreground">
            Start your journey with us
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-2 pb-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Full Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input 
                          placeholder="Your name" 
                          className="pl-9 h-10 text-sm" 
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input 
                          placeholder="your@email.com" 
                          className="pl-9 h-10 text-sm" 
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="h-10 pr-10 text-sm"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            setPasswordLength(e.target.value.length);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>

                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1 text-muted-foreground">
                        <span>Password strength</span>
                        <span>{Math.round(getPasswordStrength())}%</span>
                      </div>
                      <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                          style={{ width: `${getPasswordStrength()}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {passwordValue?.length < 6 && 'At least 6 characters'}
                        {!/[A-Z]/.test(passwordValue) && passwordValue && ', 1 uppercase'}
                        {!/[0-9]/.test(passwordValue) && passwordValue && ', 1 number'}
                      </div>
                    </div>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="h-10 text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full h-10 mt-1 font-medium text-white dark:text-black"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
          </Form>

          <div className="my-5 relative">
            <Separator />
            <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 flex justify-center">
              <span className="bg-background px-2 text-xs uppercase text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full h-10 flex items-center justify-center gap-2 text-sm"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
              <Icons.spinner className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Icons.google className="h-4 w-4 text-black dark:text-white" />
                <span>Sign up with Google</span>
              </>
            )}
          </Button>
        </CardContent>

        <CardFooter className="justify-center border-t py-4">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link 
              href="/login" 
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}