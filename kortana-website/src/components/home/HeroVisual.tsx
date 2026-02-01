'use client'

import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Stars, Line, Sphere } from '@react-three/drei'
import * as THREE from 'three'

function NetworkNode({ position }: { position: [number, number, number] }) {
    return (
        <mesh position={position}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial color="#00F0FF" emissive="#00F0FF" emissiveIntensity={2} toneMapped={false} />
        </mesh>
    )
}

function Connection({ start, end }: { start: [number, number, number], end: [number, number, number] }) {
    return (
        <Line
            points={[start, end]}
            color="rgba(46, 163, 255, 0.2)"
            lineWidth={1}
            transparent
            opacity={0.3}
        />
    )
}

function NetworkMesh() {
    const count = 40
    const nodes = useMemo(() => {
        const temp = []
        for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);
            const r = 2.5 + Math.random() * 1;

            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);
            temp.push([x, y, z] as [number, number, number])
        }
        return temp
    }, [])

    const ref = useRef<THREE.Group>(null)

    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.y = state.clock.getElapsedTime() * 0.05
            ref.current.rotation.z = state.clock.getElapsedTime() * 0.02
        }
    })

    return (
        <group ref={ref}>
            {nodes.map((pos, i) => (
                <NetworkNode key={i} position={pos} />
            ))}
            {nodes.map((pos, i) => {
                // Connect to nearest neighbors (simple demo logic)
                if (i % 3 === 0) {
                    const next = nodes[(i + 1) % nodes.length]
                    const next2 = nodes[(i + 2) % nodes.length]
                    return (
                        <group key={i}>
                            <Connection start={pos} end={next} />
                            <Connection start={pos} end={next2} />
                        </group>
                    )
                }
                return null
            })}

            {/* Central Core */}
            <mesh>
                <sphereGeometry args={[1.5, 32, 32]} />
                <meshStandardMaterial
                    color="#000"
                    roughness={0.1}
                    metalness={0.8}
                    transparent
                    opacity={0.9}
                />
            </mesh>
            <mesh>
                <sphereGeometry args={[1.52, 32, 32]} />
                <meshBasicMaterial
                    color="#2EA3FF"
                    wireframe
                    transparent
                    opacity={0.1}
                />
            </mesh>
        </group>
    )
}

export function HeroVisual() {
    return (
        <div className="absolute inset-0 z-0">
            <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
                <fog attach="fog" args={['#020408', 5, 15]} />
                <ambientLight intensity={1.5} />
                <pointLight position={[10, 10, 10]} intensity={2} color="#8A4BFF" />
                <pointLight position={[-10, -10, -10]} intensity={2} color="#00F0FF" />

                <Float speed={2} rotationIntensity={0.5} floatIntensity={0.2}>
                    <NetworkMesh />
                </Float>

                <Stars radius={50} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
            </Canvas>
        </div>
    )
}
