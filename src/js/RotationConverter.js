/**
 * Modern 3D Rotation Converter with Hierarchical Reference Frames
 * Author: Enhanced by AI Assistant
 * License: MIT
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class RotationConverter {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        
        this.frames = new Map();
        this.activeFrameId = null;
        this.frameCounter = 0;
        this.worldFrame = null;
        
        this.isUpdatingInputs = false;
        
        this.init();
    }
    
    async init() {
        console.log('🚀 Initializing 3D Rotation Converter...');
        
        try {
            this.setupScene();
            this.setupUI();
            this.createWorldFrame();
            this.startRenderLoop();
            
            console.log('✅ 3D Rotation Converter initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize 3D Rotation Converter:', error);
        }
    }
    
    setupScene() {
        console.log('🎬 Setting up 3D scene...');
        
        const container = document.getElementById('scene-container');
        if (!container) {
            throw new Error('Scene container not found');
        }
        
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf5f5f5); // Light gray background
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        // Set Z-axis as up vector
        this.camera.up.set(0, 0, 1);
        this.camera.position.set(5, 5, 5);
        this.camera.lookAt(0, 0, 0);
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(this.renderer.domElement);
        
        // Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        // Set Z-axis as up for controls
        this.controls.object.up.set(0, 0, 1);
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // Grid - rotate to XY plane since Z is now up
        const gridHelper = new THREE.GridHelper(10, 10, 0x666666, 0x999999);
        gridHelper.rotation.x = Math.PI / 2; // Rotate 90 degrees around X to make it lie in XY plane
        this.scene.add(gridHelper);
        
        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
        
        console.log('✅ 3D scene setup complete');
    }
    
    setupUI() {
        console.log('🎨 Setting up UI...');
        
        // Make methods globally available for HTML onclick handlers
        window.rotationConverter = this;
        
        // Setup event listeners
        this.setupInputEventListeners();
        
        console.log('✅ UI setup complete');
    }
    
    setupInputEventListeners() {
        // Position inputs
        ['x', 'y', 'z'].forEach(axis => {
            const input = document.getElementById(`position-${axis}`);
            if (input) {
                input.addEventListener('input', () => this.updateFramePosition());
            }
        });
        
        // Matrix inputs
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const input = document.getElementById(`m${i}${j}`);
                if (input) {
                    input.addEventListener('input', () => this.updateFromMatrix());
                }
            }
        }
        
        // Matrix text input
        const matrixTextInput = document.getElementById('matrix-text');
        if (matrixTextInput) {
            matrixTextInput.addEventListener('change', () => this.updateFromMatrixText());
            matrixTextInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                    this.updateFromMatrixText();
                }
            });
        }
        
        // Quaternion inputs
        ['q0', 'q1', 'q2', 'q3'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', () => this.updateFromQuaternion());
            }
        });
        
        // Quaternion text input
        const quaternionTextInput = document.getElementById('quaternion-text');
        if (quaternionTextInput) {
            quaternionTextInput.addEventListener('change', () => this.updateFromQuaternionText());
            quaternionTextInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.updateFromQuaternionText();
                }
            });
        }
        
        // Euler inputs
        ['euler-x', 'euler-y', 'euler-z'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', () => this.updateFromEuler());
            }
        });
    }
    
    createWorldFrame() {
        console.log('🌍 Creating world frame...');
        
        const worldFrame = this.createReferenceFrame('World', {x: 0, y: 0, z: 0}, 0x00ff00, null);
        this.worldFrame = worldFrame;
        this.activeFrameId = worldFrame.id;
        this.updateUI();
        
        console.log('✅ World frame created');
    }
    
    createReferenceFrame(name, position = {x: 0, y: 0, z: 0}, color = 0x888888, parentFrame = null) {
        console.log(`📍 Creating reference frame: ${name}`);
        
        const frameId = `frame-${this.frameCounter++}`;
        
        const frame = {
            id: frameId,
            name: name || `Frame ${this.frameCounter}`,
            parentFrame: parentFrame,
            children: new Set(),
            
            // Transform data
            position: new THREE.Vector3(position.x, position.y, position.z),
            localQuaternion: new THREE.Quaternion(),
            quaternion: new THREE.Quaternion(), // World quaternion
            worldPosition: new THREE.Vector3(), // World position
            
            // Slider base quaternion for incremental rotations
            baseQuaternion: null,
            
            // Visual representation
            group: new THREE.Group(),
            color: color,
            arrowScale: 1.0,
            attachedObject: null,
            
            // UI state
            isExpanded: true,
            isVisible: true
        };
        
        // Add to parent's children if not world frame
        if (parentFrame) {
            parentFrame.children.add(frame);
            parentFrame.group.add(frame.group);
        } else {
            this.scene.add(frame.group);
        }
        
        // Create visual representation
        this.createFrameVisuals(frame);
        
        // Store frame
        this.frames.set(frameId, frame);
        
        console.log(`✅ Reference frame '${frame.name}' created with ID: ${frameId}`);
        return frame;
    }
    
    createFrameVisuals(frame) {
        console.log(`🎨 Creating visuals for frame: ${frame.name}`);
        
        const group = frame.group;
        const scale = frame.arrowScale || 1.0;
        
        // Create coordinate axes
        const axisLength = (frame.parentFrame ? 1.5 : 2.0) * scale;
        const axisWidth = (frame.parentFrame ? 0.02 : 0.03) * scale;
        
        // X-axis (red)
        const xGeometry = new THREE.CylinderGeometry(axisWidth, axisWidth, axisLength, 8);
        const xMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const xAxis = new THREE.Mesh(xGeometry, xMaterial);
        xAxis.rotation.z = -Math.PI / 2;
        xAxis.position.x = axisLength / 2;
        group.add(xAxis);
        
        // X-axis arrow
        const xArrowGeometry = new THREE.ConeGeometry(axisWidth * 2, axisWidth * 4, 8);
        const xArrow = new THREE.Mesh(xArrowGeometry, xMaterial);
        xArrow.rotation.z = -Math.PI / 2;
        xArrow.position.x = axisLength + axisWidth * 2;
        group.add(xArrow);
        
        // Y-axis (green)
        const yGeometry = new THREE.CylinderGeometry(axisWidth, axisWidth, axisLength, 8);
        const yMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const yAxis = new THREE.Mesh(yGeometry, yMaterial);
        yAxis.position.y = axisLength / 2;
        group.add(yAxis);
        
        // Y-axis arrow
        const yArrowGeometry = new THREE.ConeGeometry(axisWidth * 2, axisWidth * 4, 8);
        const yArrow = new THREE.Mesh(yArrowGeometry, yMaterial);
        yArrow.position.y = axisLength + axisWidth * 2;
        group.add(yArrow);
        
        // Z-axis (blue)
        const zGeometry = new THREE.CylinderGeometry(axisWidth, axisWidth, axisLength, 8);
        const zMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
        const zAxis = new THREE.Mesh(zGeometry, zMaterial);
        zAxis.rotation.x = Math.PI / 2;
        zAxis.position.z = axisLength / 2;
        group.add(zAxis);
        
        // Z-axis arrow
        const zArrowGeometry = new THREE.ConeGeometry(axisWidth * 2, axisWidth * 4, 8);
        const zArrow = new THREE.Mesh(zArrowGeometry, zMaterial);
        zArrow.rotation.x = Math.PI / 2;
        zArrow.position.z = axisLength + axisWidth * 2;
        group.add(zArrow);
        
        // Origin sphere
        const originGeometry = new THREE.SphereGeometry(axisWidth * 1.5, 16, 16);
        const originMaterial = new THREE.MeshBasicMaterial({ 
            color: frame.color,
            transparent: true,
            opacity: 0.8
        });
        const origin = new THREE.Mesh(originGeometry, originMaterial);
        group.add(origin);
        
        // Frame label
        if (frame.name !== 'World') {
            this.createFrameLabel(frame, group);
        }
        
        // Apply initial transform
        this.updateFrameTransform(frame);
        
        console.log(`✅ Visuals created for frame: ${frame.name}`);
    }
    
    createFrameLabel(frame, group) {
        // This would create a text label - simplified for now
        // In a full implementation, you might use Canvas or CSS3D for text
        console.log(`📝 Label created for frame: ${frame.name}`);
    }
    
    updateFrameTransform(frame) {
        if (!frame) return;
        
        console.log(`🔄 Updating transform for frame: ${frame.name}`);
        
        // Apply local transform directly to the Three.js group
        // Three.js will handle the world transform calculation automatically
        frame.group.position.copy(frame.position);
        frame.group.quaternion.copy(frame.localQuaternion);
        
        // Calculate world transform for our own tracking
        if (frame.parentFrame) {
            // World rotation = parent_world_rotation * local_rotation
            frame.quaternion.multiplyQuaternions(frame.parentFrame.quaternion, frame.localQuaternion);
            
            // World position = parent_world_position + (parent_world_rotation * local_position)
            const localPosInWorld = frame.position.clone().applyQuaternion(frame.parentFrame.quaternion);
            frame.worldPosition = frame.parentFrame.worldPosition.clone().add(localPosInWorld);
        } else {
            // World frame: world transform = local transform
            frame.quaternion.copy(frame.localQuaternion);
            frame.worldPosition = frame.position.clone();
        }
        
        console.log(`📍 Frame ${frame.name} local position: [${frame.position.x.toFixed(3)}, ${frame.position.y.toFixed(3)}, ${frame.position.z.toFixed(3)}]`);
        console.log(`📍 Frame ${frame.name} world position: [${frame.worldPosition.x.toFixed(3)}, ${frame.worldPosition.y.toFixed(3)}, ${frame.worldPosition.z.toFixed(3)}]`);
        console.log(`📐 Frame ${frame.name} world quaternion: [${frame.quaternion.x.toFixed(3)}, ${frame.quaternion.y.toFixed(3)}, ${frame.quaternion.z.toFixed(3)}, ${frame.quaternion.w.toFixed(3)}]`);
        
        // Update all children recursively
        frame.children.forEach(child => {
            this.updateFrameTransform(child);
        });
        
        console.log(`✅ Transform updated for frame: ${frame.name}`);
    }
    
    // Public API methods for UI interaction
    addFrame(name, parentId = null) {
        console.log(`➕ Adding frame: ${name}, parent: ${parentId}`);
        
        const parentFrame = parentId ? this.frames.get(parentId) : this.worldFrame;
        if (!parentFrame && parentId) {
            console.error(`Parent frame ${parentId} not found`);
            return null;
        }
        
        const newFrame = this.createReferenceFrame(
            name,
            { x: 0, y: 0, z: 0 },
            this.getRandomColor(),
            parentFrame
        );
        
        this.activeFrameId = newFrame.id;
        this.updateUI();
        
        return newFrame;
    }
    
    addChildFrame() {
        console.log('🌿 Adding child frame to active frame...');
        
        const activeFrame = this.getActiveFrame();
        if (!activeFrame) {
            alert('Please select a frame first before adding a child frame.');
            return null;
        }
        
        const frameName = prompt(`Enter name for child frame of "${activeFrame.name}":`, 'Child Frame');
        if (!frameName) {
            return null; // User cancelled
        }
        
        const newFrame = this.createReferenceFrame(
            frameName,
            { x: 1, y: 0, z: 0 }, // Default position offset from parent
            this.getRandomColor(),
            activeFrame
        );
        
        this.activeFrameId = newFrame.id;
        this.updateUI();
        
        console.log(`✅ Child frame "${frameName}" added to "${activeFrame.name}"`);
        return newFrame;
    }
    
    removeFrame(frameId) {
        console.log(`🗑️ Removing frame: ${frameId}`);
        
        const frame = this.frames.get(frameId);
        if (!frame || frame === this.worldFrame) {
            console.error('Cannot remove world frame or frame not found');
            return;
        }
        
        // Clean up attached object
        if (frame.attachedObject) {
            this.removeFrameObject();
        }
        
        // Move children to parent
        frame.children.forEach(child => {
            if (frame.parentFrame) {
                frame.parentFrame.children.add(child);
                frame.parentFrame.group.add(child.group);
                child.parentFrame = frame.parentFrame;
            } else {
                this.scene.add(child.group);
                child.parentFrame = null;
            }
        });
        
        // Remove from parent
        if (frame.parentFrame) {
            frame.parentFrame.children.delete(frame);
            frame.parentFrame.group.remove(frame.group);
        } else {
            this.scene.remove(frame.group);
        }
        
        // Remove from frames map
        this.frames.delete(frameId);
        
        // Update active frame
        if (this.activeFrameId === frameId) {
            this.activeFrameId = this.worldFrame.id;
        }
        
        this.updateUI();
    }
    
    removeActiveFrame() {
        console.log('🗑️ Removing active frame...');
        
        const activeFrame = this.getActiveFrame();
        if (!activeFrame) {
            alert('No frame selected to remove.');
            return;
        }
        
        if (activeFrame === this.worldFrame) {
            alert('Cannot remove the World frame.');
            return;
        }
        
        const confirmMessage = `Are you sure you want to remove "${activeFrame.name}"?\n\nNote: Child frames will be moved to the parent frame.`;
        if (confirm(confirmMessage)) {
            this.removeFrame(activeFrame.id);
            console.log(`✅ Frame "${activeFrame.name}" removed`);
        }
    }
    
    selectFrame(frameId) {
        console.log(`👆 Selecting frame: ${frameId}`);
        
        const frame = this.frames.get(frameId);
        if (!frame) {
            console.error(`Frame ${frameId} not found`);
            return;
        }
        
        this.activeFrameId = frameId;
        this.updateInputsFromActiveFrame();
        this.updateFrameList();
    }
    
    getActiveFrame() {
        return this.frames.get(this.activeFrameId);
    }
    
    // Input update methods
    updateFramePosition() {
        if (this.isUpdatingInputs) return;
        
        const frame = this.getActiveFrame();
        if (!frame) return;
        
        const x = parseFloat(document.getElementById('position-x')?.value || 0);
        const y = parseFloat(document.getElementById('position-y')?.value || 0);
        const z = parseFloat(document.getElementById('position-z')?.value || 0);
        
        frame.position.set(x, y, z);
        this.updateFrameTransform(frame);
        this.updateOutputs();
    }
    
    updateFromMatrix() {
        if (this.isUpdatingInputs) return;
        
        const frame = this.getActiveFrame();
        if (!frame) return;
        
        try {
            const matrix = new THREE.Matrix3();
            const elements = [];
            
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    const value = parseFloat(document.getElementById(`m${i}${j}`)?.value || 0);
                    elements.push(value);
                }
            }
            
            matrix.set(...elements);
            
            // Convert to quaternion
            const mat4 = new THREE.Matrix4();
            mat4.setFromMatrix3(matrix);
            frame.localQuaternion.setFromRotationMatrix(mat4);
            
            this.updateFrameTransform(frame);
            this.updateInputsFromActiveFrame();
            this.updateOutputs();
        } catch (error) {
            console.error('Error updating from matrix:', error);
        }
    }
    
    updateFromMatrixText() {
        if (this.isUpdatingInputs) return;
        
        const frame = this.getActiveFrame();
        if (!frame) return;
        
        try {
            const textInput = document.getElementById('matrix-text');
            if (!textInput || !textInput.value.trim()) return;
            
            let text = textInput.value.trim();
            
            // Replace newlines and multiple spaces with single spaces
            text = text.replace(/\s+/g, ' ');
            
            // Remove brackets and commas if present
            text = text.replace(/[\[\](),]/g, ' ').replace(/\s+/g, ' ').trim();
            
            // Split by whitespace
            const values = text.split(' ').filter(v => v.length > 0);
            
            if (values.length !== 9) {
                alert('Please enter exactly 9 values for a 3x3 matrix');
                return;
            }
            
            const elements = values.map(v => parseFloat(v));
            
            // Check if all values are valid numbers
            if (elements.some(v => isNaN(v))) {
                alert('Please enter valid numbers for matrix elements');
                return;
            }
            
            // Update the matrix inputs
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    const input = document.getElementById(`m${i}${j}`);
                    if (input) {
                        input.value = elements[i * 3 + j].toFixed(6);
                    }
                }
            }
            
            // Create matrix and convert to quaternion
            const matrix = new THREE.Matrix3();
            matrix.set(...elements);
            
            const mat4 = new THREE.Matrix4();
            mat4.setFromMatrix3(matrix);
            frame.localQuaternion.setFromRotationMatrix(mat4);
            
            this.updateFrameTransform(frame);
            this.updateInputsFromActiveFrame();
            this.updateOutputs();
            
            console.log(`✅ Matrix updated from text`);
        } catch (error) {
            console.error('Error updating from matrix text:', error);
            alert('Error parsing matrix. Please check the format.');
        }
    }
    
    updateFromQuaternion() {
        if (this.isUpdatingInputs) return;
        
        const frame = this.getActiveFrame();
        if (!frame) return;
        
        try {
            const x = parseFloat(document.getElementById('q0')?.value || 0);
            const y = parseFloat(document.getElementById('q1')?.value || 0);
            const z = parseFloat(document.getElementById('q2')?.value || 0);
            const w = parseFloat(document.getElementById('q3')?.value || 1);
            
            frame.localQuaternion.set(x, y, z, w).normalize();
            
            this.updateFrameTransform(frame);
            this.updateInputsFromActiveFrame();
            this.updateOutputs();
        } catch (error) {
            console.error('Error updating from quaternion:', error);
        }
    }
    
    updateFromQuaternionText() {
        if (this.isUpdatingInputs) return;
        
        const frame = this.getActiveFrame();
        if (!frame) return;
        
        try {
            const textInput = document.getElementById('quaternion-text');
            if (!textInput || !textInput.value.trim()) return;
            
            let text = textInput.value.trim();
            
            // Remove brackets and commas if present
            text = text.replace(/[\[\]]/g, '').replace(/,/g, ' ');
            
            // Split by whitespace and filter out empty strings
            const values = text.split(/\s+/).filter(v => v.length > 0);
            
            if (values.length !== 4) {
                alert('Please enter exactly 4 values for quaternion (x, y, z, w)');
                return;
            }
            
            const [x, y, z, w] = values.map(v => parseFloat(v));
            
            // Check if all values are valid numbers
            if ([x, y, z, w].some(v => isNaN(v))) {
                alert('Please enter valid numbers for quaternion components');
                return;
            }
            
            // Update the quaternion
            frame.localQuaternion.set(x, y, z, w).normalize();
            
            // Update the individual input fields
            document.getElementById('q0').value = frame.localQuaternion.x.toFixed(6);
            document.getElementById('q1').value = frame.localQuaternion.y.toFixed(6);
            document.getElementById('q2').value = frame.localQuaternion.z.toFixed(6);
            document.getElementById('q3').value = frame.localQuaternion.w.toFixed(6);
            
            this.updateFrameTransform(frame);
            this.updateInputsFromActiveFrame();
            this.updateOutputs();
            
            console.log(`✅ Quaternion updated from text: [${x}, ${y}, ${z}, ${w}]`);
        } catch (error) {
            console.error('Error updating from quaternion text:', error);
            alert('Error parsing quaternion. Please check the format.');
        }
    }
    
    updateFromEuler() {
        if (this.isUpdatingInputs) return;
        
        const frame = this.getActiveFrame();
        if (!frame) return;
        
        try {
            const x = parseFloat(document.getElementById('euler-x')?.value || 0);
            const y = parseFloat(document.getElementById('euler-y')?.value || 0);
            const z = parseFloat(document.getElementById('euler-z')?.value || 0);
            
            const euler = new THREE.Euler(x, y, z, 'XYZ');
            frame.localQuaternion.setFromEuler(euler);
            
            this.updateFrameTransform(frame);
            this.updateInputsFromActiveFrame();
            this.updateOutputs();
        } catch (error) {
            console.error('Error updating from euler:', error);
        }
    }
    
    // UI update methods
    updateUI() {
        this.updateFrameList();
        this.updateInputsFromActiveFrame();
        this.updateOutputs();
    }
    
    updateFrameList() {
        const frameList = document.getElementById('frame-list');
        if (!frameList) return;
        
        frameList.innerHTML = '';
        this.renderFrameTree(frameList, this.worldFrame, 0);
        
        // Update active frame display
        const activeFrameDisplay = document.getElementById('active-frame-name');
        const activeFrame = this.getActiveFrame();
        if (activeFrameDisplay && activeFrame) {
            activeFrameDisplay.textContent = activeFrame.name;
        }
    }
    
    renderFrameTree(container, frame, depth) {
        const item = document.createElement('div');
        item.className = `frame-item ${frame.id === this.activeFrameId ? 'active' : ''} ${frame === this.worldFrame ? 'world-frame' : ''}`;
        item.style.paddingLeft = `${depth * 1.5}rem`;
        item.onclick = () => this.selectFrame(frame.id);
        
        const status = document.createElement('span');
        status.className = `status-indicator ${frame.id === this.activeFrameId ? 'status-active' : 'status-inactive'}`;
        
        const name = document.createElement('span');
        name.textContent = frame.name;
        
        item.appendChild(status);
        item.appendChild(name);
        container.appendChild(item);
        
        // Render children
        frame.children.forEach(child => {
            this.renderFrameTree(container, child, depth + 1);
        });
    }
    
    updateInputsFromActiveFrame() {
        const frame = this.getActiveFrame();
        if (!frame) return;
        
        this.isUpdatingInputs = true;
        
        try {
            // Update frame name input
            const frameNameInput = document.getElementById('frame-name-input');
            if (frameNameInput) {
                frameNameInput.value = frame.name;
            }
            
            // Update arrow scale input
            const arrowScaleInput = document.getElementById('arrow-scale-input');
            const arrowScaleValue = document.getElementById('arrow-scale-value');
            if (arrowScaleInput && arrowScaleValue) {
                arrowScaleInput.value = frame.arrowScale || 1.0;
                arrowScaleValue.textContent = `${(frame.arrowScale || 1.0).toFixed(1)}x`;
            }
            
            // Update position inputs
            const posInputs = ['position-x', 'position-y', 'position-z'];
            [frame.position.x, frame.position.y, frame.position.z].forEach((value, i) => {
                const input = document.getElementById(posInputs[i]);
                if (input) input.value = value.toFixed(3);
            });
            
            // Update matrix inputs
            const matrix = new THREE.Matrix4().makeRotationFromQuaternion(frame.localQuaternion);
            const m = matrix.elements;
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    const input = document.getElementById(`m${i}${j}`);
                    if (input) input.value = m[j * 4 + i].toFixed(6);
                }
            }
            
            // Update matrix text input
            const matrixTextInput = document.getElementById('matrix-text');
            if (matrixTextInput) {
                const matrixText = 
                    `${m[0].toFixed(6)} ${m[4].toFixed(6)} ${m[8].toFixed(6)}\n` +
                    `${m[1].toFixed(6)} ${m[5].toFixed(6)} ${m[9].toFixed(6)}\n` +
                    `${m[2].toFixed(6)} ${m[6].toFixed(6)} ${m[10].toFixed(6)}`;
                matrixTextInput.value = matrixText;
            }
            
            // Update quaternion inputs
            const qInputs = ['q0', 'q1', 'q2', 'q3'];
            [frame.localQuaternion.x, frame.localQuaternion.y, frame.localQuaternion.z, frame.localQuaternion.w]
                .forEach((value, i) => {
                    const input = document.getElementById(qInputs[i]);
                    if (input) input.value = value.toFixed(6);
                });
            
            // Update quaternion text input
            const quaternionTextInput = document.getElementById('quaternion-text');
            if (quaternionTextInput) {
                const q = frame.localQuaternion;
                quaternionTextInput.value = `${q.x.toFixed(6)} ${q.y.toFixed(6)} ${q.z.toFixed(6)} ${q.w.toFixed(6)}`;
            }
            
            // Update euler inputs
            const euler = new THREE.Euler().setFromQuaternion(frame.localQuaternion, 'XYZ');
            const eulerInputs = ['euler-x', 'euler-y', 'euler-z'];
            [euler.x, euler.y, euler.z].forEach((value, i) => {
                const input = document.getElementById(eulerInputs[i]);
                if (input) input.value = value.toFixed(6);
            });
            
            // Update sliders
            this.updateSliders(frame);
            
        } finally {
            this.isUpdatingInputs = false;
        }
    }
    
    updateOutputs() {
        const frame = this.getActiveFrame();
        if (!frame) return;
        
        // Update matrix output
        const matrixOutput = document.getElementById('matrix-output');
        if (matrixOutput) {
            const matrix = new THREE.Matrix4().makeRotationFromQuaternion(frame.localQuaternion);
            const m = matrix.elements;
            const matrixText = 
                `[${m[0].toFixed(6)}, ${m[4].toFixed(6)}, ${m[8].toFixed(6)}]\n` +
                `[${m[1].toFixed(6)}, ${m[5].toFixed(6)}, ${m[9].toFixed(6)}]\n` +
                `[${m[2].toFixed(6)}, ${m[6].toFixed(6)}, ${m[10].toFixed(6)}]`;
            matrixOutput.textContent = matrixText;
        }
        
        // Update quaternion output
        const quaternionOutput = document.getElementById('quaternion-output');
        if (quaternionOutput) {
            const q = frame.localQuaternion;
            quaternionOutput.textContent = `[${q.x.toFixed(6)}, ${q.y.toFixed(6)}, ${q.z.toFixed(6)}, ${q.w.toFixed(6)}]`;
        }
        
        // Update euler output
        const eulerOutput = document.getElementById('euler-output');
        if (eulerOutput) {
            const euler = new THREE.Euler().setFromQuaternion(frame.localQuaternion, 'XYZ');
            eulerOutput.textContent = `[${euler.x.toFixed(6)}, ${euler.y.toFixed(6)}, ${euler.z.toFixed(6)}]`;
        }
        
        // Update world transform outputs
        const worldPosOutput = document.getElementById('world-position-output');
        if (worldPosOutput) {
            // Get actual world position from Three.js
            const worldPos = new THREE.Vector3();
            frame.group.getWorldPosition(worldPos);
            worldPosOutput.textContent = `[${worldPos.x.toFixed(6)}, ${worldPos.y.toFixed(6)}, ${worldPos.z.toFixed(6)}]`;
        }
        
        const worldQuatOutput = document.getElementById('world-quaternion-output');
        if (worldQuatOutput) {
            // Get actual world quaternion from Three.js
            const worldQuat = new THREE.Quaternion();
            frame.group.getWorldQuaternion(worldQuat);
            worldQuatOutput.textContent = `[${worldQuat.x.toFixed(6)}, ${worldQuat.y.toFixed(6)}, ${worldQuat.z.toFixed(6)}, ${worldQuat.w.toFixed(6)}]`;
        }
    }
    
    // Utility methods
    getRandomColor() {
        const colors = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0xf9ca24, 0xf0932b, 0xeb4d4b, 0x6c5ce7, 0xa29bfe];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    createDemoHierarchy() {
        console.log('🎯 Creating demo hierarchy...');
        
        // Clear existing frames except world
        this.clearAllFrames();
        
        // Create a simple test case to verify proper transforms
        const frameA = this.addFrame('Frame A', this.worldFrame.id);
        frameA.position.set(1, 0, 0); // 1 unit along X from world
        
        const frameB = this.addFrame('Frame B', frameA.id);
        frameB.position.set(1, 0, 0); // 1 unit along X from Frame A (should be at world position [2,0,0])
        
        const frameC = this.addFrame('Frame C', frameB.id);
        frameC.position.set(1, 0, 0); // 1 unit along X from Frame B (should be at world position [3,0,0])
        
        // Update all transforms starting from world frame
        this.updateFrameTransform(this.worldFrame);
        this.updateUI();
        
        console.log('✅ Demo hierarchy created - Frame A at [1,0,0], Frame B should be at [2,0,0], Frame C at [3,0,0]');
    }
    
    clearAllFrames() {
        console.log('🧹 Clearing all frames...');
        
        // Remove all frames except world
        const framesToRemove = Array.from(this.frames.keys()).filter(id => id !== this.worldFrame.id);
        framesToRemove.forEach(id => this.removeFrame(id));
        
        console.log('✅ All frames cleared');
    }
    
    handleResize() {
        const container = document.getElementById('scene-container');
        if (!container || !this.renderer || !this.camera) return;
        
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
    
    startRenderLoop() {
        const animate = () => {
            requestAnimationFrame(animate);
            
            if (this.controls) {
                this.controls.update();
            }
            
            if (this.renderer && this.scene && this.camera) {
                this.renderer.render(this.scene, this.camera);
            }
        };
        
        animate();
        console.log('🎬 Render loop started');
    }
    
    // Advanced functionality
    addFrameFromParent(name, parentId, relativePosition = {x: 1, y: 0, z: 0}) {
        const parent = this.frames.get(parentId);
        if (!parent) {
            console.error(`Parent frame ${parentId} not found`);
            return null;
        }
        
        const frame = this.createReferenceFrame(name, relativePosition, this.getRandomColor(), parent);
        this.activeFrameId = frame.id;
        this.updateUI();
        
        return frame;
    }
    
    copyFrame(frameId) {
        const frame = this.frames.get(frameId);
        if (!frame) return null;
        
        const newFrame = this.createReferenceFrame(
            `${frame.name} Copy`,
            {x: frame.position.x, y: frame.position.y, z: frame.position.z},
            frame.color,
            frame.parentFrame
        );
        
        newFrame.localQuaternion.copy(frame.localQuaternion);
        this.updateFrameTransform(newFrame);
        this.updateUI();
        
        return newFrame;
    }
    
    setFrameTransform(frameId, position, quaternion) {
        const frame = this.frames.get(frameId);
        if (!frame) return;
        
        if (position) {
            frame.position.set(position.x || 0, position.y || 0, position.z || 0);
        }
        
        if (quaternion) {
            frame.localQuaternion.set(
                quaternion.x || 0, 
                quaternion.y || 0, 
                quaternion.z || 0, 
                quaternion.w !== undefined ? quaternion.w : 1
            );
        }
        
        this.updateFrameTransform(frame);
        if (frame.id === this.activeFrameId) {
            this.updateInputsFromActiveFrame();
        }
        this.updateOutputs();
    }
    
    getFrameWorldTransform(frameId) {
        const frame = this.frames.get(frameId);
        if (!frame) return null;
        
        const worldPosition = new THREE.Vector3();
        const worldQuaternion = new THREE.Quaternion();
        
        frame.group.getWorldPosition(worldPosition);
        frame.group.getWorldQuaternion(worldQuaternion);
        
        return {
            position: worldPosition,
            quaternion: worldQuaternion
        };
    }
    
    animateFrameRotation(frameId, targetQuaternion, duration = 1000) {
        const frame = this.frames.get(frameId);
        if (!frame) return;
        
        const startQuaternion = frame.localQuaternion.clone();
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Smooth easing function
            const eased = 1 - Math.pow(1 - progress, 3);
            
            frame.localQuaternion.slerpQuaternions(startQuaternion, targetQuaternion, eased);
            this.updateFrameTransform(frame);
            
            if (frame.id === this.activeFrameId) {
                this.updateInputsFromActiveFrame();
            }
            this.updateOutputs();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    // Import/Export functionality
    exportFrameHierarchy() {
        const data = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            worldFrame: this.worldFrame.id,
            activeFrame: this.activeFrameId,
            frames: {}
        };
        
        this.frames.forEach((frame, id) => {
            data.frames[id] = {
                id: frame.id,
                name: frame.name,
                parentFrame: frame.parentFrame ? frame.parentFrame.id : null,
                position: {
                    x: frame.position.x,
                    y: frame.position.y,
                    z: frame.position.z
                },
                localQuaternion: {
                    x: frame.localQuaternion.x,
                    y: frame.localQuaternion.y,
                    z: frame.localQuaternion.z,
                    w: frame.localQuaternion.w
                },
                color: frame.color
            };
        });
        
        return data;
    }
    
    importFrameHierarchy(data) {
        if (!data || !data.frames) {
            console.error('Invalid frame hierarchy data');
            return;
        }
        
        // Clear existing frames except world
        this.clearAllFrames();
        
        // Import frames in dependency order
        const frameIds = Object.keys(data.frames);
        const imported = new Set();
        
        while (imported.size < frameIds.length) {
            for (const frameId of frameIds) {
                if (imported.has(frameId)) continue;
                
                const frameData = data.frames[frameId];
                const parentId = frameData.parentFrame;
                
                // Can import if no parent or parent already imported
                if (!parentId || imported.has(parentId)) {
                    const parent = parentId ? this.frames.get(parentId) : null;
                    
                    if (frameId === data.worldFrame) {
                        // Update world frame
                        this.worldFrame.name = frameData.name;
                        this.worldFrame.position.set(
                            frameData.position.x,
                            frameData.position.y,
                            frameData.position.z
                        );
                        this.worldFrame.localQuaternion.set(
                            frameData.localQuaternion.x,
                            frameData.localQuaternion.y,
                            frameData.localQuaternion.z,
                            frameData.localQuaternion.w
                        );
                        imported.add(frameId);
                    } else {
                        // Create new frame
                        const frame = this.createReferenceFrame(
                            frameData.name,
                            frameData.position,
                            frameData.color || this.getRandomColor(),
                            parent
                        );
                        
                        frame.localQuaternion.set(
                            frameData.localQuaternion.x,
                            frameData.localQuaternion.y,
                            frameData.localQuaternion.z,
                            frameData.localQuaternion.w
                        );
                        
                        // Update frame ID mapping
                        this.frames.delete(frame.id);
                        frame.id = frameId;
                        this.frames.set(frameId, frame);
                        
                        imported.add(frameId);
                    }
                }
            }
        }
        
        // Update transforms and UI
        this.updateFrameTransform(this.worldFrame);
        this.activeFrameId = data.activeFrame || this.worldFrame.id;
        this.updateUI();
    }

    // Slider control methods
    updateFromSlider(axis, value) {
        if (this.isUpdatingInputs) return;
        
        const frame = this.getActiveFrame();
        if (!frame) return;
        
        const degrees = parseFloat(value);
        
        // Update the value display
        document.getElementById(`rot-${axis}-value`).textContent = `${degrees}°`;
        
        // Store the base quaternion if not already stored
        if (!frame.baseQuaternion) {
            frame.baseQuaternion = frame.localQuaternion.clone();
        }
        
        // Get current rotations from sliders
        const xSlider = document.getElementById('rot-x-slider');
        const ySlider = document.getElementById('rot-y-slider');
        const zSlider = document.getElementById('rot-z-slider');
        
        const xRad = parseFloat(xSlider.value) * Math.PI / 180;
        const yRad = parseFloat(ySlider.value) * Math.PI / 180;
        const zRad = parseFloat(zSlider.value) * Math.PI / 180;
        
        // Create incremental rotations for each axis
        const deltaQuatX = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), xRad);
        const deltaQuatY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yRad);
        const deltaQuatZ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), zRad);
        
        // Combine the delta rotations (order: Z, Y, X)
        const combinedDelta = new THREE.Quaternion()
            .multiplyQuaternions(deltaQuatZ, deltaQuatY)
            .multiply(deltaQuatX);
        
        // Apply the delta rotation to the base quaternion
        frame.localQuaternion.multiplyQuaternions(frame.baseQuaternion, combinedDelta);
        
        // Update all rotation input methods
        this.updateInputsFromActiveFrame();
        this.updateFrameTransform(frame);
    }
    
    resetSliders() {
        const frame = this.getActiveFrame();
        if (!frame) return;
        
        // Reset all sliders to 0
        const sliders = ['rot-x-slider', 'rot-y-slider', 'rot-z-slider'];
        sliders.forEach(id => {
            const slider = document.getElementById(id);
            if (slider) {
                slider.value = 0;
                const axis = id.split('-')[1];
                document.getElementById(`rot-${axis}-value`).textContent = '0°';
            }
        });
        
        // Reset to base quaternion if it exists, otherwise identity
        if (frame.baseQuaternion) {
            frame.localQuaternion.copy(frame.baseQuaternion);
        } else {
            frame.localQuaternion.set(0, 0, 0, 1);
        }
        
        // Update all rotation input methods
        this.updateInputsFromActiveFrame();
        this.updateFrameTransform(frame);
    }
    
    // Set current quaternion as the new base for slider modifications
    setSliderBase() {
        const frame = this.getActiveFrame();
        if (!frame) return;
        
        // Store current quaternion as new base
        frame.baseQuaternion = frame.localQuaternion.clone();
        
        // Reset sliders to 0
        this.resetSliders();
        
        console.log(`Set new slider base for frame ${frame.name}`);
    }
    
    toggleLegend() {
        const legend = document.getElementById('visualization-legend');
        if (legend) {
            const isVisible = legend.style.display !== 'none';
            legend.style.display = isVisible ? 'none' : 'block';
        }
    }
    
    resetCamera() {
        // Reset camera to default position with Z-up orientation
        this.camera.up.set(0, 0, 1);
        this.camera.position.set(5, 5, 5);
        this.camera.lookAt(0, 0, 0);
        this.controls.object.up.set(0, 0, 1);
        this.controls.reset();
    }
    
    // Frame arrow scaling
    updateArrowScale(scale) {
        const frame = this.getActiveFrame();
        if (!frame) return;
        
        const scaleValue = parseFloat(scale);
        document.getElementById('arrow-scale-value').textContent = `${scaleValue.toFixed(1)}x`;
        
        // Update frame arrow scale
        frame.arrowScale = scaleValue;
        this.updateFrameArrowScale(frame, scaleValue);
    }
    
    updateFrameArrowScale(frame, scale) {
        // Store the current scale
        frame.arrowScale = scale;
        
        // Clear existing visuals (but preserve attached object)
        const attachedObject = frame.attachedObject;
        const group = frame.group;
        
        // Remove all children except the attached object
        const childrenToRemove = [];
        group.children.forEach(child => {
            if (child !== attachedObject) {
                childrenToRemove.push(child);
            }
        });
        
        childrenToRemove.forEach(child => {
            group.remove(child);
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(mat => mat.dispose());
                } else {
                    child.material.dispose();
                }
            }
        });
        
        // Recreate visuals with new scale
        this.createFrameVisuals(frame);
        
        // Scale the attached object if it exists
        if (attachedObject) {
            attachedObject.scale.setScalar(scale);
        }
        
        // Update transform to maintain position
        this.updateFrameTransform(frame);
    }
    
    // Frame renaming
    renameActiveFrame(newName) {
        const frame = this.getActiveFrame();
        if (!frame || !newName.trim()) return;
        
        const trimmedName = newName.trim();
        if (trimmedName === frame.name) return;
        
        // Update frame name
        frame.name = trimmedName;
        
        // Update UI
        document.getElementById('active-frame-name').textContent = trimmedName;
        this.updateFrameList();
        
        // Update frame label in 3D scene
        this.updateFrameLabel(frame);
    }
    
    updateFrameLabel(frame) {
        // Remove existing label
        const existingLabel = frame.group.children.find(child => child.userData?.isLabel);
        if (existingLabel) {
            frame.group.remove(existingLabel);
        }
        
        // Create new label if not world frame
        if (frame.name !== 'World') {
            this.createFrameLabel(frame, frame.group);
        }
    }
    
    // Insert frame between current frame and its parent
    showInsertFrameDialog() {
        const activeFrame = this.getActiveFrame();
        if (!activeFrame || !activeFrame.parentFrame) {
            alert('Cannot insert parent frame for World frame or frames without parents.');
            return;
        }
        
        const frameName = prompt('Enter name for the new parent frame:', 'Intermediate');
        if (!frameName) return;
        
        this.insertParentFrame(activeFrame, frameName.trim());
    }
    
    insertParentFrame(childFrame, newFrameName) {
        const originalParent = childFrame.parentFrame;
        if (!originalParent) return;
        
        // Create new intermediate frame
        const intermediateFrame = {
            id: `frame_${this.frameCounter++}`,
            name: newFrameName,
            parentFrame: originalParent,
            children: [childFrame],
            position: new THREE.Vector3().copy(childFrame.position),
            localQuaternion: new THREE.Quaternion().copy(childFrame.localQuaternion),
            group: new THREE.Group(),
            color: this.getRandomColor(),
            arrowScale: 1.0
        };
        
        // Update parent-child relationships
        const childIndex = originalParent.children.indexOf(childFrame);
        if (childIndex !== -1) {
            originalParent.children[childIndex] = intermediateFrame;
        }
        childFrame.parentFrame = intermediateFrame;
        
        // Reset child frame's transform (it inherits parent's transform now)
        childFrame.position.set(0, 0, 0);
        childFrame.localQuaternion.set(0, 0, 0, 1);
        
        // Add to scene
        originalParent.group.add(intermediateFrame.group);
        intermediateFrame.group.add(childFrame.group);
        
        // Create visuals and update transforms
        this.createFrameVisuals(intermediateFrame);
        this.frames.set(intermediateFrame.id, intermediateFrame);
        
        // Update transforms
        this.updateFrameTransform(originalParent);
        
        // Select the new intermediate frame
        this.activeFrameId = intermediateFrame.id;
        this.updateUI();
        
        console.log(`✅ Inserted frame "${newFrameName}" between "${originalParent.name}" and "${childFrame.name}"`);
    }
    
    // Object attachment methods
    addPhoneObject() {
        const frame = this.getActiveFrame();
        if (!frame) return;
        
        // Remove existing object if any
        this.removeFrameObject();
        
        // Create phone-like object (iPhone-style)
        const phoneGroup = new THREE.Group();
        
        // Main body with rounded edges
        const bodyGeometry = new THREE.BoxGeometry(0.75, 1.55, 0.08);
        // Round the edges by using a cylinder for the sides
        const cornerRadius = 0.08;
        
        // Create rounded rectangle using CSG-like approach with multiple geometries
        const bodyMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x1a1a1a,
            shininess: 100,
            transparent: true,
            opacity: 0.9
        });
        const phoneBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
        phoneGroup.add(phoneBody);
        
        // Screen (slightly recessed)
        const screenGeometry = new THREE.PlaneGeometry(0.65, 1.4);
        const screenMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x000000,
            shininess: 200
        });
        const screen = new THREE.Mesh(screenGeometry, screenMaterial);
        screen.position.z = 0.035;
        phoneGroup.add(screen);
        
        // Screen content (simulated)
        const contentGeometry = new THREE.PlaneGeometry(0.6, 1.3);
        const contentMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x2c3e50,
            transparent: true,
            opacity: 0.7
        });
        const screenContent = new THREE.Mesh(contentGeometry, contentMaterial);
        screenContent.position.z = 0.036;
        phoneGroup.add(screenContent);
        
        // Home button
        const buttonGeometry = new THREE.CircleGeometry(0.04, 16);
        const buttonMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x333333,
            shininess: 50
        });
        const homeButton = new THREE.Mesh(buttonGeometry, buttonMaterial);
        homeButton.position.set(0, -0.65, 0.035);
        phoneGroup.add(homeButton);
        
        // Camera (small circle at top)
        const cameraGeometry = new THREE.CircleGeometry(0.02, 12);
        const cameraMaterial = new THREE.MeshPhongMaterial({ color: 0x111111 });
        const camera = new THREE.Mesh(cameraGeometry, cameraMaterial);
        camera.position.set(0, 0.7, 0.035);
        phoneGroup.add(camera);
        
        // Speaker grille (small rectangles)
        for (let i = -2; i <= 2; i++) {
            const grillGeometry = new THREE.PlaneGeometry(0.03, 0.003);
            const grillMaterial = new THREE.MeshPhongMaterial({ color: 0x222222 });
            const grille = new THREE.Mesh(grillGeometry, grillMaterial);
            grille.position.set(i * 0.04, 0.6, 0.035);
            phoneGroup.add(grille);
        }
        
        // Apply current arrow scale to the phone
        phoneGroup.scale.setScalar(frame.arrowScale || 1.0);
        
        // Add to frame
        frame.group.add(phoneGroup);
        frame.attachedObject = phoneGroup;
        
        console.log(`📱 Added phone object to frame ${frame.name}`);
    }
    
    addCubeObject() {
        const frame = this.getActiveFrame();
        if (!frame) return;
        
        this.removeFrameObject();
        
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshPhongMaterial({ 
            color: 0xe74c3c,
            transparent: true,
            opacity: 0.8,
            shininess: 100
        });
        const cube = new THREE.Mesh(geometry, material);
        
        // Add wireframe overlay
        const wireframeGeometry = new THREE.EdgesGeometry(geometry);
        const wireframeMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.3, transparent: true });
        const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
        cube.add(wireframe);
        
        // Apply current arrow scale to the cube
        cube.scale.setScalar(frame.arrowScale || 1.0);
        
        frame.group.add(cube);
        frame.attachedObject = cube;
        
        console.log(`📦 Added cube object to frame ${frame.name}`);
    }
    
    addPlaneObject() {
        const frame = this.getActiveFrame();
        if (!frame) return;
        
        this.removeFrameObject();
        
        // Create a more interesting plane - like a tablet/screen
        const planeGroup = new THREE.Group();
        
        // Main plane
        const geometry = new THREE.PlaneGeometry(2, 1.5);
        const material = new THREE.MeshPhongMaterial({ 
            color: 0x2c3e50,
            side: THREE.DoubleSide,
            shininess: 100
        });
        const plane = new THREE.Mesh(geometry, material);
        planeGroup.add(plane);
        
        // Border/bezel
        const borderGeometry = new THREE.PlaneGeometry(2.1, 1.6);
        const borderMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x34495e,
            side: THREE.DoubleSide
        });
        const border = new THREE.Mesh(borderGeometry, borderMaterial);
        border.position.z = -0.01;
        planeGroup.add(border);
        
        // Screen grid pattern
        for (let x = -0.8; x <= 0.8; x += 0.4) {
            for (let y = -0.6; y <= 0.6; y += 0.3) {
                const dotGeometry = new THREE.CircleGeometry(0.02, 8);
                const dotMaterial = new THREE.MeshPhongMaterial({ 
                    color: 0x3498db,
                    transparent: true,
                    opacity: 0.6
                });
                const dot = new THREE.Mesh(dotGeometry, dotMaterial);
                dot.position.set(x, y, 0.001);
                planeGroup.add(dot);
            }
        }
        
        // Apply current arrow scale to the plane
        planeGroup.scale.setScalar(frame.arrowScale || 1.0);
        
        frame.group.add(planeGroup);
        frame.attachedObject = planeGroup;
        
        console.log(`📄 Added plane object to frame ${frame.name}`);
    }
    
    // Add a new tablet object
    addTabletObject() {
        const frame = this.getActiveFrame();
        if (!frame) return;
        
        this.removeFrameObject();
        
        const tabletGroup = new THREE.Group();
        
        // Main body
        const bodyGeometry = new THREE.BoxGeometry(1.6, 2.4, 0.08);
        const bodyMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x2c3e50,
            shininess: 100
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        tabletGroup.add(body);
        
        // Screen
        const screenGeometry = new THREE.PlaneGeometry(1.4, 2.1);
        const screenMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x000000,
            shininess: 200
        });
        const screen = new THREE.Mesh(screenGeometry, screenMaterial);
        screen.position.z = 0.041;
        tabletGroup.add(screen);
        
        // Home button
        const buttonGeometry = new THREE.CircleGeometry(0.05, 16);
        const buttonMaterial = new THREE.MeshPhongMaterial({ color: 0x34495e });
        const homeButton = new THREE.Mesh(buttonGeometry, buttonMaterial);
        homeButton.position.set(0, -1.1, 0.041);
        tabletGroup.add(homeButton);
        
        // Apply current arrow scale to the tablet
        tabletGroup.scale.setScalar(frame.arrowScale || 1.0);
        
        frame.group.add(tabletGroup);
        frame.attachedObject = tabletGroup;
        
        console.log(`📱 Added tablet object to frame ${frame.name}`);
    }
    
    removeFrameObject() {
        const frame = this.getActiveFrame();
        if (!frame || !frame.attachedObject) return;
        
        // Remove from scene
        frame.group.remove(frame.attachedObject);
        
        // Dispose of geometry and material to free memory
        if (frame.attachedObject.geometry) {
            frame.attachedObject.geometry.dispose();
        }
        if (frame.attachedObject.material) {
            if (Array.isArray(frame.attachedObject.material)) {
                frame.attachedObject.material.forEach(mat => mat.dispose());
            } else {
                frame.attachedObject.material.dispose();
            }
        }
        
        // Handle groups (like phone object)
        if (frame.attachedObject.children) {
            frame.attachedObject.children.forEach(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(mat => mat.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
        }
        
        frame.attachedObject = null;
        console.log(`🗑️ Removed object from frame ${frame.name}`);
    }
    
    loadMeshFile(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const frame = this.getActiveFrame();
        if (!frame) return;
        
        console.log(`📁 Loading mesh file: ${file.name}`);
        
        // Remove existing object
        this.removeFrameObject();
        
        const fileName = file.name.toLowerCase();
        
        if (fileName.endsWith('.glb') || fileName.endsWith('.gltf')) {
            this.loadGLTFModel(file, frame);
        } else {
            alert('Currently only GLTF/GLB files are supported. Please use a .glb or .gltf file.');
        }
    }

    loadColmapFile(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const frame = this.getActiveFrame();
        if (!frame) return;
        
        console.log(`🗂️ Loading COLMAP file: ${file.name}`);
        
        // Remove existing object
        this.removeFrameObject();
        
        const fileName = file.name.toLowerCase();
        
        if (fileName.includes('points3d') || fileName.endsWith('.txt') || fileName.endsWith('.bin')) {
            this.loadColmapModel(file, frame);
        } else {
            alert('Please select a COLMAP points3D.txt or points3D.bin file.');
        }
        
        // Clear the file input
        event.target.value = '';
    }
    
    loadGLTFModel(file, frame) {
        const loader = new GLTFLoader();
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const arrayBuffer = e.target.result;
                loader.parse(arrayBuffer, '', (gltf) => {
                    console.log('✅ GLTF model loaded successfully');
                    
                    const model = gltf.scene;
                    
                    // Scale the model to a reasonable size (optional)
                    const box = new THREE.Box3().setFromObject(model);
                    const size = box.getSize(new THREE.Vector3());
                    const maxDimension = Math.max(size.x, size.y, size.z);
                    
                    if (maxDimension > 3) {
                        const scale = 3 / maxDimension;
                        model.scale.setScalar(scale);
                    }
                    
                    // Apply additional scaling based on frame arrow scale
                    const currentScale = model.scale.x;
                    const frameScale = frame.arrowScale || 1.0;
                    model.scale.setScalar(currentScale * frameScale);
                    
                    // Center the model
                    box.setFromObject(model);
                    const center = box.getCenter(new THREE.Vector3());
                    model.position.sub(center);
                    
                    // Add to frame
                    frame.group.add(model);
                    frame.attachedObject = model;
                    
                    console.log(`📱 Added GLTF model to frame ${frame.name}`);
                }, (error) => {
                    console.error('Error loading GLTF model:', error);
                    alert('Error loading 3D model. Please check the file format.');
                });
            } catch (error) {
                console.error('Error parsing GLTF file:', error);
                alert('Error parsing 3D model file.');
            }
        };
        
        reader.onerror = () => {
            console.error('Error reading file');
            alert('Error reading the file.');
        };
        
        reader.readAsArrayBuffer(file);
    }

    async loadColmapModel(file, frame) {
        try {
            let points3D = [];
            
            // Detect file format and parse accordingly
            if (file.name.includes('points3D.txt') || file.name.endsWith('.txt')) {
                const text = await file.text();
                points3D = this.parseColmapTextPoints(text);
            } else if (file.name.includes('points3D.bin') || file.name.endsWith('.bin')) {
                const arrayBuffer = await file.arrayBuffer();
                points3D = this.parseColmapBinaryPoints(arrayBuffer);
            } else {
                // Try to auto-detect format by reading first few bytes
                const arrayBuffer = await file.arrayBuffer();
                const firstBytes = new Uint8Array(arrayBuffer.slice(0, 100));
                const firstBytesStr = String.fromCharCode.apply(null, firstBytes);
                
                if (firstBytesStr.includes('# 3D point list') || firstBytesStr.includes('#')) {
                    // Looks like text format
                    const text = new TextDecoder().decode(arrayBuffer);
                    points3D = this.parseColmapTextPoints(text);
                } else {
                    // Assume binary format
                    points3D = this.parseColmapBinaryPoints(arrayBuffer);
                }
            }
            
            if (points3D.length === 0) {
                alert('No valid 3D points found in the file. Please check the format.');
                return;
            }
            
            // Create point cloud
            const pointCloud = this.createPointCloud(points3D, frame);
            
            // Apply current arrow scale
            pointCloud.scale.setScalar(frame.arrowScale || 1.0);
            
            // Add to frame
            frame.group.add(pointCloud);
            frame.attachedObject = pointCloud;
            
            console.log(`🗂️ Added ${points3D.length} COLMAP points to frame ${frame.name}`);
            
        } catch (error) {
            console.error('Error loading COLMAP model:', error);
            alert('Error loading COLMAP model. Please check the file format.');
        }
    }

    parseColmapTextPoints(text) {
        const lines = text.split('\n');
        const points = [];
        
        for (let line of lines) {
            line = line.trim();
            
            // Skip comments and empty lines
            if (line.startsWith('#') || line.length === 0) {
                continue;
            }
            
            // Parse point line: POINT3D_ID X Y Z R G B ERROR TRACK[] as (IMAGE_ID, POINT2D_IDX)
            const parts = line.split(/\s+/);
            if (parts.length >= 7) {
                const point = {
                    id: parseInt(parts[0]),
                    x: parseFloat(parts[1]),
                    y: parseFloat(parts[2]),
                    z: parseFloat(parts[3]),
                    r: parseInt(parts[4]) / 255.0,
                    g: parseInt(parts[5]) / 255.0,
                    b: parseInt(parts[6]) / 255.0,
                    error: parseFloat(parts[7]) || 0
                };
                
                // Only include points with reasonable coordinates
                if (isFinite(point.x) && isFinite(point.y) && isFinite(point.z)) {
                    points.push(point);
                }
            }
        }
        
        return points;
    }

    parseColmapBinaryPoints(arrayBuffer) {
        const points = [];
        const dataView = new DataView(arrayBuffer);
        let offset = 0;
        
        try {
            // Read number of points (uint64, but we'll treat as uint32 for JavaScript)
            const numPoints = dataView.getUint32(offset, true); // little-endian
            offset += 8; // Skip 8 bytes for uint64
            
            console.log(`📊 Reading ${numPoints} points from binary COLMAP file`);
            
            for (let i = 0; i < numPoints; i++) {
                if (offset + 43 > arrayBuffer.byteLength) {
                    console.warn(`⚠️ Unexpected end of file at point ${i}`);
                    break;
                }
                
                // Read point data according to COLMAP binary format
                const pointId = dataView.getUint32(offset, true); // POINT3D_ID (uint64, read as uint32)
                offset += 8; // Skip 8 bytes for uint64
                
                const x = dataView.getFloat64(offset, true); // X coordinate
                offset += 8;
                const y = dataView.getFloat64(offset, true); // Y coordinate  
                offset += 8;
                const z = dataView.getFloat64(offset, true); // Z coordinate
                offset += 8;
                
                const r = dataView.getUint8(offset); // Red
                offset += 1;
                const g = dataView.getUint8(offset); // Green
                offset += 1;
                const b = dataView.getUint8(offset); // Blue
                offset += 1;
                
                const error = dataView.getFloat64(offset, true); // Error
                offset += 8;
                
                // Read track length
                const trackLength = dataView.getUint32(offset, true); // TRACK length (uint64, read as uint32)
                offset += 8;
                
                // Skip track data (each track element is 2 * uint32 = 8 bytes)
                offset += trackLength * 8;
                
                // Create point object
                const point = {
                    id: pointId,
                    x: x,
                    y: y,
                    z: z,
                    r: r / 255.0,
                    g: g / 255.0,
                    b: b / 255.0,
                    error: error
                };
                
                // Only include points with reasonable coordinates
                if (isFinite(point.x) && isFinite(point.y) && isFinite(point.z)) {
                    points.push(point);
                }
                
                // Progress logging for large files
                if (i > 0 && i % 10000 === 0) {
                    console.log(`📊 Processed ${i}/${numPoints} points...`);
                }
            }
            
            console.log(`✅ Successfully parsed ${points.length} points from binary COLMAP file`);
            
        } catch (error) {
            console.error('Error parsing binary COLMAP file:', error);
            throw new Error('Invalid COLMAP binary file format');
        }
        
        return points;
    }

    createPointCloud(points, frame) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(points.length * 3);
        const colors = new Float32Array(points.length * 3);
        
        // Calculate bounds for auto-scaling
        let minX = Infinity, minY = Infinity, minZ = Infinity;
        let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
        
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            
            // Positions
            positions[i * 3] = point.x;
            positions[i * 3 + 1] = point.y;
            positions[i * 3 + 2] = point.z;
            
            // Colors
            colors[i * 3] = point.r;
            colors[i * 3 + 1] = point.g;
            colors[i * 3 + 2] = point.b;
            
            // Update bounds
            minX = Math.min(minX, point.x);
            minY = Math.min(minY, point.y);
            minZ = Math.min(minZ, point.z);
            maxX = Math.max(maxX, point.x);
            maxY = Math.max(maxY, point.y);
            maxZ = Math.max(maxZ, point.z);
        }
        
        // Center and scale the point cloud
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        const centerZ = (minZ + maxZ) / 2;
        
        const sizeX = maxX - minX;
        const sizeY = maxY - minY;
        const sizeZ = maxZ - minZ;
        const maxSize = Math.max(sizeX, sizeY, sizeZ);
        
        // Scale to fit within a reasonable size (e.g., 4 units)
        const scale = maxSize > 0 ? 4.0 / maxSize : 1.0;
        
        for (let i = 0; i < points.length; i++) {
            positions[i * 3] = (positions[i * 3] - centerX) * scale;
            positions[i * 3 + 1] = (positions[i * 3 + 1] - centerY) * scale;
            positions[i * 3 + 2] = (positions[i * 3 + 2] - centerZ) * scale;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        // Create point cloud material
        const material = new THREE.PointsMaterial({
            size: 0.02,
            vertexColors: true,
            sizeAttenuation: true
        });
        
        const pointCloud = new THREE.Points(geometry, material);
        pointCloud.name = 'COLMAP_Points';
        
        return pointCloud;
    }
    
    // Generate and download sample models
    createSamplePhone() {
        const frame = this.getActiveFrame();
        if (!frame) return;
        
        // Remove existing object
        this.removeFrameObject();
        
        // Create a more detailed phone model
        const phoneGroup = new THREE.Group();
        
        // Main body
        const bodyGeometry = new THREE.RoundedBoxGeometry ? 
            new THREE.RoundedBoxGeometry(0.75, 1.55, 0.08, 5, 0.02) :
            new THREE.BoxGeometry(0.75, 1.55, 0.08);
        const bodyMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x1a1a1a,
            shininess: 100
        });
        const phoneBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
        phoneGroup.add(phoneBody);
        
        // Screen with reflection
        const screenGeometry = new THREE.PlaneGeometry(0.65, 1.35);
        const screenMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x000000,
            shininess: 300,
            transparent: true,
            opacity: 0.9
        });
        const screen = new THREE.Mesh(screenGeometry, screenMaterial);
        screen.position.z = 0.041;
        phoneGroup.add(screen);
        
        // Screen glow effect
        const glowGeometry = new THREE.PlaneGeometry(0.63, 1.33);
        const glowMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x4a90e2,
            transparent: true,
            opacity: 0.1
        });
        const screenGlow = new THREE.Mesh(glowGeometry, glowMaterial);
        screenGlow.position.z = 0.042;
        phoneGroup.add(screenGlow);
        
        // Camera bump
        const cameraGeometry = new THREE.CylinderGeometry(0.025, 0.025, 0.01, 16);
        const cameraMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x333333,
            shininess: 200
        });
        const camera = new THREE.Mesh(cameraGeometry, cameraMaterial);
        camera.rotation.x = Math.PI / 2;
        camera.position.set(-0.25, 0.65, 0.045);
        phoneGroup.add(camera);
        
        // Camera lens
        const lensGeometry = new THREE.CylinderGeometry(0.015, 0.015, 0.005, 16);
        const lensMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x111111,
            shininess: 500
        });
        const lens = new THREE.Mesh(lensGeometry, lensMaterial);
        lens.rotation.x = Math.PI / 2;
        lens.position.set(-0.25, 0.65, 0.05);
        phoneGroup.add(lens);
        
        // Speaker grille
        const grilleMaterial = new THREE.MeshPhongMaterial({ color: 0x222222 });
        for (let i = -3; i <= 3; i++) {
            const grillGeometry = new THREE.CylinderGeometry(0.005, 0.005, 0.01, 8);
            const grille = new THREE.Mesh(grillGeometry, grilleMaterial);
            grille.rotation.x = Math.PI / 2;
            grille.position.set(i * 0.02, 0.7, 0.045);
            phoneGroup.add(grille);
        }
        
        // Home button with ring
        const buttonGeometry = new THREE.CylinderGeometry(0.035, 0.035, 0.005, 16);
        const buttonMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x2c3e50,
            shininess: 100
        });
        const homeButton = new THREE.Mesh(buttonGeometry, buttonMaterial);
        homeButton.rotation.x = Math.PI / 2;
        homeButton.position.set(0, -0.65, 0.043);
        phoneGroup.add(homeButton);
        
        // Button ring
        const ringGeometry = new THREE.RingGeometry(0.035, 0.04, 16);
        const ringMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x34495e,
            shininess: 200
        });
        const buttonRing = new THREE.Mesh(ringGeometry, ringMaterial);
        buttonRing.position.set(0, -0.65, 0.041);
        phoneGroup.add(buttonRing);
        
        // Add to frame
        frame.group.add(phoneGroup);
        frame.attachedObject = phoneGroup;
        
        console.log(`📱 Added detailed phone model to frame ${frame.name}`);
    }
    
    // Create a sample colored plane for testing
    createSamplePlane() {
        const frame = this.getActiveFrame();
        if (!frame) return;
        
        this.removeFrameObject();
        
        // Create a colorful test pattern plane
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Create a gradient background
        const gradient = ctx.createLinearGradient(0, 0, 512, 512);
        gradient.addColorStop(0, '#3498db');
        gradient.addColorStop(0.5, '#e74c3c');
        gradient.addColorStop(1, '#f39c12');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);
        
        // Add a grid pattern
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 512; i += 64) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, 512);
            ctx.moveTo(0, i);
            ctx.lineTo(512, i);
            ctx.stroke();
        }
        
        // Add text
        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Test Pattern', 256, 256);
        
        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        
        const geometry = new THREE.PlaneGeometry(2, 2);
        const material = new THREE.MeshPhongMaterial({ 
            map: texture,
            side: THREE.DoubleSide,
            shininess: 50
        });
        const plane = new THREE.Mesh(geometry, material);
        
        frame.group.add(plane);
        frame.attachedObject = plane;
        
        console.log(`📄 Added textured plane to frame ${frame.name}`);
    }
    
    // Update slider values when switching frames or updating rotations
    updateSliders(frame) {
        if (this.isUpdatingInputs) return;
        
        // Reset sliders to 0 when switching frames (since sliders represent delta from base)
        const sliders = ['rot-x-slider', 'rot-y-slider', 'rot-z-slider'];
        sliders.forEach(id => {
            const slider = document.getElementById(id);
            if (slider) {
                slider.value = 0;
                const axis = id.split('-')[1];
                document.getElementById(`rot-${axis}-value`).textContent = '0°';
            }
        });
        
        // Set base quaternion to current quaternion when switching frames
        frame.baseQuaternion = frame.localQuaternion.clone();
    }
}
