import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons/Logo';
import { GoogleIcon } from '@/components/icons/GoogleIcon';
import { Users } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between max-w-7xl">
        <Logo />
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Users className="mr-2 h-4 w-4" />
            Guest Mode
          </Button>
          <Button size="sm">
            <GoogleIcon className="mr-2 h-5 w-5" />
            Sign in with Google
          </Button>
        </div>
      </div>
    </header>
  );
}
