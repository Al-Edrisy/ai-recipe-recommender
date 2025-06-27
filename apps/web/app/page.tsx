'use client';

import { useAuth } from '@/lib/auth/context';
import { Button } from '@/components/ui/button';
import { AuthService } from '@/lib/auth/auth-service';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import { getUid, getIdToken } from '@/lib/auth/utils';
import { CopyIcon, ReloadIcon } from '@radix-ui/react-icons';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export default function HomePage() {
  const { user, userProfile, loading, isAdmin, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [token, setToken] = useState<string | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [refreshingToken, setRefreshingToken] = useState(false);

  const loadTokenData = async () => {
    setRefreshingToken(true);
    try {
      const [currentToken, currentUid] = await Promise.all([
        getIdToken(),
        getUid()
      ]);
      setToken(currentToken);
      setUid(currentUid);
    } catch (error) {
      console.error('Failed to load token data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load authentication data',
        variant: 'destructive',
      });
    } finally {
      setRefreshingToken(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadTokenData();
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      toast({
        title: 'Logout Error',
        description: 'Failed to sign out',
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'Text copied to clipboard',
    });
  };

  if (loading) {
    return (
      <div className="container py-10 space-y-6">
        <Skeleton className="h-10 w-[200px]" />
        <div className="space-y-4">
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10 space-y-6 mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">AI Recipe Recommender 🍽️</h1>
        {isAdmin && (
          <Badge variant="secondary" className="ml-2">
            Admin
          </Badge>
        )}
      </div>

      {isAuthenticated ? (
        <div className="grid gap-6 md:grid-cols-2">
          {/* User Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>Manage your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user?.photoURL || undefined} />
                  <AvatarFallback>
                    {user?.displayName?.charAt(0) || user?.email?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-medium">
                    {user?.displayName || 'User'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Account Created</Label>
                <p className="text-sm">
                  {user?.metadata.creationTime || 'Unknown'}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Last Sign In</Label>
                <p className="text-sm">
                  {user?.metadata.lastSignInTime || 'Unknown'}
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <a href="/profile">Edit Profile</a>
              </Button>
              <Button variant="destructive" onClick={handleLogout}>
                Sign Out
              </Button>
            </CardFooter>
          </Card>

          {/* Token Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Authentication Details</CardTitle>
              <CardDescription>
                Your current session information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>User ID (UID)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={uid || 'Not available'}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => uid && copyToClipboard(uid)}
                    disabled={!uid}
                  >
                    <CopyIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Access Token</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={loadTokenData}
                    disabled={refreshingToken}
                  >
                    {refreshingToken ? (
                      <ReloadIcon className="h-4 w-4 animate-spin" />
                    ) : (
                      'Refresh'
                    )}
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    value={token ? `${token.substring(0, 30)}...` : 'Not available'}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => token && copyToClipboard(token)}
                    disabled={!token}
                  >
                    <CopyIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <a href="/recipes">View Recipes</a>
              </Button>
              {isAdmin && (
                <Button variant="secondary" asChild>
                  <a href="/admin">Admin Dashboard</a>
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      ) : (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Welcome to AI Recipe Recommender</CardTitle>
              <CardDescription>
                Get personalized recipe suggestions based on your dietary needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Please sign in to access your recipes and personalized recommendations
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild>
                  <a href="/login">Sign In</a>
                </Button>
                <Button variant="secondary" asChild>
                  <a href="/signup">Create Account</a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Featured Recipes</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-5/6" />
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" disabled>
                      View Recipe
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}