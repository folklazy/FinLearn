'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import ProductTour from '@/components/ProductTour';

const CHROMELESS_PATHS = ['/onboarding'];

function ScrollToTop() {
    const pathname = usePathname();
    useEffect(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    }, [pathname]);
    return null;
}

export default function LayoutShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isChromeless = CHROMELESS_PATHS.some((p) => pathname.startsWith(p));

    if (isChromeless) {
        return <>{children}</>;
    }

    return (
        <>
            <ScrollToTop />
            <Navbar />
            <ProductTour />
            <main style={{ minHeight: 'calc(100vh - 64px)' }}>
                {children}
            </main>
            <Footer />
        </>
    );
}
