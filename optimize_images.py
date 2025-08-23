#!/usr/bin/env python3
"""
Script de otimização de imagens para o site Átria Veículos
Otimiza automaticamente todas as imagens PNG/JPG para WebP com compressão inteligente
"""

import os
import sys
from PIL import Image, ImageOps
import argparse

def optimize_image(input_path, output_dir):
    """
    Otimiza uma única imagem convertendo para WebP
    """
    try:
        # Abrir imagem original
        with Image.open(input_path) as img:
            # Converter para RGB se necessário (para WebP)
            if img.mode in ('RGBA', 'LA', 'P'):
                img = img.convert('RGBA')
                # Criar fundo branco para transparências
                background = Image.new('RGBA', img.size, (255, 255, 255, 255))
                img = Image.alpha_composite(background, img).convert('RGB')
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Corrigir orientação baseada no EXIF
            img = ImageOps.exif_transpose(img)
            
            # Redimensionar se necessário (máximo 1200px de largura)
            original_width, original_height = img.size
            if original_width > 1200:
                ratio = 1200 / original_width
                new_height = int(original_height * ratio)
                img = img.resize((1200, new_height), Image.Resampling.LANCZOS)
                print(f"  📏 Redimensionado: {original_width}x{original_height} → 1200x{new_height}")
            
            # Determinar qualidade baseada no tipo de imagem
            filename = os.path.basename(input_path).lower()
            
            # Logos e ícones: qualidade alta (90)
            if any(word in filename for word in ['logo', 'icon', 'brand']):
                quality = 90
            # Banners e fotos grandes: qualidade média-alta (75)  
            elif any(word in filename for word in ['banner', 'background', 'hero']):
                quality = 75
            # Outras imagens: qualidade média (70)
            else:
                quality = 70
            
            # Criar nome do arquivo otimizado
            base_name = os.path.splitext(os.path.basename(input_path))[0]
            output_path = os.path.join(output_dir, f"{base_name}.webp")
            
            # Salvar como WebP otimizado
            img.save(output_path, 
                    'WebP', 
                    quality=quality, 
                    method=6,  # Melhor compressão
                    optimize=True)
            
            # Verificar tamanhos
            original_size = os.path.getsize(input_path)
            optimized_size = os.path.getsize(output_path)
            reduction = ((original_size - optimized_size) / original_size) * 100
            
            print(f"  ✅ {os.path.basename(input_path)} → {os.path.basename(output_path)}")
            print(f"     📊 {format_size(original_size)} → {format_size(optimized_size)} ({reduction:.1f}% redução)")
            
            return original_size, optimized_size
            
    except Exception as e:
        print(f"  ❌ Erro ao processar {input_path}: {str(e)}")
        return 0, 0

def format_size(size_bytes):
    """Formatar tamanho em bytes para leitura humana"""
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024**2:
        return f"{size_bytes/1024:.1f} KB"
    else:
        return f"{size_bytes/(1024**2):.1f} MB"

def main():
    parser = argparse.ArgumentParser(description='Otimizar imagens para WebP')
    parser.add_argument('--input-dir', default='public/images', help='Diretório de entrada')  
    parser.add_argument('--output-dir', default='public/images/optimized', help='Diretório de saída')
    parser.add_argument('--extensions', nargs='+', default=['.png', '.jpg', '.jpeg'], help='Extensões a processar')
    
    args = parser.parse_args()
    
    # Verificar se diretório de entrada existe
    if not os.path.exists(args.input_dir):
        print(f"❌ Diretório {args.input_dir} não encontrado!")
        sys.exit(1)
    
    # Criar diretório de saída
    os.makedirs(args.output_dir, exist_ok=True)
    print(f"📁 Otimizando imagens de {args.input_dir} para {args.output_dir}")
    print("=" * 60)
    
    # Estatísticas
    total_original = 0
    total_optimized = 0
    processed = 0
    
    # Processar todas as imagens recursivamente
    for root, dirs, files in os.walk(args.input_dir):
        # Pular diretório de saída
        if args.output_dir in root:
            continue
            
        for file in files:
            file_path = os.path.join(root, file)
            file_ext = os.path.splitext(file)[1].lower()
            
            if file_ext in args.extensions:
                print(f"🔄 Processando: {file}")
                
                # Manter estrutura de diretórios
                rel_path = os.path.relpath(root, args.input_dir)
                if rel_path == '.':
                    output_subdir = args.output_dir
                else:
                    output_subdir = os.path.join(args.output_dir, rel_path)
                    os.makedirs(output_subdir, exist_ok=True)
                
                original_size, optimized_size = optimize_image(file_path, output_subdir)
                total_original += original_size
                total_optimized += optimized_size
                processed += 1
                print()
    
    # Resumo final
    print("=" * 60)
    print(f"🎉 OTIMIZAÇÃO CONCLUÍDA!")
    print(f"📊 Arquivos processados: {processed}")
    print(f"📦 Tamanho original: {format_size(total_original)}")
    print(f"📦 Tamanho otimizado: {format_size(total_optimized)}")
    
    if total_original > 0:
        total_reduction = ((total_original - total_optimized) / total_original) * 100
        print(f"🚀 Redução total: {total_reduction:.1f}% ({format_size(total_original - total_optimized)} economizados)")
        
        # Estimativa de melhoria de performance
        load_improvement = min(total_reduction * 0.8, 70)  # Estimativa conservadora
        print(f"⚡ Melhoria estimada no carregamento: ~{load_improvement:.1f}%")

if __name__ == "__main__":
    main()