'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment, useGLTF } from '@react-three/drei';
import { TokenDefinition, MetalFinish } from '@/constants/tokenConfig';

import { SkeletonUtils } from 'three-stdlib';
import '@/utils/threePatch';

interface ShowcaseModelProps {
  token: TokenDefinition;
  metalFinish: MetalFinish;
}

const ShowcaseModel: React.FC<ShowcaseModelProps> = ({ token, metalFinish }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(token.modelPath);

  // Clone scene và phủ vật liệu kim loại PBR phản quang tươi sáng
  const clonedScene = useMemo(() => {
    const clone = SkeletonUtils.clone(scene) as THREE.Group;
    const color = new THREE.Color(metalFinish.hexColor);

    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (mesh.material) {
          const mat = (mesh.material as THREE.MeshStandardMaterial).clone();
          if (mat.map) {
            // Giữ nguyên texture màu sắc gốc sống động của nhân vật (tóc, da, trang phục)
            mat.color = new THREE.Color(0xffffff);
            mat.roughness = 0.4;
            mat.metalness = 0.05;
          } else {
            mat.color = color;
            mat.metalness = Math.max(0.75, metalFinish.metalness);
            mat.roughness = Math.min(0.2, metalFinish.roughness);
          }
          mesh.material = mat;
        }
      }
    });

    return clone;
  }, [scene, metalFinish]);

  // Hoạt ảnh (Animation) 'idle' cho nhân vật trong sảnh chờ
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);

  useEffect(() => {
    if (!clonedScene || !animations || animations.length === 0) return;

    const mixer = new THREE.AnimationMixer(clonedScene);
    mixerRef.current = mixer;

    const clip =
      animations.find((a) => a.name.toLowerCase() === 'idle') ||
      animations.find((a) => a.name.toLowerCase() === 'static') ||
      animations[0];

    if (clip) {
      const action = mixer.clipAction(clip);
      action.reset().fadeIn(0.2).play();
    }

    return () => {
      mixer.stopAllAction();
      mixer.uncacheRoot(clonedScene);
    };
  }, [clonedScene, animations]);

  // Xoay tròn tự động nhẹ nhàng và cập nhật animation mixer
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.85;
    }
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.20, 0]}>
      <primitive
        object={clonedScene}
        scale={token.scale * 2.0}
        position={[0, 0, 0]}
      />
    </group>
  );
};

interface TokenShowcase3DProps {
  token: TokenDefinition;
  metalFinish: MetalFinish;
}

export const TokenShowcase3D: React.FC<TokenShowcase3DProps> = ({ token, metalFinish }) => {
  return (
    <div className="relative w-full h-full">
      <Canvas
        camera={{ position: [0, 1.4, 3.9], fov: 38 }}
        shadows={{ enabled: true, type: THREE.PCFShadowMap }}
        dpr={[1, 2]}
        gl={{
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.35,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
      >
        {/* Ánh sáng ban ngày tươi sáng rực rỡ phong cách Mint Zen */}
        <ambientLight intensity={1.45} color="#F0FDF4" />
        <directionalLight
          position={[3, 8, 5]}
          intensity={2.3}
          color="#FFFBEB"
          castShadow
          shadow-bias={-0.0001}
        />
        <pointLight position={[-4, 3, -2]} intensity={1.6} color="#BAE6FD" />
        <pointLight position={[4, 3, 2]} intensity={1.8} color="#6EE7B7" />
        
        <Environment preset="city" environmentIntensity={0.9} />

        {/* 1. Bục Trưng Bày Mint & Matcha Cream Sang Trọng (Kích thước tinh gọn, cân đối) */}
        <group position={[0, -0.45, 0]}>
          {/* Tầng chân bục kem sữa */}
          <mesh receiveShadow position={[0, 0.10, 0]}>
            <cylinderGeometry args={[1.35, 1.52, 0.20, 48]} />
            <meshStandardMaterial
              color="#ECFDF5"
              roughness={0.2}
              metalness={0.08}
            />
          </mesh>

          {/* Vành mạ ngọc lục bảo mint */}
          <mesh position={[0, 0.22, 0]}>
            <cylinderGeometry args={[1.38, 1.38, 0.04, 48]} />
            <meshStandardMaterial
              color="#10B981"
              metalness={0.88}
              roughness={0.15}
            />
          </mesh>

          {/* Mặt bục thạch sáng màu người chơi */}
          <mesh position={[0, 0.245, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[1.28, 48]} />
            <meshStandardMaterial
              color={metalFinish.hexColor}
              metalness={0.65}
              roughness={0.2}
            />
          </mesh>

          {/* Vòng hào quang xanh mint lấp lánh */}
          <mesh position={[0, 0.25, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.05, 1.25, 48]} />
            <meshBasicMaterial
              color="#34D399"
              transparent
              opacity={0.7}
            />
          </mesh>
        </group>

        {/* 2. Model GLB xoay 360° */}
        <ShowcaseModel token={token} metalFinish={metalFinish} />

        {/* 3. Đổ bóng tiếp xúc mềm mại màu ngọc lục bảo */}
        <ContactShadows
          position={[0, -0.48, 0]}
          opacity={0.55}
          scale={5}
          blur={2.2}
          far={3.5}
          color="#064E3B"
        />

        {/* 4. Điều khiển xoay chuột tự do (không chặn cuộn trang bằng con lăn) */}
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.1}
        />
      </Canvas>
    </div>
  );
};
