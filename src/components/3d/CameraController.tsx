'use client';

import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import gsap from 'gsap';
import { useUIStore } from '@/store/uiStore';

export const CameraController: React.FC = () => {
  const cameraView = useUIStore((state) => state.cameraView);
  const { camera } = useThree();

  // CHỈ chạy hoạt ảnh chuyển đổi khi người chơi bấm nút đổi góc nhìn (cameraView thay đổi)
  useEffect(() => {
    if (cameraView === 'topdown') {
      // Chuyển mượt mà sang góc nhìn 2D thẳng đứng từ trên xuống
      gsap.to(camera.position, {
        x: 0,
        y: 35,
        z: 0.001,
        duration: 0.9,
        ease: 'power2.out',
        onUpdate: () => {
          camera.lookAt(0, 0, 0);
        },
      });
    } else {
      // Chuyển mượt mà về góc 3D nghiêng toàn cảnh
      gsap.to(camera.position, {
        x: 0,
        y: 22,
        z: 17,
        duration: 0.9,
        ease: 'power2.out',
        onUpdate: () => {
          camera.lookAt(0, 0, 0);
        },
      });
    }
  }, [cameraView, camera]);

  return null;
};
