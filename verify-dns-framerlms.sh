#!/bin/bash

# Script para verificar DNS de framerlms.com
# Ejecutar con: bash verify-dns-framerlms.sh

echo "🔍 Verificando DNS de framerlms.com..."
echo ""

echo "1️⃣ Verificando dominio root (framerlms.com):"
dig framerlms.com +short
echo "   ✅ Debería mostrar: 76.76.2.3"
echo ""

echo "2️⃣ Verificando www (www.framerlms.com):"
dig www.framerlms.com CNAME +short
echo "   ✅ Debería mostrar: cname.vercel-dns.com"
echo ""

echo "3️⃣ Verificando resolución completa de www:"
dig www.framerlms.com +short
echo "   ✅ Debería mostrar una IP de Vercel"
echo ""

echo "4️⃣ Verificando acceso HTTP:"
echo "   Root domain:"
curl -I http://framerlms.com 2>/dev/null | head -n 1
echo "   WWW domain:"
curl -I http://www.framerlms.com 2>/dev/null | head -n 1
echo ""

echo "✅ Si todo está correcto, los dominios deberían cargar tu sitio de Vercel"
echo "🔄 Si aún no funciona, espera más tiempo (hasta 1 hora) para propagación DNS"
