# AutoPorto - Android [![Build Status](https://travis-ci.com/randrade23/AutoPorto-Android.svg?token=U9qJgnd9JP3PkpQRzKCB&branch=master)](https://travis-ci.com/randrade23/AutoPorto-Android)

_Os horários da STCP em tempo real, no seu bolso_

## A aplicação

<p align="center">
  <img width="400" src="md/screenshot.png">
</p>

* Listagem automática das paragens próximas (~100 metros) com base na localização
* Histórico de paragens pesquisadas
* Leitor de código de barras / código QR para ler paragem a partir da folha de horários
* Design simples onde é possível ao utilizador obter imediatamente a informação de uma paragem, sem menus adicionais

## Como compilar

* Node.js v10.19.0
* Ionic v5.0.0
* Android SDK v28

```bash
npm install -g ionic cordova
npm install
ionic cordova build android
```

## Licença

GPL v3
