import Reveal from './Reveal'

const STEPS = [
  { n: '01', t: 'Combinem uma vez', d: '50/50 fixo ou proporcional à renda. Vocês decidem como dividir as contas do casal.' },
  { n: '02', t: 'Registrem os gastos', d: 'Cada despesa entra no extrato compartilhado. Avulso, fixo ou parcelado — categorizado e ratado automaticamente.' },
  { n: '03', t: 'Fechem o mês em paz', d: 'No fim do mês, Pacto mostra o saldo claro: quem deve quanto pra quem. Ou se ninguém deve nada.' },
]

export default function HowScene() {
  return (
    <div className="pl-how-steps">
      {STEPS.map((s, i) => (
        <Reveal key={s.n} delay={i * 180} className="pl-strong">
          <div className="pl-how-box">
            <span className="num pl-display">{s.n}</span>
            <span className="pl-how-box-txt">
              <span className="ttl">{s.t}</span>
              <span className="dsc">{s.d}</span>
            </span>
          </div>
        </Reveal>
      ))}
    </div>
  )
}
