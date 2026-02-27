'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function RedirectContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email') ?? '';

    useEffect(() => {
        const dest = email ? `/verify-email?email=${encodeURIComponent(email)}` : '/verify-email';
        router.replace(dest);
    }, [router, email]);

    return null;
}

export default function VerifyEmailConfirmPage() {
    return (
        <Suspense>
            <RedirectContent />
        </Suspense>
    );
}
