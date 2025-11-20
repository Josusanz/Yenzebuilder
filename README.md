# ⚡ YENZE Builder - Visual HTML Editor

Un editor visual de HTML moderno y potente que te permite importar, editar y publicar sitios web de forma visual.

## 🚀 Demo en vivo

**URL:** https://yenzehtml-bp7a9y2va-josus-projects-95701179.vercel.app

## 📖 Cómo usar

1. **Importa tu HTML** de dos formas:
   - Arrastra y suelta un archivo `.html`
   - Pega código HTML directamente en el área de texto

2. **Edita visualmente:**
   - Haz clic en cualquier elemento del canvas
   - Modifica propiedades en el panel derecho (colores, texto, tamaño de fuente)
   - Visualiza la estructura en el panel "Layers"

3. **Vista responsive:**
   - Cambia entre Desktop, Tablet y Mobile
   - Previsualiza cómo se ve en diferentes dispositivos

4. **Exporta y publica:**
   - Ver código: botón `</> Code`
   - Preview: abre en nueva ventana
   - Publish: genera URL de publicación

## 🎨 Prueba con este HTML de ejemplo

Copia y pega este código en el área "OR PASTE HTML":

\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <title>Mi Sitio Web</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 {
            color: #667eea;
            font-size: 3rem;
            margin-bottom: 10px;
        }
        p {
            color: #666;
            font-size: 1.2rem;
            line-height: 1.8;
        }
        .button {
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 40px;
            border-radius: 50px;
            border: none;
            font-size: 1.1rem;
            cursor: pointer;
            margin-top: 20px;
        }
        .card {
            background: #f8f9fa;
            padding: 30px;
            border-radius: 15px;
            margin-top: 30px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>¡Bienvenido a YENZE!</h1>
        <p>Este es un ejemplo de sitio web que puedes editar visualmente. Haz clic en cualquier elemento para modificar sus propiedades.</p>

        <button class="button">Click Aquí</button>

        <div class="card">
            <h2>Características</h2>
            <p>Editor visual intuitivo con soporte para edición en tiempo real de colores, textos y más.</p>
        </div>

        <div class="card">
            <h2>Responsive Design</h2>
            <p>Previsualiza tu sitio en diferentes dispositivos: Desktop, Tablet y Mobile.</p>
        </div>
    </div>
</body>
</html>
\`\`\`

## 🛠️ Tecnologías

- HTML5
- CSS3
- Vanilla JavaScript
- LocalStorage para persistencia
- **Supabase** - Autenticación y base de datos
- **Stripe** - Sistema de pagos y suscripciones
- **PostgreSQL** - Base de datos con Row Level Security

## 💎 Planes y Monetización

YENZE Builder utiliza un modelo **Freemium** con 3 niveles:

### 🆓 FREE (Gratis)
- ✅ Edición ilimitada sin login
- ✅ Publicación en subdominio YENZE
- ✅ Incluye badge "Made with YENZE"
- ❌ Sin dominio personalizado

### ⭐ PRO ($9.99/mes)
- ✅ Todo lo de FREE
- ✅ Dominio personalizado
- ✅ Descargar HTML/ZIP
- ✅ Remover badge de YENZE
- ✅ Hasta 5 proyectos
- ✅ Panel de analytics
- ✅ Soporte prioritario

### 🚀 BUSINESS ($29.99/mes)
- ✅ Todo lo de PRO
- ✅ Proyectos ilimitados
- ✅ White label completo
- ✅ Múltiples dominios personalizados
- ✅ Inyección de código personalizado
- ✅ Analytics avanzados
- ✅ Acceso a API
- ✅ Colaboración en equipo
- ✅ Soporte 24/7

## 🔐 Sistema de Autenticación

El proyecto ahora incluye un sistema completo de autenticación y gestión de usuarios:

- **Login/Signup** con email y contraseña
- **OAuth** con Google y GitHub
- **Recuperación de contraseña**
- **Gestión de sesiones**
- **Base de datos PostgreSQL** con Row Level Security
- **Sistema de suscripciones** con Stripe

### 📋 Configuración Requerida

Para activar todas las funcionalidades, necesitas configurar:

1. **Supabase** (autenticación y base de datos)
2. **Stripe** (pagos y suscripciones)
3. **Variables de entorno**

**👉 Ver guía completa**: [SETUP-GUIDE.md](SETUP-GUIDE.md)
**📊 Resumen técnico**: [AUTHENTICATION-SUMMARY.md](AUTHENTICATION-SUMMARY.md)

### ⚡ Inicio Rápido (Solo Autenticación)

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ejecuta el schema SQL: `supabase-schema.sql`
3. Actualiza `config.js` con tus credenciales:
   ```javascript
   const SUPABASE_CONFIG = {
       url: 'TU_SUPABASE_URL',
       anonKey: 'TU_SUPABASE_ANON_KEY'
   };
   ```
4. ¡Listo! Ya puedes probar login/signup y publicar en modo FREE

## 📦 Deployment

Deployed en Vercel con deploy automático.

## 🔄 Actualizar el sitio

\`\`\`bash
git add .
git commit -m "Descripción del cambio"
vercel --prod
\`\`\`

## 📁 Estructura del Proyecto

```
yenzehtml/
├── index.html                    # Interfaz principal
├── app.js                        # Lógica de la aplicación
├── config.js                     # Configuración (Supabase, Stripe, Planes)
├── supabase-client.js            # Cliente de Supabase (auth y DB)
├── auth-ui.js                    # Componentes de autenticación (modales)
├── auth-styles.css               # Estilos para auth
├── stripe-integration.js         # Integración con Stripe
├── supabase-schema.sql           # Schema de base de datos
├── example.html                  # HTML de ejemplo para probar
├── SETUP-GUIDE.md               # Guía completa de configuración
├── AUTHENTICATION-SUMMARY.md    # Resumen técnico de implementación
└── README.md                    # Este archivo
```
