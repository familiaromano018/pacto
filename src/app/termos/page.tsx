import Link from 'next/link'
import { LogoMark } from '@/components/Logo'

export const metadata = {
  title: 'Termos de Uso — Pacto',
  description: 'Regras de uso do Pacto.',
}

export default function TermosPage() {
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
          Termos de Uso
        </h1>
        <p style={{ color: '#a0a3ad', fontSize: 13, marginBottom: 32 }}>
          Última atualização: 14 de maio de 2026
        </p>

        <Section title="1. Aceite">
          Ao usar o Pacto, você concorda com esses termos. Se não concorda, não use o app. A continuidade do uso após mudanças nos termos significa aceite das novas regras.
        </Section>

        <Section title="2. O que o Pacto faz">
          O Pacto é uma ferramenta para casais organizarem suas finanças compartilhadas. Ele:
          <ul style={ulStyle}>
            <Li>Registra gastos do casal e pessoais</Li>
            <Li>Calcula rateio justo (50/50 ou proporcional à renda)</Li>
            <Li>Acompanha custos fixos e parcelas</Li>
            <Li>Gera extratos do mês</Li>
            <Li>Sincroniza entre os celulares do casal em tempo real</Li>
          </ul>
        </Section>

        <Section title="3. O que o Pacto NÃO faz">
          O Pacto não é um banco, não movimenta dinheiro, não dá empréstimos, não é consultoria financeira profissional, não substitui um contador ou educador financeiro. É uma ferramenta de registro e organização.
        </Section>

        <Section title="4. Sua responsabilidade">
          <ul style={ulStyle}>
            <Li>Manter seu login Google seguro (não compartilhar senha)</Li>
            <Li>Convidar apenas pessoas em quem você confia pro mesmo pacto</Li>
            <Li>Inserir dados verdadeiros (rendas, gastos) — cálculos errados saem de dados errados</Li>
            <Li>Usar o app respeitando seu parceiro</Li>
          </ul>
        </Section>

        <Section title="5. Assinatura">
          <ul style={ulStyle}>
            <Li>O Pacto oferece 14 dias de trial gratuito ao criar um pacto novo</Li>
            <Li>Após o trial, o uso continuado requer assinatura ativa</Li>
            <Li>O pagamento é processado pela Hotmart conforme termos próprios deles</Li>
            <Li>Uma assinatura libera o casal inteiro (2 pessoas)</Li>
            <Li>Você pode cancelar a qualquer momento pelo painel da Hotmart</Li>
            <Li>Após cancelamento, seus dados continuam salvos por 90 dias caso queira voltar</Li>
          </ul>
        </Section>

        <Section title="6. Conta e dados">
          Você é responsável por todos os dados inseridos. O Pacto não revisa, valida ou faz auditoria desses dados. Recomendamos baixar o PDF do extrato mensalmente como backup.
        </Section>

        <Section title="7. Disponibilidade">
          Fazemos o possível pra manter o Pacto sempre no ar, mas não garantimos disponibilidade 100% do tempo. Pode haver manutenções programadas ou indisponibilidades pontuais. Não somos responsáveis por perdas decorrentes de instabilidade.
        </Section>

        <Section title="8. Propriedade intelectual">
          A marca Pacto, o design, o código e os recursos do app são de nossa propriedade. Você pode usar o app pra suas finanças pessoais, mas não pode copiar, redistribuir ou recriar o serviço comercialmente.
        </Section>

        <Section title="9. Encerramento">
          Podemos suspender ou encerrar sua conta em caso de:
          <ul style={ulStyle}>
            <Li>Uso fraudulento ou tentativas de hackear o serviço</Li>
            <Li>Inadimplência prolongada</Li>
            <Li>Violação grave desses termos</Li>
          </ul>
        </Section>

        <Section title="10. Limitação de responsabilidade">
          O Pacto é fornecido "como está". Não somos responsáveis por decisões financeiras tomadas com base nos dados do app. Nossa responsabilidade máxima fica limitada ao valor pago nos últimos 12 meses de assinatura.
        </Section>

        <Section title="11. Lei aplicável">
          Esses termos são regidos pelas leis do Brasil. Eventuais disputas serão julgadas no foro de São Paulo/SP.
        </Section>

        <Section title="12. Contato">
          Dúvidas sobre esses termos: <a style={linkStyle} href="mailto:turbomusicbr@gmail.com">turbomusicbr@gmail.com</a>
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
