import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Sphere, Line } from "@react-three/drei";
import * as THREE from "three";
import { useCampaignStore } from "@/store/campaignStore";

const AGENTS = [
  { name: "ceo_agent",               label: "CEO",         pos: [0, 0, 0] as [number,number,number],       color: "#a855f7" },
  { name: "research_agent",          label: "Research",    pos: [-3, -1.5, 0] as [number,number,number],   color: "#3b82f6" },
  { name: "seo_agent",               label: "SEO",         pos: [-1, -2.5, 1] as [number,number,number],   color: "#22c55e" },
  { name: "content_agent",           label: "Content",     pos: [1, -2.5, 1] as [number,number,number],    color: "#eab308" },
  { name: "social_agent",            label: "Social",      pos: [3, -1.5, 0] as [number,number,number],    color: "#ec4899" },
  { name: "analytics_agent",         label: "Analytics",   pos: [2, -3, -1] as [number,number,number],     color: "#f97316" },
  { name: "creative_director_agent", label: "Creative",    pos: [-2, -3, -1] as [number,number,number],    color: "#ef4444" },
  { name: "report_agent",            label: "Report",      pos: [0, -4, 0] as [number,number,number],      color: "#6366f1" },
];

const CONNECTIONS = [
  ["ceo_agent", "research_agent"],
  ["ceo_agent", "seo_agent"],
  ["ceo_agent", "content_agent"],
  ["ceo_agent", "social_agent"],
  ["ceo_agent", "analytics_agent"],
  ["ceo_agent", "creative_director_agent"],
  ["ceo_agent", "report_agent"],
  ["research_agent", "seo_agent"],
  ["seo_agent", "content_agent"],
  ["content_agent", "social_agent"],
  ["analytics_agent", "report_agent"],
  ["creative_director_agent", "report_agent"],
];

function AgentNode({ agent, isActive }: { agent: typeof AGENTS[0]; isActive: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += 0.005;
    if (isActive) {
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.1 + 1;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group position={agent.pos}>
      {isActive && (
        <Sphere ref={glowRef} args={[0.6, 16, 16]}>
          <meshBasicMaterial color={agent.color} transparent opacity={0.15} />
        </Sphere>
      )}
      <Sphere ref={meshRef} args={[0.3, 16, 16]}>
        <meshStandardMaterial
          color={agent.color}
          emissive={agent.color}
          emissiveIntensity={isActive ? 0.8 : 0.2}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
      <Text
        position={[0, -0.55, 0]}
        fontSize={0.2}
        color="#e2e8f0"
        anchorX="center"
        anchorY="top"
      >
        {agent.label}
      </Text>
    </group>
  );
}

function DataFlow({ from, to, active }: { from: [number,number,number]; to: [number,number,number]; active: boolean }) {
  const particleRef = useRef<THREE.Mesh>(null);
  const progress = useRef(0);

  useFrame((_, delta) => {
    if (!particleRef.current || !active) return;
    progress.current = (progress.current + delta * 0.5) % 1;
    const p = progress.current;
    particleRef.current.position.set(
      from[0] + (to[0] - from[0]) * p,
      from[1] + (to[1] - from[1]) * p,
      from[2] + (to[2] - from[2]) * p,
    );
  });

  return (
    <group>
      <Line
        points={[from, to]}
        color={active ? "#6366f1" : "#1e293b"}
        lineWidth={active ? 1.5 : 0.5}
        transparent
        opacity={active ? 0.6 : 0.2}
      />
      {active && (
        <Sphere ref={particleRef} args={[0.08, 8, 8]}>
          <meshBasicMaterial color="#a5b4fc" />
        </Sphere>
      )}
    </group>
  );
}

function Scene() {
  const { agentProgress } = useCampaignStore();

  const agentMap = useMemo(
    () => Object.fromEntries(AGENTS.map((a) => [a.name, a])),
    []
  );

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 5, 5]} intensity={1} color="#6366f1" />
      <pointLight position={[-5, -5, 5]} intensity={0.5} color="#a855f7" />

      {CONNECTIONS.map(([from, to]) => {
        const fromAgent = agentMap[from];
        const toAgent = agentMap[to];
        const fromProgress = agentProgress[from];
        const active = fromProgress?.state === "RUNNING" || fromProgress?.state === "COMPLETED";
        return (
          <DataFlow
            key={`${from}-${to}`}
            from={fromAgent.pos}
            to={toAgent.pos}
            active={active}
          />
        );
      })}

      {AGENTS.map((agent) => {
        const progress = agentProgress[agent.name];
        const isActive = progress?.state === "RUNNING";
        return <AgentNode key={agent.name} agent={agent} isActive={isActive} />;
      })}

      <OrbitControls enableZoom autoRotate autoRotateSpeed={0.5} />
    </>
  );
}

export function SystemVisualization() {
  return (
    <div className="w-full h-96 rounded-xl overflow-hidden glass">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <Scene />
      </Canvas>
    </div>
  );
}
