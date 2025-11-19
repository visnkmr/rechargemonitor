'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Loader2 } from 'lucide-react';

export function LoginButton() {
    console.log('LoginButton');
    const { user, error, isLoading } = useUser();

    if (isLoading) {
        return (
            <Button variant="outline" disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
            </Button>
        );
    }

    if (error) {
        console.log('LoginButton error', error);
        return <div className="text-red-500 text-sm">{error.message}</div>;
    }

    if (user) {
        return (
            <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                    Signed in as <span className="font-medium text-foreground">{user.name}</span>
                </div>
                <a href="/api/auth/logout">
                    <Button variant="outline" size="sm">
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                    </Button>
                </a>
            </div>
        );
    }

    return (
        <a href="/api/auth/login">
            <Button>
                <LogIn className="mr-2 h-4 w-4" />
                Sign In to Sync
            </Button>
        </a>
    );
}
