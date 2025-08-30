
'use client';

import { Button } from "@/components/ui/button";
import { auth, db } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { ref, set, get } from "firebase/database";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const GoogleIcon = () => (
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" className="mr-2">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-.97 2.53-1.94 3.31v2.76h3.54c2.08-1.92 3.28-4.74 3.28-8.08z" fill="#4285F4"></path>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.54-2.76c-.98.66-2.23 1.06-3.74 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
        <path d="M1 1h22v22H1z" fill="none"></path>
    </svg>
)

export default function GoogleSignInButton() {
  const router = useRouter();
  const { toast } = useToast();
  
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user.email) {
          throw new Error("Could not retrieve email from Google account.");
      }

      const userRef = ref(db, `users/${user.uid}`);
      const userSnapshot = await get(userRef);
      
      let userData;
      if (userSnapshot.exists()) {
        userData = userSnapshot.val();
        if (userData.isBanned) {
            toast({
              variant: 'destructive',
              title: 'Account Banned',
              description: 'This account has been banned. Please contact support.',
          });
          await auth.signOut();
          return;
        }
      } else {
        // New user, save their data
        userData = {
            id: user.uid,
            name: user.displayName,
            email: user.email,
            orders: 0,
            isBanned: false,
            role: 'customer', // Default role
        };
        await set(ref(db, 'users/' + user.uid), userData);
      }

      toast({
        title: "Signed In with Google",
        description: "Welcome! Redirecting..."
      });

      if (userData.role === 'admin') {
          router.push('/admin');
      } else {
          router.push('/');
      }
      router.refresh();

    } catch(error: any) {
        console.error("Google sign-in error", error);
        toast({
            variant: "destructive",
            title: "Google Sign-In Failed",
            description: error.message || "Could not sign in with Google."
        });
    }
  }

  return (
    <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
      <GoogleIcon />
      Sign in with Google
    </Button>
  );
}
