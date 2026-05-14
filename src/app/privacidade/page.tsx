import Link from 'next/link'
import { LogoMark } from '@/components/Logo'

export const metadata = {
  title: 'Política de Privacidade — Pacto',
  description: 'Como tratamos seus dados no Pacto.',
}

export default function PrivacidadePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#0b0b10',
        color: '#f4f4f6',
        fontFamily: "'Inter', system-ui, sans-serif",
        padding: '40px 24px 80px',
      }}
    >
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color: '#f4f4f6', textDecoration: 'none', marginBottom: 32 }}>
          <LogoMark size={24} />
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.18em' }}>PACTO</span>
        </Link>

        <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 }}>
          Política de Privacidade
        </h1>
        <p style={{ color: '#a0a3ad', fontSize: 13, marginBottom: 32 }}>
          Última atualização: 14 de maio de 2026
        </p>

        <Section title="1. Quem somos">
          O Pacto é um app que ajuda casais a organizarem suas finanças compartilhadas — gastos do casal, custos pessoais separados, custos fixos e parcelados, metas, e rateio justo.
        </Section>

        <Section title="2. Quais dados coletamos">
          <ul style={ulStyle}>
            <Li>Nome e endereço de e-mail (fornecidos pelo Google ao você fazer login)</Li>
            <Li>Dados financeiros que você mesmo digita: descrições de gastos, valores, categorias, datas, método de pagamento, rendas declaradas</Li>
            <Li>Código do casal (gerado automaticamente para você convidar o parceiro)</Li>
            <Li>Histórico de meses fechados e categorias personalizadas que você cria</Li>
          </ul>
        </Section>

        <Section title="3. Para que usamos">
          <ul style={ulStyle}>
            <Li>Operar o app: salvar seus dados, calcular rateio, gerar relatórios</Li>
            <Li>Sincronizar entre os 2 celulares do casal em tempo real</Li>
            <Li>Processar sua assinatura (via Hotmart, quando aplicável)</Li>
            <Li>Suporte e atendimento ao cliente</Li>
          </ul>
          <p style={{ marginTop: 12 }}>
            <strong style={{ color: '#fff' }}>Não vendemos seus dados.</strong> Não compartilhamos seus dados financeiros com terceiros pra marketing, anúncios ou perfilação.
          </p>
        </Section>

        <Section title="4. Onde guardamos">
          Seus dados ficam em servidores do Supabase (infraestrutura na região South America — São Paulo). O acesso é restrito a você e ao seu parceiro pelo código do casal. Aplicamos Row Level Security: ninguém de fora do seu casal vê seus gastos.
        </Section>

        <Section title="5. Quem mais tem acesso">
          <ul style={ulStyle}>
            <Li>Você e seu parceiro de pacto</Li>
            <Li>Operadores do Supabase (provedor de infraestrutura) — apenas no nível técnico, sob acordo de confidencialidade</Li>
            <Li>Hotmart (apenas pra processar seu pagamento — somente nome, e-mail e dados de cobrança, nunca seus gastos)</Li>
          </ul>
        </Section>

        <Section title="6. Seus direitos">
          Você pode, a qualquer momento:
          <ul style={ulStyle}>
            <Li>Acessar todos os seus dados pelo app</Li>
            <Li>Exportar seus dados em PDF (botão de extrato dentro do app)</Li>
            <Li>Pedir a exclusão total dos seus dados enviando e-mail para <a style={linkStyle} href="mailto:turbomusicbr@gmail.com">turbomusicbr@gmail.com</a></Li>
            <Li>Cancelar sua assinatura a qualquer momento</Li>
          </ul>
        </Section>

        <Section title="7. Cookies e tecnologias parecidas">
          Usamos apenas cookies estritamente necessários pra manter você logado e pro app funcionar. Não usamos cookies de analytics, propaganda ou de terceiros pra marketing.
        </Section>

        <Section title="8. Crianças">
          O Pacto é destinado a maiores de 18 anos. Não coletamos intencionalmente dados de menores.
        </Section>

        <Section title="9. Mudanças">
          Podemos atualizar essa política. A data no topo sempre indica a última versão. Mudanças relevantes serão avisadas no app ou por e-mail.
        </Section>

        <Section title="10. Contato">
          Dúvidas, pedidos ou reclamações: <a style={linkStyle} href="mailto:turbomusicbr@gmail.com">turbomusicbr@gmail.com</a>
        </Section>
      </div>
    </main>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 28 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, color: '#fff' }}>{title}</h2>
      <div style={{ color: '#c4c6cf', fontSize: 14, lineHeight: 1.65 }}>{children}</div>
    </section>
  )
}

function Li({ children }: { children: React.ReactNode }) {
  return <li style={{ marginBottom: 4 }}>{children}</li>
}

const ulStyle: React.CSSProperties = { paddingLeft: 20, margin: '6px 0' }
const linkStyle: React.CSSProperties = { color: '#5b8dff', textDecoration: 'underline' }
