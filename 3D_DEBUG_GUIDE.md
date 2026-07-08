# 3D Objects Visibility Debug Guide

## 🔍 The Issue

The 3D objects (sphere, cone, and shell mesh created in `extra-3d-objects.js`) are not visible because they're rendered to a container with **`z-index: -1`**, which places them **behind the entire page background**.

### Current HTML Structure:
```html
<div id="extra-3d-objects"
  style="position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:-1;pointer-events:none;"></div>
```

The Three.js renderer creates a canvas inside this container, but with `z-index: -1`, it renders **beneath everything**.

---

## 🛠️ Debug Tools Added (Top-Right Corner)

A **cyan debug panel** is now visible in the top-right corner with real-time diagnostics:

### **Available Debug Functions:**

1. **Debug Info Display**
   - `Canvas Size`: Shows actual WebGL canvas dimensions
   - `Objects Count`: Indicates 3 models are loaded
   - `Camera Position`: Shows camera setup
   - `Render Status`: Displays FPS and visibility state

2. **Toggle Z-Index Debug Button**
   - Click to move 3D layer from behind (`z-index: -1`) to top (`z-index: 999`)
   - **This will make the 3D objects visible if they're rendering correctly**

3. **Show 3D Layer Button**
   - Toggle visibility of the entire 3D container
   - Helps confirm if rendering is active

---

## 🎯 How to Use the Debug Panel

1. **Open the page in your browser**
2. **Look for cyan panel in top-right corner** with 🔍 symbol
3. **Click "Toggle Z-Index Debug"** to bring the 3D layer to the front
4. **Observe:**
   - If 3D objects appear → rendering is working, just needs z-index adjustment
   - If nothing appears → check Three.js module loading or camera/object positioning

---

## ✅ What You'll Find

### The 3D Scene Contains:
- **3 rotating objects** with different materials:
  1. **Ribbed Sphere** (blue metallic, hexagon pattern)
  2. **Faceted Prism** (teal cone with grid pattern)
  3. **Curved Shell** (dark steel blue with wave pattern)

### Camera Setup:
- Position: `(0, 0, 12)` - looking at scene center
- FOV: 45°
- Near: 0.1, Far: 100

### Lighting:
- Ambient light (0x224466, intensity 0.5)
- Directional key light (0xffffff, intensity 0.8)
- Point rim light (0x2fd8ff, cyan glow, intensity 1.5)

---

## 🔧 Troubleshooting Steps

### If 3D Objects Still Don't Appear After Z-Index Toggle:

1. **Check browser console** (F12) for WebGL errors
2. **Verify Three.js module loads:**
   - Check if `./digital_files/three.module.min.js` exists
3. **Check camera aspect ratio:**
   - Debug panel shows FPS - if it's 60+, rendering is active
4. **Verify object positioning:**
   - Objects positioned at: `(-4.6, 2.4, 0)`, `(-0.6, 1.2, 1)`, `(-3.4, -1.8, -1)`
   - All should be visible from camera at `(0, 0, 12)`

---

## 💡 Next Steps to Fix

To permanently fix visibility, you have options:

### Option 1: Raise Z-Index (Recommended)
Change the container z-index from `-1` to a positive value like `10`:
```html
<div id="extra-3d-objects"
  style="position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:10;pointer-events:none;"></div>
```

### Option 2: Use Different Positioning
Move to a specific section instead of fixed overlay:
```html
<div id="extra-3d-objects" 
  style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;"></div>
```

### Option 3: Create Separate 3D Canvas
Use the existing `canvas-3d-shapes` element (line 84) instead of creating a new renderer.

---

## 📊 Real-Time Monitoring

The debug panel updates every frame:
- **FPS Counter**: Shows rendering performance
- **Canvas Visibility Status**: Confirms if container is in viewport
- **Auto-detection**: Monitors when Three.js scene initializes

---

## 🎮 Interactive Testing

**Console command to test:**
```javascript
// Show 3D layer
document.getElementById('extra-3d-objects').style.zIndex = '999';

// Hide background to see only 3D
document.body.style.background = 'transparent';

// Check if canvas exists
console.log(document.querySelector('#extra-3d-objects canvas'));
```

---

## ⚙️ Technical Details

- **Render Loop**: Uses `requestAnimationFrame` for 60 FPS target
- **Animation**: Each object rotates with different speeds (stored in `spin` vector)
- **Material**: PBR (Physically Based Rendering) with metalness/roughness
- **Textures**: Procedurally generated via canvas (no external image files)
- **Performance**: Single WebGL canvas, efficient for all browsers

---

## 📝 Debug Panel Source

The debug panel is added before the Three.js script loads, so it monitors initialization in real-time without affecting the rendering logic.
