#!/bin/bash
# Script para substituir URLs antigas do Cloudinary pelas novas otimizadas

echo "🔄 Substituindo URLs do Cloudinary..."

# Backup
echo "📦 Criando backup..."
tar -czf backup-before-cloudinary-$(date +%Y%m%d-%H%M%S).tar.gz src/ public/

# Substituições

# freepik__the-style-is-candid-image-photography-with-natural__47739_g8kdq9 → atria-site/misc/freepik__the-style-is-candid-image-photography-with-natural__47739_g8kdq9
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754439564/freepik__the-style-is-candid-image-photography-with-natural__47739_g8kdq9\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/misc/freepik__the-style-is-candid-image-photography-with-natural__47739_g8kdq9.png|g' {} +

# atria-site/images/resource/dealer1-2 → atria-site/images/dealer1-2
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405398/atria-site/images/resource/dealer1-2\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/dealer1-2.png|g' {} +

# atria-site/images/resource/deal1-9 → atria-site/images/deal1-9
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405396/atria-site/images/resource/deal1-9\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/deal1-9.png|g' {} +

# atria-site/images/resource/deal1-8 → atria-site/images/deal1-8
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405395/atria-site/images/resource/deal1-8\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/deal1-8.png|g' {} +

# atria-site/images/resource/deal1-7 → atria-site/images/deal1-7
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405394/atria-site/images/resource/deal1-7\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/deal1-7.png|g' {} +

# atria-site/images/resource/deal1-6 → atria-site/images/deal1-6
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405393/atria-site/images/resource/deal1-6\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/deal1-6.png|g' {} +

# atria-site/images/resource/deal1-5 → atria-site/images/deal1-5
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405392/atria-site/images/resource/deal1-5\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/deal1-5.png|g' {} +

# atria-site/images/resource/deal1-4 → atria-site/images/deal1-4
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405391/atria-site/images/resource/deal1-4\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/deal1-4.png|g' {} +

# atria-site/images/resource/deal1-3 → atria-site/images/deal1-3
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405390/atria-site/images/resource/deal1-3\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/deal1-3.png|g' {} +

# atria-site/images/resource/deal1-12 → atria-site/images/deal1-12
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405388/atria-site/images/resource/deal1-12\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/deal1-12.png|g' {} +

# atria-site/images/resource/deal1-11 → atria-site/images/deal1-11
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405387/atria-site/images/resource/deal1-11\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/deal1-11.png|g' {} +

# atria-site/images/resource/deal1-10 → atria-site/images/deal1-10
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405386/atria-site/images/resource/deal1-10\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/deal1-10.png|g' {} +

# atria-site/images/resource/deal1-1 → atria-site/images/deal1-1
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405385/atria-site/images/resource/deal1-1\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/deal1-1.png|g' {} +

# atria-site/images/resource/compare3 → atria-site/images/compare3
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405384/atria-site/images/resource/compare3\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/compare3.png|g' {} +

# atria-site/images/resource/compare2 → atria-site/images/compare2
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405383/atria-site/images/resource/compare2\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/compare2.png|g' {} +

# atria-site/images/resource/compare1 → atria-site/images/compare1
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405382/atria-site/images/resource/compare1\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/compare1.png|g' {} +

# atria-site/images/resource/comas → atria-site/images/comas
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405381/atria-site/images/resource/comas\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/comas.png|g' {} +

# atria-site/images/resource/citroen → atria-site/images/citroen
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405380/atria-site/images/resource/citroen\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/citroen.png|g' {} +

# atria-site/images/resource/cart3 → atria-site/veiculos/cart3
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405378/atria-site/images/resource/cart3\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/veiculos/cart3.png|g' {} +

# atria-site/images/resource/cart2 → atria-site/veiculos/cart2
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405377/atria-site/images/resource/cart2\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/veiculos/cart2.png|g' {} +

# atria-site/images/resource/cart1 → atria-site/veiculos/cart1
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405376/atria-site/images/resource/cart1\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/veiculos/cart1.png|g' {} +

# atria-site/images/resource/car-single-4 → atria-site/veiculos/car-single-4
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405374/atria-site/images/resource/car-single-4\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/veiculos/car-single-4.png|g' {} +

# atria-site/images/resource/car-single-3 → atria-site/veiculos/car-single-3
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405373/atria-site/images/resource/car-single-3\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/veiculos/car-single-3.png|g' {} +

# atria-site/images/resource/car-single-2 → atria-site/veiculos/car-single-2
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405372/atria-site/images/resource/car-single-2\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/veiculos/car-single-2.png|g' {} +

# atria-site/images/resource/car-single-1 → atria-site/veiculos/car-single-1
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405371/atria-site/images/resource/car-single-1\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/veiculos/car-single-1.png|g' {} +

# atria-site/images/resource/car-search → atria-site/veiculos/car-search
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405370/atria-site/images/resource/car-search\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/veiculos/car-search.png|g' {} +

# atria-site/images/resource/candidate-88 → atria-site/images/candidate-88
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405369/atria-site/images/resource/candidate-88\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/candidate-88.png|g' {} +

# atria-site/images/resource/candidate-8 → atria-site/images/candidate-8
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405368/atria-site/images/resource/candidate-8\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/candidate-8.png|g' {} +

# atria-site/images/resource/candidate-7 → atria-site/images/candidate-7
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405367/atria-site/images/resource/candidate-7\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/candidate-7.png|g' {} +

# atria-site/images/resource/candidate-6 → atria-site/images/candidate-6
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405366/atria-site/images/resource/candidate-6\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/candidate-6.png|g' {} +

# atria-site/images/resource/candidate-5 → atria-site/images/candidate-5
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405365/atria-site/images/resource/candidate-5\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/candidate-5.png|g' {} +

# atria-site/images/resource/candidate-4 → atria-site/images/candidate-4
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405364/atria-site/images/resource/candidate-4\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/candidate-4.png|g' {} +

# atria-site/images/resource/candidate-3 → atria-site/images/candidate-3
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405363/atria-site/images/resource/candidate-3\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/candidate-3.png|g' {} +

# atria-site/images/resource/candidate-2 → atria-site/images/candidate-2
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405362/atria-site/images/resource/candidate-2\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/candidate-2.png|g' {} +

# atria-site/images/resource/candidate-1 → atria-site/images/candidate-1
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405361/atria-site/images/resource/candidate-1\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/candidate-1.png|g' {} +

# atria-site/images/resource/brandf → atria-site/marcas/brandf
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405360/atria-site/images/resource/brandf\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/marcas/brandf.png|g' {} +

# atria-site/images/resource/brandf-backup → atria-site/marcas/brandf-backup
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405359/atria-site/images/resource/brandf-backup\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/marcas/brandf-backup.png|g' {} +

# atria-site/images/resource/brand5-9 → atria-site/marcas/brand5-9
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405357/atria-site/images/resource/brand5-9\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/marcas/brand5-9.png|g' {} +

# atria-site/images/resource/brand5-8 → atria-site/marcas/brand5-8
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405356/atria-site/images/resource/brand5-8\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/marcas/brand5-8.png|g' {} +

# atria-site/images/resource/brand5-7 → atria-site/marcas/brand5-7
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405355/atria-site/images/resource/brand5-7\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/marcas/brand5-7.png|g' {} +

# atria-site/images/resource/brand5-6 → atria-site/marcas/brand5-6
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405354/atria-site/images/resource/brand5-6\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/marcas/brand5-6.png|g' {} +

# atria-site/images/resource/brand5-3 → atria-site/marcas/brand5-3
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405351/atria-site/images/resource/brand5-3\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/marcas/brand5-3.png|g' {} +

# atria-site/images/resource/brand-jeep → atria-site/marcas/brand-jeep
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405346/atria-site/images/resource/brand-jeep\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/marcas/brand-jeep.png|g' {} +

# atria-site/images/resource/brand-fiat → atria-site/marcas/brand-fiat
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405345/atria-site/images/resource/brand-fiat\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/marcas/brand-fiat.png|g' {} +

# atria-site/images/resource/brand-caoa-chery → atria-site/marcas/brand-caoa-chery
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405344/atria-site/images/resource/brand-caoa-chery\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/marcas/brand-caoa-chery.png|g' {} +

# atria-site/images/resource/brand-6 → atria-site/marcas/brand-6
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405342/atria-site/images/resource/brand-6\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/marcas/brand-6.png|g' {} +

# atria-site/images/resource/brand-4 → atria-site/marcas/brand-4
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405339/atria-site/images/resource/brand-4\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/marcas/brand-4.png|g' {} +

# atria-site/images/resource/brand-3 → atria-site/marcas/brand-3
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405338/atria-site/images/resource/brand-3\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/marcas/brand-3.png|g' {} +

# atria-site/images/resource/brand-1 → atria-site/marcas/brand-1
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405336/atria-site/images/resource/brand-1\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/marcas/brand-1.png|g' {} +

# atria-site/images/resource/book1-3 → atria-site/images/book1-3
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405334/atria-site/images/resource/book1-3\.svg|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/book1-3.svg|g' {} +

# atria-site/images/resource/book1-2 → atria-site/images/book1-2
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405332/atria-site/images/resource/book1-2\.svg|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/book1-2.svg|g' {} +

# atria-site/images/resource/book1-1 → atria-site/images/book1-1
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405330/atria-site/images/resource/book1-1\.svg|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/book1-1.svg|g' {} +

# atria-site/images/resource/blog5-6 → atria-site/images/blog5-6
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405329/atria-site/images/resource/blog5-6\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/blog5-6.png|g' {} +

# atria-site/images/resource/blog5-5 → atria-site/images/blog5-5
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405327/atria-site/images/resource/blog5-5\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/blog5-5.png|g' {} +

# atria-site/images/resource/blog5-4 → atria-site/images/blog5-4
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405326/atria-site/images/resource/blog5-4\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/blog5-4.png|g' {} +

# atria-site/images/resource/blog5-3 → atria-site/images/blog5-3
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405325/atria-site/images/resource/blog5-3\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/blog5-3.png|g' {} +

# atria-site/images/resource/blog5-2 → atria-site/images/blog5-2
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405324/atria-site/images/resource/blog5-2\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/blog5-2.png|g' {} +

# atria-site/images/resource/blog5-1 → atria-site/images/blog5-1
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405323/atria-site/images/resource/blog5-1\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/blog5-1.png|g' {} +

# atria-site/images/resource/blog4-9 → atria-site/images/blog4-9
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405322/atria-site/images/resource/blog4-9\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/blog4-9.png|g' {} +

# atria-site/images/resource/blog4-8 → atria-site/images/blog4-8
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405321/atria-site/images/resource/blog4-8\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/blog4-8.png|g' {} +

# atria-site/images/resource/blog4-7 → atria-site/images/blog4-7
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405320/atria-site/images/resource/blog4-7\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/blog4-7.png|g' {} +

# atria-site/images/resource/blog4-6 → atria-site/images/blog4-6
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405319/atria-site/images/resource/blog4-6\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/blog4-6.png|g' {} +

# atria-site/images/resource/blog4-5 → atria-site/images/blog4-5
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405317/atria-site/images/resource/blog4-5\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/blog4-5.png|g' {} +

# atria-site/images/resource/blog4-4 → atria-site/images/blog4-4
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405316/atria-site/images/resource/blog4-4\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/blog4-4.png|g' {} +

# atria-site/images/resource/blog4-3 → atria-site/images/blog4-3
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405315/atria-site/images/resource/blog4-3\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/blog4-3.png|g' {} +

# atria-site/images/resource/blog4-2 → atria-site/images/blog4-2
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405314/atria-site/images/resource/blog4-2\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/blog4-2.png|g' {} +

# atria-site/images/resource/blog4-1 → atria-site/images/blog4-1
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405313/atria-site/images/resource/blog4-1\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/blog4-1.png|g' {} +

# atria-site/images/resource/blog3-2 → atria-site/images/blog3-2
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405312/atria-site/images/resource/blog3-2\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/blog3-2.png|g' {} +

# atria-site/images/resource/blog3-1 → atria-site/images/blog3-1
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405311/atria-site/images/resource/blog3-1\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/blog3-1.png|g' {} +

# atria-site/images/resource/blog-3 → atria-site/images/blog-3
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405310/atria-site/images/resource/blog-3\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/blog-3.png|g' {} +

# atria-site/images/resource/blog-2 → atria-site/images/blog-2
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405309/atria-site/images/resource/blog-2\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/blog-2.png|g' {} +

# atria-site/images/resource/blog-1 → atria-site/images/blog-1
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405308/atria-site/images/resource/blog-1\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/blog-1.png|g' {} +

# atria-site/images/resource/banner-six → atria-site/hero/banner-six
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405307/atria-site/images/resource/banner-six\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/hero/banner-six.png|g' {} +

# atria-site/images/resource/auther2-1 → atria-site/images/auther2-1
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405306/atria-site/images/resource/auther2-1\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/auther2-1.png|g' {} +

# atria-site/images/resource/audi → atria-site/images/audi
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405305/atria-site/images/resource/audi\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/audi.png|g' {} +

# atria-site/images/resource/apple → atria-site/images/apple
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405304/atria-site/images/resource/apple\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/apple.png|g' {} +

# atria-site/images/resource/apple-1 → atria-site/images/apple-1
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405303/atria-site/images/resource/apple-1\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/apple-1.png|g' {} +

# atria-site/images/resource/ali-tufan → atria-site/images/ali-tufan
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405302/atria-site/images/resource/ali-tufan\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/ali-tufan.png|g' {} +

# atria-site/images/resource/add-car3 → atria-site/veiculos/add-car3
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405301/atria-site/images/resource/add-car3\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/veiculos/add-car3.png|g' {} +

# atria-site/images/resource/add-car2 → atria-site/veiculos/add-car2
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405299/atria-site/images/resource/add-car2\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/veiculos/add-car2.png|g' {} +

# atria-site/images/resource/add-car1 → atria-site/veiculos/add-car1
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405298/atria-site/images/resource/add-car1\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/veiculos/add-car1.png|g' {} +

# atria-site/images/resource/about-inner1-5 → atria-site/images/about-inner1-5
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405297/atria-site/images/resource/about-inner1-5\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/about-inner1-5.png|g' {} +

# atria-site/images/resource/about-inner1-4 → atria-site/images/about-inner1-4
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405296/atria-site/images/resource/about-inner1-4\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/about-inner1-4.png|g' {} +

# atria-site/images/resource/about-inner1-3 → atria-site/images/about-inner1-3
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405295/atria-site/images/resource/about-inner1-3\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/about-inner1-3.png|g' {} +

# atria-site/images/resource/about-inner1-2 → atria-site/images/about-inner1-2
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405294/atria-site/images/resource/about-inner1-2\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/about-inner1-2.png|g' {} +

# atria-site/images/resource/about-inner1-1 → atria-site/images/about-inner1-1
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405293/atria-site/images/resource/about-inner1-1\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/about-inner1-1.png|g' {} +

# atria-site/images/optimized/resource/blog4-1 → atria-site/images/blog4-1
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405292/atria-site/images/optimized/resource/blog4-1\.webp|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/blog4-1.webp|g' {} +

# atria-site/images/optimized/resource/blog3-2 → atria-site/images/blog3-2
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405291/atria-site/images/optimized/resource/blog3-2\.webp|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/blog3-2.webp|g' {} +

# atria-site/images/optimized/resource/blog3-1 → atria-site/images/blog3-1
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405290/atria-site/images/optimized/resource/blog3-1\.webp|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/blog3-1.webp|g' {} +

# atria-site/images/optimized/resource/blog-3 → atria-site/images/blog-3
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405289/atria-site/images/optimized/resource/blog-3\.webp|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/blog-3.webp|g' {} +

# atria-site/images/optimized/resource/blog-2 → atria-site/images/blog-2
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405288/atria-site/images/optimized/resource/blog-2\.webp|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/blog-2.webp|g' {} +

# atria-site/images/optimized/resource/blog-1 → atria-site/images/blog-1
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405287/atria-site/images/optimized/resource/blog-1\.webp|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/blog-1.webp|g' {} +

# atria-site/images/optimized/resource/banner-six → atria-site/hero/banner-six
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405286/atria-site/images/optimized/resource/banner-six\.webp|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/hero/banner-six.webp|g' {} +

# atria-site/images/optimized/resource/auther2-1 → atria-site/images/auther2-1
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405285/atria-site/images/optimized/resource/auther2-1\.webp|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/auther2-1.webp|g' {} +

# atria-site/images/optimized/resource/audi → atria-site/images/audi
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405284/atria-site/images/optimized/resource/audi\.webp|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/audi.webp|g' {} +

# atria-site/images/optimized/resource/apple → atria-site/images/apple
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405283/atria-site/images/optimized/resource/apple\.webp|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/apple.webp|g' {} +

# atria-site/images/optimized/resource/apple-1 → atria-site/images/apple-1
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405282/atria-site/images/optimized/resource/apple-1\.webp|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/apple-1.webp|g' {} +

# atria-site/images/optimized/resource/ali-tufan → atria-site/images/ali-tufan
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405281/atria-site/images/optimized/resource/ali-tufan\.webp|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/ali-tufan.webp|g' {} +

# atria-site/images/optimized/resource/add-car3 → atria-site/veiculos/add-car3
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405280/atria-site/images/optimized/resource/add-car3\.webp|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/veiculos/add-car3.webp|g' {} +

# atria-site/images/optimized/resource/add-car2 → atria-site/veiculos/add-car2
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405279/atria-site/images/optimized/resource/add-car2\.webp|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/veiculos/add-car2.webp|g' {} +

# atria-site/images/optimized/resource/add-car1 → atria-site/veiculos/add-car1
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405277/atria-site/images/optimized/resource/add-car1\.webp|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/veiculos/add-car1.webp|g' {} +

# atria-site/images/optimized/resource/about-inner1-5 → atria-site/images/about-inner1-5
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405276/atria-site/images/optimized/resource/about-inner1-5\.webp|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/about-inner1-5.webp|g' {} +

# atria-site/images/optimized/resource/about-inner1-4 → atria-site/images/about-inner1-4
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405275/atria-site/images/optimized/resource/about-inner1-4\.webp|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/about-inner1-4.webp|g' {} +

# atria-site/images/optimized/resource/about-inner1-3 → atria-site/images/about-inner1-3
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405274/atria-site/images/optimized/resource/about-inner1-3\.webp|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/about-inner1-3.webp|g' {} +

# atria-site/images/optimized/resource/about-inner1-2 → atria-site/images/about-inner1-2
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405273/atria-site/images/optimized/resource/about-inner1-2\.webp|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/about-inner1-2.webp|g' {} +

# atria-site/images/optimized/resource/about-inner1-1 → atria-site/images/about-inner1-1
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405272/atria-site/images/optimized/resource/about-inner1-1\.webp|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/about-inner1-1.webp|g' {} +

# atria-site/images/optimized/logo → atria-site/marcas/logo
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405271/atria-site/images/optimized/logo\.webp|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/marcas/logo.webp|g' {} +

# atria-site/images/optimized/financing-calculator → atria-site/ferramentas/financing-calculator
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405270/atria-site/images/optimized/financing-calculator\.webp|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/ferramentas/financing-calculator.webp|g' {} +

# atria-site/images/optimized/financing-calculator-backup → atria-site/ferramentas/financing-calculator-backup
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405269/atria-site/images/optimized/financing-calculator-backup\.webp|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/ferramentas/financing-calculator-backup.webp|g' {} +

# atria-site/images/optimized/financing-calculator-backup-backup → atria-site/ferramentas/financing-calculator-backup-backup
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405268/atria-site/images/optimized/financing-calculator-backup-backup\.webp|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/ferramentas/financing-calculator-backup-backup.webp|g' {} +

# atria-site/images/optimized/atria-logo-white → atria-site/marcas/atria-logo-white
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405267/atria-site/images/optimized/atria-logo-white\.webp|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/marcas/atria-logo-white.webp|g' {} +

# atria-site/images/optimized/atria-logo-final → atria-site/marcas/atria-logo-final
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405266/atria-site/images/optimized/atria-logo-final\.webp|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/marcas/atria-logo-final.webp|g' {} +

# atria-site/images/logos/logo-white → atria-site/marcas/logo-white
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405264/atria-site/images/logos/logo-white\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/marcas/logo-white.png|g' {} +

# atria-site/images/logos/logo-white-original → atria-site/marcas/logo-white-original
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405263/atria-site/images/logos/logo-white-original\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/marcas/logo-white-original.png|g' {} +

# atria-site/images/logos/logo-white-backup → atria-site/marcas/logo-white-backup
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405261/atria-site/images/logos/logo-white-backup\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/marcas/logo-white-backup.png|g' {} +

# atria-site/images/logos/logo-white-backup-old → atria-site/marcas/logo-white-backup-old
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405261/atria-site/images/logos/logo-white-backup-old\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/marcas/logo-white-backup-old.png|g' {} +

# atria-site/images/logos/logo-white-backup-backup → atria-site/marcas/logo-white-backup-backup
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405259/atria-site/images/logos/logo-white-backup-backup\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/marcas/logo-white-backup-backup.png|g' {} +

# atria-site/images/logos/logo-default → atria-site/marcas/logo-default
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405257/atria-site/images/logos/logo-default\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/marcas/logo-default.png|g' {} +

# atria-site/images/logos/logo-default-backup → atria-site/marcas/logo-default-backup
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405257/atria-site/images/logos/logo-default-backup\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/marcas/logo-default-backup.png|g' {} +

# atria-site/images/logos/logo-default-backup-backup → atria-site/marcas/logo-default-backup-backup
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405256/atria-site/images/logos/logo-default-backup-backup\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/marcas/logo-default-backup-backup.png|g' {} +

# atria-site/images/icons/search → atria-site/images/search
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405247/atria-site/images/icons/search\.svg|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/search.svg|g' {} +

# atria-site/images/icons/remove → atria-site/images/remove
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405245/atria-site/images/icons/remove\.svg|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/remove.svg|g' {} +

# atria-site/images/icons/lob3 → atria-site/images/lob3
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405243/atria-site/images/icons/lob3\.svg|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/lob3.svg|g' {} +

# atria-site/images/icons/lob2 → atria-site/images/lob2
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405241/atria-site/images/icons/lob2\.svg|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/lob2.svg|g' {} +

# atria-site/images/icons/lob1 → atria-site/images/lob1
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405239/atria-site/images/icons/lob1\.svg|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/lob1.svg|g' {} +

# atria-site/images/icons/filter → atria-site/images/filter
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405237/atria-site/images/icons/filter\.svg|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/filter.svg|g' {} +

# atria-site/images/icons/edit → atria-site/images/edit
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405235/atria-site/images/icons/edit\.svg|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/edit.svg|g' {} +

# atria-site/images/icons/dash8 → atria-site/images/dash8
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405233/atria-site/images/icons/dash8\.svg|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/dash8.svg|g' {} +

# atria-site/images/icons/dash7 → atria-site/images/dash7
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405231/atria-site/images/icons/dash7\.svg|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/dash7.svg|g' {} +

# atria-site/images/icons/dash6 → atria-site/images/dash6
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405229/atria-site/images/icons/dash6\.svg|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/dash6.svg|g' {} +

# atria-site/images/icons/dash5 → atria-site/images/dash5
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405227/atria-site/images/icons/dash5\.svg|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/dash5.svg|g' {} +

# atria-site/images/icons/dash4 → atria-site/images/dash4
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405226/atria-site/images/icons/dash4\.svg|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/dash4.svg|g' {} +

# atria-site/images/icons/dash3 → atria-site/images/dash3
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405224/atria-site/images/icons/dash3\.svg|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/dash3.svg|g' {} +

# atria-site/images/icons/dash2 → atria-site/images/dash2
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405221/atria-site/images/icons/dash2\.svg|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/dash2.svg|g' {} +

# atria-site/images/icons/dash1 → atria-site/images/dash1
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405219/atria-site/images/icons/dash1\.svg|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/dash1.svg|g' {} +

# atria-site/images/icons/cv9 → atria-site/images/cv9
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405217/atria-site/images/icons/cv9\.svg|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/cv9.svg|g' {} +

# atria-site/images/icons/cv8 → atria-site/images/cv8
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405215/atria-site/images/icons/cv8\.svg|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/cv8.svg|g' {} +

# atria-site/images/icons/cv7 → atria-site/images/cv7
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405213/atria-site/images/icons/cv7\.svg|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/cv7.svg|g' {} +

# atria-site/images/icons/cv6 → atria-site/images/cv6
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405211/atria-site/images/icons/cv6\.svg|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/cv6.svg|g' {} +

# atria-site/images/icons/cv5 → atria-site/images/cv5
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405209/atria-site/images/icons/cv5\.svg|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/cv5.svg|g' {} +

# atria-site/images/icons/cv4 → atria-site/images/cv4
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405207/atria-site/images/icons/cv4\.svg|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/cv4.svg|g' {} +

# atria-site/images/icons/cv3 → atria-site/images/cv3
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405205/atria-site/images/icons/cv3\.svg|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/cv3.svg|g' {} +

# atria-site/images/icons/cv2 → atria-site/images/cv2
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405203/atria-site/images/icons/cv2\.svg|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/cv2.svg|g' {} +

# atria-site/images/icons/cv11 → atria-site/images/cv11
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405201/atria-site/images/icons/cv11\.svg|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/cv11.svg|g' {} +

# atria-site/images/icons/cv10 → atria-site/images/cv10
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405199/atria-site/images/icons/cv10\.svg|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/cv10.svg|g' {} +

# atria-site/images/icons/cv1 → atria-site/images/cv1
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405196/atria-site/images/icons/cv1\.svg|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/cv1.svg|g' {} +

# atria-site/images/icons/close → atria-site/images/close
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405194/atria-site/images/icons/close\.svg|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/close.svg|g' {} +

# atria-site/images/icons/cart4 → atria-site/veiculos/cart4
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405192/atria-site/images/icons/cart4\.svg|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/veiculos/cart4.svg|g' {} +

# atria-site/images/icons/cart3 → atria-site/veiculos/cart3
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405191/atria-site/images/icons/cart3\.svg|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/veiculos/cart3.svg|g' {} +

# atria-site/images/icons/cart2 → atria-site/veiculos/cart2
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405188/atria-site/images/icons/cart2\.svg|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/veiculos/cart2.svg|g' {} +

# atria-site/images/icons/cart1 → atria-site/veiculos/cart1
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405186/atria-site/images/icons/cart1\.svg|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/veiculos/cart1.svg|g' {} +

# atria-site/images/brands/volvo → atria-site/marcas/volvo
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405176/atria-site/images/brands/volvo\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/marcas/volvo.png|g' {} +

# atria-site/images/brands/volvo-backup → atria-site/marcas/volvo-backup
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405175/atria-site/images/brands/volvo-backup\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/marcas/volvo-backup.png|g' {} +

# atria-site/images/brands/volkswagen → atria-site/marcas/volkswagen
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405174/atria-site/images/brands/volkswagen\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/marcas/volkswagen.png|g' {} +

# atria-site/images/brands/toyota → atria-site/marcas/toyota
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405172/atria-site/images/brands/toyota\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/marcas/toyota.png|g' {} +

# atria-site/images/brands/toyota-backup → atria-site/marcas/toyota-backup
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405171/atria-site/images/brands/toyota-backup\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/marcas/toyota-backup.png|g' {} +

# atria-site/images/brands/suzuki → atria-site/marcas/suzuki
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405170/atria-site/images/brands/suzuki\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/marcas/suzuki.png|g' {} +

# atria-site/images/brands/renault → atria-site/marcas/renault
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405169/atria-site/images/brands/renault\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/marcas/renault.png|g' {} +

# atria-site/images/brands/peugeot → atria-site/marcas/peugeot
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405168/atria-site/images/brands/peugeot\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/marcas/peugeot.png|g' {} +

# atria-site/images/brands/peugeot-backup → atria-site/marcas/peugeot-backup
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405167/atria-site/images/brands/peugeot-backup\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/marcas/peugeot-backup.png|g' {} +

# atria-site/images/brands/nissan → atria-site/marcas/nissan
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405165/atria-site/images/brands/nissan\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/marcas/nissan.png|g' {} +

# atria-site/images/brands/mitsubishi → atria-site/marcas/mitsubishi
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405164/atria-site/images/brands/mitsubishi\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/marcas/mitsubishi.png|g' {} +

# atria-site/images/brands/mitsubishi-backup → atria-site/marcas/mitsubishi-backup
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405163/atria-site/images/brands/mitsubishi-backup\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/marcas/mitsubishi-backup.png|g' {} +

# atria-site/images/brands/mini → atria-site/marcas/mini
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405162/atria-site/images/brands/mini\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/marcas/mini.png|g' {} +

# atria-site/images/brands/mercedes-benz → atria-site/marcas/mercedes-benz
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405161/atria-site/images/brands/mercedes-benz\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/marcas/mercedes-benz.png|g' {} +

# atria-site/images/brands/mercedes-benz-backup → atria-site/marcas/mercedes-benz-backup
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405160/atria-site/images/brands/mercedes-benz-backup\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/marcas/mercedes-benz-backup.png|g' {} +

# atria-site/images/brands/kia → atria-site/marcas/kia
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405159/atria-site/images/brands/kia\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/marcas/kia.png|g' {} +

# atria-site/images/brands/kia-new → atria-site/marcas/kia-new
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405158/atria-site/images/brands/kia-new\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/marcas/kia-new.png|g' {} +

# atria-site/images/brands/chevrolet → atria-site/marcas/chevrolet
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405157/atria-site/images/brands/chevrolet\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/marcas/chevrolet.png|g' {} +

# atria-site/images/brands/chevrolet-backup → atria-site/marcas/chevrolet-backup
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405155/atria-site/images/brands/chevrolet-backup\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/marcas/chevrolet-backup.png|g' {} +

# atria-site/images/brands/audi → atria-site/marcas/audi
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405154/atria-site/images/brands/audi\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/marcas/audi.png|g' {} +

# atria-site/images/brands/audi-backup → atria-site/marcas/audi-backup
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405153/atria-site/images/brands/audi-backup\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/marcas/audi-backup.png|g' {} +

# atria-site/images/banner/bg-7 → atria-site/hero/bg-7
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405150/atria-site/images/banner/bg-7\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/hero/bg-7.png|g' {} +

# atria-site/images/banner/bg-4-1 → atria-site/hero/bg-4-1
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405149/atria-site/images/banner/bg-4-1\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/hero/bg-4-1.png|g' {} +

# atria-site/images/banner/bg-2 → atria-site/hero/bg-2
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405148/atria-site/images/banner/bg-2\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/hero/bg-2.png|g' {} +

# atria-site/images/banner/banner5-1 → atria-site/hero/banner5-1
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405147/atria-site/images/banner/banner5-1\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/hero/banner5-1.png|g' {} +

# atria-site/images/banner/banner-page9 → atria-site/hero/banner-page9
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405145/atria-site/images/banner/banner-page9\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/hero/banner-page9.png|g' {} +

# atria-site/images/banner/banner-page1 → atria-site/hero/banner-page1
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405144/atria-site/images/banner/banner-page1\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/hero/banner-page1.png|g' {} +

# atria-site/images/banner/banner-hp3 → atria-site/hero/banner-hp3
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405143/atria-site/images/banner/banner-hp3\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/hero/banner-hp3.png|g' {} +

# atria-site/images/banner/banner-calc-9 → atria-site/hero/banner-calc-9
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405142/atria-site/images/banner/banner-calc-9\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/hero/banner-calc-9.png|g' {} +

# atria-site/images/banks/itau-seeklogo → atria-site/marcas/itau-seeklogo
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405141/atria-site/images/banks/itau-seeklogo\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/marcas/itau-seeklogo.png|g' {} +

# atria-site/images/banks/c6-bank-seeklogo → atria-site/marcas/c6-bank-seeklogo
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405140/atria-site/images/banks/c6-bank-seeklogo\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/marcas/c6-bank-seeklogo.png|g' {} +

# atria-site/images/banks/bv-seeklogo → atria-site/marcas/bv-seeklogo
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405138/atria-site/images/banks/bv-seeklogo\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/marcas/bv-seeklogo.png|g' {} +

# atria-site/images/banks/bradesco-seeklogo → atria-site/marcas/bradesco-seeklogo
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405137/atria-site/images/banks/bradesco-seeklogo\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/marcas/bradesco-seeklogo.png|g' {} +

# atria-site/images/banks/banco-santander-seeklogo → atria-site/marcas/banco-santander-seeklogo
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405136/atria-site/images/banks/banco-santander-seeklogo\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/marcas/banco-santander-seeklogo.png|g' {} +

# atria-site/images/banks/banco-safra-seeklogo → atria-site/marcas/banco-safra-seeklogo
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405135/atria-site/images/banks/banco-safra-seeklogo\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/marcas/banco-safra-seeklogo.png|g' {} +

# atria-site/images/banks/banco-pan-seeklogo → atria-site/marcas/banco-pan-seeklogo
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405134/atria-site/images/banks/banco-pan-seeklogo\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/marcas/banco-pan-seeklogo.png|g' {} +

# atria-site/images/background/child → atria-site/images/child
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405133/atria-site/images/background/child\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/images/child.png|g' {} +

# atria-site/images/background/banner-v8 → atria-site/hero/banner-v8
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405132/atria-site/images/background/banner-v8\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/hero/banner-v8.png|g' {} +

# atria-site/css/images/ui-icons_555555_256x240 → atria-site/icones/ui-icons_555555_256x240
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405106/atria-site/css/images/ui-icons_555555_256x240\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/icones/ui-icons_555555_256x240.png|g' {} +

# atria-site/css/images/ui-icons_444444_256x240 → atria-site/icones/ui-icons_444444_256x240
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754405105/atria-site/css/images/ui-icons_444444_256x240\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/icones/ui-icons_444444_256x240.png|g' {} +

# teste-preset-1754404645521 → atria-site/misc/teste-preset-1754404645521
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1754404645/teste-preset-1754404645521\.jpg|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/misc/teste-preset-1754404645521.jpg|g' {} +

# main-sample → atria-site/misc/main-sample
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1752837691/main-sample\.png|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/misc/main-sample.png|g' {} +

# cld-sample-4 → atria-site/misc/cld-sample-4
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1752837691/cld-sample-4\.jpg|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/misc/cld-sample-4.jpg|g' {} +

# cld-sample-5 → atria-site/misc/cld-sample-5
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1752837691/cld-sample-5\.jpg|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/misc/cld-sample-5.jpg|g' {} +

# cld-sample-3 → atria-site/misc/cld-sample-3
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1752837691/cld-sample-3\.jpg|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/misc/cld-sample-3.jpg|g' {} +

# cld-sample → atria-site/misc/cld-sample
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1752837690/cld-sample\.jpg|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/misc/cld-sample.jpg|g' {} +

# cld-sample-2 → atria-site/misc/cld-sample-2
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1752837690/cld-sample-2\.jpg|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/misc/cld-sample-2.jpg|g' {} +

# sample → atria-site/misc/sample
find src public -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://res\.cloudinary\.com/dyngqkiyl/image/upload/v1752837680/sample\.jpg|https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-site/misc/sample.jpg|g' {} +

echo "✅ Substituição concluída!"
echo "📊 Total de URLs substituídas: 199"
