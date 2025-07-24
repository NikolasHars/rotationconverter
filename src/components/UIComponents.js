/**
 * UI Components for 3            <!-- Collapsible Section: Frame Mana            <!-- Collapsible Sec            <!-- Collapsible Section: 3D Objects & Models -->
            <div cla            <!-- Collapsi            <!-- Collapsible Section: Advanced Rotation Input -->
            <div class="collapsible-section">
                <button class="collapsible-header" onclick="toggleSection('advanced-rotation')" aria-expanded="false">
                    <span>🔢 Advanced Rotation Input</span>
                    <span class="toggle-icon">▶</span>
                </button>
                <div id="advanced-rotation" class="collapsible-content" style="display: none;">`tion: Import/Export -->
            <div class="collapsible-section">
                <button class="collapsible-header" onclick="toggleSection('import-export')" aria-expanded="false">
                    <span>💾 Import/Export</span>
                    <span class="toggle-icon">▶</span>
                </button>
                <div id="import-export" class="collapsible-content" style="display: none;">`lapsible-section">
                <button class="collapsible-header" onclick="toggleSection('object-controls')" aria-expanded="false">
                    <span>📦 3D Objects & Models</span>
                    <span class="toggle-icon">▶</span>
                </button>
                <div id="object-controls" class="collapsible-content" style="display: none;">`isibility Controls -->
            <div class="collapsible-section">
                <button class="collapsible-header" onclick="toggleSection('visibility-controls')" aria-expanded="false">
                    <span>👁️ Visibility Controls</span>
                    <span class="toggle-icon">▶</span>
                </button>
                <div id="visibility-controls" class="collapsible-content" style="display: none;">`-->
            <div class="collapsible-section">
                <button class="collapsible-header" onclick="toggleSection('frame-management')" aria-expanded="false">
                    <span>📁 Frame Management</span>
                    <span class="toggle-icon">▶</span>
                </button>
                <div id="frame-management" class="collapsible-content" style="display: none;">`ion Converter - Clean Version
 */

export function createInputPanel() {
    return `
        <div class="panel">
            <div class="panel-header">
                <h2 class="panel-title">Input Controls</h2>
            </div>
            
            <!-- Active Frame Display -->
            <div class="active-frame-section" style="margin-bottom: 1rem;">
                <div class="form-group">
                    <label>Active Frame:</label>
                    <div id="active-frame-display" class="active-frame-display">
                        <span id="active-frame-name">World</span>
                    </div>
                    <input type="text" id="frame-name-input" class="form-control" 
                           placeholder="Rename frame..." 
                           onchange="rotationConverter.renameActiveFrame(this.value)"
                           data-tooltip="Rename the current frame"
                           style="margin-top: 0.5rem; font-size: 0.9rem;">
                </div>
            </div>

            <!-- Collapsible Section: Frame Management -->
            <div class="collapsible-section">
                <button class="collapsible-header" onclick="toggleSection('frame-management')" style="width: 100%; padding: 0.75rem; background: var(--surface-color); border: 1px solid var(--border-color); border-radius: var(--radius-md); cursor: pointer; display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <span style="font-weight: 600;">📁 Frame Management</span>
                    <span class="toggle-icon">▼</span>
                </button>
                <div id="frame-management" class="collapsible-content" style="margin-bottom: 1rem;">
                    <div class="frame-controls" style="margin-bottom: 1rem;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 0.5rem;">
                            <button class="btn btn-primary btn-sm" onclick="rotationConverter.addFrame(prompt('Frame name:') || 'New Frame')">
                                ➕ Add Frame
                            </button>
                            <button class="btn btn-success btn-sm" onclick="rotationConverter.addChildFrame()">
                                🌿 Add Child
                            </button>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 0.5rem;">
                            <button class="btn btn-secondary btn-sm" onclick="rotationConverter.showInsertFrameDialog()">
                                🔄 Insert Parent
                            </button>
                            <button class="btn btn-warning btn-sm" onclick="rotationConverter.removeActiveFrame()">
                                🗑️ Remove
                            </button>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                            <button class="btn btn-secondary btn-sm" onclick="rotationConverter.createDemoHierarchy()">
                                🎯 Demo
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="rotationConverter.clearAllFrames()">
                                🧹 Clear All
                            </button>
                        </div>
                    </div>
                    
                    <div class="frame-hierarchy">
                        <div id="frame-list" class="frame-tree">
                            <!-- Frame tree will be populated here -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- Collapsible Section: Visibility Controls -->
            <div class="collapsible-section">
                <button class="collapsible-header" onclick="toggleSection('visibility-controls')" style="width: 100%; padding: 0.75rem; background: var(--surface-color); border: 1px solid var(--border-color); border-radius: var(--radius-md); cursor: pointer; display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <span style="font-weight: 600;">👁️ Visibility Controls</span>
                    <span class="toggle-icon">▼</span>
                </button>
                <div id="visibility-controls" class="collapsible-content" style="margin-bottom: 1rem;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 0.5rem;">
                        <button class="btn btn-secondary btn-sm" onclick="rotationConverter.toggleFrameVisibility()" data-tooltip="Toggle all coordinate frame axes">
                            👁️ All Frames
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="rotationConverter.toggleChildrenVisibility()" data-tooltip="Toggle child frame axes only">
                            👶 Children
                        </button>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                        <button class="btn btn-info btn-sm" onclick="rotationConverter.toggleActiveFrameVisibility()" data-tooltip="Toggle visibility of current active frame only">
                            🎯 Active Frame
                        </button>
                        <button class="btn btn-info btn-sm" onclick="rotationConverter.showKeyboardHelp()" data-tooltip="Show keyboard control shortcuts">
                            ⌨️ Controls
                        </button>
                    </div>
                </div>
            </div>

            <!-- Collapsible Section: 3D Objects & Models -->
            <div class="collapsible-section">
                <button class="collapsible-header" onclick="toggleSection('object-controls')" style="width: 100%; padding: 0.75rem; background: var(--surface-color); border: 1px solid var(--border-color); border-radius: var(--radius-md); cursor: pointer; display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <span style="font-weight: 600;">📦 3D Objects & Models</span>
                    <span class="toggle-icon">▼</span>
                </button>
                <div id="object-controls" class="collapsible-content" style="display: none; margin-bottom: 1rem;">
                    <div class="form-group" style="margin-bottom: 1rem;">
                        <label>Attach Objects:</label>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 0.5rem;">
                            <button class="btn btn-secondary btn-sm" onclick="rotationConverter.createSamplePhone()" data-tooltip="Add a detailed phone model">
                                📱 Phone
                            </button>
                            <button class="btn btn-secondary btn-sm" onclick="rotationConverter.addTabletObject()" data-tooltip="Add a tablet-like object">
                                📋 Tablet
                            </button>
                            <button class="btn btn-secondary btn-sm" onclick="rotationConverter.createSamplePlane()" data-tooltip="Add a textured test plane">
                                🎨 Plane
                            </button>
                            <button class="btn btn-secondary btn-sm" onclick="rotationConverter.addCubeObject()" data-tooltip="Add a cube object">
                                🎲 Cube
                            </button>
                        </div>
                        <button class="btn btn-warning btn-sm" onclick="rotationConverter.removeFrameObject()" data-tooltip="Remove attached object" style="width: 100%;">
                            🗑️ Remove Object
                        </button>
                    </div>
                    
                    <div class="form-group" style="margin-bottom: 1rem;">
                        <label>Load Files:</label>
                        <input type="file" id="mesh-file-input" accept=".glb,.gltf" style="display: none;" onchange="rotationConverter.loadMeshFile(event)">
                        <button class="btn btn-info btn-sm" onclick="document.getElementById('mesh-file-input').click()" data-tooltip="Load GLTF/GLB 3D model file" style="width: 100%; margin-bottom: 0.5rem;">
                            📁 3D Model (.glb/.gltf)
                        </button>
                        <input type="file" id="colmap-file-input" accept=".txt,.bin" style="display: none;" onchange="rotationConverter.loadColmapFile(event)">
                        <button class="btn btn-info btn-sm" onclick="document.getElementById('colmap-file-input').click()" data-tooltip="Load COLMAP points3D files or simple XYZ RGB text files" style="width: 100%;">
                            🗂️ Point Cloud (.txt/.bin)
                        </button>
                    </div>

                    <!-- Point Cloud Controls (shown when loaded) -->
                    <div class="form-group" id="colmap-alignment-controls" style="display: none; margin-bottom: 1rem;">
                        <label>Point Cloud Controls:</label>
                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem; margin-bottom: 0.5rem;">
                            <button class="btn btn-secondary btn-sm" onclick="rotationConverter.centerColmapPoints()" data-tooltip="Center point cloud at frame origin">
                                🎯 Center
                            </button>
                            <button class="btn btn-secondary btn-sm" onclick="rotationConverter.resetColmapPoints()" data-tooltip="Reset to original COLMAP positions">
                                🔄 Reset
                            </button>
                            <button class="btn btn-secondary btn-sm" onclick="rotationConverter.flipColmapZ()" data-tooltip="Flip Z-axis">
                                ↕️ Flip Z
                            </button>
                        </div>
                        <div style="display: grid; grid-template-columns: auto 1fr; gap: 0.5rem; align-items: center;">
                            <label style="font-size: 0.8rem;">Size:</label>
                            <input type="range" id="colmap-point-size" min="0.005" max="0.1" step="0.005" value="0.03" 
                                   oninput="rotationConverter.updateColmapPointSize(this.value)"
                                   data-tooltip="Adjust point cloud point size">
                        </div>
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
                </div>
            </div>

            <!-- Collapsible Section: Import/Export -->
            <div class="collapsible-section">
                <button class="collapsible-header" onclick="toggleSection('import-export')" style="width: 100%; padding: 0.75rem; background: var(--surface-color); border: 1px solid var(--border-color); border-radius: var(--radius-md); cursor: pointer; display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <span style="font-weight: 600;">💾 Import/Export</span>
                    <span class="toggle-icon">▼</span>
                </button>
                <div id="import-export" class="collapsible-content" style="display: none; margin-bottom: 1rem;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                        <input type="file" id="import-file" accept=".json" style="display: none;" onchange="handleImport(event)">
                        <button class="btn btn-secondary btn-sm" onclick="document.getElementById('import-file').click()">
                            📂 Import JSON
                        </button>
                        <button class="btn btn-success btn-sm" onclick="downloadFrameHierarchy()">
                            💾 Export JSON
                        </button>
                    </div>
                </div>
            </div>

            <!-- Collapsible Section: Advanced Rotation Input -->
            <div class="collapsible-section">
                <button class="collapsible-header" onclick="toggleSection('advanced-rotation')" style="width: 100%; padding: 0.75rem; background: var(--surface-color); border: 1px solid var(--border-color); border-radius: var(--radius-md); cursor: pointer; display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <span style="font-weight: 600;">🔢 Advanced Rotation Input</span>
                    <span class="toggle-icon">▼</span>
                </button>
                <div id="advanced-rotation" class="collapsible-content" style="display: none;">
                    <!-- Rotation Matrix Input -->
                    <div class="input-section" data-input-type="matrix" style="margin-bottom: 1rem;">
                        <h4>Rotation Matrix</h4>
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
                        <h4>Euler Angles (XYZ Order)</h4>
                        <div class="form-group">
                            <label for="euler-text">Quick Input (paste angles):</label>
                            <input type="text" id="euler-text" class="form-control" 
                                   placeholder="e.g., 0 90 0 or [0, 1.57, 0]" 
                                   onchange="rotationConverter.updateFromEulerText()"
                                   data-tooltip="Paste Euler angles as degrees or radians">
                        </div>
                        <div class="vector-inputs with-label">
                            <span class="input-label">X (pitch)</span>
                            <input type="number" id="euler-x" class="rotation-input" value="0" step="0.1" data-tooltip="Rotation around X-axis (degrees)">
                            <span class="input-label">Y (yaw)</span>
                            <input type="number" id="euler-y" class="rotation-input" value="0" step="0.1" data-tooltip="Rotation around Y-axis (degrees)">
                            <span class="input-label">Z (roll)</span>
                            <input type="number" id="euler-z" class="rotation-input" value="0" step="0.1" data-tooltip="Rotation around Z-axis (degrees)">
                        </div>
                    </div>
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
            
            <!-- Position Controls -->
            <div class="slider-section" style="margin-top: 1rem;">
                <h3>Frame Position</h3>
                <div class="vector-inputs position with-label" style="display: grid; grid-template-columns: auto 1fr auto 1fr auto 1fr; gap: 0.5rem; align-items: center;">
                    <span class="input-label">X</span>
                    <input type="number" id="position-x" class="form-control" 
                           value="0" step="0.1" data-tooltip="X position in parent frame"
                           style="min-width: 80px;">
                    <span class="input-label">Y</span>
                    <input type="number" id="position-y" class="form-control" 
                           value="0" step="0.1" data-tooltip="Y position in parent frame"
                           style="min-width: 80px;">
                    <span class="input-label">Z</span>
                    <input type="number" id="position-z" class="form-control" 
                           value="0" step="0.1" data-tooltip="Z position in parent frame"
                           style="min-width: 80px;">
                </div>
            </div>
            
            <!-- Quaternion Input -->
            <div class="slider-section" style="margin-top: 1rem;">
                <h3>Frame Rotation (Quaternion)</h3>
                <div class="form-group" style="margin-bottom: 0.75rem;">
                    <label for="quaternion-text" style="font-size: 0.9rem; margin-bottom: 0.25rem; display: block;">Quick Input:</label>
                    <input type="text" id="quaternion-text" class="form-control" 
                           placeholder="e.g., 0.707 0 0 0.707 or [0.707, 0, 0, 0.707]" 
                           onchange="rotationConverter.updateFromQuaternionText()"
                           data-tooltip="Paste quaternion as: 'x y z w' or '[x, y, z, w]'"
                           style="font-size: 0.9rem;">
                </div>
                <div class="vector-inputs with-label" style="display: grid; grid-template-columns: auto 1fr auto 1fr auto 1fr auto 1fr; gap: 0.5rem; align-items: center;">
                    <span class="input-label">x</span>
                    <input type="number" id="q0" class="rotation-input" value="0" step="0.000001" data-tooltip="Quaternion x component"
                           style="min-width: 80px; font-size: 0.9rem;">
                    <span class="input-label">y</span>
                    <input type="number" id="q1" class="rotation-input" value="0" step="0.000001" data-tooltip="Quaternion y component"
                           style="min-width: 80px; font-size: 0.9rem;">
                    <span class="input-label">z</span>
                    <input type="number" id="q2" class="rotation-input" value="0" step="0.000001" data-tooltip="Quaternion z component"
                           style="min-width: 80px; font-size: 0.9rem;">
                    <span class="input-label">w</span>
                    <input type="number" id="q3" class="rotation-input" value="1" step="0.000001" data-tooltip="Quaternion w component (real part)"
                           style="min-width: 80px; font-size: 0.9rem;">
                </div>
            </div>
            
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
        </div>
    `;
}
