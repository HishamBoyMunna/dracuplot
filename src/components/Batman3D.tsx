import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { WeaknessId } from '../types/plan';
import { WEAKNESSES } from '../data/weaknesses';

interface Batman3DProps {
  selectedWeakness: WeaknessId;
  onHoverWeakness: (id: WeaknessId | null) => void;
  onSelectWeakness: (id: WeaknessId) => void;
}

const HIGHLIGHT = new THREE.Color('#e01b36');
const REDUCED_MOTION =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function makeSuitMaterial(color = 0x1b1c24, metalness = 0.7, roughness = 0.35) {
  return new THREE.MeshStandardMaterial({
    color,
    metalness,
    roughness,
    emissive: new THREE.Color('#050507'),
    emissiveIntensity: 0.7,
  });
}

function makeBatEmblemGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0.18);
  shape.bezierCurveTo(0.06, 0.22, 0.1, 0.23, 0.15, 0.22);
  shape.lineTo(0.11, 0.11);
  shape.lineTo(0.31, 0.2);
  shape.lineTo(0.26, 0.06);
  shape.lineTo(0.45, 0.14);
  shape.lineTo(0.38, -0.02);
  shape.lineTo(0.53, 0.03);
  shape.lineTo(0.18, -0.14);
  shape.lineTo(0.12, -0.06);
  shape.lineTo(0.06, -0.18);
  shape.lineTo(0, -0.1);
  shape.lineTo(-0.06, -0.18);
  shape.lineTo(-0.12, -0.06);
  shape.lineTo(-0.18, -0.14);
  shape.lineTo(-0.53, 0.03);
  shape.lineTo(-0.38, -0.02);
  shape.lineTo(-0.45, 0.14);
  shape.lineTo(-0.26, 0.06);
  shape.lineTo(-0.31, 0.2);
  shape.lineTo(-0.11, 0.11);
  shape.lineTo(-0.15, 0.22);
  shape.bezierCurveTo(-0.1, 0.23, -0.06, 0.22, 0, 0.18);

  return new THREE.ExtrudeGeometry(shape, {
    depth: 0.06,
    bevelEnabled: true,
    bevelSegments: 1,
    bevelSize: 0.012,
    bevelThickness: 0.012,
  });
}

function addPartMesh(
  parent: THREE.Object3D,
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  partId: WeaknessId,
  position: [number, number, number],
  rotation: [number, number, number] = [0, 0, 0],
  scale: [number, number, number] = [1, 1, 1],
  materials: Map<WeaknessId, THREE.MeshStandardMaterial[]>,
) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  mesh.scale.set(...scale);
  mesh.userData.partId = partId;
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  parent.add(mesh);

  if (material instanceof THREE.MeshStandardMaterial) {
    const own = material.clone();
    mesh.material = own;
    const baseEmissive = material.emissive.clone();
    const baseIntensity = material.emissiveIntensity;
    own.userData.baseEmissive = baseEmissive;
    own.userData.baseIntensity = baseIntensity;
    const bucket = materials.get(partId) ?? [];
    bucket.push(own);
    materials.set(partId, bucket);
  }
  return mesh;
}

function addCape(
  parent: THREE.Object3D,
  materials: Map<WeaknessId, THREE.MeshStandardMaterial[]>,
) {
  const geometry = new THREE.PlaneGeometry(1, 1, 28, 28);
  const position = geometry.attributes.position;
  const vector = new THREE.Vector3();

  for (let index = 0; index < position.count; index += 1) {
    vector.fromBufferAttribute(position, index);
    const u = vector.x * 2;
    const t = vector.y + 0.5;
    const width = 0.75 + (1 - t) * 1.35;
    const newX = u * width;
    const newY = t * 4.35 - 0.02;
    const fold = Math.sin(u * Math.PI * 2.2 + t * 3.4) * (0.1 + (1 - t) * 0.16);
    const newZ = -0.48 - (1 - t) * 0.55 + fold;
    position.setXYZ(index, newX, newY, newZ);
  }
  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    color: 0x09090d,
    emissive: new THREE.Color('#060608'),
    emissiveIntensity: 0.5,
    metalness: 0.55,
    roughness: 0.62,
    side: THREE.DoubleSide,
  });
  const cape = addPartMesh(
    parent,
    geometry,
    material,
    'cape',
    [0, 0, -0.18],
    [0, 0, 0],
    [1, 1, 1],
    materials,
  );
  cape.renderOrder = -1;

  const claspMaterial = makeSuitMaterial(0x2b2c33, 0.92, 0.24);
  addPartMesh(
    parent,
    new THREE.TorusGeometry(0.54, 0.045, 8, 32, Math.PI),
    claspMaterial,
    'cape',
    [0, 3.05, -0.3],
    [0, 0, Math.PI],
    [1.45, 1.12, 1],
    materials,
  );
}

function buildBatman(materials: Map<WeaknessId, THREE.MeshStandardMaterial[]>) {
  const figure = new THREE.Group();
  const suit = makeSuitMaterial();
  const armor = makeSuitMaterial(0x2a2c37, 0.86, 0.27);
  const darkLeather = makeSuitMaterial(0x101015, 0.48, 0.52);
  const gold = new THREE.MeshStandardMaterial({
    color: 0xb08b44,
    metalness: 0.9,
    roughness: 0.28,
    emissive: new THREE.Color('#3b2b10'),
    emissiveIntensity: 0.35,
  });

  addCape(figure, materials);

  /* Legs and boots */
  for (const side of [-1, 1]) {
    addPartMesh(
      figure,
      new THREE.CapsuleGeometry(0.3, 0.62, 8, 14),
      suit,
      'knees',
      [side * 0.35, 1.42, 0],
      [0, 0, side * 0.03],
      [1, 1, 1],
      materials,
    );
    addPartMesh(
      figure,
      new THREE.BoxGeometry(0.44, 0.22, 0.54),
      armor,
      'knees',
      [side * 0.35, 1.08, 0.12],
      [0.06, 0, 0],
      [1, 1, 1],
      materials,
    );
    addPartMesh(
      figure,
      new THREE.CapsuleGeometry(0.24, 0.62, 8, 12),
      suit,
      'knees',
      [side * 0.35, 0.63, 0],
      [0, 0, side * 0.015],
      [1, 1, 1],
      materials,
    );
    addPartMesh(
      figure,
      new THREE.BoxGeometry(0.48, 0.34, 0.7),
      darkLeather,
      'knees',
      [side * 0.35, 0.2, 0.08],
      [0, 0, 0],
      [1, 1, 1],
      materials,
    );
    addPartMesh(
      figure,
      new THREE.BoxGeometry(0.48, 0.06, 0.7),
      armor,
      'knees',
      [side * 0.35, 0.38, 0.08],
      [0, 0, 0],
      [1, 1, 1],
      materials,
    );
  }

  /* Pelvis and torso */
  addPartMesh(
    figure,
    new THREE.SphereGeometry(0.63, 28, 18),
    suit,
    'belt',
    [0, 2.02, 0],
    [0, 0, 0],
    [1.15, 0.65, 0.82],
    materials,
  );

  addPartMesh(
    figure,
    new THREE.SphereGeometry(0.84, 32, 24),
    suit,
    'chest',
    [0, 2.92, 0],
    [0, 0, 0],
    [1.08, 0.98, 0.59],
    materials,
  );
  addPartMesh(
    figure,
    new THREE.SphereGeometry(0.5, 24, 16),
    suit,
    'chest',
    [0, 3.48, -0.03],
    [0, 0, 0],
    [1.5, 0.55, 0.74],
    materials,
  );
  for (const side of [-1, 1]) {
    addPartMesh(
      figure,
      new THREE.SphereGeometry(0.37, 20, 14),
      armor,
      'chest',
      [side * 0.34, 3.18, 0.33],
      [0, 0, side * 0.16],
      [1.08, 0.72, 0.62],
      materials,
    );
    addPartMesh(
      figure,
      new THREE.SphereGeometry(0.45, 20, 16),
      armor,
      'chest',
      [side * 0.9, 3.32, -0.02],
      [0, 0, side * 0.25],
      [1.04, 0.95, 0.92],
      materials,
    );
  }

  addPartMesh(
    figure,
    new THREE.SphereGeometry(0.55, 24, 16),
    suit,
    'chest',
    [0, 2.4, 0.02],
    [0, 0, 0],
    [0.86, 0.6, 0.64],
    materials,
  );

  /* Utility belt */
  addPartMesh(
    figure,
    new THREE.CylinderGeometry(0.7, 0.68, 0.24, 24),
    gold,
    'belt',
    [0, 2.05, 0],
    [0, 0, 0],
    [1, 1, 0.9],
    materials,
  );
  for (let index = -2; index <= 2; index += 1) {
    addPartMesh(
      figure,
      new THREE.BoxGeometry(0.19, 0.3, 0.17),
      gold,
      'belt',
      [index * 0.24, 2.03, 0.61 - Math.abs(index) * 0.07],
      [0, 0, 0],
      [1, 1, 1],
      materials,
    );
  }
  addPartMesh(
    figure,
    new THREE.BoxGeometry(0.3, 0.26, 0.14),
    armor,
    'belt',
    [0, 2.06, 0.68],
    [0, 0, 0],
    [1, 1, 1],
    materials,
  );
  addPartMesh(
    figure,
    new THREE.BoxGeometry(0.12, 0.08, 0.03),
    gold,
    'belt',
    [0, 2.07, 0.76],
    [0, 0, 0],
    [1, 1, 1],
    materials,
  );

  /* Arms and gauntlets */
  for (const side of [-1, 1]) {
    addPartMesh(
      figure,
      new THREE.CapsuleGeometry(0.25, 0.66, 8, 14),
      suit,
      'gauntlets',
      [side * 0.98, 2.83, 0],
      [0, 0, side * 0.12],
      [1, 1, 1],
      materials,
    );
    addPartMesh(
      figure,
      new THREE.CapsuleGeometry(0.2, 0.56, 8, 14),
      suit,
      'gauntlets',
      [side * 1.08, 2.12, 0.04],
      [0, 0, side * 0.06],
      [1, 1, 1],
      materials,
    );
    addPartMesh(
      figure,
      new THREE.CylinderGeometry(0.24, 0.2, 0.52, 10),
      armor,
      'gauntlets',
      [side * 1.08, 2.13, 0.04],
      [0, 0, side * 0.06],
      [1, 1, 1],
      materials,
    );
    addPartMesh(
      figure,
      new THREE.SphereGeometry(0.18, 16, 12),
      darkLeather,
      'gauntlets',
      [side * 1.11, 1.74, 0.08],
      [0, 0, 0],
      [1, 1.18, 0.84],
      materials,
    );

    for (let fin = 0; fin < 3; fin += 1) {
      const finMesh = new THREE.BoxGeometry(0.035, 0.22 - fin * 0.03, 0.24);
      addPartMesh(
        figure,
        finMesh,
        armor,
        'gauntlets',
        [side * (1.28 + fin * 0.02), 2.27 - fin * 0.13, 0.02],
        [0, 0, side * -0.2],
        [1, 1, 1],
        materials,
      );
    }
  }

  /* Chest emblem */
  const emblemGeometry = makeBatEmblemGeometry();
  addPartMesh(
    figure,
    emblemGeometry,
    new THREE.MeshStandardMaterial({
      color: 0x050507,
      metalness: 0.62,
      roughness: 0.34,
      emissive: new THREE.Color('#25040a'),
      emissiveIntensity: 0.5,
    }),
    'chest',
    [0, 3.16, 0.51],
    [0, 0, 0],
    [1.24, 1.24, 1],
    materials,
  );

  /* Neck and head */
  addPartMesh(
    figure,
    new THREE.CylinderGeometry(0.22, 0.27, 0.38, 14),
    suit,
    'cowl',
    [0, 3.83, 0],
    [0, 0, 0],
    [1, 1, 1],
    materials,
  );
  addPartMesh(
    figure,
    new THREE.SphereGeometry(0.53, 32, 24),
    armor,
    'cowl',
    [0, 4.26, 0],
    [0, 0, 0],
    [0.9, 1.08, 0.92],
    materials,
  );
  addPartMesh(
    figure,
    new THREE.SphereGeometry(0.36, 20, 16),
    new THREE.MeshStandardMaterial({
      color: 0x8d6a57,
      roughness: 0.72,
      metalness: 0.02,
      emissive: new THREE.Color('#120805'),
      emissiveIntensity: 0.2,
    }),
    'jaw',
    [0, 4.03, 0.31],
    [0.08, 0, 0],
    [0.95, 0.68, 0.58],
    materials,
  );
  addPartMesh(
    figure,
    new THREE.BoxGeometry(0.21, 0.025, 0.02),
    new THREE.MeshBasicMaterial({ color: 0x2b1a15 }),
    'jaw',
    [0, 3.96, 0.48],
    [0, 0, 0],
    [1, 1, 1],
    materials,
  );

  for (const side of [-1, 1]) {
    addPartMesh(
      figure,
      new THREE.ConeGeometry(0.14, 0.56, 4),
      armor,
      'cowl',
      [side * 0.34, 4.86, -0.05],
      [0.05, 0, side * -0.13],
      [1, 1, 1],
      materials,
    );
    addPartMesh(
      figure,
      new THREE.BoxGeometry(0.2, 0.038, 0.025),
      new THREE.MeshBasicMaterial({ color: 0xe8f5ff }),
      'cowl',
      [side * 0.18, 4.33, 0.49],
      [0, 0, side * -0.14],
      [1, 1, 1],
      materials,
    );
    addPartMesh(
      figure,
      new THREE.BoxGeometry(0.24, 0.07, 0.04),
      armor,
      'cowl',
      [side * 0.18, 4.38, 0.47],
      [0, 0, side * -0.14],
      [1, 1, 1],
      materials,
    );
  }

  return figure;
}

export default function Batman3D({
  selectedWeakness,
  onHoverWeakness,
  onSelectWeakness,
}: Batman3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef(selectedWeakness);
  const hoverRef = useRef<WeaknessId | null>(null);
  const onHoverRef = useRef(onHoverWeakness);
  const onSelectRef = useRef(onSelectWeakness);
  const [hovered, setHovered] = useState<WeaknessId | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    selectedRef.current = selectedWeakness;
  }, [selectedWeakness]);

  useEffect(() => {
    onHoverRef.current = onHoverWeakness;
    onSelectRef.current = onSelectWeakness;
  }, [onHoverWeakness, onSelectWeakness]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    let disposed = false;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      queueMicrotask(() => {
        if (!disposed) setFailed(true);
      });
      return () => {
        disposed = true;
      };
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.22;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.className = 'batman-canvas';
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 100);
    camera.position.set(0, 3.3, 10.7);
    camera.lookAt(0, 2.65, 0);

    scene.add(new THREE.HemisphereLight(0xa8b5d9, 0x060608, 1.35));

    const keyLight = new THREE.DirectionalLight(0xc7d8ff, 3.7);
    keyLight.position.set(-3.5, 6.5, 5.5);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0xe01b36, 38, 16, 1.8);
    rimLight.position.set(-4.3, 3.5, -3.4);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(0x6c85b7, 22, 15, 2);
    fillLight.position.set(4.6, 3.2, 2.8);
    scene.add(fillLight);

    const topSpot = new THREE.SpotLight(0xfff3ea, 70, 18, Math.PI / 5, 0.68, 1.6);
    topSpot.position.set(0.4, 9.5, 3.2);
    topSpot.target.position.set(0, 2.3, 0);
    scene.add(topSpot, topSpot.target);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(3.25, 72),
      new THREE.MeshStandardMaterial({
        color: 0x08080b,
        metalness: 0.78,
        roughness: 0.28,
      }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.08;
    scene.add(floor);

    const platformRing = new THREE.Mesh(
      new THREE.RingGeometry(2.42, 2.46, 96),
      new THREE.MeshBasicMaterial({ color: 0xe01b36, transparent: true, opacity: 0.7, side: THREE.DoubleSide }),
    );
    platformRing.rotation.x = -Math.PI / 2;
    platformRing.position.y = -0.06;
    scene.add(platformRing);

    const outerRing = new THREE.Mesh(
      new THREE.RingGeometry(3.03, 3.05, 96),
      new THREE.MeshBasicMaterial({ color: 0x596071, transparent: true, opacity: 0.22, side: THREE.DoubleSide }),
    );
    outerRing.rotation.x = -Math.PI / 2;
    outerRing.position.y = -0.06;
    scene.add(outerRing);

    const grid = new THREE.GridHelper(14, 28, 0x1e1f27, 0x111117);
    grid.position.y = -0.075;
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.33;
    scene.add(grid);

    const partMaterials = new Map<WeaknessId, THREE.MeshStandardMaterial[]>();
    const figure = buildBatman(partMaterials);
    figure.rotation.y = -0.19;
    scene.add(figure);

    const batSignal = new THREE.Mesh(
      new THREE.RingGeometry(0.47, 0.5, 40),
      new THREE.MeshBasicMaterial({ color: 0xe01b36, transparent: true, opacity: 0.42, side: THREE.DoubleSide }),
    );
    batSignal.rotation.x = -Math.PI / 2;
    batSignal.position.y = 0.002;
    scene.add(batSignal);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const timer = new THREE.Timer();
    timer.connect(document);
    let animation = 0;
    let hoveredInside: WeaknessId | null = null;
    let appliedFocus: WeaknessId | null = null;
    let dragging = false;
    let pointerDown = false;
    let moved = false;
    let lastX = 0;
    let lastY = 0;
    let downX = 0;
    let downY = 0;

    const updateHighlight = (focus: WeaknessId | null) => {
      if (appliedFocus === focus) return;
      appliedFocus = focus;
      partMaterials.forEach((materials, id) => {
        const active = id === focus;
        materials.forEach((material) => {
          const base = material.userData.baseEmissive as THREE.Color;
          const baseIntensity = material.userData.baseIntensity as number;
          if (active) {
            material.emissive.copy(HIGHLIGHT);
            material.emissiveIntensity = 1.55;
          } else {
            material.emissive.copy(base);
            material.emissiveIntensity = baseIntensity;
          }
        });
      });
    };

    const pick = (clientX: number, clientY: number): WeaknessId | null => {
      const rect = renderer.domElement.getBoundingClientRect();
      if (!rect.width || !rect.height) return null;
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObject(figure, true);
      const hit = hits.find((entry) => typeof entry.object.userData.partId === 'string');
      return (hit?.object.userData.partId as WeaknessId | undefined) ?? null;
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (pointerDown) {
        const dx = event.clientX - lastX;
        const dy = event.clientY - lastY;
        if (Math.abs(event.clientX - downX) + Math.abs(event.clientY - downY) > 3) {
          moved = true;
          dragging = true;
        }
        if (dragging) {
          figure.rotation.y += dx * 0.012;
          figure.rotation.x = THREE.MathUtils.clamp(figure.rotation.x + dy * 0.003, -0.08, 0.08);
          renderer.domElement.style.cursor = 'grabbing';
        }
        lastX = event.clientX;
        lastY = event.clientY;
        return;
      }

      const id = pick(event.clientX, event.clientY);
      renderer.domElement.style.cursor = id ? 'pointer' : 'grab';
      if (id !== hoveredInside) {
        hoveredInside = id;
        hoverRef.current = id;
        setHovered(id);
        onHoverRef.current(id);
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      pointerDown = true;
      moved = false;
      dragging = false;
      lastX = event.clientX;
      lastY = event.clientY;
      downX = event.clientX;
      downY = event.clientY;
      renderer.domElement.setPointerCapture?.(event.pointerId);
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (!moved) {
        const id = pick(event.clientX, event.clientY);
        if (id) {
          selectedRef.current = id;
          onSelectRef.current(id);
        }
      }
      pointerDown = false;
      dragging = false;
    };

    const handlePointerLeave = () => {
      pointerDown = false;
      dragging = false;
      hoveredInside = null;
      hoverRef.current = null;
      setHovered(null);
      onHoverRef.current(null);
    };

    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);
    renderer.domElement.addEventListener('pointerleave', handlePointerLeave);

    const resize = () => {
      const rect = mount.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      renderer.setSize(rect.width, rect.height, false);
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();

    const animate = (timestamp: number) => {
      animation = requestAnimationFrame(animate);
      timer.update(timestamp);
      const elapsed = timer.getElapsed();
      const focus = hoverRef.current ?? selectedRef.current;
      updateHighlight(focus);

      if (!dragging && !REDUCED_MOTION && !hoveredInside) {
        figure.rotation.y += 0.0019;
      }
      figure.position.y = Math.sin(elapsed * 0.85) * 0.012;

      const pulse = 1 + Math.sin(elapsed * 2.1) * 0.045;
      batSignal.scale.setScalar(pulse);
      (platformRing.material as THREE.MeshBasicMaterial).opacity =
        0.54 + Math.sin(elapsed * 1.6) * 0.16;
      rimLight.intensity = 34 + Math.sin(elapsed * 1.1) * 7;

      renderer.render(scene, camera);
    };
    animation = requestAnimationFrame(animate);

    return () => {
      disposed = true;
      cancelAnimationFrame(animation);
      timer.dispose();
      observer.disconnect();
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);
      renderer.domElement.removeEventListener('pointerleave', handlePointerLeave);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  const hoveredWeakness = hovered ? WEAKNESSES.find((weakness) => weakness.id === hovered) : null;

  return (
    <div className="batman-stage relative h-full min-h-[510px] w-full overflow-hidden border border-white/10 bg-[#09090c] sm:min-h-[620px]">
      <div ref={mountRef} className="absolute inset-0" aria-label="Interactive 3D Batman model. Hover or tap a body part to inspect its weakness." />
      <div className="stage-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,transparent_25%,rgba(5,5,7,0.7)_100%)]" aria-hidden="true" />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between p-5 sm:p-6">
        <div>
          <p className="font-mono text-[8px] tracking-[0.3em] text-blood-glow">TARGET / LIVE MODEL</p>
          <p className="mt-2 font-display text-lg tracking-[0.12em] text-bone">BRUCE WAYNE // MK. III</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-[8px] tracking-[0.24em] text-bone-faint">BIOMETRIC MATCH</p>
          <p className="mt-1 font-mono text-[10px] tracking-[0.15em] text-bone">99.7%</p>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-4 p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping bg-blood opacity-60" />
            <span className="relative inline-flex size-1.5 bg-blood" />
          </span>
          <p className="font-mono text-[8px] tracking-[0.24em] text-bone-dim">SCAN ACTIVE</p>
        </div>
        <p className="font-mono text-[8px] tracking-[0.18em] text-bone-faint">
          DRAG TO ROTATE · HOVER TO ISOLATE
        </p>
      </div>

      {hoveredWeakness && (
        <div className="pointer-events-none absolute left-5 top-24 z-20 max-w-[210px] border border-blood/40 bg-[#0a080b]/95 p-3 shadow-[0_0_40px_rgba(224,27,54,0.16)] sm:left-6">
          <p className="font-mono text-[8px] tracking-[0.26em] text-blood-glow">FAULT ISOLATED</p>
          <p className="mt-2 font-display text-xl tracking-[0.05em] text-bone">
            {hoveredWeakness.label.toUpperCase()}
          </p>
          <p className="mt-1 text-[11px] leading-5 text-bone-dim">{hoveredWeakness.bodyPart}</p>
          <div className="mt-3 flex items-center gap-1">
            {Array.from({ length: 10 }).map((_, index) => (
              <span
                key={index}
                className={`h-1 flex-1 ${index < hoveredWeakness.severity ? 'bg-blood' : 'bg-white/10'}`}
              />
            ))}
          </div>
        </div>
      )}

      {failed && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#09090c]/95 p-8 text-center">
          <div>
            <p className="font-display text-2xl text-bone">THE SCANNER IS BLIND.</p>
            <p className="mt-3 max-w-xs text-sm leading-6 text-bone-dim">
              WebGL is unavailable in this browser. The fault-line dossier still works — use the
              list beside the model.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
