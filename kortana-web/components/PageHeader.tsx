export default function PageHeader({ title, subtitle }: { title: string, subtitle: string }) {
    return (
        <div className="py-24 px-4 text-center border-b border-white/10 bg-midnight-blue/30 backdrop-blur-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 to-transparent"></div>
            <h1 className="relative z-10 text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight drop-shadow-lg">{title}</h1>
            <p className="relative z-10 text-xl text-cyan-300 max-w-2xl mx-auto font-medium">{subtitle}</p>
        </div>
    )
}
