import { LoginForm } from '@/components/auth/login-form';
import { Logo } from '@/components/layout/logo';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center justify-center text-center">
            <div className="mb-4">
                <Logo variant="full" width={610} height={203} />
            </div>
        </div>
        <LoginForm />
        
        <div className="relative mt-8 w-full">
            <Separator />
            <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-background px-2 text-xs text-muted-foreground">
                OR
            </span>
        </div>

        <div className="mt-6 w-full text-center">
            <Button asChild className="w-full font-semibold" variant="secondary">
                <Link href="/register">Shift Into Drive</Link>
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
                Create Your AutoDrive Account
            </p>
        </div>
      </div>
    </main>
  );
}
