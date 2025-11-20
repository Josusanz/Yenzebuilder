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

## 📦 Deployment

Deployed en Vercel con deploy automático.

## 🔄 Actualizar el sitio

\`\`\`bash
git add .
git commit -m "Descripción del cambio"
vercel --prod
\`\`\`
