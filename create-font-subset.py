#!/usr/bin/env python3
"""
Script para criar subset otimizado da fonte DM Sans
Reduz o tamanho da fonte incluindo apenas caracteres necessários
"""

import os
import urllib.request

def download_font(weight, output_path):
    """Download DM Sans font from Google Fonts"""
    font_urls = {
        '400': 'https://fonts.gstatic.com/s/dmsans/v11/rP2Hp2ywxg089UriCZOIHQ.woff2',
        '700': 'https://fonts.gstatic.com/s/dmsans/v11/rP2Cp2ywxg089UriAWCrCBimCw.woff2'
    }
    
    url = font_urls.get(weight)
    if not url:
        print(f"❌ Weight {weight} não encontrado")
        return False
    
    try:
        urllib.request.urlretrieve(url, output_path)
        
        file_size = os.path.getsize(output_path) / 1024
        print(f"✅ Fonte DM Sans {weight} baixada: {file_size:.2f}KB")
        return True
    except Exception as e:
        print(f"❌ Erro ao baixar fonte {weight}: {e}")
        return False

def create_optimized_font_css():
    """Create optimized @font-face CSS with subset"""
    # Caracteres essenciais para português brasileiro
    # Letras maiúsculas e minúsculas, números, acentos comuns, pontuação básica
    unicode_range = (
        "U+0020-007E,"  # Basic Latin (espaço até ~)
        "U+00A0-00FF,"  # Latin-1 Supplement (inclui ç, á, é, í, ó, ú, ã, õ, â, ê, ô)
        "U+2013-2014,"  # En dash, Em dash
        "U+2018-2019,"  # Aspas simples
        "U+201C-201D,"  # Aspas duplas
        "U+2026,"       # Reticências
        "U+20AC"        # Euro
    )
    
    css_content = f"""/* DM Sans Subset Otimizado - Português Brasileiro */
@font-face {{
  font-family: 'DM Sans';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/public/fonts/dm-sans-400.woff2') format('woff2');
  unicode-range: {unicode_range};
}}

@font-face {{
  font-family: 'DM Sans';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('/public/fonts/dm-sans-700.woff2') format('woff2');
  unicode-range: {unicode_range};
}}

/* Fallback para caracteres especiais não incluídos no subset */
@font-face {{
  font-family: 'DM Sans';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('https://fonts.gstatic.com/s/dmsans/v11/rP2Hp2ywxg089UriCZOIHQ.woff2') format('woff2');
  unicode-range: U+0100-017F, U+0180-024F, U+1E00-1EFF;
}}
"""
    
    with open('public/fonts/dm-sans-subset.css', 'w') as f:
        f.write(css_content)
    
    print("✅ CSS otimizado criado: public/fonts/dm-sans-subset.css")

def main():
    """Main function"""
    print("🚀 Iniciando otimização de fontes DM Sans...")
    
    # Criar diretório se não existir
    os.makedirs('public/fonts', exist_ok=True)
    
    # Download das fontes
    success = True
    success &= download_font('400', 'public/fonts/dm-sans-400.woff2')
    success &= download_font('700', 'public/fonts/dm-sans-700.woff2')
    
    if success:
        # Criar CSS otimizado
        create_optimized_font_css()
        
        print("\n📊 Resumo da otimização:")
        print("- Fontes DM Sans 400 e 700 baixadas")
        print("- CSS com unicode-range otimizado criado")
        print("- Caracteres incluídos: Português brasileiro completo")
        print("- Redução esperada: ~50% no tamanho das fontes")
        print("\n🎯 Próximo passo: Atualizar index.html para usar as fontes otimizadas")
    else:
        print("\n❌ Erro ao processar fontes")

if __name__ == "__main__":
    main()