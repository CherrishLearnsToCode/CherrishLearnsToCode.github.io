/* ═══════════════════════════════════════════
   Rose Day - Three.js Scene
   3D falling petals, glowing particles, rose bloom
   ═══════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── Globals ───
  const canvas = document.getElementById('rose-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x0a0008, 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0008, 0.015);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 0, 30);

  // ─── Lighting ───
  const ambientLight = new THREE.AmbientLight(0xff6b8a, 0.3);
  scene.add(ambientLight);

  const pointLight1 = new THREE.PointLight(0xff2d55, 1.5, 60);
  pointLight1.position.set(10, 15, 20);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0xff8fa3, 1, 50);
  pointLight2.position.set(-10, -5, 15);
  scene.add(pointLight2);

  const pointLight3 = new THREE.PointLight(0xffb3c1, 0.8, 40);
  pointLight3.position.set(0, 10, -10);
  scene.add(pointLight3);

  // ─── Petal Geometry ───
  function createPetalGeometry() {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.4, 0.6, 0.8, 1.2, 0, 2);
    shape.bezierCurveTo(-0.8, 1.2, -0.4, 0.6, 0, 0);

    const geometry = new THREE.ShapeGeometry(shape, 12);
    // Bend the petal slightly
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const y = positions.getY(i);
      const curl = Math.sin(y * 0.8) * 0.3;
      positions.setZ(i, curl);
    }
    geometry.computeVertexNormals();
    return geometry;
  }

  // ─── Rose Materials ───
  const petalMaterials = [
    new THREE.MeshPhongMaterial({
      color: 0xff2d55,
      emissive: 0x440011,
      shininess: 60,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.92,
    }),
    new THREE.MeshPhongMaterial({
      color: 0xff6b8a,
      emissive: 0x330015,
      shininess: 50,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.88,
    }),
    new THREE.MeshPhongMaterial({
      color: 0xcc2244,
      emissive: 0x550018,
      shininess: 70,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    }),
    new THREE.MeshPhongMaterial({
      color: 0xff8fa3,
      emissive: 0x3a0012,
      shininess: 55,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    }),
  ];

  // ─── 3D Rose Builder ───
  function createRose(scale = 1) {
    const roseGroup = new THREE.Group();
    const petalGeo = createPetalGeometry();
    const layers = 5;
    const petalsPerLayer = [5, 7, 9, 11, 13];

    for (let layer = 0; layer < layers; layer++) {
      const count = petalsPerLayer[layer];
      const radius = (layer * 0.35 + 0.2) * scale;
      const tilt = 0.3 + layer * 0.18;
      const layerScale = (0.5 + layer * 0.15) * scale;

      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + layer * 0.3;
        const mat = petalMaterials[Math.floor(Math.random() * petalMaterials.length)].clone();
        const petal = new THREE.Mesh(petalGeo, mat);

        petal.position.set(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          layer * 0.15 * scale
        );
        petal.rotation.set(
          tilt + Math.random() * 0.15,
          0,
          angle + Math.PI / 2
        );
        petal.scale.setScalar(layerScale * (0.85 + Math.random() * 0.3));
        roseGroup.add(petal);
      }
    }

    // Center bud
    const budGeo = new THREE.SphereGeometry(0.25 * scale, 16, 16);
    const budMat = new THREE.MeshPhongMaterial({
      color: 0xcc1133,
      emissive: 0x660022,
      shininess: 80,
    });
    const bud = new THREE.Mesh(budGeo, budMat);
    bud.position.z = -0.1 * scale;
    roseGroup.add(bud);

    return roseGroup;
  }

  // ─── Create Main Rose ───
  const mainRose = createRose(1.8);
  mainRose.position.set(0, 0, 0);
  scene.add(mainRose);

  // ─── Falling Petals System ───
  const fallingPetals = [];
  const petalGeo = createPetalGeometry();

  function spawnFallingPetal() {
    const mat = petalMaterials[Math.floor(Math.random() * petalMaterials.length)].clone();
    mat.opacity = 0.7 + Math.random() * 0.3;
    const petal = new THREE.Mesh(petalGeo, mat);

    const spread = 40;
    petal.position.set(
      (Math.random() - 0.5) * spread,
      20 + Math.random() * 15,
      (Math.random() - 0.5) * 20
    );

    const s = 0.4 + Math.random() * 0.6;
    petal.scale.setScalar(s);
    petal.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );

    scene.add(petal);
    fallingPetals.push({
      mesh: petal,
      velocity: {
        x: (Math.random() - 0.5) * 0.02,
        y: -(0.02 + Math.random() * 0.03),
        z: (Math.random() - 0.5) * 0.01,
      },
      rotSpeed: {
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.015,
      },
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.01 + Math.random() * 0.02,
      wobbleAmp: 0.3 + Math.random() * 0.5,
    });
  }

  // Pre-populate some petals
  for (let i = 0; i < 60; i++) {
    spawnFallingPetal();
    // Spread them out vertically so they don't all start at top
    const p = fallingPetals[fallingPetals.length - 1];
    p.mesh.position.y = (Math.random() - 0.3) * 40;
  }

  // ─── Particle Sparkle System ───
  const particleCount = 300;
  const particleGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  const particleSpeeds = [];

  for (let i = 0; i < particleCount; i++) {
    particlePositions[i * 3] = (Math.random() - 0.5) * 60;
    particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 60;
    particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 40;
    particleSpeeds.push({
      x: (Math.random() - 0.5) * 0.005,
      y: (Math.random() - 0.5) * 0.005,
      z: (Math.random() - 0.5) * 0.005,
      twinkle: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.02 + Math.random() * 0.04,
    });
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

  const particleMat = new THREE.PointsMaterial({
    color: 0xffb3c1,
    size: 0.15,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // ─── Floating Mini Roses ───
  const miniRoses = [];
  for (let i = 0; i < 6; i++) {
    const mini = createRose(0.5 + Math.random() * 0.4);
    mini.position.set(
      (Math.random() - 0.5) * 30,
      (Math.random() - 0.5) * 20,
      -5 - Math.random() * 10
    );
    scene.add(mini);
    miniRoses.push({
      mesh: mini,
      baseY: mini.position.y,
      floatOffset: Math.random() * Math.PI * 2,
      floatSpeed: 0.005 + Math.random() * 0.008,
      rotSpeed: 0.002 + Math.random() * 0.004,
    });
  }

  // ─── Heart Particle Burst (on transition) ───
  const heartBurstParticles = [];

  function createHeartBurst() {
    const count = 80;
    for (let i = 0; i < count; i++) {
      // Heart-shaped distribution
      const t = (i / count) * Math.PI * 2;
      const hx = 16 * Math.pow(Math.sin(t), 3) * 0.15;
      const hy = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * 0.15;

      const geo = new THREE.SphereGeometry(0.08 + Math.random() * 0.08, 6, 6);
      const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.95 + Math.random() * 0.05, 0.9, 0.5 + Math.random() * 0.2),
        transparent: true,
        opacity: 1,
      });
      const sphere = new THREE.Mesh(geo, mat);
      sphere.position.set(0, 0, 25);

      scene.add(sphere);
      heartBurstParticles.push({
        mesh: sphere,
        target: { x: hx, y: hy, z: 25 },
        velocity: {
          x: (Math.random() - 0.5) * 0.1,
          y: (Math.random() - 0.5) * 0.1,
          z: (Math.random() - 0.5) * 0.05,
        },
        life: 1,
        decay: 0.003 + Math.random() * 0.003,
        phase: 0, // 0 = expand to heart, 1 = float away
        phaseTimer: 0,
      });
    }
  }

  // ─── Mouse Interaction ───
  const mouse = { x: 0, y: 0 };
  window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  // ─── Scene Transition ───
  let currentScene = 'intro';
  const introEl = document.getElementById('scene-intro');
  const mainEl = document.getElementById('scene-main');
  const introRose = document.querySelector('.intro-rose');

  introRose.addEventListener('click', () => {
    if (currentScene !== 'intro') return;
    currentScene = 'main';

    introEl.classList.remove('active');
    setTimeout(() => {
      mainEl.classList.add('active');
      createHeartBurst();
      // Increase petal density for main scene
      for (let i = 0; i < 30; i++) spawnFallingPetal();
    }, 600);
  });

  // ─── Resize ───
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ─── Animation Loop ───
  let time = 0;

  function animate() {
    requestAnimationFrame(animate);
    time += 0.016;

    // Rotate main rose
    mainRose.rotation.z += 0.003;
    mainRose.rotation.x = Math.sin(time * 0.5) * 0.1;
    mainRose.rotation.y = Math.cos(time * 0.3) * 0.1;

    // Camera subtle sway based on mouse
    camera.position.x += (mouse.x * 3 - camera.position.x) * 0.02;
    camera.position.y += (mouse.y * 2 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);

    // Animate falling petals
    for (let i = fallingPetals.length - 1; i >= 0; i--) {
      const p = fallingPetals[i];
      p.wobble += p.wobbleSpeed;

      p.mesh.position.x += p.velocity.x + Math.sin(p.wobble) * p.wobbleAmp * 0.01;
      p.mesh.position.y += p.velocity.y;
      p.mesh.position.z += p.velocity.z;

      p.mesh.rotation.x += p.rotSpeed.x;
      p.mesh.rotation.y += p.rotSpeed.y;
      p.mesh.rotation.z += p.rotSpeed.z;

      // Respawn if too low
      if (p.mesh.position.y < -25) {
        p.mesh.position.y = 22 + Math.random() * 10;
        p.mesh.position.x = (Math.random() - 0.5) * 40;
        p.mesh.position.z = (Math.random() - 0.5) * 20;
      }
    }

    // Animate sparkle particles
    const positions = particles.geometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      const sp = particleSpeeds[i];
      positions[i * 3] += sp.x;
      positions[i * 3 + 1] += sp.y;
      positions[i * 3 + 2] += sp.z;
      sp.twinkle += sp.twinkleSpeed;

      // Wrap around
      if (Math.abs(positions[i * 3]) > 30) sp.x *= -1;
      if (Math.abs(positions[i * 3 + 1]) > 30) sp.y *= -1;
      if (Math.abs(positions[i * 3 + 2]) > 20) sp.z *= -1;
    }
    particles.geometry.attributes.position.needsUpdate = true;
    particleMat.opacity = 0.4 + Math.sin(time * 2) * 0.3;

    // Animate mini roses
    for (const mr of miniRoses) {
      mr.floatOffset += mr.floatSpeed;
      mr.mesh.position.y = mr.baseY + Math.sin(mr.floatOffset) * 1.5;
      mr.mesh.rotation.z += mr.rotSpeed;
      mr.mesh.rotation.y += mr.rotSpeed * 0.5;
    }

    // Animate heart burst
    for (let i = heartBurstParticles.length - 1; i >= 0; i--) {
      const hp = heartBurstParticles[i];
      hp.phaseTimer += 0.016;

      if (hp.phase === 0) {
        // Move towards heart position
        hp.mesh.position.x += (hp.target.x - hp.mesh.position.x) * 0.05;
        hp.mesh.position.y += (hp.target.y - hp.mesh.position.y) * 0.05;
        hp.mesh.position.z = hp.target.z;
        if (hp.phaseTimer > 2) {
          hp.phase = 1;
        }
      } else {
        // Float away and fade
        hp.mesh.position.x += hp.velocity.x;
        hp.mesh.position.y += hp.velocity.y + 0.01;
        hp.mesh.position.z += hp.velocity.z;
        hp.life -= hp.decay;
        hp.mesh.material.opacity = Math.max(0, hp.life);

        if (hp.life <= 0) {
          scene.remove(hp.mesh);
          hp.mesh.geometry.dispose();
          hp.mesh.material.dispose();
          heartBurstParticles.splice(i, 1);
        }
      }
    }

    // Animate lights
    pointLight1.intensity = 1.2 + Math.sin(time * 1.5) * 0.3;
    pointLight2.intensity = 0.8 + Math.sin(time * 1.2 + 1) * 0.2;

    renderer.render(scene, camera);
  }

  animate();

  // ─── Spawn petals over time ───
  setInterval(() => {
    if (fallingPetals.length < 120) {
      spawnFallingPetal();
    }
  }, 500);

  // ─── Touch support for intro ───
  introRose.addEventListener('touchend', (e) => {
    e.preventDefault();
    introRose.click();
  });

})();
