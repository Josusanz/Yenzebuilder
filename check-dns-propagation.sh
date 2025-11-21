#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Verificador de Propagación DNS          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

DOMAIN="yenze.io"

echo -e "${YELLOW}🔍 Verificando nameservers...${NC}"
echo ""

# Check nameservers
NS=$(dig NS $DOMAIN +short | head -2)
echo -e "${BLUE}Nameservers actuales:${NC}"
echo "$NS"
echo ""

# Check if GoDaddy nameservers
if echo "$NS" | grep -q "domaincontrol"; then
    echo -e "${GREEN}✅ Los nameservers ya están en GoDaddy!${NC}"
    echo ""
    echo -e "${YELLOW}Ahora puedes agregar los registros DNS:${NC}"
    echo ""
    echo -e "${BLUE}1. A Record:${NC}"
    echo "   Tipo:  A"
    echo "   Nombre: @"
    echo "   Valor: 76.76.21.21"
    echo "   TTL:   600"
    echo ""
    echo -e "${BLUE}2. CNAME Record:${NC}"
    echo "   Tipo:  CNAME"
    echo "   Nombre: www"
    echo "   Valor: cname.vercel-dns.com"
    echo "   TTL:   600"
    echo ""
    echo -e "${GREEN}Ve a: https://dcc.godaddy.com/control/yenze.io/dns${NC}"
    echo ""
else
    echo -e "${YELLOW}⏳ Todavía usando nameservers antiguos (DiagonalHosting)${NC}"
    echo -e "${YELLOW}   Esto puede tardar de 1-4 horas en propagarse.${NC}"
    echo ""
    echo -e "${BLUE}Ejecuta este script nuevamente en 30-60 minutos:${NC}"
    echo "   ./check-dns-propagation.sh"
    echo ""
fi

# Check A record (will only work after nameserver change)
echo -e "${BLUE}Verificando registro A...${NC}"
A_RECORD=$(dig A $DOMAIN +short | head -1)
if [ -z "$A_RECORD" ]; then
    echo -e "${RED}❌ No hay registro A configurado aún${NC}"
elif [ "$A_RECORD" = "76.76.21.21" ]; then
    echo -e "${GREEN}✅ Registro A correcto: $A_RECORD${NC}"
else
    echo -e "${YELLOW}⚠️  Registro A actual: $A_RECORD (debería ser 76.76.21.21)${NC}"
fi
echo ""

# Check CNAME record for www
echo -e "${BLUE}Verificando registro CNAME para www...${NC}"
CNAME_RECORD=$(dig CNAME www.$DOMAIN +short | head -1)
if [ -z "$CNAME_RECORD" ]; then
    echo -e "${RED}❌ No hay registro CNAME para www aún${NC}"
elif echo "$CNAME_RECORD" | grep -q "vercel-dns"; then
    echo -e "${GREEN}✅ Registro CNAME correcto: $CNAME_RECORD${NC}"
else
    echo -e "${YELLOW}⚠️  Registro CNAME actual: $CNAME_RECORD (debería ser cname.vercel-dns.com)${NC}"
fi
echo ""

# Summary
echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║             Resumen del Estado             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

if echo "$NS" | grep -q "domaincontrol" && [ "$A_RECORD" = "76.76.21.21" ] && echo "$CNAME_RECORD" | grep -q "vercel-dns"; then
    echo -e "${GREEN}🎉 ¡TODO LISTO! Tu dominio está configurado correctamente.${NC}"
    echo ""
    echo -e "${YELLOW}Ahora ejecuta:${NC}"
    echo "   vercel domains ls"
    echo ""
    echo -e "${YELLOW}Para verificar que Vercel haya detectado el dominio.${NC}"
else
    echo -e "${YELLOW}⏳ Configuración en progreso...${NC}"
    echo ""
    if ! echo "$NS" | grep -q "domaincontrol"; then
        echo -e "${YELLOW}Pendiente:${NC}"
        echo "   • Esperar propagación de nameservers (1-4 horas)"
    else
        if [ "$A_RECORD" != "76.76.21.21" ]; then
            echo "   • Configurar registro A en GoDaddy"
        fi
        if ! echo "$CNAME_RECORD" | grep -q "vercel-dns"; then
            echo "   • Configurar registro CNAME en GoDaddy"
        fi
    fi
fi
echo ""
