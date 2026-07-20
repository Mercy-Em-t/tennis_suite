// 3D State Machine Engine

let scene, camera, renderer;
let blueprintData = null;
let permissionsData = null;
let currentUserRole = 'PUBLIC'; // Default to unauthenticated

let nodeMeshes = [];
let gateMeshes = [];
let targetZ = 100;
let currentZ = 100;
let spineLine;

// Listen for secure context from React parent
window.addEventListener('message', (event) => {
  if (event.data?.type === 'SET_USER_CONTEXT') {
    currentUserRole = event.data.payload.role;
    console.log('[3D Engine] User context injected:', currentUserRole);
    applyPermissionsToUI();
  }
});

// LOD Thresholds
const OVERLAY_SHOW_DISTANCE = 40; // Camera distance to node before showing details

async function init() {
  // 1. Load Blueprint and Permissions
  try {
    const [bpRes, permRes] = await Promise.all([
      fetch('./blueprint.json'),
      fetch('./permissions.json')
    ]);
    blueprintData = await bpRes.json();
    permissionsData = await permRes.json();
  } catch (e) {
    console.error("Failed to load data files", e);
    return;
  }

  // 2. Setup Three.js Scene
  const container = document.getElementById('canvas-container');
  
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x050814, 0.003); // Deep space fog

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 15, targetZ);
  camera.lookAt(0, 0, targetZ - 100);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0x00f0ff, 0.8);
  directionalLight.position.set(10, 20, 10);
  scene.add(directionalLight);
  
  const pointLight = new THREE.PointLight(0x3b82f6, 1, 100);
  pointLight.position.set(0, 0, 50);
  scene.add(pointLight);

  // 3. Build Architecture (Spine, Nodes, Gates)
  buildArchitecture();

  // 4. Setup Interactions
  setupInteractions();

  // 5. Render Loop
  window.addEventListener('resize', onWindowResize);
  animate();
}

function buildArchitecture() {
  const nodes = blueprintData.nodes;
  const gates = blueprintData.gates;

  // Materials
  const nodeMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x00f0ff, 
    emissive: 0x004455,
    wireframe: true,
    transparent: true,
    opacity: 0.8
  });

  const gateMaterial = new THREE.MeshStandardMaterial({
    color: 0x3b82f6,
    emissive: 0x112244,
    transparent: true,
    opacity: 0.5
  });

  // Spine
  const minZ = nodes[nodes.length - 1].position.z - 50;
  const maxZ = nodes[0].position.z + 50;
  const spineLength = maxZ - minZ;
  
  const spineGeo = new THREE.CylinderGeometry(0.2, 0.2, spineLength, 8);
  spineGeo.rotateX(Math.PI / 2);
  const spineMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.3 });
  spineLine = new THREE.Mesh(spineGeo, spineMat);
  spineLine.position.z = minZ + spineLength / 2;
  scene.add(spineLine);

  const overlaysContainer = document.getElementById('overlays-container');

  // Create Nodes
  nodes.forEach(node => {
    // 3D Geometry
    const geo = new THREE.IcosahedronGeometry(4, 1);
    const mesh = new THREE.Mesh(geo, nodeMaterial);
    mesh.position.set(0, 0, node.position.z);
    mesh.userData = { id: node.id, type: 'node', z: node.position.z };
    scene.add(mesh);
    nodeMeshes.push(mesh);

    // 2D HTML Overlay
    const overlay = document.createElement('div');
    overlay.className = 'node-overlay';
    overlay.id = `overlay-${node.id}`;
    
    // Title
    const title = document.createElement('div');
    title.className = 'node-title-simple';
    title.innerText = node.title;
    title.onclick = () => navigateToZ(node.position.z + 30);
    overlay.appendChild(title);

    // Details Card (Hidden initially)
    const card = document.createElement('div');
    card.className = 'node-details-card';
    card.id = `card-${node.id}`;

    let substatesHtml = node.substates.map(s => `<span class="substate-badge">${s}</span>`).join('');
    
    // Build actions with initial permissions logic based on currentUserRole
    let actionsHtml = node.allowedActions.map(actionName => {
      return `<li class="action-item" data-action="${actionName}" data-phase="${node.id}">${actionName}</li>`;
    }).join('');

    let boundariesHtml = node.prohibitedBoundaries.map(b => `<li>${b}</li>`).join('');

    card.innerHTML = `
      <div class="card-title">${node.title} Phase</div>
      <div class="card-substates">${substatesHtml}</div>
      <div class="card-section">
        <div class="card-label">Core Objectives</div>
        <div class="card-text">${node.objectives}</div>
      </div>
      <div class="card-section">
        <div class="card-label">Allowed Actions</div>
        <ul class="action-list">${actionsHtml}</ul>
      </div>
      <div class="card-section">
        <div class="card-label">Prohibited Boundaries</div>
        <ul class="boundary-list">${boundariesHtml}</ul>
      </div>
    `;
    overlay.appendChild(card);
    overlaysContainer.appendChild(overlay);
  });

  // Apply initial permissions
  applyPermissionsToUI();

  // Create Gates
  gates.forEach(gate => {
    const fromNode = nodes.find(n => n.id === gate.from);
    const toNode = nodes.find(n => n.id === gate.to);
    
    if(fromNode && toNode) {
      const zPos = (fromNode.position.z + toNode.position.z) / 2;
      
      const geo = new THREE.TorusGeometry(8, 0.5, 16, 50);
      const mesh = new THREE.Mesh(geo, gateMaterial);
      mesh.position.set(0, 0, zPos);
      mesh.userData = { type: 'gate', requirement: gate.requirement };
      scene.add(mesh);
      gateMeshes.push({ mesh, z: zPos });

      // Gate HTML Overlay
      const gateOverlay = document.createElement('div');
      gateOverlay.className = 'gate-overlay';
      gateOverlay.id = `gate-${gate.from}-${gate.to}`;
      gateOverlay.innerHTML = `
        <div class="gate-label">TRANSITION GATE</div>
        <div class="gate-requirement">${gate.requirement}</div>
      `;
      overlaysContainer.appendChild(gateOverlay);
    }
  });
}

function applyPermissionsToUI() {
  if (!permissionsData || !blueprintData) return;
  
  // Track allowed actions per phase
  const phaseAllowedCounts = {};
  blueprintData.nodes.forEach(node => {
    phaseAllowedCounts[node.id] = 0;
  });

  const actionItems = document.querySelectorAll('.action-item');
  actionItems.forEach(item => {
    const actionName = item.getAttribute('data-action');
    const phaseId = item.getAttribute('data-phase');
    
    // Look up required roles
    const phasePerms = permissionsData.stages[phaseId];
    if (phasePerms && phasePerms.actions[actionName]) {
      const allowedRoles = phasePerms.actions[actionName].allowedRoles;
      const isAllowed = allowedRoles.includes(currentUserRole);
      
      if (isAllowed) {
        item.classList.remove('locked');
        item.innerHTML = `<span class="icon">✓</span> ${actionName}`;
        phaseAllowedCounts[phaseId]++;
      } else {
        item.classList.add('locked');
        item.innerHTML = `<span class="icon">🔒</span> <span class="locked-text">${actionName} (Requires ${allowedRoles[0]})</span>`;
      }
    }
  });

  // Apply node-level access styling
  blueprintData.nodes.forEach(node => {
    const card = document.getElementById(`card-${node.id}`);
    if (card) {
      if (phaseAllowedCounts[node.id] === 0) {
        card.classList.add('no-access');
        if (!card.querySelector('.no-access-banner')) {
           const banner = document.createElement('div');
           banner.className = 'no-access-banner';
           banner.innerHTML = '🔒 RESTRICTED: NO ACCESS';
           card.prepend(banner);
        }
      } else {
        card.classList.remove('no-access');
        const banner = card.querySelector('.no-access-banner');
        if (banner) banner.remove();
      }
    }
  });
}

function setupInteractions() {
  // Global View Button
  document.getElementById('btn-global').addEventListener('click', () => {
    navigateToZ(100);
  });

  // Next State Button
  document.getElementById('btn-next').addEventListener('click', () => {
    // Find next node that is deeper (smaller z) than current targetZ
    const nodes = blueprintData.nodes;
    let nextZ = targetZ;
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].position.z < targetZ - 10) {
        nextZ = nodes[i].position.z + 30; // 30 units in front of the node
        break;
      }
    }
    navigateToZ(nextZ);
  });

  // Mouse Wheel Scrolling
  window.addEventListener('wheel', (e) => {
    const scrollDelta = e.deltaY * 0.05;
    targetZ += scrollDelta;
    
    // Clamp Z
    const maxZ = 120;
    const minZ = blueprintData.nodes[blueprintData.nodes.length - 1].position.z - 20;
    targetZ = Math.max(minZ, Math.min(maxZ, targetZ));
  });
}

function navigateToZ(zPos) {
  gsap.to(window, {
    duration: 1.5,
    targetZ: zPos,
    ease: "power2.inOut",
    onUpdate: function() {
      // The render loop will smoothly interpolate camera to targetZ
    }
  });
  targetZ = zPos;
}

function updateOverlays() {
  // Project 3D positions to 2D screen space
  const tempV = new THREE.Vector3();

  // Nodes
  nodeMeshes.forEach(mesh => {
    const nodeData = mesh.userData;
    tempV.copy(mesh.position);
    tempV.project(camera);

    const x = (tempV.x *  .5 + .5) * window.innerWidth;
    const y = (tempV.y * -.5 + .5) * window.innerHeight;

    const overlay = document.getElementById(`overlay-${nodeData.id}`);
    const card = document.getElementById(`card-${nodeData.id}`);
    
    // Only show if it's in front of camera
    if (tempV.z < 1) {
      overlay.style.display = 'flex';
      overlay.style.left = `${x}px`;
      overlay.style.top = `${y}px`;

      // LOD Logic: Show card if close enough
      const dist = camera.position.z - mesh.position.z;
      
      // If camera is between [10, OVERLAY_SHOW_DISTANCE] units in front of node
      if (dist > 10 && dist < OVERLAY_SHOW_DISTANCE) {
        card.classList.add('visible');
      } else {
        card.classList.remove('visible');
      }
      
      // Fade out simple title as we get very close or pass it
      if (dist < 5 || dist > 200) {
        overlay.style.opacity = 0;
      } else {
        overlay.style.opacity = 1;
      }

    } else {
      overlay.style.display = 'none';
    }
  });

  // Gates
  gateMeshes.forEach(gateObj => {
    const { mesh, z } = gateObj;
    tempV.copy(mesh.position);
    tempV.project(camera);

    const x = (tempV.x *  .5 + .5) * window.innerWidth;
    const y = (tempV.y * -.5 + .5) * window.innerHeight;

    const overlay = document.getElementById(`gate-${mesh.userData.from}-${mesh.userData.to}`);
    if(!overlay) {
      // Find dynamically via DOM if id isn't explicitly saved (or just select all gates, wait we gave it an id)
      // Actually we didn't save gate from/to on mesh.userData cleanly above. Let's fix that.
    }
  });
  
  // Second pass for Gates (Fixing the ID mapping)
  blueprintData.gates.forEach(gate => {
    const fromNode = blueprintData.nodes.find(n => n.id === gate.from);
    const toNode = blueprintData.nodes.find(n => n.id === gate.to);
    if(fromNode && toNode) {
      const zPos = (fromNode.position.z + toNode.position.z) / 2;
      tempV.set(0, 0, zPos);
      tempV.project(camera);
      
      const x = (tempV.x *  .5 + .5) * window.innerWidth;
      const y = (tempV.y * -.5 + .5) * window.innerHeight;
      
      const gateOverlay = document.getElementById(`gate-${gate.from}-${gate.to}`);
      if(gateOverlay) {
        if(tempV.z < 1) {
          gateOverlay.style.display = 'flex';
          gateOverlay.style.left = `${x}px`;
          gateOverlay.style.top = `${y}px`;
          
          const dist = camera.position.z - zPos;
          if(dist > 5 && dist < 60) {
            gateOverlay.classList.add('visible');
          } else {
            gateOverlay.classList.remove('visible');
          }
        } else {
          gateOverlay.style.display = 'none';
        }
      }
    }
  });
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  // Smooth camera follow
  currentZ += (targetZ - currentZ) * 0.1;
  camera.position.z = currentZ;

  // Look slightly down the pipe
  camera.lookAt(0, 0, currentZ - 100);

  // Animate Meshes
  const time = Date.now() * 0.001;
  nodeMeshes.forEach((mesh, index) => {
    mesh.rotation.x = time * 0.5 + index;
    mesh.rotation.y = time * 0.3 + index;
    // Gentle bob
    mesh.position.y = Math.sin(time * 2 + index) * 1.5;
  });

  gateMeshes.forEach((gateObj, index) => {
    gateObj.mesh.rotation.z = time * 0.2 + index;
  });

  updateOverlays();

  renderer.render(scene, camera);
}

// Start
init();
