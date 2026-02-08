'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminIndex() {
    const router = useRouter();

    useEffect(() => {
        router.push('/admin/dashboard');
    }, [router]);

    return (
        <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-[#DC143C] border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
}
