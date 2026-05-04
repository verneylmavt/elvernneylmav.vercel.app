"use client";

import { useEffect, useRef } from "react";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function prefersReducedMotion(): boolean {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

function canCreateWebGlContext(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    context?.getExtension("WEBGL_lose_context")?.loseContext();
    return Boolean(context);
  } catch {
    return false;
  }
}

export function ThreeBackground() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (!canCreateWebGlContext()) return;

    let disposed = false;
    let cleanup: (() => void) | null = null;

    const setup = async () => {
      const THREE = await import("three");
      if (disposed || !container.isConnected) return;

      const reduceMotion = prefersReducedMotion();

      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10);
      camera.position.z = 2;

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false,
        powerPreference: "high-performance",
      });
      renderer.setClearColor(0x000000, 0);
      renderer.domElement.setAttribute("aria-hidden", "true");
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      renderer.domElement.style.display = "block";

      container.appendChild(renderer.domElement);

      // Particle texture (soft disc) from a canvas.
      const texCanvas = document.createElement("canvas");
      texCanvas.width = 64;
      texCanvas.height = 64;
      const ctx = texCanvas.getContext("2d");
      if (!ctx) return;
      const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0.0, "rgba(255,255,255,1)");
      g.addColorStop(0.35, "rgba(255,255,255,0.35)");
      g.addColorStop(1.0, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 64, 64);

      const texture = new THREE.CanvasTexture(texCanvas);
      texture.needsUpdate = true;

      const count = 900;
      const positions = new Float32Array(count * 3);
      const base = new Float32Array(count * 3);
      const phase = new Float32Array(count);
      const speed = new Float32Array(count);

      for (let i = 0; i < count; i++) {
        const x = (Math.random() * 2 - 1) * 1.15;
        const y = (Math.random() * 2 - 1) * 1.05;
        const z = Math.random() * 0.4;
        positions[i * 3 + 0] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
        base.set([x, y, z], i * 3);
        phase[i] = Math.random() * Math.PI * 2;
        speed[i] = 0.15 + Math.random() * 0.55;
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

      const material = new THREE.PointsMaterial({
        color: 0xffffff,
        map: texture,
        transparent: true,
        opacity: 0.42,
        size: 0.032,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      const points = new THREE.Points(geometry, material);
      scene.add(points);

      const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
      const onPointerMove = (e: PointerEvent) => {
        const nx = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
        const ny = (e.clientY / Math.max(1, window.innerHeight)) * 2 - 1;
        pointer.tx = nx;
        pointer.ty = ny;
      };
      window.addEventListener("pointermove", onPointerMove, { passive: true });

      const resize = () => {
        const w = Math.max(container.clientWidth, 1);
        const h = Math.max(container.clientHeight, 1);
        const pixelRatio = clamp(window.devicePixelRatio || 1, 1, w < 768 ? 1.0 : 1.25);

        renderer.setPixelRatio(pixelRatio);
        renderer.setSize(w, h, false);

        const aspect = w / h;
        camera.left = -aspect;
        camera.right = aspect;
        camera.top = 1;
        camera.bottom = -1;
        camera.updateProjectionMatrix();
      };

      resize();

      let resizeCleanup: (() => void) | null = null;
      if (typeof ResizeObserver !== "undefined") {
        const ro = new ResizeObserver(() => resize());
        ro.observe(container);
        resizeCleanup = () => ro.disconnect();
      } else {
        window.addEventListener("resize", resize);
        resizeCleanup = () => window.removeEventListener("resize", resize);
      }

      const clock = new THREE.Clock();

      const renderOnce = () => {
        renderer.render(scene, camera);
      };

      const loop = () => {
        if (disposed) return;
        const t = clock.getElapsedTime();

        pointer.x += (pointer.tx - pointer.x) * 0.04;
        pointer.y += (pointer.ty - pointer.y) * 0.04;

        const pos = geometry.getAttribute("position") as import("three").BufferAttribute;
        for (let i = 0; i < count; i++) {
          const o = i * 3;
          const px = base[o + 0];
          const py = base[o + 1];
          const pz = base[o + 2];
          const s = speed[i];
          const ph = phase[i];

          // Slow drift + very subtle pointer parallax.
          pos.array[o + 0] = px + Math.sin(t * s + ph) * 0.03 + pointer.x * 0.035;
          pos.array[o + 1] = py + Math.cos(t * s + ph) * 0.03 - pointer.y * 0.035;
          pos.array[o + 2] = pz;
        }
        pos.needsUpdate = true;

        renderer.render(scene, camera);
        requestAnimationFrame(loop);
      };

      if (reduceMotion) renderOnce();
      else requestAnimationFrame(loop);

      cleanup = () => {
        window.removeEventListener("pointermove", onPointerMove);
        resizeCleanup?.();
        renderer.dispose();
        geometry.dispose();
        material.dispose();
        texture.dispose();
        points.removeFromParent();
        renderer.domElement.remove();
      };
    };

    void setup();

    return () => {
      disposed = true;
      cleanup?.();
      cleanup = null;
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_20%,rgba(255,255,255,0.06),transparent_70%)]" />
      <div ref={containerRef} className="absolute inset-0" />
    </div>
  );
}

