'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Moon, Sun, Monitor, Menu, X, User, LogIn, UserPlus } from 'lucide-react';
import { useTheme } from 'next-themes';
import { logout, s } from '@lib/auth/auth-service';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { firebaseUser, userProfile, loading, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  // List of routes where only the portfolio name is displayed
  const noHeaderRoutes = ['/login', '/signup'];
  const showMinimalHeader = noHeaderRoutes.includes(pathname || '');

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/recipes', label: 'Recipes' },
    { href: '/playground', label: 'Playground' },
    { href: '/about', label: 'About' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
  ];

  const headerClasses = cn(
    'fixed top-0 z-50 w-full border-b transition-all duration-300',
    scrolled || mobileMenuOpen
      ? 'bg-background/95 backdrop-blur-md border-transparent'
      : 'bg-background/80 border-border'
  );

  const handleSignOut = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Failed to sign out:', error);
      // Optionally show a toast or alert here
    }
  };

  return (
    <header className={headerClasses}>
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link 
            href="/" 
            className="flex items-center gap-2 font-semibold hover:opacity-80 transition-opacity"
          >
            <span className="text-lg bg-gradient-to-r from-primary to-black-100 bg-clip-text text-transparent">
              Recipedia  |||
            </span>
          </Link>

          {/* Only show nav links if not in minimal header mode */}
          {!showMinimalHeader && (
            <nav className="hidden md:flex items-center gap-1 text-sm">
              {navLinks.map((link) => (
                <Button
                  key={link.href}
                  asChild
                  variant="ghost"
                  className={cn(
                    'h-9 rounded-md px-3',
                    pathname === link.href
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Link href={link.href}>
                    {link.label}
                  </Link>
                </Button>
              ))}
            </nav>
          )}
        </div>

        {/* Only show theme toggle and mobile menu if not in minimal header */}
        {!showMinimalHeader && (
          <div className="flex items-center gap-2">
            {/* Theme Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  {mounted ? (
                    theme === 'light' ? (
                      <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />
                    ) : theme === 'dark' ? (
                      <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />
                    ) : (
                      <Monitor className="h-[1.2rem] w-[1.2rem] transition-all" />
                    )
                  ) : (
                    <Monitor className="h-[1.2rem] w-[1.2rem] opacity-0" />
                  )}
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => setTheme('light')}>
                  <Sun className="mr-2 h-4 w-4" />
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                  <Moon className="mr-2 h-4 w-4" />
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')}>
                  <Monitor className="mr-2 h-4 w-4" />
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Auth Section */}
            {loading ? (
              <Skeleton className="h-9 w-9 rounded-full" />
            ) : firebaseUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full p-0">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={firebaseUser.photoURL || undefined} />
                      <AvatarFallback>
                        {firebaseUser.displayName?.charAt(0) || <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-sm font-medium">
                    {firebaseUser.displayName || 'User'}
                  </div>
                  <div className="px-2 py-1 text-xs text-muted-foreground">
                    {firebaseUser.email}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="w-full">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  {firebaseUser.email === 'salehfree33@gmail.com' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="w-full">
                        <User className="mr-2 h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-600 focus:text-red-600"
                    onClick={handleSignOut}
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex gap-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-9 hidden sm:flex"
                  asChild
                >
                  <Link href="/login">
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </Link>
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  className="h-9 hidden sm:flex"
                  asChild
                >
                  <Link href="/signup">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Sign Up
                  </Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        )}
      </div>

      {/* Mobile Navigation */}
      {!showMinimalHeader && mobileMenuOpen && (
        <div className="md:hidden bg-background border-t">
          <nav className="flex flex-col gap-1 p-2">
            {navLinks.map((link) => (
              <Button
                key={link.href}
                asChild
                variant="ghost"
                className={cn(
                  'justify-start h-12',
                  pathname === link.href
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link href={link.href}>
                  {link.label}
                </Link>
              </Button>
            ))}
            
            {!firebaseUser && (
              <>
                <Button 
                  variant="default" 
                  className="mt-2 h-12"
                  asChild
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link href="/login">
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-12"
                  asChild
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link href="/signup">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Sign Up
                  </Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}