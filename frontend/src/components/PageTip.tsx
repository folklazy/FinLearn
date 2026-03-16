'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { X, Lightbulb } from 'lucide-react';

const TIP_PREFIX = 'finlearn_pagetip_';
const AUTO_DISMISS_MS = 12000;
const SHOW_DELAY_MS = 800;

interface PageTipProps {
    pageKey: string;
    icon?: string;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
}

export default function PageTip({ pageKey, icon, title, description, actionLabel, onAction }: PageTipProps) {
    const { data: session } = useSession();
    const [visible, setVisible] = useState(false);
    const [exiting, setExiting] = useState(false);

    const dismiss = useCallback(() => {
        setExiting(true);
        setTimeout(() => {
            setVisible(false);
            localStorage.setItem(`${TIP_PREFIX}${pageKey}`, 'true');
        }, 300);
    }, [pageKey]);

    useEffect(() => {
        if (!session?.user) return;
        if (localStorage.getItem('finlearn_tour_step')) return; // tour active
        const seen = localStorage.getItem(`${TIP_PREFIX}${pageKey}`);
        if (seen) return;
        const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
        return () => clearTimeout(timer);
    }, [session, pageKey]);

    useEffect(() => {
        if (!visible || exiting) return;
        const timer = setTimeout(dismiss, AUTO_DISMISS_MS);
        return () => clearTimeout(timer);
    }, [visible, exiting, dismiss]);

    if (!visible) return null;

    return (
        <div className={`pagetip${exiting ? ' pagetip-exit' : ''}`}>
            <div className="pagetip-glow" />
            <div className="pagetip-content">
                <div className="pagetip-header">
                    <div className="pagetip-icon-wrap">
                        {icon ? (
                            <span className="pagetip-emoji">{icon}</span>
                        ) : (
                            <Lightbulb size={16} className="pagetip-bulb" />
                        )}
                    </div>
                    <span className="pagetip-title">{title}</span>
                    <button onClick={dismiss} className="pagetip-close" aria-label="Dismiss">
                        <X size={14} />
                    </button>
                </div>
                <p className="pagetip-desc">{description}</p>
                {actionLabel && onAction && (
                    <button onClick={() => { onAction(); dismiss(); }} className="pagetip-action">
                        {actionLabel}
                    </button>
                )}
            </div>
            <div className="pagetip-progress">
                <div className="pagetip-progress-bar" style={{ animationDuration: `${AUTO_DISMISS_MS}ms` }} />
            </div>
        </div>
    );
}
