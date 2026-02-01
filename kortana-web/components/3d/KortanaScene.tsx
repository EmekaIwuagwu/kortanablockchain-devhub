'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function ParticleNetwork() {
    const ref = useRef<THREE.Points>(null!);

    // Generate particles in a spherical distribution
    const positions = useMemo(() => {
        const count = 3000;
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const r = 10 + Math.random() * 20; // Radius between 10 and 30
            const theta = 2 * Math.PI * Math.random();
            const phi = Math.acos(2 * Math.random() - 1);

            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
        }
        return positions;
    }, []);

    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.rotation.x -= delta / 15;
            ref.current.rotation.y -= delta / 20;
        }
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
                <PointMaterial
                    transparent
                    color="#06b6d4" // Cyan accent
                    size={0.05}
                    sizeAttenuation={true}
                    depthWrite={false}
                    opacity={0.6}
                />
            </Points>
        </group>
    );
}

function FloatingGrid() {
    return (
        <gridHelper args={[60, 60, 0x1a1f3a, 0x0a0e27]} position={[0, -5, 0]} />
    )
}

export default function KortanaScene() {
    return (
        <div className="absolute inset-0 z-0 bg-deep-space">
            <Canvas camera={{ position: [0, 0, 25], fov: 60 }}>
                <fog attach="fog" args={['#0a0e27', 10, 40]} />
                <ambientLight intensity={0.5} />
                <ParticleNetwork />

                {/* Subtle secondary particles for depth */}
                <Points positions={new Float32Array(500 * 3).map(() => (Math.random() - 0.5) * 50)} stride={3}>
                    <PointMaterial transparent color="#7c3aed" size={0.03} sizeAttenuation={true} opacity={0.4} />
                </Points>
            </Canvas>
        </div>
    );
}
