'use client';

import PageHeader from "@/components/PageHeader";
import WhitepaperContent from "@/components/WhitepaperContent";

export default function WhitepaperPage() {
    return (
        <div className="min-h-screen bg-deep-space pb-20 relative overflow-hidden text-medium">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-cyan-500/5 blur-[150px] rounded-full pointer-events-none"></div>

            <PageHeader
                title="Whitepaper"
                subtitle="The Technical Specification for the Industrial Finance Layer."
            />

            <WhitepaperContent />
        </div>
    )
}
