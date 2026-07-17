import Link from 'next/link'
import { LogoMark } from '@/components/Logo'

export const metadata = {
  title: 'Excluir conta e dados — Pacto',
  description: 'Como solicitar a exclusão da sua conta Pacto e de todos os seus dados.',
}

export default function ExcluirContaPage() {
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
          Excluir conta e dados
        </h1>
        <p style={{ color: '#a0a3ad', fontSize: 13, marginBottom: 32 }}>
          Aplicativo: Pacto — Contas do Casal
        </p>

        <Section title="Como solicitar a exclusão">
          Você pode pedir a exclusão total da sua conta Pacto e de todos os dados associados a ela. Basta enviar um e-mail para{' '}
          <a style={linkStyle} href="mailto:turbomusicbr@gmail.com?subject=Excluir%20minha%20conta%20Pacto">turbomusicbr@gmail.com</a>{' '}
          usando o mesmo endereço de e-mail com que você acessa o app, com o assunto <strong style={{ color: '#fff' }}>"Excluir minha conta"</strong>.
          <p style={{ marginTop: 12 }}>
            Concluímos a exclusão em até <strong style={{ color: '#fff' }}>7 dias úteis</strong> e confirmamos por e-mail quando terminar.
          </p>
        </Section>

        <Section title="O que é excluído">
          <ul style={ulStyle}>
            <Li>Sua conta de acesso (e-mail e credenciais de login)</Li>
            <Li>Todos os seus lançamentos: gastos, receitas, categorias, valores e datas</Li>
            <Li>Contas fixas, parcelas, metas e meses fechados</Li>
            <Li>Os dados do casal (código, nomes, rendas e configuração de rateio)</Li>
            <Li>Sua assinatura e o histórico de eventos de pagamento</Li>
          </ul>
          <p style={{ marginTop: 12 }}>
            A exclusão é <strong style={{ color: '#fff' }}>permanente e irreversível</strong>. Depois de concluída, os dados não podem ser recuperados.
          </p>
        </Section>

        <Section title="Observações">
          <ul style={ulStyle}>
            <Li>Como o Pacto é compartilhado por um casal, ao excluir sua conta os dados do casal deixam de ficar acessíveis para as duas pessoas.</Li>
            <Li>Registros mínimos de transações financeiras exigidos por lei (ex.: comprovantes de pagamento da assinatura) podem ser mantidos pelo período legal antes de serem descartados.</Li>
            <Li>Antes de excluir, você pode exportar seus dados em PDF pelo botão de extrato dentro do app.</Li>
          </ul>
        </Section>

        <Section title="Contato">
          Dúvidas sobre exclusão de conta ou dados:{' '}
          <a style={linkStyle} href="mailto:turbomusicbr@gmail.com">turbomusicbr@gmail.com</a>.
          {' '}Veja também a nossa{' '}
          <Link style={linkStyle} href="/privacidade">Política de Privacidade</Link>.
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
