import SignupForm from '@/components/auth/SignupForm';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Image from 'next/image';

export default function SignupPage() {
  return (
    <div className="w-full lg:grid lg:min-h-[calc(100vh-4rem)] lg:grid-cols-2 xl:min-h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-center py-12 px-4">
        <div className="mx-auto grid w-full max-w-sm gap-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="font-headline text-2xl">
                Create an Account
              </CardTitle>
              <CardDescription>
                Join GharTek to order your favorite food
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SignupForm />
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="bg-muted hidden lg:block">
        <Image
          src="https://picsum.photos/1920/1080?grayscale"
          data-ai-hint="restaurant kitchen"
          alt="Image"
          width="1920"
          height="1080"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
