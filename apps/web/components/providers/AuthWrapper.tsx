'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { useEffect } from 'react';
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { toast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExclamationTriangleIcon, ReloadIcon } from '@radix-ui/react-icons';

const PUBLIC_ROUTES = ['/login', '/signup', '/forgot-password', '/reset-password'];
const HIDE_HEADER_FOOTER_ROUTES = [...PUBLIC_ROUTES, '/404', '/playground'];

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isAuthRoute = PUBLIC_ROUTES.includes(pathname);
  const hideHeaderFooter = HIDE_HEADER_FOOTER_ROUTES.includes(pathname);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated && !isAuthRoute) {
        toast({
          title: 'Authentication Required',
          description: 'You need to sign in to access this page',
          variant: 'default',
          action: {
            label: 'Sign In',
            onClick: () => router.push('/login'),
          },
        });
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else if (isAuthenticated && isAuthRoute) {
        router.push('/');
      }
    }
  }, [pathname, loading, router, isAuthenticated, isAuthRoute]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <span className="text-lg font-medium">Loading application...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {!hideHeaderFooter && <Header />}
      <main className={hideHeaderFooter ? '' : 'pt-16 pb-8 min-h-[calc(100vh-64px)]'}>
        {!isAuthenticated && !isAuthRoute ? (
          <div className="container py-4">
            <Alert variant="destructive">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <AlertTitle>Authentication Required</AlertTitle>
              <AlertDescription>
                You need to sign in to access this page. Redirecting to login...
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          children
        )}
      </main>
      {!hideHeaderFooter && <Footer />}
    </>
  );
}