#!/bin/bash
# Test script to verify analytics are working for framerlms.com

echo "🧪 Testing Analytics for framerlms.com"
echo "======================================="
echo ""

echo "📋 Instrucciones:"
echo "1. Abre framerlms.com en tu navegador (ventana de incógnito)"
echo "2. Espera 3-5 segundos para que se registre el evento"
echo "3. Presiona ENTER aquí para verificar si se creó el evento"
echo ""
read -p "Presiona ENTER cuando hayas visitado framerlms.com..."

echo ""
echo "🔍 Verificando eventos de analytics..."
echo ""

node check-analytics.js

echo ""
echo "✅ Si ves eventos arriba, ¡las analytics están funcionando!"
echo ""
echo "💡 Para ver las estadísticas en el dashboard:"
echo "   1. Ve a builder.yenze.io/dashboard.html"
echo "   2. Haz clic en la sección 'Analytics'"
echo "   3. Deberías ver las estadísticas actualizadas"
