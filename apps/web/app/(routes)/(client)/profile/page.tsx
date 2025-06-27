'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { updateUserProfile, logout } from '@/lib/auth/auth-service';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL ?? '');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      await updateUserProfile(user, { displayName, photoURL });
      toast({
        title: 'Profile Updated',
        description: 'Your profile information has been saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: 'An error occurred while saving your profile.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Logged Out',
        description: 'You have been signed out successfully.',
      });
      router.push('/login');
    } catch {
      toast({
        title: 'Logout Failed',
        description: 'Unable to sign you out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Page Header */}
      <div className="mb-6 space-y-1">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">
          View and update your personal information.
        </p>
      </div>

      {/* User Info Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>Basic account details</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4 md:flex-row md:items-start md:space-x-6 md:space-y-0">
          <Avatar className="h-20 w-20">
            <AvatarImage src={photoURL} alt={displayName || 'User Avatar'} />
            <AvatarFallback className="text-2xl">
              {user?.displayName?.charAt(0) ?? 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="w-full max-w-lg space-y-1">
            <p className="text-lg font-semibold">
              {user?.displayName ?? 'Unnamed User'}
            </p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      {/* Profile Edit Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>
            Update your display name and avatar URL below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Display Name Field */}
            <div className="grid w-full max-w-lg items-center gap-1.5">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
              />
            </div>

            {/* Email (read-only) */}
            <div className="grid w-full max-w-lg items-center gap-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                value={user?.email ?? ''}
                readOnly
                disabled
                className="bg-muted text-muted-foreground"
              />
            </div>

            {/* Avatar URL Field */}
            <div className="grid w-full max-w-lg items-center gap-1.5">
              <Label htmlFor="photoURL">Profile Picture URL</Label>
              <Input
                id="photoURL"
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            {/* Save Button */}
            <Button
              type="submit"
              className="w-full max-w-xs"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* Change Password Link (optional) */}
          <Button
            variant="outline"
            className="w-full max-w-xs"
            onClick={() => {
              // Navigate to change-password page
              router.push('/change-password');
            }}
          >
            Change Password
          </Button>

          {/* Logout Button */}
          <Button
            variant="destructive"
            className="w-full max-w-xs"
            onClick={handleLogout}
          >
            Log Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
