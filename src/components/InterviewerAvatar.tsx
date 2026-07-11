import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";

interface Props {
  status: "ready" | "listening" | "thinking" | "speaking" | "error";
}

function Persona({ status }: Props) {
  const group = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.55) * 0.1;
    group.current.position.y = Math.sin(clock.getElapsedTime() * 1.2) * 0.035;
  });
  const mouthScale = status === "speaking" ? 1 + Math.sin(Date.now() / 90) * 0.35 : 0.55;
  return (
    <group ref={group} position={[0, -0.65, 0]}>
      <mesh position={[0, 0.15, 0]} castShadow><capsuleGeometry args={[0.57, 1.35, 8, 16]} /><meshStandardMaterial color="#193c38" roughness={0.82} /></mesh>
      <mesh position={[0, 1.45, 0.05]} castShadow><sphereGeometry args={[0.72, 28, 28]} /><meshStandardMaterial color="#e6aa86" roughness={0.72} /></mesh>
      <mesh position={[0, 1.82, -0.02]}><sphereGeometry args={[0.76, 28, 18, 0, Math.PI * 2, 0, 1.55]} /><meshStandardMaterial color="#1a242c" roughness={0.9} /></mesh>
      <mesh position={[-0.24, 1.5, 0.64]}><sphereGeometry args={[0.07, 12, 12]} /><meshStandardMaterial color="#132529" /></mesh>
      <mesh position={[0.24, 1.5, 0.64]}><sphereGeometry args={[0.07, 12, 12]} /><meshStandardMaterial color="#132529" /></mesh>
      <mesh scale={[0.19, 0.055 * mouthScale, 0.04]} position={[0, 1.18, 0.68]}><sphereGeometry args={[1, 16, 16]} /><meshStandardMaterial color="#a94e53" /></mesh>
      <mesh position={[0, 0.92, 0.55]} rotation={[0.17, 0, 0]}><boxGeometry args={[0.72, 0.38, 0.08]} /><meshStandardMaterial color="#e8f2e9" /></mesh>
    </group>
  );
}

export function InterviewerAvatar({ status }: Props) {
  return <Canvas shadows camera={{ position: [0, 1.25, 5], fov: 42 }}><ambientLight intensity={1.5} /><directionalLight position={[3, 4, 3]} intensity={2.2} castShadow /><pointLight position={[-2, 2, 2]} color="#86d7c6" intensity={12} /><Persona status={status} /></Canvas>;
}
