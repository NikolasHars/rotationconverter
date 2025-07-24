/**
 * UI Components for 3D Rotation Converter
 */

export function createInputPanel() {
    return `
        <div class="pane                    </div>
                </div>
                
                <!-- Rotation Input Methods --><div class="panel-header">
                <h2 class="panel-title">Input Controls</h2>
            </div>
            
            <!-- Frame Management -->
            <div class="frame-management">
                <h3>Reference Frames</h3>
                
                <div class="form-group">
                    <label>Active Frame:</label>
                    <div id="active-frame-display" class="active-frame-display">
                        <span id="active-frame-name">World</span>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="frame-name-input">Frame Name:</label>
                    <input type="text" id="frame-name-input" class="form-control" 
                           placeholder="Enter frame name" 
                           onchange="rotationConverter.renameActiveFrame(this.value)"
                           data-tooltip="Rename the current frame">
                </div>
                
                <div class="form-group">
                    <label for="arrow-scale-input">Arrow Scale:</label>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <input type="range" id="arrow-scale-input" class="form-control" 
                               min="0.1" max="3.0" value="1.0" step="0.1"
                               oninput="rotationConverter.updateArrowScale(this.value)"
                               data-tooltip="Adjust the size of coordinate frame arrows"
                               style="flex: 1;">
                        <span id="arrow-scale-value" class="slider-value" style="min-width: 40px;">1.0x</span>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Attach Object:</label>
                    <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
                        <button class="btn btn-secondary btn-sm" onclick="rotationConverter.createSamplePhone()" data-tooltip="Add a detailed phone model">
                            📱 Phone+
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="rotationConverter.addTabletObject()" data-tooltip="Add a tablet-like object">
                            📋 Tablet
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="rotationConverter.createSamplePlane()" data-tooltip="Add a textured test plane">
                            🎨 Test Plane
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="rotationConverter.addCubeObject()" data-tooltip="Add a cube object">
                            � Cube
                        </button>
                        <button class="btn btn-warning btn-sm" onclick="rotationConverter.removeFrameObject()" data-tooltip="Remove attached object">
                            🗑️ Remove
                        </button>
                    </div>
                    <input type="file" id="mesh-file-input" accept=".glb,.gltf" style="display: none;" onchange="rotationConverter.loadMeshFile(event)">
                    <button class="btn btn-info btn-sm" onclick="document.getElementById('mesh-file-input').click()" data-tooltip="Load GLTF/GLB 3D model file" style="margin-top: 0.5rem;">
                        📁 Load 3D Model (.glb/.gltf)
                    </button>
                    <input type="file" id="colmap-file-input" accept=".txt,.bin" style="display: none;" onchange="rotationConverter.loadColmapFile(event)">
                    <button class="btn btn-info btn-sm" onclick="document.getElementById('colmap-file-input').click()" data-tooltip="Load COLMAP points3D files or simple XYZ RGB text files" style="margin-top: 0.5rem;">
                        🗂️ Load Point Cloud (.txt/.bin)
                    </button>
                </div>
                
                <!-- Point Cloud Alignment Controls (shown when COLMAP points are loaded) -->
                <div class="form-group" id="colmap-alignment-controls" style="display: none;">
                    <label>Point Cloud Alignment:</label>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem; margin-bottom: 0.5rem;">
                        <button class="btn btn-secondary btn-sm" onclick="rotationConverter.centerColmapPoints()" data-tooltip="Center point cloud at frame origin">
                            🎯 Center at Origin
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="rotationConverter.resetColmapPoints()" data-tooltip="Reset to original COLMAP positions">
                            🔄 Reset Position
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="rotationConverter.flipColmapZ()" data-tooltip="Flip Z-axis (common for coordinate system differences)">
                            ↕️ Flip Z
                        </button>
                    </div>
                    <div style="display: grid; grid-template-columns: auto 1fr; gap: 0.5rem; align-items: center;">
                        <label style="font-size: 0.9rem;">Point Size:</label>
                        <input type="range" id="colmap-point-size" min="0.005" max="0.1" step="0.005" value="0.03" 
                               oninput="rotationConverter.updateColmapPointSize(this.value)"
                               data-tooltip="Adjust point cloud point size">
                    </div>
                </div>
                
                <div class="frame-controls">
                    <button class="btn btn-primary btn-sm" onclick="rotationConverter.addFrame(prompt('Frame name:') || 'New Frame')">
                        ➕ Add Frame
                    </button>
                    <button class="btn btn-success btn-sm" onclick="rotationConverter.addChildFrame()">
                        🌿 Add Child Frame
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="rotationConverter.showInsertFrameDialog()">
                        🔄 Insert Parent
                    </button>
                    <button class="btn btn-warning btn-sm" onclick="rotationConverter.removeActiveFrame()">
                        🗑️ Remove Frame
                    </button>
                </div>
                
                <!-- Frame Visibility Controls -->
                <div class="form-group">
                    <label>Visibility Controls:</label>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 0.5rem;">
                        <button class="btn btn-secondary btn-sm" onclick="rotationConverter.toggleFrameVisibility()" data-tooltip="Toggle all coordinate frame axes">
                            👁️ All Frames
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="rotationConverter.toggleChildrenVisibility()" data-tooltip="Toggle child frame axes only">
                            👶 Children
                        </button>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 0.5rem;">
                        <button class="btn btn-info btn-sm" onclick="rotationConverter.toggleActiveFrameVisibility()" data-tooltip="Toggle visibility of current active frame only">
                            🎯 Active Frame
                        </button>
                        <button class="btn btn-info btn-sm" onclick="rotationConverter.showKeyboardHelp()" data-tooltip="Show keyboard control shortcuts">
                            ⌨️ Controls
                        </button>
                    </div>
                </div>
                
                <div class="frame-controls">
                    <label>Frame Visibility:</label>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                        <button class="btn btn-secondary btn-sm" onclick="rotationConverter.toggleFrameVisibility()" data-tooltip="Hide/show coordinate axes for all frames">
                            👁️ Toggle Frames
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="rotationConverter.toggleChildrenVisibility()" data-tooltip="Hide/show only child frame axes (keep objects visible)">
                            👶 Toggle Children
                        </button>
                    </div>
                </div>
                
                <!-- Camera Controls -->
                <div class="form-group">
                    <label>Camera Controls:</label>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 0.5rem;">
                        <button class="btn btn-info btn-sm" onclick="rotationConverter.resetCameraToOrigin()" data-tooltip="Reset camera to origin view (or press R)">
                            📷 Reset Camera
                        </button>
                        <button class="btn btn-info btn-sm" onclick="rotationConverter.showKeyboardHelp()" data-tooltip="Show keyboard shortcuts">
                            ⌨️ Controls Help
                        </button>
                    </div>
                    <div style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4;">
                        <strong>Keyboard:</strong> Arrow keys/WASD = move, Q/E = up/down, R = reset
                    </div>
                </div>
                
                <div class="frame-controls">
                    <button class="btn btn-secondary btn-sm" onclick="rotationConverter.createDemoHierarchy()">
                        🎯 Demo Hierarchy
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="rotationConverter.clearAllFrames()">
                        🧹 Clear All
                    </button>
                </div>
                
                <div class="frame-controls">
                    <input type="file" id="import-file" accept=".json" style="display: none;" onchange="handleImport(event)">
                    <button class="btn btn-secondary btn-sm" onclick="document.getElementById('import-file').click()">
                        📂 Import JSON
                    </button>
                    <button class="btn btn-success btn-sm" onclick="downloadFrameHierarchy()">
                        💾 Export JSON
                    </button>
                </div>
                
                <div class="frame-hierarchy">
                    <div id="frame-list" class="frame-tree">
                        <!-- Frame tree will be populated here -->
                    </div>
                </div>
            </div>
            
            <!-- Position Controls -->
            <div class="input-section">
                <h3>Position</h3>
                <div class="vector-inputs position with-label">
                    <span class="input-label">X</span>
                    <input type="number" id="position-x" class="form-control" 
                           value="0" step="0.1" data-tooltip="X position in parent frame">
                    <span class="input-label">Y</span>
                    <input type="number" id="position-y" class="form-control" 
                           value="0" step="0.1" data-tooltip="Y position in parent frame">
                    <span class="input-label">Z</span>
                    <input type="number" id="position-z" class="form-control" 
                           value="0" step="0.1" data-tooltip="Z position in parent frame">
                </div>
            </div>

            <!-- Quaternion Input -->
            <div class="input-section highlighted" data-input-type="quaternion">
                <h3>Quaternion</h3>
                <div class="form-group">
                    <label for="quaternion-text">Quick Input (paste quaternion):</label>
                    <input type="text" id="quaternion-text" class="form-control" 
                           placeholder="e.g., 0.707 0 0 0.707 or [0.707, 0, 0, 0.707]" 
                           onchange="rotationConverter.updateFromQuaternionText()"
                           data-tooltip="Paste quaternion as: 'x y z w' or '[x, y, z, w]'">
                </div>
                <div class="vector-inputs with-label">
                    <span class="input-label">x</span>
                    <input type="number" id="q0" class="rotation-input" value="0" step="0.000001" data-tooltip="Quaternion x component">
                    <span class="input-label">y</span>
                    <input type="number" id="q1" class="rotation-input" value="0" step="0.000001" data-tooltip="Quaternion y component">
                    <span class="input-label">z</span>
                    <input type="number" id="q2" class="rotation-input" value="0" step="0.000001" data-tooltip="Quaternion z component">
                    <span class="input-label">w</span>
                    <input type="number" id="q3" class="rotation-input" value="1" step="0.000001" data-tooltip="Quaternion w component (real part)">
                </div>
            </div>

            <!-- Rotation Matrix Input -->
            <div class="input-section" data-input-type="matrix">
                <h3>Rotation Matrix</h3>
                <div class="form-group">
                    <label for="matrix-text">Quick Input (paste matrix):</label>
                    <textarea id="matrix-text" class="form-control" rows="3" 
                              placeholder="e.g., 1 0 0&#10;0 1 0&#10;0 0 1" 
                              onchange="rotationConverter.updateFromMatrixText()"
                              data-tooltip="Paste 3x3 matrix, separated by spaces/newlines"></textarea>
                </div>
                <div class="matrix-inputs">
                    <input type="number" id="m00" class="rotation-input" value="1" step="0.000001" data-tooltip="Matrix element [0,0]">
                    <input type="number" id="m01" class="rotation-input" value="0" step="0.000001" data-tooltip="Matrix element [0,1]">
                    <input type="number" id="m02" class="rotation-input" value="0" step="0.000001" data-tooltip="Matrix element [0,2]">
                    <input type="number" id="m10" class="rotation-input" value="0" step="0.000001" data-tooltip="Matrix element [1,0]">
                    <input type="number" id="m11" class="rotation-input" value="1" step="0.000001" data-tooltip="Matrix element [1,1]">
                    <input type="number" id="m12" class="rotation-input" value="0" step="0.000001" data-tooltip="Matrix element [1,2]">
                    <input type="number" id="m20" class="rotation-input" value="0" step="0.000001" data-tooltip="Matrix element [2,0]">
                    <input type="number" id="m21" class="rotation-input" value="0" step="0.000001" data-tooltip="Matrix element [2,1]">
                    <input type="number" id="m22" class="rotation-input" value="1" step="0.000001" data-tooltip="Matrix element [2,2]">
                </div>
            </div>

            <!-- Euler Angles Input -->
            <div class="input-section" data-input-type="euler">
                <h3>Euler Angles (radians)</h3>
                <div class="vector-inputs with-label">
                    <span class="input-label">x</span>
                    <input type="number" id="euler-x" class="rotation-input" value="0" step="0.000001" data-tooltip="Rotation around X-axis">
                    <span class="input-label">y</span>
                    <input type="number" id="euler-y" class="rotation-input" value="0" step="0.000001" data-tooltip="Rotation around Y-axis">
                    <span class="input-label">z</span>
                    <input type="number" id="euler-z" class="rotation-input" value="0" step="0.000001" data-tooltip="Rotation around Z-axis">
                </div>
            </div>
        </div>
    `;
}

export function createVisualizationPanel() {
    return `
        <div class="panel">
            <div class="panel-header">
                <h2 class="panel-title">3D Visualization</h2>
                <div class="visualization-controls">
                    <button class="btn btn-secondary btn-sm" onclick="rotationConverter.toggleLegend()" data-tooltip="Toggle legend">
                        📝 Legend
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="rotationConverter.resetCamera()" data-tooltip="Reset camera view">
                        🎥 Reset View
                    </button>
                </div>
            </div>
            <div id="scene-container" class="scene-container"></div>
            
            <!-- Rotation Sliders -->
            <div class="slider-section" style="margin-top: 1rem;">
                <h3>Interactive Rotation</h3>
                <div class="slider-group">
                    <div class="slider-item">
                        <label for="rot-x-slider">X-Axis Rotation</label>
                        <input type="range" id="rot-x-slider" class="rotation-slider" 
                               min="-180" max="180" value="0" step="1"
                               oninput="rotationConverter.updateFromSlider('x', this.value)">
                        <span id="rot-x-value" class="slider-value">0°</span>
                    </div>
                    <div class="slider-item">
                        <label for="rot-y-slider">Y-Axis Rotation</label>
                        <input type="range" id="rot-y-slider" class="rotation-slider" 
                               min="-180" max="180" value="0" step="1"
                               oninput="rotationConverter.updateFromSlider('y', this.value)">
                        <span id="rot-y-value" class="slider-value">0°</span>
                    </div>
                    <div class="slider-item">
                        <label for="rot-z-slider">Z-Axis Rotation</label>
                        <input type="range" id="rot-z-slider" class="rotation-slider" 
                               min="-180" max="180" value="0" step="1"
                               oninput="rotationConverter.updateFromSlider('z', this.value)">
                        <span id="rot-z-value" class="slider-value">0°</span>
                    </div>
                </div>
                <div style="display: flex; gap: 0.5rem; margin-top: 10px;">
                    <button class="btn btn-secondary" onclick="rotationConverter.resetSliders()">Reset Rotation</button>
                    <button class="btn btn-primary" onclick="rotationConverter.setSliderBase()">Set as Base</button>
                </div>
            </div>
            
            <div id="visualization-legend" class="visualization-info" style="display: none;">
                <p><strong>Controls:</strong></p>
                <ul>
                    <li>🖱️ Left click + drag: Rotate view</li>
                    <li>🖱️ Right click + drag: Pan view</li>
                    <li>⚙️ Scroll: Zoom in/out</li>
                </ul>
                <p><strong>Colors:</strong></p>
                <ul>
                    <li>🔴 Red: X-axis</li>
                    <li>🟢 Green: Y-axis</li>
                    <li>🔵 Blue: Z-axis</li>
                </ul>
            </div>
        </div>
    `;
}

export function createOutputPanel() {
    return `
        <div class="panel">
            <div class="panel-header">
                <h2 class="panel-title">Output Formats</h2>
            </div>

            <!-- Rotation Matrix Output -->
            <div class="output-section">
                <h3>Rotation Matrix</h3>
                <div class="matrix-output" id="matrix-output">
[1.000000, 0.000000, 0.000000]
[0.000000, 1.000000, 0.000000]
[0.000000, 0.000000, 1.000000]
                </div>
            </div>

            <!-- Quaternion Output -->
            <div class="output-section">
                <h3>Quaternion [x, y, z, w]</h3>
                <div class="vector-output" id="quaternion-output">
[0.000000, 0.000000, 0.000000, 1.000000]
                </div>
            </div>

            <!-- Euler Angles Output -->
            <div class="output-section">
                <h3>Euler Angles [x, y, z] (radians)</h3>
                <div class="vector-output" id="euler-output">
[0.000000, 0.000000, 0.000000]
                </div>
            </div>
            
            <!-- World Transform Output -->
            <div class="output-section">
                <h3>World Transform</h3>
                <div class="form-group">
                    <label>Position</label>
                    <div class="vector-output" id="world-position-output">
[0.000000, 0.000000, 0.000000]
                    </div>
                </div>
                <div class="form-group">
                    <label>Quaternion</label>
                    <div class="vector-output" id="world-quaternion-output">
[0.000000, 0.000000, 0.000000, 1.000000]
                    </div>
                </div>
            </div>
            
            <!-- Export Options -->
            <div class="output-section">
                <h3>Export</h3>
                <div class="frame-controls">
                    <button class="btn btn-primary btn-sm" onclick="rotationConverter.exportAsJSON()" data-tooltip="Export all frames as JSON">
                        📄 Export JSON
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="rotationConverter.exportAsCSV()" data-tooltip="Export transforms as CSV">
                        📊 Export CSV
                    </button>
                </div>
            </div>
        </div>
    `;
}
