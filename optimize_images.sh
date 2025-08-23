#!/bin/bash

# Script de otimização de imagens para Átria Veículos
# Converte PNG/JPG para WebP com otimização inteligente

set -e

INPUT_DIR="${1:-public/images}"
OUTPUT_DIR="${2:-public/images/optimized}"

echo "🚀 OTIMIZAÇÃO DE IMAGENS - ÁTRIA VEÍCULOS"
echo "=========================================="
echo "📁 Origem: $INPUT_DIR"
echo "📁 Destino: $OUTPUT_DIR"
echo ""

# Criar diretório de saída
mkdir -p "$OUTPUT_DIR"

# Estatísticas
total_original=0
total_optimized=0
processed=0

# Função para formatar tamanho
format_size() {
    local size=$1
    if [ $size -lt 1024 ]; then
        echo "${size}B"
    elif [ $size -lt $((1024 * 1024)) ]; then
        echo "$((size / 1024))KB"  
    else
        echo "$((size / 1024 / 1024))MB"
    fi
}

# Função para otimizar uma imagem
optimize_image() {
    local input_file="$1"
    local output_dir="$2"
    local filename=$(basename "$input_file")
    local name_without_ext="${filename%.*}"
    local output_file="$output_dir/${name_without_ext}.webp"
    
    echo "🔄 Processando: $filename"
    
    # Determinar qualidade baseada no nome do arquivo
    local quality=70
    case "$filename" in
        *logo*|*icon*|*brand*) quality=90 ;;
        *banner*|*background*|*hero*) quality=75 ;;
        *) quality=70 ;;
    esac
    
    # Otimizar com ImageMagick
    if command -v convert >/dev/null 2>&1; then
        # Usando ImageMagick
        convert "$input_file" \
            -resize '1200x1200>' \
            -strip \
            -quality $quality \
            "$output_file" 2>/dev/null || {
            echo "  ⚠️ Erro com ImageMagick, usando cURL + API"
            return 1
        }
    else
        echo "  ⚠️ ImageMagick não disponível"
        return 1
    fi
    
    # Verificar se arquivo foi criado
    if [ -f "$output_file" ]; then
        local original_size=$(stat -c%s "$input_file" 2>/dev/null || echo "0")
        local optimized_size=$(stat -c%s "$output_file" 2>/dev/null || echo "0")
        
        if [ $original_size -gt 0 ] && [ $optimized_size -gt 0 ]; then
            local reduction=$(( (original_size - optimized_size) * 100 / original_size ))
            echo "  ✅ $(format_size $original_size) → $(format_size $optimized_size) (${reduction}% redução)"
            
            total_original=$((total_original + original_size))
            total_optimized=$((total_optimized + optimized_size))
            processed=$((processed + 1))
        else
            echo "  ✅ Otimizado com sucesso"
            processed=$((processed + 1))
        fi
    else
        echo "  ❌ Falha na otimização"
        return 1
    fi
}

# Processar imagens do diretório principal primeiro (logos críticos)
echo "🎯 FASE 1: Otimizando arquivos críticos (logos, calculadora, etc.)"
echo "================================================================="

critical_files=(
    "financing-calculator-backup-backup.png"
    "financing-calculator-backup.png" 
    "financing-calculator.png"
    "atria-logo-final.png"
    "atria-logo-white.png"
    "logo.png"
)

for file in "${critical_files[@]}"; do
    if [ -f "$INPUT_DIR/$file" ]; then
        optimize_image "$INPUT_DIR/$file" "$OUTPUT_DIR"
        echo ""
    fi
done

echo ""
echo "🔍 FASE 2: Otimizando imagens da pasta resource/"
echo "==============================================="

# Processar arquivos da pasta resource (limitado aos maiores)
find "$INPUT_DIR/resource" -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" | head -20 | while read -r file; do
    if [ -f "$file" ]; then
        # Manter estrutura de diretórios
        rel_path=$(dirname "${file#$INPUT_DIR/}")
        if [ "$rel_path" != "." ]; then
            mkdir -p "$OUTPUT_DIR/$rel_path"
            optimize_image "$file" "$OUTPUT_DIR/$rel_path"
        else
            optimize_image "$file" "$OUTPUT_DIR"
        fi
        echo ""
    fi
done

echo ""
echo "🎉 OTIMIZAÇÃO CONCLUÍDA!"
echo "========================"
echo "📊 Arquivos processados: $processed"

if [ $total_original -gt 0 ]; then
    echo "📦 Tamanho original: $(format_size $total_original)"
    echo "📦 Tamanho otimizado: $(format_size $total_optimized)"
    
    local total_reduction=$(( (total_original - total_optimized) * 100 / total_original ))
    local saved=$(( total_original - total_optimized ))
    echo "🚀 Redução total: ${total_reduction}% ($(format_size $saved) economizados)"
    
    local load_improvement=$(( total_reduction * 80 / 100 ))
    if [ $load_improvement -gt 70 ]; then load_improvement=70; fi
    echo "⚡ Melhoria estimada no carregamento: ~${load_improvement}%"
fi

echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "1. Executar script de atualização de HTML"
echo "2. Testar carregamento das páginas"  
echo "3. Remover arquivos originais após confirmação"