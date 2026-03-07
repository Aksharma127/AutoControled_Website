import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

function Particles({ count = 800 }) {
    const mesh = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 12;
            const y = (Math.random() - 0.5) * 12;
            const z = (Math.random() - 0.5) * 12;
            temp.push({
                x, y, z,
                original: new THREE.Vector3(x, y, z),
                speed: 0.002 + Math.random() * 0.005
            });
        }
        return temp;
    }, [count]);

    const { pointer } = useThree();

    useFrame(() => {
        if (!mesh.current) return;

        // Mouse mapped to 3D space roughly
        const mouseX = pointer.x * 6;
        const mouseY = pointer.y * 6;
        const mousePos = new THREE.Vector3(mouseX, mouseY, 2);

        particles.forEach((particle, i) => {
            dummy.position.set(particle.x, particle.y, particle.z);

            const currentPos = new THREE.Vector3(particle.x, particle.y, particle.z);
            const dist = currentPos.distanceTo(mousePos);

            // Gravity toward mouse if within radius
            if (dist < 3) {
                currentPos.lerp(mousePos, 0.08 * (3 - dist));
                particle.x = currentPos.x;
                particle.y = currentPos.y;
                particle.z = currentPos.z;
            } else {
                // Return to original slowly
                currentPos.lerp(particle.original, 0.02);
                particle.x = currentPos.x;
                particle.y = currentPos.y;
                particle.z = currentPos.z;
            }

            // Subtle rotation around origin
            const newX = particle.x * Math.cos(particle.speed) - particle.z * Math.sin(particle.speed);
            const newZ = particle.x * Math.sin(particle.speed) + particle.z * Math.cos(particle.speed);
            particle.x = newX;
            particle.z = newZ;

            dummy.updateMatrix();
            mesh.current!.setMatrixAt(i, dummy.matrix);
        });
        mesh.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshBasicMaterial color="#00F0FF" transparent opacity={0.5} />
        </instancedMesh>
    );
}

export function NeuralNetwork() {
    return (
        <div className="absolute inset-0 z-0 pointer-events-auto">
            <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
                <ambientLight intensity={0.5} />
                <Particles count={500} />
            </Canvas>
        </div>
    );
}
