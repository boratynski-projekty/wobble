"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, RoundedBox, Text } from "@react-three/drei";
import { stackFromBottom } from "@/lib/tower/order";
import type { Block } from "@/lib/tower/types";

/**
 * Wieża jako prawdziwa Jenga w 3D.
 *
 * Układ: 3 klocki na warstwę, orientacja obraca się o 90° co warstwę (jak w Jendze).
 * Wieża rośnie od dołu, ale kolejność priorytetu jest odwrócona — najważniejsze
 * zadania lądują na SZCZYCIE, bo stamtąd się je wyjmuje, nie ruszając mniej ważnych
 * z dołu (decyzja właściciela 2026-07-24). Tekst zadania jest wypalony na górnej
 * ściance klocka fontem z public/fonts (polskie znaki, offline).
 */

// Proporcje zbliżone do klocka Jenga (75 × 25 × 15 mm → 3 × 1 × 0.6 jednostki).
const LEN = 3;
const WID = 1;
const HGT = 0.6;
const GAP = 0.04;
const FONT = "/fonts/inter-500.woff";

const WOOD = "#c9a877";
const INK = "#3d2f1f";

type Placed = {
  block: Block;
  position: [number, number, number];
  /** true = klocek leży wzdłuż osi X (warstwa parzysta). */
  alongX: boolean;
};

function layout(blocks: Block[]): { placed: Placed[]; height: number } {
  const fromBottom = stackFromBottom(blocks);
  const placed: Placed[] = fromBottom.map((block, i) => {
    const layer = Math.floor(i / 3);
    const slot = i % 3; // 0,1,2 w obrębie warstwy
    const alongX = layer % 2 === 0;
    const y = HGT / 2 + layer * HGT;
    const off = (slot - 1) * (WID + GAP); // -1, 0, 1
    const position: [number, number, number] = alongX
      ? [0, y, off]
      : [off, y, 0];
    return { block, position, alongX };
  });
  const layers = Math.ceil(fromBottom.length / 3);
  return { placed, height: layers * HGT };
}

type Props = {
  blocks: Block[];
  onComplete: (id: string) => void;
};

export function Tower3DScene({ blocks, onComplete }: Props) {
  const { placed, height } = useMemo(() => layout(blocks), [blocks]);
  const midY = height / 2;

  return (
    <Canvas
      dpr={[1, 2]}
      shadows
      camera={{ position: [6, height + 3, 7], fov: 38 }}
      style={{ width: "100%", height: 420, touchAction: "none" }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight
        position={[6, 12, 6]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-5, 6, -4]} intensity={0.35} />

      {placed.map(({ block, position, alongX }) => (
        <JengaBlock
          key={block.id}
          block={block}
          position={position}
          alongX={alongX}
          onComplete={onComplete}
        />
      ))}

      {/* Ziemia — łapie cień, kotwiczy wieżę. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[6, 48]} />
        <shadowMaterial opacity={0.18} />
      </mesh>

      <OrbitControls
        enablePan={false}
        minDistance={5}
        maxDistance={16}
        minPolarAngle={0.3}
        maxPolarAngle={Math.PI / 2 - 0.05}
        target={[0, midY, 0]}
      />
    </Canvas>
  );
}

function JengaBlock({
  block,
  position,
  alongX,
  onComplete,
}: {
  block: Block;
  position: [number, number, number];
  alongX: boolean;
  onComplete: (id: string) => void;
}) {
  const boxArgs: [number, number, number] = alongX
    ? [LEN, HGT, WID]
    : [WID, HGT, LEN];

  return (
    <group position={position}>
      <RoundedBox
        args={boxArgs}
        radius={0.05}
        smoothness={3}
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          onComplete(block.id);
        }}
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "auto")}
      >
        <meshStandardMaterial color={WOOD} roughness={0.75} metalness={0.02} />
      </RoundedBox>

      {/* Tytuł na górnej ściance, ułożony wzdłuż długiej osi klocka. */}
      <Text
        font={FONT}
        position={[0, HGT / 2 + 0.01, 0]}
        rotation={[-Math.PI / 2, 0, alongX ? 0 : Math.PI / 2]}
        fontSize={0.24}
        maxWidth={LEN * 0.82}
        lineHeight={1.05}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
        color={INK}
        outlineWidth={0}
      >
        {block.title}
      </Text>
    </group>
  );
}
