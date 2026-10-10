// Keep the login's particle positions stable across rerenders and navigation.
const random = seed => { const x = Math.sin(seed * 9301 + 49297) * 233280; return x - Math.floor(x); };
const droplets = Array.from({ length: 14 }, (_, i) => {
    const size = 4 + random(i + 1) * 9;
    return { left: `${random(i + 50) * 100}%`, top: `${random(i + 90) * 100}%`, width: size, height: size * 1.1, opacity: 0.2 + random(i + 7) * 0.25 };
});
const sparks = Array.from({ length: 16 }, (_, i) => ({ left: `${(i * 7 + 5) % 100}%`, bottom: `-${(i % 4) * 20 + 10}px`, animationDuration: `${10 + (i % 5) * 3}s`, animationDelay: `${-(i * 1.9)}s` }));

export default function AmbientParticles({ compact = false }) {
    return <div className="ambient-particles" aria-hidden="true">
        {sparks.slice(0, compact ? 10 : sparks.length).map((style, index) => <i className="ambient-spark" key={`spark-${index}`} style={style} />)}
        {droplets.slice(0, compact ? 8 : droplets.length).map((style, index) => <i className="ambient-drop" key={`drop-${index}`} style={style} />)}
    </div>;
}
