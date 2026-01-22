
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Footer } from '@/components/layout/footer';
import { TourFooter } from '@/components/layout/tour-footer';
import { usePathname } from 'next/navigation';
import { Spinner } from '../ui/spinner';

export function MainLayout({ children }: { children: React.ReactNode }) {
    const { isTouring, loading } = useAuth();
    const pathname = usePathname();

    const showTourFooter = isTouring && pathname !== '/login' && pathname !== '/register';

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Spinner size="lg" />
            </div>
        )
    }

    return (
        <div className="relative flex min-h-screen flex-col">
            <div className="flex-1">{children}</div>
            {showTourFooter ? <TourFooter /> : <Footer />}
        </div>
    );
}
