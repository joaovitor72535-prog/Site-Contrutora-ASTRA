# Carnegie Engenharia — Da planta à vida

Site institucional em português com uma residência conceitual modelada em Three.js. O scroll nativo controla planta, estrutura, acabamentos e entrada na sala. Os modelos e as animações são criados em código; não há vídeo pré-renderizado.

## Desenvolvimento

- `npm install`
- `npm run dev`
- `npm run build`
- `npx tsc --noEmit`

Stack: React, Vinext, TypeScript, Three.js, Tailwind e componentes Base UI/Shadcn.

## Conteúdo e interações

- Dados institucionais, serviços, contatos, logomarca, imagem institucional, artigo e dois panoramas provenientes de https://carnegieengenharia.com.br, consultado em 08/09/2026.
- A residência interativa é uma maquete conceitual e não representa um empreendimento real da empresa.
- Panorama: arrastar com mouse/toque, setas do teclado, zoom e restauração da vista.
- O formulário prepara uma mensagem e oferece um link para o visitante revisar e enviar no WhatsApp. Não há envio automático nem armazenamento de dados do formulário.
- Blog e redes sociais apontam para os endereços originais.
- Textos de segurança descrevem serviços, sem reproduzir trechos normativos ou datas desatualizadas da página de origem.

## Movimento e desempenho

Scroll nativo sem interceptar roda ou toque. Renderização sob demanda, suspensão fora da área visível, pixel ratio limitado, descarte de recursos WebGL e panorama carregado apenas ao abrir o visualizador. A opção de reduzir movimentos respeita a preferência do sistema. Dispositivos sem WebGL recebem uma alternativa com acesso ao conteúdo.

Verificações: TypeScript, build de produção e resposta HTTP local. Não foram realizados testes visuais em navegadores ou medições de desempenho em aparelhos físicos.

## Materiais e iluminação

A cena final usa madeira, reboco e tecido PBR do Poly Haven (CC0), com mapas de cor, normal e rugosidade em escala física. Iluminação de ambiente HDR Rooitou Park, luzes de área nas aberturas e luminárias, vidro com transmissão no desktop e bordas arredondadas nos móveis. Créditos e URLs exatos em `public/materials/attribution.json`.

As texturas são carregadas ao avançar na narrativa. O desktop usa oclusão ambiente GTAO em resolução reduzida; o celular mantém os materiais e as sombras diretas sem esse passe adicional. Folhagens usam instâncias para reduzir chamadas de desenho.

