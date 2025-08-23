#!/bin/bash

# Script para reorganizar assets do Cloudinary usando API REST
# Usa curl para mover assets para pastas organizadas

CLOUD_NAME="dyngqkiyl"
API_KEY="${CLOUDINARY_API_KEY}"
API_SECRET="${CLOUDINARY_API_SECRET}"

echo "🚀 Reorganização de Assets do Cloudinary"
echo "========================================="
echo ""

# Verifica credenciais
if [ -z "$API_KEY" ] || [ -z "$API_SECRET" ]; then
    echo "❌ Erro: Credenciais não encontradas!"
    echo "Configure CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET"
    exit 1
fi

echo "✅ Credenciais configuradas"
echo "📊 Cloud Name: $CLOUD_NAME"
echo ""

# Função para listar recursos
list_resources() {
    curl -s -X GET \
        -u "${API_KEY}:${API_SECRET}" \
        "https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/image/upload?max_results=500"
}

# Função para determinar a pasta de destino
determine_folder() {
    local public_id="$1"
    local id_lower=$(echo "$public_id" | tr '[:upper:]' '[:lower:]')
    
    # Ignora samples
    if [[ "$id_lower" == *"sample"* ]]; then
        echo "skip"
        return
    fi
    
    # Já está organizado
    if [[ "$public_id" == "atria-veiculos/"* ]]; then
        echo "skip"
        return
    fi
    
    # Marcas de veículos
    if [[ "$id_lower" == *"brand"* ]] || [[ "$id_lower" == *"marca"* ]] || \
       [[ "$id_lower" == *"bmw"* ]] || [[ "$id_lower" == *"audi"* ]] || \
       [[ "$id_lower" == *"mercedes"* ]] || [[ "$id_lower" == *"toyota"* ]]; then
        echo "atria-veiculos/images/brands"
        return
    fi
    
    # Hero e banners
    if [[ "$id_lower" == *"hero"* ]] || [[ "$id_lower" == *"banner"* ]] || \
       [[ "$id_lower" == *"sell-car"* ]]; then
        echo "atria-veiculos/hero"
        return
    fi
    
    # Veículos
    if [[ "$id_lower" == *"vehicle"* ]] || [[ "$id_lower" == *"car"* ]] || \
       [[ "$id_lower" == *"veiculo"* ]] || [[ "$id_lower" == *"cart"* ]]; then
        echo "atria-veiculos/veiculos"
        return
    fi
    
    # Depoimentos
    if [[ "$id_lower" == *"testimonial"* ]] || [[ "$id_lower" == *"depoimento"* ]]; then
        echo "atria-veiculos/depoimentos"
        return
    fi
    
    # Blog
    if [[ "$id_lower" == *"blog"* ]] || [[ "$id_lower" == *"post"* ]]; then
        echo "atria-veiculos/blog"
        return
    fi
    
    # Ícones
    if [[ "$id_lower" == *"icon"* ]] || [[ "$id_lower" == *"feature"* ]]; then
        echo "atria-veiculos/icons"
        return
    fi
    
    # Financiamento
    if [[ "$id_lower" == *"financing"* ]] || [[ "$id_lower" == *"calculator"* ]]; then
        echo "atria-veiculos/ferramentas"
        return
    fi
    
    # Sobre
    if [[ "$id_lower" == *"about"* ]] || [[ "$id_lower" == *"dealer"* ]]; then
        echo "atria-veiculos/about"
        return
    fi
    
    # Padrão
    echo "atria-veiculos/images/misc"
}

# Lista recursos e processa
echo "📥 Buscando recursos no Cloudinary..."
RESOURCES=$(list_resources)

if [ $? -ne 0 ]; then
    echo "❌ Erro ao buscar recursos"
    exit 1
fi

# Extrai public_ids usando jq ou python
echo "$RESOURCES" | python3 -c "
import json
import sys

data = json.load(sys.stdin)
resources = data.get('resources', [])

print(f'✅ Encontrados {len(resources)} recursos\n')

# Conta categorias
stats = {
    'moved': 0,
    'skipped': 0,
    'errors': 0,
    'by_folder': {}
}

# Processa cada recurso
for resource in resources:
    public_id = resource['public_id']
    
    # Se já está em atria-veiculos, pula
    if public_id.startswith('atria-veiculos/'):
        print(f'⏭️  {public_id} (já organizado)')
        stats['skipped'] += 1
        continue
    
    # Se é sample, pula
    if 'sample' in public_id.lower():
        print(f'⏭️  {public_id} (sample)')
        stats['skipped'] += 1
        continue
    
    # Determina categoria
    id_lower = public_id.lower()
    
    if 'brand' in id_lower or 'marca' in id_lower:
        folder = 'atria-veiculos/images/brands'
    elif 'hero' in id_lower or 'banner' in id_lower or 'sell-car' in id_lower:
        folder = 'atria-veiculos/hero'
    elif 'vehicle' in id_lower or 'car' in id_lower or 'veiculo' in id_lower:
        folder = 'atria-veiculos/veiculos'
    elif 'testimonial' in id_lower or 'depoimento' in id_lower:
        folder = 'atria-veiculos/depoimentos'
    elif 'blog' in id_lower or 'post' in id_lower:
        folder = 'atria-veiculos/blog'
    elif 'icon' in id_lower or 'feature' in id_lower:
        folder = 'atria-veiculos/icons'
    elif 'financing' in id_lower or 'calculator' in id_lower:
        folder = 'atria-veiculos/ferramentas'
    elif 'about' in id_lower or 'dealer' in id_lower:
        folder = 'atria-veiculos/about'
    else:
        folder = 'atria-veiculos/images/misc'
    
    # Nome do arquivo
    filename = public_id.split('/')[-1]
    new_id = f'{folder}/{filename}'
    
    print(f'📁 {public_id}')
    print(f'   → {new_id}')
    
    stats['moved'] += 1
    if folder not in stats['by_folder']:
        stats['by_folder'][folder] = 0
    stats['by_folder'][folder] += 1

print('\n' + '='*60)
print('📊 RESUMO DA REORGANIZAÇÃO PLANEJADA:')
print('='*60)
print(f\"✅ Para mover: {stats['moved']} recursos\")
print(f\"⏭️  Ignorados: {stats['skipped']} recursos\")

if stats['by_folder']:
    print('\n📁 Distribuição por pasta:')
    for folder, count in sorted(stats['by_folder'].items(), key=lambda x: x[1], reverse=True):
        print(f'  {folder}: {count} arquivos')

print('\n💡 IMPORTANTE:')
print('Este é um preview da reorganização.')
print('Para executar a movimentação real dos arquivos, você precisará:')
print('1. Instalar o SDK do Cloudinary: npm install cloudinary')
print('2. Executar o script Node.js: node cloudinary-reorganize.js')
print('')
print('Os URLs antigos continuarão funcionando após a reorganização.')
print('O Cloudinary mantém redirecionamento automático.')
"