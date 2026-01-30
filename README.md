# YENZE Builder - Visual HTML Editor

Un editor visual de HTML moderno, gratuito y open source. Importa, edita y publica sitios web sin escribir codigo.

**100% Gratis - Sin limites - Open Source**

## Demo en Vivo

**URL:** [https://yenze.io](https://yenze.io)

## Caracteristicas

- **Editor Visual** - Click y edita cualquier elemento
- **Importar HTML** - Arrastra archivos o pega codigo
- **Vista Responsive** - Desktop, Tablet y Mobile
- **Publicar Gratis** - Subdominio yoursite.yenze.io incluido
- **Descargar HTML** - Exporta tu codigo y deployalo donde quieras
- **Self-Hosting** - Deploya tu propia instancia

## Uso Rapido

1. **Importa tu HTML** - Arrastra un `.html` o pega codigo
2. **Edita visualmente** - Click en elementos para modificar
3. **Previsualiza** - Ve como queda en diferentes dispositivos
4. **Publica o descarga** - Gratis, solo ingresa tu email

## Self-Hosting

Quieres tu propia instancia? Sigue la guia:

- [SELF-HOSTING.md](SELF-HOSTING.md) - Guia rapida
- [DEPLOY-TUTORIAL.md](DEPLOY-TUTORIAL.md) - Tutorial paso a paso

### Deploy en 5 minutos

```bash
# 1. Fork este repo
# 2. Crea proyecto en Supabase
# 3. Ejecuta supabase-schema.sql
# 4. Deploy en Vercel conectando tu fork
# 5. Agrega variables de entorno
```

## Stack Tecnologico

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Vercel Serverless Functions
- **Database:** Supabase (PostgreSQL)
- **Auth:** Email simple (sin passwords)

## Estructura del Proyecto

```
yenzehtml/
├── public/
│   ├── builder.html      # Editor principal
│   ├── app.js            # Logica del editor
│   ├── email-gate.js     # Captura de emails
│   ├── supabase-client.js
│   └── ...
├── api/                  # Serverless functions
├── migrations/           # SQL migrations
├── SELF-HOSTING.md       # Guia de self-hosting
├── DEPLOY-TUTORIAL.md    # Tutorial de deploy
└── supabase-schema.sql   # Schema de base de datos
```

## Contribuir

Las contribuciones son bienvenidas!

1. Fork el proyecto
2. Crea tu branch (`git checkout -b feature/MiFeature`)
3. Commit tus cambios (`git commit -m 'Add MiFeature'`)
4. Push al branch (`git push origin feature/MiFeature`)
5. Abre un Pull Request

## Apoyar el Proyecto

Si YENZE te es util, considera:

- Dar una estrella al repo
- Compartir en redes sociales
- [Invitarme un cafe](https://ko-fi.com/yourusername)

## Licencia

MIT License - Usa el codigo como quieras.

## Autor

Creado por [@yourusername](https://twitter.com/yourusername)

---

**Hecho con amor para la comunidad open source**
