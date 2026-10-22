'use client';

/**
 * 🛠️ Three.js Console Warning Filter
 * Tự động lọc các cảnh báo deprecation trung gian từ Three.js r183+
 * mà các thư viện wrapper như @react-three/fiber và @react-three/drei đang xử lý ở tầng nội bộ.
 */
if (typeof window !== 'undefined') {
  const originalWarn = console.warn;
  console.warn = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('THREE.Clock: This module has been deprecated') ||
        args[0].includes('THREE.WebGLShadowMap: PCFSoftShadowMap has been removed'))
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };
}
