import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'br.tec.pactoapp',
  appName: 'Pacto',
  // webDir é exigido pela CLI, mas em runtime o app carrega o site de produção
  // (server.url abaixo). Mantemos um placeholder mínimo em www/.
  webDir: 'www',
  server: {
    // Abre direto no app (login/dashboard), não na landing de marketing.
    url: 'https://pacto-app.tec.br/app',
    cleartext: false,
  },
}

export default config
