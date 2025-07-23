# 3D Rotation Converter - Modern Hierarchical Version

A modern, user-friendly 3D rotation converter with hierarchical reference frame support. Convert between rotation matrices, quaternions, Euler angles, and more with real-time 3D visualization.

## 🚀 Features

### Core Functionality
- **Multiple Rotation Formats**: Rotation matrices, quaternions, Euler angles, axis-angle representation
- **Real-time Conversion**: All formats update simultaneously as you edit
- **3D Visualization**: Interactive 3D scene showing coordinate frames
- **Hierarchical Reference Frames**: Create parent-child relationships between coordinate frames

### Modern Interface
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern UI**: Clean, intuitive interface with smooth animations
- **Real-time Feedback**: Instant visual updates as you modify rotations
- **Keyboard Navigation**: Full keyboard accessibility support

### Advanced Features
- **World Frame**: Central reference frame for the entire system
- **Frame Hierarchy**: Nested coordinate frames with automatic transform propagation
- **Import/Export**: Save and load frame hierarchies as JSON
- **Demo Scenarios**: Pre-built examples (robot arm, camera rig, etc.)
- **Export Options**: Export data as JSON or CSV for external use

## 🎯 Use Cases

- **Robotics**: Define robot joint frames and end-effector poses
- **Computer Graphics**: Set up camera and object transformations
- **Engineering**: Coordinate system transformations for CAD/CAM
- **Education**: Learn about 3D rotations and coordinate frames
- **Research**: Rapid prototyping of spatial relationships

## 🏗️ Architecture

The modernized version features a clean, modular architecture:

```
src/
├── css/
│   └── styles.css          # Modern CSS with CSS variables
├── js/
│   └── RotationConverter.js # Main application logic
└── components/
    └── UIComponents.js      # Reusable UI components
```

### Key Components

- **RotationConverter**: Core class managing 3D scene and frame hierarchy
- **Reference Frames**: Hierarchical coordinate systems with visual representation
- **UI Components**: Modular, reusable interface elements
- **Three.js Integration**: Modern 3D graphics with WebGL acceleration

## 🚀 Getting Started

### Online Version
Visit the [hosted website](https://your-domain.github.io/rotationconverter/) to use the converter directly in your browser.

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/rotationconverter.git
   cd rotationconverter
   ```

2. **Serve the files**:
   Since the application uses ES6 modules, you need to serve it over HTTP:
   
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js (with http-server)
   npx http-server -p 8000
   
   # Using PHP
   php -S localhost:8000
   ```

3. **Open in browser**:
   Navigate to `http://localhost:8000/index-modern.html`

## 📖 User Guide

### Basic Usage

1. **World Frame**: The system starts with a "World" frame as the root reference
2. **Add Frames**: Click "➕ Add Frame" to create new coordinate frames
3. **Select Frames**: Click on frames in the hierarchy to select and edit them
4. **Edit Transforms**: Use the input panels to modify position and rotation
5. **View Results**: All rotation formats update automatically in the output panel

### Frame Hierarchy

- **Parent-Child Relationships**: Child frames inherit their parent's transformation
- **Local vs World Coordinates**: Edit local transforms; world coordinates calculated automatically
- **Visual Representation**: Each frame shows X (red), Y (green), Z (blue) axes

### Input Methods

- **Rotation Matrix**: 3×3 orthogonal matrix representation
- **Quaternion**: Unit quaternion [x, y, z, w] format
- **Euler Angles**: XYZ rotation sequence in radians
- **Position**: 3D translation relative to parent frame

### Demo Hierarchy

Click "🎯 Demo Hierarchy" to create a sample robot arm structure:
- Robot Base → Arm 1 → Arm 2 → End Effector

## 🛠️ Technical Details

### Dependencies

- **Three.js**: 3D graphics and mathematics
- **ES6 Modules**: Modern JavaScript module system
- **CSS Grid/Flexbox**: Responsive layout system
- **Web APIs**: File API for import/export functionality

### Browser Support

- **Chrome**: 61+ (ES6 modules)
- **Firefox**: 60+ (ES6 modules)
- **Safari**: 10.1+ (ES6 modules)
- **Edge**: 16+ (ES6 modules)

### Performance

- **WebGL Acceleration**: Hardware-accelerated 3D rendering
- **Efficient Updates**: Only modified frames are recalculated
- **Memory Management**: Proper cleanup of Three.js resources
- **Responsive Design**: Optimized for various screen sizes

## 🔧 API Reference

### RotationConverter Class

```javascript
// Create new frame
const frame = rotationConverter.addFrame('Frame Name', parentId);

// Set frame transform
rotationConverter.setFrameTransform(frameId, 
    { x: 1, y: 0, z: 0 },           // position
    { x: 0, y: 0, z: 0, w: 1 }      // quaternion
);

// Get world transform
const worldTransform = rotationConverter.getFrameWorldTransform(frameId);

// Export/Import
const data = rotationConverter.exportFrameHierarchy();
rotationConverter.importFrameHierarchy(data);
```

### Frame Structure

```javascript
{
    id: 'frame-1',
    name: 'Robot Arm',
    parentFrame: parentFrameObject,
    children: Set(),
    position: Vector3,
    localQuaternion: Quaternion,
    quaternion: Quaternion,  // world space
    group: THREE.Group,      // 3D representation
    color: 0xff6b6b
}
```

## 🎨 Customization

### Styling

The interface uses CSS custom properties for easy theming:

```css
:root {
    --primary-color: #3b82f6;
    --surface-color: #ffffff;
    --text-primary: #1e293b;
    /* ... more variables ... */
}
```

### Adding New Input Types

1. Add input UI in `UIComponents.js`
2. Create update method in `RotationConverter.js`
3. Add event listener in `setupInputEventListeners()`

## 📊 Export Formats

### JSON Format
```json
{
    "version": "1.0",
    "timestamp": "2023-12-07T10:30:00.000Z",
    "worldFrame": "frame-0",
    "activeFrame": "frame-1",
    "frames": {
        "frame-0": {
            "name": "World",
            "position": { "x": 0, "y": 0, "z": 0 },
            "localQuaternion": { "x": 0, "y": 0, "z": 0, "w": 1 }
        }
    }
}
```

### CSV Format
```csv
Frame Name,Parent Frame,Position X,Position Y,Position Z,Local Quat X,Local Quat Y,Local Quat Z,Local Quat W
World,None,0,0,0,0,0,0,1
Robot Base,World,0,1,0,0,0,0,1
```

## 🐛 Troubleshooting

### Common Issues

1. **3D Scene Not Loading**
   - Check browser console for WebGL errors
   - Ensure WebGL is supported and enabled
   - Try refreshing the page

2. **Import/Export Not Working**
   - Verify file format is valid JSON
   - Check browser console for parsing errors
   - Ensure file permissions are correct

3. **Performance Issues**
   - Reduce number of frames in complex hierarchies
   - Check for browser extensions blocking WebGL
   - Close other resource-intensive tabs

### Debug Mode

Open browser developer tools and check the console for detailed logging:
- 🚀 Initialization messages
- 📍 Frame creation/deletion
- 🔄 Transform updates
- ✅ Success confirmations
- ❌ Error messages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit with descriptive messages: `git commit -m "Add feature description"`
5. Push to your fork: `git push origin feature-name`
6. Create a Pull Request

### Code Style

- Use ES6+ features and modern JavaScript
- Follow existing naming conventions
- Add console logging for major operations
- Include error handling for user actions
- Write descriptive comments for complex logic

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Three.js**: Amazing 3D library that powers the visualization
- **Original Author**: A. Gaschler for the initial rotation converter
- **Icons**: Custom SVG rotation icon
- **Modern Web Standards**: ES6 modules, CSS Grid, Web APIs

## 🔗 Links

- [GitHub Repository](https://github.com/your-username/rotationconverter)
- [Live Demo](https://your-domain.github.io/rotationconverter/)
- [Three.js Documentation](https://threejs.org/docs/)
- [Web APIs Reference](https://developer.mozilla.org/en-US/docs/Web/API)

---

**Built with ❤️ for the robotics, graphics, and engineering communities**
