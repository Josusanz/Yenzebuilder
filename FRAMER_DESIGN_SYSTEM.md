# 🎨 YENZE - Framer-Style Design System

## Overview

YENZE ahora utiliza un diseño limpio, moderno y minimalista inspirado en Framer, con modo light (claro) como predeterminado.

## 🎨 Color Palette

### Primary Colors
- **Primary Blue**: `#0099ff` - Botones principales, enlaces activos, badges
- **Primary Hover**: `#0088dd` - Estados hover de botones

### Neutral Colors (Light Mode)
- **Background**: `#fafafa` - Fondo principal del body
- **White**: `#ffffff` - Fondo de cards y contenedores
- **Black**: `#000000` - Textos principales y títulos
- **Gray 66**: `#666666` - Textos secundarios
- **Gray 99**: `#999999` - Textos terciarios
- **Border**: `#e8e8e8` - Bordes de cards
- **Background Gray**: `#f5f5f5` - Fondos secundarios

### Accent Colors
- **Light Blue**: `#f0f9ff` - Fondos de estados activos
- **Success**: `#d1fae5` - Estados exitosos
- **Warning**: `#fef3c7` - Estados de advertencia
- **Error**: `#fee2e2` - Estados de error

## 📐 Typography

### Font Family
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Font Sizes & Weights
- **Hero Title**: 40px, weight 600, letter-spacing -1px
- **Section Title**: 32px, weight 600, letter-spacing -0.5px
- **Card Title**: 18px, weight 600, letter-spacing -0.2px
- **Body Text**: 14px, weight 400
- **Small Text**: 13px, weight 400
- **Badge**: 10px, weight 600, uppercase

## 🔲 Components

### Cards (`.plan-option`)
```css
background: #ffffff;
border: 1px solid #e8e8e8;
border-radius: 16px;
padding: 32px 28px;
box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
```

**Hover State:**
```css
border-color: #0099ff;
box-shadow: 0 8px 24px rgba(0, 153, 255, 0.12);
transform: translateY(-2px);
```

**Featured Plan:**
```css
border-color: #0099ff;
border-width: 2px;
background: linear-gradient(180deg, rgba(0, 153, 255, 0.02) 0%, rgba(0, 153, 255, 0.00) 100%);
```

### Buttons

**Primary Button (`.btn-primary`)**
```css
background: #0099ff;
color: white;
border-radius: 10px;
padding: 12px 20px;
font-size: 14px;
font-weight: 500;
transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
```

**Secondary Button (`.btn-secondary`)**
```css
background: #f5f5f5;
color: #666666;
border: 1px solid #e8e8e8;
border-radius: 10px;
```

### Badges
```css
background: #0099ff;
color: white;
padding: 4px 12px;
border-radius: 6px;
font-size: 10px;
font-weight: 600;
letter-spacing: 0.5px;
text-transform: uppercase;
```

### Period Toggle
```css
/* Container */
display: inline-flex;
background: #f5f5f5;
border-radius: 10px;
padding: 4px;

/* Active Button */
background: white;
color: #000;
padding: 8px 20px;
border-radius: 8px;
```

## 🎯 Design Principles (Framer-Style)

### 1. Minimalism
- Clean layouts con mucho espacio en blanco
- Bordes sutiles (1px, #e8e8e8)
- Sombras ligeras y elegantes

### 2. Typography-First
- Tipografía grande y bold para títulos
- Letter-spacing negativo en títulos grandes (-0.5px a -1px)
- Jerarquía clara con tamaños y pesos

### 3. Smooth Interactions
- Transiciones suaves con `cubic-bezier(0.4, 0, 0.2, 1)`
- Transforms sutiles (`translateY(-2px)`)
- Duraciones cortas (0.2s - 0.25s)

### 4. Blue as Primary
- Azul vibrante (#0099ff) como color principal
- Contrasta bien con fondos blancos
- Visible pero no agresivo

### 5. Card-Based Layout
- Todo organizado en cards con bordes sutiles
- Border-radius grandes (12px-16px)
- Hover states con elevación

## 📱 Responsive Breakpoints

```css
@media (max-width: 1024px) {
    /* Tablets */
}

@media (max-width: 768px) {
    /* Mobile */
}
```

## 🚀 Comparison: Old vs New

| Aspect | Old Design | New Design (Framer) |
|--------|-----------|---------------------|
| **Colors** | Purple gradient (#667eea → #764ba2) | Clean blue (#0099ff) |
| **Background** | #f5f7fa | #fafafa (lighter) |
| **Borders** | 2px solid #e5e7eb | 1px solid #e8e8e8 |
| **Shadows** | Heavy (0 10px 25px) | Subtle (0 1px 2px) |
| **Border Radius** | 12px | 16px |
| **Typography** | Standard weights | Tighter spacing, bolder |
| **Button Style** | Gradient backgrounds | Solid colors, simple |
| **Overall Feel** | Colorful, playful | Minimal, professional |

## 📦 Files Modified

1. **public/dashboard.css** - Complete redesign
2. **public/dashboard.html** - Added period toggle, updated structure
3. **public/index.html** - Updated publish modal prices (previous commit)

## 🎨 Design Inspiration

Based on [Framer's Pricing Page](https://www.framer.com/pricing/):
- Clean light mode
- Blue accent color
- Period toggle for annual/monthly
- Card-based layout with subtle shadows
- Typography-first approach
- Smooth micro-interactions

## ✅ What's Different

### Colors
- ✅ All purple gradients replaced with clean blue
- ✅ Background now #fafafa (very light gray)
- ✅ Text colors simplified (black, #666, #999)

### Layout
- ✅ Cards now left-aligned instead of center
- ✅ Period toggle added (Annual/Monthly)
- ✅ Better spacing and padding
- ✅ Badge repositioned to top-right

### Typography
- ✅ Larger, bolder titles
- ✅ Negative letter-spacing for modern look
- ✅ Better hierarchy

### Interactions
- ✅ Smoother transitions (cubic-bezier)
- ✅ Subtle hover effects
- ✅ Less aggressive transforms

## 🔜 Next Steps

- [ ] Implement price switching for annual/monthly toggle
- [ ] Add more Framer-like animations (fade-in, stagger)
- [ ] Consider dark mode support
- [ ] Add testimonials section
- [ ] Create comparison table component
