# Guia de Publicação - Guia Digital Regional

Este documento descreve os passos necessários para publicar seu aplicativo na Google Play Store e Apple App Store.

## 1. Preparação do PWA (Concluído)
Já configuramos os arquivos base:
- `manifest.json`: Configurado com cores, categorias e múltiplos tamanhos de ícones.
- `index.html`: Configurado com meta tags específicas para iOS (Apple Touch Icons).
- `sw.js`: Service Worker básico para suporte offline e notificações.

## 2. Publicação na Google Play Store (Android)
A forma mais recomendada é usar uma **Trusted Web Activity (TWA)**.

### Opção A: Bubblewrap (Recomendado para Desenvolvedores)
1. Instale o Bubblewrap CLI: `npm install -g @bubblewrap/cli`
2. Inicie o projeto: `bubblewrap init --manifest=https://seu-app.run.app/manifest.json`
3. Siga as instruções para gerar o arquivo `.apk` ou `.aab`.
4. Envie o `.aab` para o Google Play Console.

### Opção B: PWA2APK
1. Acesse [pwa2apk.com](https://pwa2apk.com/)
2. Insira a URL do seu app.
3. Eles gerarão o código fonte Android para você.

## 3. Publicação na Apple App Store (iOS)
A Apple exige um wrapper nativo (geralmente usando `WKWebView`).

### Opção A: Capacitor (Recomendado)
1. Instale o Capacitor: `npm install @capacitor/core @capacitor/cli`
2. Inicialize: `npx cap init`
3. Adicione a plataforma iOS: `npm install @capacitor/ios && npx cap add ios`
4. Gere o build do seu app: `npm run build`
5. Sincronize: `npx cap copy`
6. Abra no Xcode: `npx cap open ios`
7. No Xcode, configure os certificados e envie para a App Store.

### Opção B: PWA2IPA / PWABuilder
1. Acesse [pwabuilder.com](https://www.pwabuilder.com/)
2. Insira a URL do seu app.
3. Selecione "iOS" e siga as instruções para gerar o pacote.

## 4. Requisitos de Design (Ícones)
Embora tenhamos configurado URLs temporárias (picsum.photos), para a publicação real você **DEVE**:
1. Criar um ícone quadrado de 1024x1024px.
2. Usar uma ferramenta como [App Icon Generator](https://appicon.co/) para gerar todos os tamanhos.
3. Substituir os arquivos na pasta `public/icons/` (você precisará criar esta pasta e colocar os arquivos reais lá).
4. Atualizar o `manifest.json` e `index.html` para apontar para os caminhos locais (ex: `/icons/icon-192x192.png`).

## 5. Notificações Push
Para que as notificações funcionem no Android/iOS nativo via Capacitor:
1. Você precisará configurar o **Firebase Cloud Messaging (FCM)**.
2. Integrar o plugin `@capacitor/push-notifications`.

---
*Nota: A publicação em lojas requer contas de desenvolvedor pagas (Google: ~$25 taxa única / Apple: ~$99 por ano).*
