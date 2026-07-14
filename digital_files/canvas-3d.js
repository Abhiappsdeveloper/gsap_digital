/**
 * 3D Canvas Animation - Ukonnect Staffing
 * Renders animated 3D shapes (sphere, pyramid, cone) with glowing cyan effects
 * Canvas ID: canvas-3d-shapes
 */

(function initCanvas3D() {
  // Get canvas element
  const canvas = document.getElementById('canvas-3d-shapes');
  if (!canvas) {
    console.warn('Canvas element not found');
    return;
  }

  // Check if Three.js is loaded
  if (typeof THREE === 'undefined') {
    console.warn('Three.js not loaded yet');
    return;
  }

  // Scene, Camera, Renderer
  const scene = new THREE.Scene();
  scene.background = null; // Transparent background
  scene.fog = new THREE.Fog(0x000000, 10, 50);

  const camera = new THREE.PerspectiveCamera(
    75,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });

  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio || 1);

  // Materials with glowing effect
  const glowMaterial = new THREE.MeshStandardMaterial({
    color: 0x00ffff, // Cyan
    emissive: 0x00ffff,
    emissiveIntensity: 0.8,
    metalness: 0.8,
    roughness: 0.2
  });

  const magentaMaterial = new THREE.MeshStandardMaterial({
    color: 0xff00ff, // Magenta
    emissive: 0xff00ff,
    emissiveIntensity: 0.8,
    metalness: 0.8,
    roughness: 0.2
  });

  // Create 3D Shapes
  // Sphere
  const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
  const sphere = new THREE.Mesh(sphereGeometry, glowMaterial);
  sphere.position.x = -3;
  sphere.position.y = 0;
  sphere.scale.set(1.2, 1.2, 1.2);
  scene.add(sphere);

  // Pyramid (using cone with scale)
  const pyramidGeometry = new THREE.ConeGeometry(1, 2.5, 4);
  const pyramid = new THREE.Mesh(pyramidGeometry, magentaMaterial);
  pyramid.position.x = 0;
  pyramid.position.y = 0;
  pyramid.rotation.z = Math.PI * 0.25;
  scene.add(pyramid);

  // Cone
  const coneGeometry = new THREE.ConeGeometry(1, 2.5, 32);
  const cone = new THREE.Mesh(coneGeometry, glowMaterial);
  cone.position.x = 3;
  cone.position.y = 0;
  scene.add(cone);

  // Lighting
  // Add point lights for glow effect
  const lightCyan = new THREE.PointLight(0x00ffff, 1.5, 100);
  lightCyan.position.set(-3, 2, 5);
  scene.add(lightCyan);

  const lightMagenta = new THREE.PointLight(0xff00ff, 1.5, 100);
  lightMagenta.position.set(3, 2, 5);
  scene.add(lightMagenta);

  // Ambient light for overall illumination
  const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
  scene.add(ambientLight);

  // Handle window resize
  function onWindowResize() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
  window.addEventListener('resize', onWindowResize);

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);

    // Rotate shapes
    sphere.rotation.x += 0.003;
    sphere.rotation.y += 0.005;

    pyramid.rotation.x += 0.002;
    pyramid.rotation.y += 0.003;
    pyramid.rotation.z += 0.004;

    cone.rotation.x += 0.003;
    cone.rotation.y += 0.005;

    // Gentle floating animation
    sphere.position.y += Math.sin(Date.now() * 0.0005) * 0.002;
    pyramid.position.y += Math.sin(Date.now() * 0.0003) * 0.002;
    cone.position.y += Math.sin(Date.now() * 0.0007) * 0.002;

    // Pulsating scale
    const pulse = 1 + Math.sin(Date.now() * 0.002) * 0.05;
    sphere.scale.set(pulse * 1.2, pulse * 1.2, pulse * 1.2);
    cone.scale.set(pulse, pulse, pulse);

    renderer.render(scene, camera);
  }

  // Start animation
  animate();

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    renderer.dispose();
    sphereGeometry.dispose();
    pyramidGeometry.dispose();
    coneGeometry.dispose();
    glowMaterial.dispose();
    magentaMaterial.dispose();
  });

  console.log('✅ 3D Canvas initialized successfully');
})();
