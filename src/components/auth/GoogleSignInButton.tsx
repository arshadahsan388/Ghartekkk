import { Button } from "@/components/ui/button";

const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-1.5c-1 0-1.5.5-1.5 1.5V12h3l-.5 3h-2.5v6.95A10.02 10.02 0 0 0 22 12z" fill="#4285F4" stroke="none"/>
        <path d="M21.99 12c0-.67-.06-1.32-.17-1.95H12v3.7h5.5a4.83 4.83 0 0 1-2.09 3.15v2.4h3.1c1.81-1.67 2.89-4.14 2.89-6.95z" fill="#4285F4" stroke="none"/>
        <path d="M12 22c2.7 0 4.96-1.09 6.62-2.95l-3.1-2.4c-.89.6-2.03.95-3.52.95-2.67 0-4.95-1.8-5.76-4.25H2.9v2.58A10 10 0 0 0 12 22z" fill="#34A853" stroke="none"/>
        <path d="M6.24 14.25c-.2-.6-.31-1.25-.31-1.93s.11-1.33.31-1.93V7.81H2.9A10.03 10.03 0 0 0 2 12c0 1.8.48 3.49 1.3 4.97l2.94-2.72z" fill="#FBBC05" stroke="none"/>
        <path d="M12 5.25c1.46 0 2.76.5 3.78 1.48l2.58-2.58C16.96 2.14 14.7 1 12 1 7.05 1 3.2 3.82 2.9 7.81l3.34 2.58C7.05 7.05 9.33 5.25 12 5.25z" fill="#EA4335" stroke="none"/>
    </svg>
)


export default function GoogleSignInButton() {
  return (
    <Button variant="outline" className="w-full">
      <GoogleIcon />
      Sign in with Google
    </Button>
  );
}
