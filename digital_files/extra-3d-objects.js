import * as THREE from './three.module.min.js';

(function () {
  const mount = document.getElementById('extra-3d-objects');
  if (!mount || mount.dataset.booted) return;
  mount.dataset.booted = '1';

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 12);

  scene.add(new THREE.AmbientLight(0x224466, 0.6));
  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(5, 6, 8);
  scene.add(key);
  const rim = new THREE.PointLight(0x2fd8ff, 2.5, 20);
  rim.position.set(-4, 2, 4);
  scene.add(rim);

  function glowSprite(color, size) {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, color + 'ff');
    g.addColorStop(0.35, color + '88');
    g.addColorStop(1, color + '00');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    const tex = new THREE.CanvasTexture(c);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(size, size, 1);
    return sprite;
  }

  function createPatternTexture(width = 512, height = 512, patternType = 'grid') {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(20, 40, 60, 0.8)';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(0, 200, 255, 0.4)';
    ctx.lineWidth = 1;

    if (patternType === 'grid') {
      const gridSize = 32;
      for (let i = 0; i <= width; i += gridSize) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      for (let i = 0; i <= height; i += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }
    } else if (patternType === 'hexagon') {
      const hexSize = 24;
      for (let y = 0; y < height; y += hexSize * 1.5) {
        for (let x = 0; x < width; x += hexSize * 2) {
          drawHexagon(ctx, x + (y / (hexSize * 1.5)) % 2 * hexSize, y, hexSize);
        }
      }
    } else if (patternType === 'waves') {
      ctx.strokeStyle = 'rgba(0, 180, 255, 0.3)';
      for (let i = 0; i < width; i += 20) {
        ctx.beginPath();
        for (let y = 0; y < height; y += 2) {
          const wave = Math.sin((y + i) * 0.05) * 10;
          if (y === 0) ctx.moveTo(i + wave, y);
          else ctx.lineTo(i + wave, y);
        }
        ctx.stroke();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    return texture;
  }

  function drawHexagon(ctx, x, y, size) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * 60) * Math.PI / 180;
      const hx = x + size * Math.cos(angle);
      const hy = y + size * Math.sin(angle);
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.stroke();
  }

  const objects = [];

  // Solid object 1: ribbed twisted sphere (top-left, blue metallic)
  const ribbedGeo = new THREE.SphereGeometry(1.3, 64, 64);
  const ribbedPos = ribbedGeo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < ribbedPos.count; i++) {
    v.fromBufferAttribute(ribbedPos, i);
    const angle = Math.atan2(v.z, v.x);
    const ribble = Math.sin(angle * 10) * 0.08;
    const scale = 1 + ribble;
    v.multiplyScalar(scale);
    ribbedPos.setXYZ(i, v.x, v.y, v.z);
  }
  ribbedGeo.computeVertexNormals();
  const spherePattern = createPatternTexture(512, 512, 'hexagon');
  const ribbedMat = new THREE.MeshStandardMaterial({
    color: 0x2233bb,
    metalness: 0.9,
    roughness: 0.25,
    emissive: 0x0a1466,
    emissiveIntensity: 0.4,
    map: spherePattern,
    metalnessMap: spherePattern
  });
  const ribbedMesh = new THREE.Mesh(ribbedGeo, ribbedMat);
  ribbedMesh.position.set(-4.6, 2.4, 0);
  ribbedMesh.rotation.set(0.3, 0.4, 0);
  scene.add(ribbedMesh);
  objects.push({ mesh: ribbedMesh, spin: new THREE.Vector3(0.05, 0.12, 0) });

  // Solid object 2: faceted prism (teal)
  const prismGeo = new THREE.ConeGeometry(1, 1.9, 3);
  const prismPattern = createPatternTexture(512, 512, 'grid');
  const prismMat = new THREE.MeshStandardMaterial({
    color: 0x0e8f7d,
    metalness: 0.75,
    roughness: 0.3,
    emissive: 0x043c33,
    emissiveIntensity: 0.5,
    flatShading: true,
    map: prismPattern,
    metalnessMap: prismPattern
  });
  const prismMesh = new THREE.Mesh(prismGeo, prismMat);
  prismMesh.position.set(-0.6, 1.2, 1);
  prismMesh.rotation.set(0, 0, Math.PI / 2.3);
  scene.add(prismMesh);
  objects.push({ mesh: prismMesh, spin: new THREE.Vector3(0.02, 0.09, 0.03) });

  // Solid object 3: curved shell / cone wedge (dark steel blue)
  const shellGeo = new THREE.LatheGeometry(
    (function () {
      const pts = [];
      for (let i = 0; i <= 12; i++) {
        const t = i / 12;
        pts.push(new THREE.Vector2(0.05 + t * 1.3, (t - 1) * 1.6));
      }
      return pts;
    })(),
    24,
    0,
    Math.PI * 0.55
  );
  const shellPattern = createPatternTexture(512, 512, 'waves');
  const shellMat = new THREE.MeshStandardMaterial({
    color: 0x1c2b3a,
    metalness: 0.8,
    roughness: 0.35,
    side: THREE.DoubleSide,
    emissive: 0x08131c,
    emissiveIntensity: 0.5,
    map: shellPattern,
    metalnessMap: shellPattern
  });
  const shellMesh = new THREE.Mesh(shellGeo, shellMat);
  shellMesh.position.set(-3.4, -1.8, -1);
  shellMesh.rotation.set(0.2, 2.4, 0.3);
  scene.add(shellMesh);
  objects.push({ mesh: shellMesh, spin: new THREE.Vector3(0.03, -0.07, 0.02) });

  // Light producer: glowing neon square frame
  const squareGroup = new THREE.Group();
  const frameMat = new THREE.MeshBasicMaterial({ color: 0x37e6ff });
  const side = 2.6;
  const barLen = side;
  const barThickness = 0.08;
  [0, 1, 2, 3].forEach((i) => {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(barLen, barThickness, barThickness), frameMat);
    if (i < 2) {
      bar.position.set(0, i === 0 ? side / 2 : -side / 2, 0);
    } else {
      bar.rotation.z = Math.PI / 2;
      bar.position.set(i === 2 ? side / 2 : -side / 2, 0, 0);
    }
    squareGroup.add(bar);
  });
  squareGroup.position.set(1.6, 0.4, -2);
  scene.add(squareGroup);
  const squareLight = new THREE.PointLight(0x37e6ff, 3, 10);
  squareLight.position.copy(squareGroup.position);
  scene.add(squareLight);
  squareGroup.add(glowSprite('#37e6ff', 5.5));
  objects.push({ mesh: squareGroup, spin: new THREE.Vector3(0, 0.01, 0) });

  function resize() {
    const w = mount.clientWidth || 1;
    const h = mount.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const dt = clock.getDelta();
    for (const o of objects) {
      o.mesh.rotation.x += o.spin.x * dt;
      o.mesh.rotation.y += o.spin.y * dt;
      o.mesh.rotation.z += o.spin.z * dt;
    }
    renderer.render(scene, camera);
  }
  animate();
})();
