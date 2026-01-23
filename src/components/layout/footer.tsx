
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export function Footer() {
    const [currentYear, setCurrentYear] = useState<string>('');

    useEffect(() => {
        // This effect runs only on the client, after hydration
        setCurrentYear(new Date().getFullYear().toString());
    }, []);

    return (
        <footer className="p-4 text-center text-xs text-muted-foreground border-t">
            <Link href="/privacy" className="hover:text-primary underline-offset-4 hover:underline">Privacy Policy</Link>
            <span className="mx-2">|</span>
            <span suppressHydrationWarning className="inline-block h-4">
                © {currentYear} AutoKnerd, Inc. All rights reserved.
            </span>
        </footer>
    );
}
