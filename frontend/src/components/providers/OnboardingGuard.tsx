'use client';

import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const PUBLIC_PATHS = ['/login', '/register', '/onboarding'];

function isPublicPath(p: string) {
    return PUBLIC_PATHS.some((pub) => p.startsWith(pub));
}

export default function OnboardingGuard({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const router = useRouter();
    const [ready, setReady] = useState(false);

    const isPublic = isPublicPath(pathname);
    const isAuthed = !!session?.user;

    useEffect(() => {
        // Skip check for unauthenticated or public pages
        if (status === 'loading') return;

        if (!isAuthed || isPublic) {
            setReady(true);
            return;
        }

        let cancelled = false;

        fetch('/api/user/profile')
            .then((res) => res.json())
            .then((data) => {
                if (cancelled) return;
                const profile = data.user?.profile;
                if (!profile || !profile.onboardingCompletedAt) {
                    router.replace('/onboarding');
                } else {
                    setReady(true);
                }
            })
            .catch(() => {
                if (!cancelled) setReady(true);
            });

        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, isAuthed, isPublic]);

    if (!ready) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    border: '2px solid var(--primary)', borderTopColor: 'transparent',
                    animation: 'spin 0.8s linear infinite',
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return <>{children}</>;
}
