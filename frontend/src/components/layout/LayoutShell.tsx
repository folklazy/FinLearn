'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

const CHROMELESS_PATHS = ['/onboarding'];

export default function LayoutShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isChromeless = CHROMELESS_PATHS.some((p) => pathname.startsWith(p));

    if (isChromeless) {
        return <>{children}</>;
    }

    return (
        <>
            <Navbar />
            <main style={{ minHeight: 'calc(100vh - 64px)' }}>
                {children}
            </main>
            <Footer />
        </>
    );
}
