#!/bin/bash
# Testa API Sances sem expor o token no histórico do bash.
# Token é lido silenciosamente (read -s) e descartado ao fim.
# Resposta salva em sances-amostra.json (gitignored).

set -e

cd "$(dirname "$0")/.."

echo "Cola o bearer token da Sances (não vai aparecer na tela):"
read -s TOKEN
echo ""

if [ -z "$TOKEN" ]; then
  echo "Token vazio. Abortando."
  exit 1
fi

echo "Chamando https://integracao.sancesturbo.com.br/api/estoqueVeiculos ..."

HTTP_CODE=$(curl -s -o sances-amostra.json \
  -w "%{http_code}" \
  -H "Authorization: Bearer $TOKEN" \
  "https://integracao.sancesturbo.com.br/api/estoqueVeiculos")

TOKEN=""
unset TOKEN

SIZE=$(wc -c < sances-amostra.json 2>/dev/null || echo 0)

echo ""
echo "Status HTTP: $HTTP_CODE"
echo "Bytes recebidos: $SIZE"
echo "Arquivo: sances-amostra.json"
echo ""

if [ "$HTTP_CODE" != "200" ]; then
  echo "Resposta (erro):"
  cat sances-amostra.json
  echo ""
  exit 2
fi

echo "Prévia (30 primeiras linhas do JSON formatado):"
if command -v jq >/dev/null 2>&1; then
  jq '.' sances-amostra.json 2>/dev/null | head -30 || head -30 sances-amostra.json
else
  head -30 sances-amostra.json
fi

echo ""
echo "OK — arquivo pronto. Avisa no chat que eu leio daqui."
