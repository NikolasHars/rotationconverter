/**
 * Modern 3D Rotation Converter with Hierarchical Reference Frames
 * Author: Enhanced by AI Assistant
 * License: MIT
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

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
        this.scene.background = new THREE.Color(0x1a1a1a);
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
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
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // Grid
        const gridHelper = new THREE.GridHelper(10, 10, 0x444444, 0x222222);
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
        
        // Quaternion inputs
        ['q0', 'q1', 'q2', 'q3'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', () => this.updateFromQuaternion());
            }
        });
        
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
            
            // Visual representation
            group: new THREE.Group(),
            color: color,
            
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
        
        // Create coordinate axes
        const axisLength = frame.parentFrame ? 1.5 : 2.0;
        const axisWidth = frame.parentFrame ? 0.02 : 0.03;
        
        // X-axis (red)
        const xGeometry = new THREE.CylinderGeometry(axisWidth, axisWidth, axisLength, 8);
        const xMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
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
        const yMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
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
        const zMaterial = new THREE.MeshLambertMaterial({ color: 0x0000ff });
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
        const originMaterial = new THREE.MeshLambertMaterial({ 
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
        
        // Calculate world transform
        if (frame.parentFrame) {
            // Child frame: combine parent's world transform with local transform
            frame.quaternion.multiplyQuaternions(frame.parentFrame.quaternion, frame.localQuaternion);
            
            // Transform local position by parent's rotation and add to parent's position
            const rotatedPosition = frame.position.clone().applyQuaternion(frame.parentFrame.quaternion);
            frame.group.position.copy(frame.parentFrame.group.position).add(rotatedPosition);
        } else {
            // World frame: use local transform directly
            frame.quaternion.copy(frame.localQuaternion);
            frame.group.position.copy(frame.position);
        }
        
        // Apply rotation to group
        frame.group.quaternion.copy(frame.quaternion);
        
        // Update all children
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
    
    removeFrame(frameId) {
        console.log(`🗑️ Removing frame: ${frameId}`);
        
        const frame = this.frames.get(frameId);
        if (!frame || frame === this.worldFrame) {
            console.error('Cannot remove world frame or frame not found');
            return;
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
            
            // Update quaternion inputs
            const qInputs = ['q0', 'q1', 'q2', 'q3'];
            [frame.localQuaternion.x, frame.localQuaternion.y, frame.localQuaternion.z, frame.localQuaternion.w]
                .forEach((value, i) => {
                    const input = document.getElementById(qInputs[i]);
                    if (input) input.value = value.toFixed(6);
                });
            
            // Update euler inputs
            const euler = new THREE.Euler().setFromQuaternion(frame.localQuaternion, 'XYZ');
            const eulerInputs = ['euler-x', 'euler-y', 'euler-z'];
            [euler.x, euler.y, euler.z].forEach((value, i) => {
                const input = document.getElementById(eulerInputs[i]);
                if (input) input.value = value.toFixed(6);
            });
            
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
            const worldPos = frame.group.position;
            worldPosOutput.textContent = `[${worldPos.x.toFixed(6)}, ${worldPos.y.toFixed(6)}, ${worldPos.z.toFixed(6)}]`;
        }
        
        const worldQuatOutput = document.getElementById('world-quaternion-output');
        if (worldQuatOutput) {
            const worldQuat = frame.quaternion;
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
        
        const robotBase = this.addFrame('Robot Base', this.worldFrame.id);
        const arm1 = this.addFrame('Arm 1', robotBase.id);
        const arm2 = this.addFrame('Arm 2', arm1.id);
        const endEffector = this.addFrame('End Effector', arm2.id);
        
        // Set some demo positions and rotations
        robotBase.position.set(0, 1, 0);
        arm1.position.set(2, 0, 0);
        arm1.localQuaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 4);
        arm2.position.set(1.5, 0, 0);
        endEffector.position.set(1, 0, 0);
        
        this.updateFrameTransform(this.worldFrame);
        this.updateUI();
        
        console.log('✅ Demo hierarchy created');
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
        
        return {
            position: frame.group.position.clone(),
            quaternion: frame.quaternion.clone()
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
}
