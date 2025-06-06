
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plane, Compass, LogOut, UserCircle, Edit, MessageSquare, Bell, Users } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [profilePreferencesSet, setProfilePreferencesSet] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const updateAuthState = useCallback(() => {
    if (typeof window !== 'undefined') {
      const signedInStatus = localStorage.getItem('isUserSignedIn') === 'true';
      const preferencesSetStatus = localStorage.getItem('userProfilePreferencesSet') === 'true';
      setIsSignedIn(signedInStatus);
      setProfilePreferencesSet(preferencesSetStatus);
    }
  }, []);

  useEffect(() => {
    setIsClient(true);
    updateAuthState();
  }, [pathname, updateAuthState]); 

  useEffect(() => {
    const handleStorageChange = () => {
      updateAuthState();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange); 

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, [updateAuthState]); 


  const handleSignOut = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isUserSignedIn');
      localStorage.removeItem('userProfilePreferencesSet');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userProfileData');
    }
    setIsSignedIn(false);
    setProfilePreferencesSet(false);
    router.push('/');
  },[router]);

  const canAccessMainAppFeatures = isSignedIn && profilePreferencesSet;

  const baseHeaderClasses = "sticky top-0 z-50 w-full border-b backdrop-blur";
  const serverHeaderClasses = `${baseHeaderClasses} bg-background/95 supports-[backdrop-filter]:bg-background/60`;
  const clientHeaderClasses = `${baseHeaderClasses} bg-secondary/95 supports-[backdrop-filter]:bg-secondary/60`;

  return (
    <header className={isClient ? clientHeaderClasses : serverHeaderClasses}>
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Plane className="h-7 w-7 text-primary" />
          <span className="text-2xl font-bold text-gradient">TripTogether</span>
        </Link>
        <nav className="flex items-center gap-1 md:gap-2">
          {isClient && isSignedIn && (
            <Button variant="ghost" asChild>
              <Link href="/discover">
                <Compass className="md:mr-2 h-4 w-4" /> <span className="hidden md:inline font-bold text-gradient">Discover</span>
              </Link>
            </Button>
          )}

          {isClient && isSignedIn && (
            profilePreferencesSet ? (
              <Button variant="ghost" asChild>
                <Link href="/profile"><UserCircle className="md:mr-2 h-4 w-4" /><span className="hidden md:inline font-bold text-gradient">Profile</span></Link>
              </Button>
            ) : (
              <Button variant="ghost" asChild>
                <Link href="/profile"><Edit className="md:mr-2 h-4 w-4" /><span className="hidden md:inline font-bold text-gradient">Complete Profile</span></Link>
              </Button>
            )
          )}

          {isClient && isSignedIn && (
            <>
              <Button variant="ghost" asChild>
                <Link href="/groups"><Users className="md:mr-2 h-4 w-4"/><span className="hidden md:inline font-bold text-gradient">Groups</span></Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/create-trip"><Edit className="md:mr-2 h-4 w-4"/><span className="hidden md:inline font-bold text-gradient">Create Trip</span></Link>
              </Button>
            </>
          )}
          
          {isClient && canAccessMainAppFeatures && (
             <>
              <Button variant="ghost" asChild size="icon" title="Messages">
                <Link href="/messages">
                  <MessageSquare />
                  <span className="sr-only">Messages</span>
                </Link>
              </Button>
              <Button variant="ghost" asChild size="icon" title="Notifications">
                <Link href="/notifications">
                  <Bell />
                  <span className="sr-only">Notifications</span>
                </Link>
              </Button>
            </>
          )}


          {isClient && !isSignedIn && (
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link href="/auth/sign-in"><span className="font-bold text-gradient">Sign In</span></Link>
              </Button>
              <Button className="bg-gradient-to-r from-[var(--gradient-start)] via-[var(--gradient-middle)] to-[var(--gradient-end)] text-primary-foreground" asChild>
                <Link href="/auth/sign-up"><span className="font-bold">Sign Up</span></Link>
              </Button>
            </div>
          )}
           {isClient && isSignedIn && (
            <Button variant="outline" onClick={handleSignOut} className="flex">
              <LogOut className="md:mr-2 h-4 w-4" />
              <span className="hidden md:inline font-bold text-gradient">Sign Out</span>
            </Button>
          )}
          {!isClient && ( 
            <div className="flex items-center gap-2">
                <div className="h-9 w-20 bg-muted/50 rounded-md animate-pulse"></div>
                <div className="h-9 w-24 bg-muted/50 rounded-md animate-pulse"></div>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
