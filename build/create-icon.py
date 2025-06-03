#!/usr/bin/env python3
"""
Custom App Icon Generator for Pen & Paper Timeline
Creates a beautiful icon representing D&D timeline management
"""

import os
import subprocess
import tempfile
from pathlib import Path

# Enhanced SVG icon design for Pen & Paper Timeline
icon_svg = '''<?xml version="1.0" encoding="UTF-8"?>
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Modern gradient background -->
    <radialGradient id="bgGradient" cx="40%" cy="30%" r="90%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="30%" style="stop-color:#764ba2;stop-opacity:1" />
      <stop offset="70%" style="stop-color:#3b2d7b;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1a1428;stop-opacity:1" />
    </radialGradient>
    
    <!-- Elegant timeline gradient -->
    <linearGradient id="timelineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#ffd700;stop-opacity:1" />
      <stop offset="25%" style="stop-color:#ff8a65;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#e91e63;stop-opacity:1" />
      <stop offset="75%" style="stop-color:#9c27b0;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#4ecdc4;stop-opacity:1" />
    </linearGradient>
    
    <!-- Premium D20 gradient -->
    <linearGradient id="diceGradient" x1="20%" y1="20%" x2="80%" y2="80%">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#f8f9fa;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#e3f2fd;stop-opacity:1" />
    </linearGradient>
    
    <!-- Modern clock gradient -->
    <radialGradient id="clockGradient" cx="30%" cy="30%" r="70%">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.95" />
      <stop offset="50%" style="stop-color:#f5f5f5;stop-opacity:0.85" />
      <stop offset="100%" style="stop-color:#e8eaf6;stop-opacity:0.75" />
    </radialGradient>
    
    <!-- Scroll gradient -->
    <linearGradient id="scrollGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#fff8e1;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#f4f1e8;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#efebe0;stop-opacity:1" />
    </linearGradient>
    
    <!-- Enhanced shadow filter -->
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="6" dy="12" stdDeviation="16" flood-color="rgba(0,0,0,0.4)"/>
    </filter>
    
    <!-- Soft glow filter -->
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    
    <!-- Inner shadow for depth -->
    <filter id="innerShadow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
      <feOffset dx="2" dy="2" result="offset"/>
      <feComposite in="SourceGraphic" in2="offset" operator="over"/>
    </filter>
  </defs>
  
  <!-- Main background with modern rounded corners -->
  <rect width="1024" height="1024" rx="220" ry="220" fill="url(#bgGradient)"/>
  
  <!-- Subtle border -->
  <rect width="1024" height="1024" rx="220" ry="220" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="3"/>
  
  <!-- Central timeline track (more prominent) -->
  <rect x="120" y="460" width="784" height="32" rx="16" ry="16" fill="url(#timelineGradient)" filter="url(#shadow)"/>
  <rect x="124" y="464" width="776" height="24" rx="12" ry="12" fill="rgba(255,255,255,0.2)"/>
  
  <!-- Timeline event markers with better spacing -->
  <circle cx="200" cy="476" r="20" fill="#ffd700" stroke="rgba(255,255,255,0.3)" stroke-width="2" filter="url(#glow)"/>
  <circle cx="340" cy="476" r="18" fill="#ff8a65" stroke="rgba(255,255,255,0.3)" stroke-width="2" filter="url(#glow)"/>
  <circle cx="512" cy="476" r="24" fill="#e91e63" stroke="rgba(255,255,255,0.4)" stroke-width="3" filter="url(#glow)"/>
  <circle cx="684" cy="476" r="18" fill="#9c27b0" stroke="rgba(255,255,255,0.3)" stroke-width="2" filter="url(#glow)"/>
  <circle cx="824" cy="476" r="20" fill="#4ecdc4" stroke="rgba(255,255,255,0.3)" stroke-width="2" filter="url(#glow)"/>
  
  <!-- Modern D20 (top left) -->
  <g transform="translate(200,180)" filter="url(#shadow)">
    <!-- D20 icosahedron shape -->
    <path d="M 0,-60 L 57,-18 L 35,48 L -35,48 L -57,-18 Z" fill="url(#diceGradient)" stroke="#4a5568" stroke-width="3"/>
    <path d="M 0,-60 L 57,-18 L 0,12 Z" fill="rgba(255,255,255,0.9)" stroke="#4a5568" stroke-width="2"/>
    <path d="M 0,-60 L -57,-18 L 0,12 Z" fill="rgba(255,255,255,0.7)" stroke="#4a5568" stroke-width="2"/>
    <!-- D20 number -->
    <text x="0" y="-5" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="32" font-weight="bold" fill="#2d3748">20</text>
    <!-- Dot pattern -->
    <circle cx="15" cy="-35" r="3" fill="#4a5568"/>
    <circle cx="-15" cy="-35" r="3" fill="#4a5568"/>
  </g>
  
  <!-- Elegant clock (top right) -->
  <g transform="translate(780,180)" filter="url(#shadow)">
    <circle cx="0" cy="0" r="90" fill="url(#clockGradient)" stroke="#4a5568" stroke-width="4"/>
    <circle cx="0" cy="0" r="8" fill="#2d3748"/>
    <!-- Clock hands pointing to special time -->
    <line x1="0" y1="0" x2="0" y2="-50" stroke="#2d3748" stroke-width="6" stroke-linecap="round"/>
    <line x1="0" y1="0" x2="40" y2="0" stroke="#2d3748" stroke-width="8" stroke-linecap="round"/>
    <!-- Enhanced hour markers -->
    <circle cx="0" cy="-70" r="5" fill="#4a5568"/>
    <circle cx="70" cy="0" r="5" fill="#4a5568"/>
    <circle cx="0" cy="70" r="5" fill="#4a5568"/>
    <circle cx="-70" cy="0" r="5" fill="#4a5568"/>
    <!-- Additional markers -->
    <circle cx="49" cy="-49" r="3" fill="#718096"/>
    <circle cx="49" cy="49" r="3" fill="#718096"/>
    <circle cx="-49" cy="49" r="3" fill="#718096"/>
    <circle cx="-49" cy="-49" r="3" fill="#718096"/>
  </g>
  
  <!-- Beautiful scroll/parchment (bottom center) -->
  <g transform="translate(512,700)" filter="url(#shadow)">
    <ellipse cx="0" cy="0" rx="220" ry="130" fill="url(#scrollGradient)" stroke="#d4af37" stroke-width="5"/>
    <ellipse cx="0" cy="0" rx="200" ry="110" fill="none" stroke="#d4af37" stroke-width="2" opacity="0.7"/>
    
    <!-- Elegant quill pen -->
    <g transform="translate(60,-25) rotate(30)">
      <rect x="0" y="0" width="90" height="8" rx="4" fill="#8b4513"/>
      <polygon points="90,4 115,0 115,8" fill="#2d3748"/>
      <ellipse cx="8" cy="4" rx="10" ry="16" fill="#e91e63" opacity="0.8"/>
    </g>
    
    <!-- Refined text lines -->
    <line x1="-140" y1="-50" x2="70" y2="-50" stroke="#8b4513" stroke-width="3" opacity="0.7"/>
    <line x1="-140" y1="-20" x2="50" y2="-20" stroke="#8b4513" stroke-width="3" opacity="0.7"/>
    <line x1="-140" y1="10" x2="90" y2="10" stroke="#8b4513" stroke-width="3" opacity="0.7"/>
    <line x1="-140" y1="40" x2="30" y2="40" stroke="#8b4513" stroke-width="3" opacity="0.7"/>
    <line x1="-140" y1="70" x2="110" y2="70" stroke="#8b4513" stroke-width="3" opacity="0.7"/>
  </g>
  
  <!-- Modern calendar (left side) -->
  <g transform="translate(120,360)" filter="url(#shadow)">
    <rect x="0" y="20" width="100" height="100" rx="12" fill="#ffffff" stroke="#4a5568" stroke-width="3"/>
    <rect x="0" y="20" width="100" height="25" rx="12" fill="#4ecdc4"/>
    <!-- Calendar rings -->
    <rect x="20" y="8" width="6" height="25" rx="3" fill="#4a5568"/>
    <rect x="74" y="8" width="6" height="25" rx="3" fill="#4a5568"/>
    <!-- Modern calendar grid -->
    <line x1="15" y1="55" x2="85" y2="55" stroke="#e2e8f0" stroke-width="2"/>
    <line x1="15" y1="75" x2="85" y2="75" stroke="#e2e8f0" stroke-width="2"/>
    <line x1="15" y1="95" x2="85" y2="95" stroke="#e2e8f0" stroke-width="2"/>
    <line x1="30" y1="45" x2="30" y2="110" stroke="#e2e8f0" stroke-width="2"/>
    <line x1="50" y1="45" x2="50" y2="110" stroke="#e2e8f0" stroke-width="2"/>
    <line x1="70" y1="45" x2="70" y2="110" stroke="#e2e8f0" stroke-width="2"/>
    <!-- Featured date -->
    <text x="50" y="88" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="bold" fill="#2d3748">16</text>
  </g>
  
  <!-- Magical sparkles with enhanced design -->
  <g opacity="0.9">
    <!-- Large sparkle -->
    <g transform="translate(320,140)">
      <polygon points="0,-20 5,-5 20,0 5,5 0,20 -5,5 -20,0 -5,-5" fill="#ffd700" filter="url(#glow)"/>
      <polygon points="0,-12 3,-3 12,0 3,3 0,12 -3,3 -12,0 -3,-3" fill="#fff" opacity="0.8"/>
    </g>
    
    <!-- Medium sparkles -->
    <g transform="translate(800,420)">
      <polygon points="0,-12 3,-3 12,0 3,3 0,12 -3,3 -12,0 -3,-3" fill="#e91e63" filter="url(#glow)"/>
    </g>
    
    <g transform="translate(880,650)">
      <polygon points="0,-10 2.5,-2.5 10,0 2.5,2.5 0,10 -2.5,2.5 -10,0 -2.5,-2.5" fill="#4ecdc4" filter="url(#glow)"/>
    </g>
    
    <!-- Small sparkles -->
    <circle cx="150" cy="600" r="4" fill="#ffd700" opacity="0.8"/>
    <circle cx="900" cy="250" r="3" fill="#9c27b0" opacity="0.7"/>
    <circle cx="250" cy="800" r="5" fill="#ff8a65" opacity="0.8"/>
  </g>
  
  <!-- Subtle connecting energy lines -->
  <path d="M 290 240 Q 400 320 480 460" stroke="rgba(255,255,255,0.2)" stroke-width="3" fill="none" stroke-dasharray="8,6" opacity="0.6"/>
  <path d="M 710 240 Q 620 320 544 460" stroke="rgba(255,255,255,0.2)" stroke-width="3" fill="none" stroke-dasharray="8,6" opacity="0.6"/>
  <path d="M 200 450 Q 350 550 450 680" stroke="rgba(255,255,255,0.15)" stroke-width="2" fill="none" stroke-dasharray="6,4" opacity="0.5"/>
  
</svg>'''

def create_iconset():
    """Create the iconset directory and generate all required sizes"""
    
    # Create iconset directory
    iconset_dir = Path('/Users/maxbohn/pen_and_paper_timeline/build/icon.iconset')
    iconset_dir.mkdir(exist_ok=True)
    
    # Clear existing files
    for file in iconset_dir.glob('*'):
        file.unlink()
    
    # Required icon sizes for macOS
    sizes = [
        (16, 'icon_16x16.png'),
        (32, 'icon_16x16@2x.png'),
        (32, 'icon_32x32.png'),
        (64, 'icon_32x32@2x.png'),
        (128, 'icon_128x128.png'),
        (256, 'icon_128x128@2x.png'),
        (256, 'icon_256x256.png'),
        (512, 'icon_256x256@2x.png'),
        (512, 'icon_512x512.png'),
        (1024, 'icon_512x512@2x.png')
    ]
    
    # Create temporary SVG file
    with tempfile.NamedTemporaryFile(mode='w', suffix='.svg', delete=False) as f:
        f.write(icon_svg)
        svg_path = f.name
    
    try:
        # Generate PNG files for each size
        for size, filename in sizes:
            output_path = iconset_dir / filename
            
            # Use rsvg-convert if available, otherwise try cairosvg, then ImageMagick
            success = False
            
            # Try rsvg-convert first (most reliable)
            try:
                result = subprocess.run([
                    'rsvg-convert', 
                    '-w', str(size), 
                    '-h', str(size), 
                    svg_path, 
                    '-o', str(output_path)
                ], check=True, capture_output=True)
                success = True
                print(f"✅ Created {filename} ({size}x{size})")
            except (subprocess.CalledProcessError, FileNotFoundError):
                pass
            
            # Try ImageMagick convert if rsvg-convert failed
            if not success:
                try:
                    result = subprocess.run([
                        'convert', 
                        '-background', 'transparent',
                        '-size', f'{size}x{size}',
                        svg_path, 
                        str(output_path)
                    ], check=True, capture_output=True)
                    success = True
                    print(f"✅ Created {filename} ({size}x{size}) with ImageMagick")
                except (subprocess.CalledProcessError, FileNotFoundError):
                    pass
            
            if not success:
                print(f"❌ Failed to create {filename}")
        
        # Generate the .icns file
        try:
            icns_path = '/Users/maxbohn/pen_and_paper_timeline/build/icon.icns'
            result = subprocess.run([
                'iconutil', 
                '-c', 'icns', 
                str(iconset_dir),
                '-o', icns_path
            ], check=True, capture_output=True)
            print(f"✅ Created icon.icns")
            return True
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to create .icns file: {e}")
            return False
            
    finally:
        # Clean up temporary SVG file
        os.unlink(svg_path)

def install_dependencies():
    """Check and install required dependencies"""
    print("🔍 Checking for required tools...")
    
    # Check for rsvg-convert
    try:
        subprocess.run(['rsvg-convert', '--version'], check=True, capture_output=True)
        print("✅ rsvg-convert is available")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ rsvg-convert not found")
    
    # Check for ImageMagick
    try:
        subprocess.run(['convert', '--version'], check=True, capture_output=True)
        print("✅ ImageMagick is available")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ ImageMagick not found")
    
    print("\n🚨 No suitable SVG converter found!")
    print("Please install one of the following:")
    print("  • librsvg (recommended): brew install librsvg")
    print("  • ImageMagick: brew install imagemagick")
    print("\nThen run this script again.")
    return False

if __name__ == "__main__":
    print("🎨 Creating beautiful custom app icon for Pen & Paper Timeline...")
    print("✨ This enhanced icon represents elegant D&D timeline management with:")
    print("   • Modern gradient timeline with vibrant event markers")
    print("   • Premium 3D D20 die with refined details")
    print("   • Elegant clock with sophisticated styling")
    print("   • Beautiful scroll with quill for campaign storytelling")
    print("   • Modern calendar with clean design")
    print("   • Enhanced magical sparkles and energy connections")
    print("   • Professional color palette matching the app's aesthetic")
    print()
    
    if install_dependencies():
        if create_iconset():
            print("\n🎊 Icon creation complete!")
            print("📍 Files created:")
            print("   • icon.iconset/ - Individual PNG files")
            print("   • icon.icns - macOS icon file")
            print("\n🔄 To apply the new icon:")
            print("   1. Run: npm run build-mac")
            print("   2. Replace your old app with the new one from dist-electron/mac/")
            print("   3. The new icon will appear after a few seconds")
        else:
            print("\n❌ Icon creation failed. Please check the errors above.")
    else:
        exit(1)
