import * as THREE from './three.module.min.js';

(function () {
  const mount = document.getElementById('extra-3d-objects');
  if (!mount || mount.dataset.booted) return;
  mount.dataset.booted = '1';

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, precision: 'highp' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.physicallyCorrectLights = true;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 12);

  scene.add(new THREE.AmbientLight(0x1a3d5d, 0.5));
  const key = new THREE.DirectionalLight(0xffffff, 1.2);
  key.position.set(5, 6, 8);
  key.castShadow = true;
  key.shadow.camera.left = -20;
  key.shadow.camera.right = 20;
  key.shadow.camera.top = 20;
  key.shadow.camera.bottom = -20;
  key.shadow.mapSize.width = 2048;
  key.shadow.mapSize.height = 2048;
  scene.add(key);
  const rim = new THREE.PointLight(0x3fd9ff, 2.5, 35);
  rim.position.set(-4, 2, 4);
  rim.castShadow = true;
  scene.add(rim);
  const rimBack = new THREE.PointLight(0x00e5ff, 2.2, 30);
  rimBack.position.set(4, -2, -6);
  rimBack.castShadow = true;
  scene.add(rimBack);
  const fillLight = new THREE.PointLight(0x0099dd, 1.2, 25);
  fillLight.position.set(-8, 0, 4);
  scene.add(fillLight);
  const topLight = new THREE.PointLight(0xffffff, 0.8, 20);
  topLight.position.set(0, 8, 0);
  scene.add(topLight);

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

  function createCrystalTexture(width = 512, height = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(15, 50, 80, 1)';
    ctx.fillRect(0, 0, width, height);

    // Voronoi-like crystal cells
    const cellCount = 40;
    const points = [];
    for (let i = 0; i < cellCount; i++) {
      points.push({
        x: Math.random() * width,
        y: Math.random() * height
      });
    }

    // Draw crystal facets
    ctx.strokeStyle = 'rgba(0, 200, 255, 0.6)';
    ctx.lineWidth = 2;
    for (let i = 0; i < points.length; i++) {
      const p1 = points[i];
      const p2 = points[(i + 1) % points.length];

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      // Inner crystal details
      const dx = (p2.x - p1.x) * 0.3;
      const dy = (p2.y - p1.y) * 0.3;
      ctx.strokeStyle = 'rgba(0, 150, 200, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(p1.x + dx, p1.y + dy);
      ctx.lineTo(p2.x - dx, p2.y - dy);
      ctx.stroke();
    }

    // Add subtle noise for depth
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 20;
      data[i] += noise;
      data[i + 1] += noise * 1.5;
      data[i + 2] += noise * 2;
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  function createNormalMap(width = 512, height = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#8080ff';
    ctx.fillRect(0, 0, width, height);

    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    // Perlin-like noise for crystal bumps
    for (let i = 0; i < data.length; i += 4) {
      const val = Math.random() * 100 + 128;
      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = 200 + Math.random() * 55;
      data[i + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);

    return new THREE.CanvasTexture(canvas);
  }

  function createFresnelShader() {
    return {
      uniforms: {
        color1: { value: new THREE.Color(0x0066cc) },
        color2: { value: new THREE.Color(0x00ffff) },
        fresnelBias: { value: 0.1 },
        fresnelScale: { value: 1.0 },
        fresnelPower: { value: 3.0 },
        time: { value: 0 }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec3 vViewPosition;

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          vViewPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color1;
        uniform vec3 color2;
        uniform float fresnelBias;
        uniform float fresnelScale;
        uniform float fresnelPower;
        uniform float time;

        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec3 vViewPosition;

        void main() {
          vec3 viewDir = normalize(-vViewPosition);
          float fresnel = fresnelBias + fresnelScale * pow(1.0 + dot(vNormal, viewDir), fresnelPower);

          vec3 glowColor = mix(color1, color2, fresnel);
          vec3 finalColor = glowColor * (0.8 + 0.2 * sin(time * 2.0));

          gl_FragColor = vec4(finalColor, 0.85 + fresnel * 0.15);
        }
      `
    };
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
      // Main grid
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
      // Fine grid
      ctx.strokeStyle = 'rgba(0, 150, 200, 0.2)';
      ctx.lineWidth = 0.5;
      const fineGridSize = 8;
      for (let i = 0; i <= width; i += fineGridSize) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      for (let i = 0; i <= height; i += fineGridSize) {
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
      // Add inner dots for detail
      ctx.fillStyle = 'rgba(0, 200, 255, 0.3)';
      for (let y = 0; y < height; y += hexSize * 1.5) {
        for (let x = 0; x < width; x += hexSize * 2) {
          const px = x + (y / (hexSize * 1.5)) % 2 * hexSize;
          const py = y;
          ctx.beginPath();
          ctx.arc(px, py, 3, 0, Math.PI * 2);
          ctx.fill();
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
      // Add secondary wave layer
      ctx.strokeStyle = 'rgba(0, 150, 200, 0.2)';
      for (let i = 0; i < width; i += 10) {
        ctx.beginPath();
        for (let y = 0; y < height; y += 2) {
          const wave = Math.cos((y + i) * 0.08) * 8;
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
  const sphereCrystal = createCrystalTexture(512, 512);
  const sphereNormal = createNormalMap(512, 512);
  const ribbedMat = new THREE.MeshStandardMaterial({
    color: 0x0055bb,
    metalness: 0.9,
    roughness: 0.1,
    emissive: 0x002255,
    emissiveIntensity: 0.4,
    map: sphereCrystal,
    normalMap: sphereNormal,
    normalScale: new THREE.Vector2(2.5, 2.5),
    metalnessMap: sphereCrystal,
    transparent: true,
    opacity: 0.95,
    side: THREE.FrontSide,
    envMapIntensity: 1.4,
    wireframe: false
  });
  ribbedMat.onBeforeCompile = (shader) => {
    shader.uniforms.time = { value: 0 };
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <output_fragment>',
      `
      vec3 viewDir = normalize(vViewPosition);
      float fresnel = pow(1.0 - abs(dot(vNormal, viewDir)), 2.8);
      vec3 glowEdge = mix(vec3(0.0), vec3(0.1, 0.7, 1.0), fresnel);

      gl_FragColor.rgb += glowEdge * 0.35;
      gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.0, 0.9, 1.0) * fresnel, 0.15);
      gl_FragColor.rgb += vec3(0.0, 0.2, 0.3) * 0.1;
      #include <output_fragment>
      `
    );
    ribbedMat.userData.shader = shader;
  };
  const ribbedMesh = new THREE.Mesh(ribbedGeo, ribbedMat);
  ribbedMesh.position.set(-4.6, 2.4, 0);
  ribbedMesh.rotation.set(0.3, 0.4, 0);
  ribbedMesh.castShadow = true;
  ribbedMesh.receiveShadow = true;
  scene.add(ribbedMesh);
  objects.push({ mesh: ribbedMesh, spin: new THREE.Vector3(0.04, 0.1, 0.01), shader: ribbedMat });

  // Solid object 2: faceted prism (teal)
  const prismGeo = new THREE.ConeGeometry(1, 1.9, 3);
  const prismCrystal = createCrystalTexture(512, 512);
  const prismNormal = createNormalMap(512, 512);
  const prismMat = new THREE.MeshStandardMaterial({
    color: 0x009a88,
    metalness: 0.88,
    roughness: 0.08,
    emissive: 0x004444,
    emissiveIntensity: 0.35,
    flatShading: true,
    map: prismCrystal,
    normalMap: prismNormal,
    normalScale: new THREE.Vector2(3, 3),
    metalnessMap: prismCrystal,
    transparent: true,
    opacity: 0.94,
    side: THREE.FrontSide,
    envMapIntensity: 1.5,
    wireframe: false
  });
  prismMat.onBeforeCompile = (shader) => {
    shader.uniforms.time = { value: 0 };
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <output_fragment>',
      `
      vec3 viewDir = normalize(vViewPosition);
      float fresnel = pow(1.0 - abs(dot(vNormal, viewDir)), 2.3);
      vec3 glowEdge = mix(vec3(0.0), vec3(0.0, 1.0, 0.9), fresnel);

      gl_FragColor.rgb += glowEdge * 0.4;
      gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.0, 1.0, 1.0) * fresnel, 0.2);
      gl_FragColor.rgb += vec3(0.0, 0.15, 0.2) * 0.08;
      #include <output_fragment>
      `
    );
    prismMat.userData.shader = shader;
  };
  const prismMesh = new THREE.Mesh(prismGeo, prismMat);
  prismMesh.position.set(-0.6, 1.2, 1);
  prismMesh.rotation.set(0, 0, Math.PI / 2.3);
  prismMesh.castShadow = true;
  prismMesh.receiveShadow = true;
  scene.add(prismMesh);
  objects.push({ mesh: prismMesh, spin: new THREE.Vector3(0.015, 0.08, 0.025), shader: prismMat });

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
  const shellCrystal = createCrystalTexture(512, 512);
  const shellNormal = createNormalMap(512, 512);
  const shellMat = new THREE.MeshStandardMaterial({
    color: 0x003355,
    metalness: 0.85,
    roughness: 0.12,
    side: THREE.DoubleSide,
    emissive: 0x001122,
    emissiveIntensity: 0.3,
    map: shellCrystal,
    normalMap: shellNormal,
    normalScale: new THREE.Vector2(2.8, 2.8),
    metalnessMap: shellCrystal,
    transparent: true,
    opacity: 0.93,
    envMapIntensity: 1.3,
    wireframe: false
  });
  shellMat.onBeforeCompile = (shader) => {
    shader.uniforms.time = { value: 0 };
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <output_fragment>',
      `
      vec3 viewDir = normalize(vViewPosition);
      float fresnel = pow(1.0 - abs(dot(vNormal, viewDir)), 2.6);
      vec3 glowEdge = mix(vec3(0.0), vec3(0.0, 0.95, 1.0), fresnel);

      gl_FragColor.rgb += glowEdge * 0.38;
      gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.0, 1.0, 1.0) * fresnel, 0.18);
      gl_FragColor.rgb += vec3(0.0, 0.1, 0.2) * 0.06;
      #include <output_fragment>
      `
    );
    shellMat.userData.shader = shader;
  };
  const shellMesh = new THREE.Mesh(shellGeo, shellMat);
  shellMesh.position.set(-3.4, -1.8, -1);
  shellMesh.rotation.set(0.2, 2.4, 0.3);
  shellMesh.castShadow = true;
  shellMesh.receiveShadow = true;
  scene.add(shellMesh);
  objects.push({ mesh: shellMesh, spin: new THREE.Vector3(0.025, -0.065, 0.015), shader: shellMat });


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
    const elapsed = clock.getElapsedTime();

    for (const o of objects) {
      o.mesh.rotation.x += o.spin.x * dt;
      o.mesh.rotation.y += o.spin.y * dt;
      o.mesh.rotation.z += o.spin.z * dt;

      if (o.shader && o.shader.userData && o.shader.userData.shader) {
        o.shader.userData.shader.uniforms.time.value = elapsed;
      }
    }
    renderer.render(scene, camera);
  }
  animate();
})();
