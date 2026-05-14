import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatBRL, monthLabel, parseMonthKey } from './format'
import { categoryEmoji } from './categories'
import { paymentMethodLabel } from '@/components/constants'
import type { Expense, FixedCost, Installment, CustomCategory } from '@/components/types'

interface ExtractInput {
  monthKey: string
  nameA: string
  nameB: string
  incomeA: string
  incomeB: string
  method: '50/50' | 'proporcional'
  expenses: Expense[]
  fixedCosts: FixedCost[]
  installments: Installment[]
  customCategories: CustomCategory[]
}

function monthsBetween(startTs: number, monthKey: string) {
  const start = new Date(startTs)
  const { year, month } = parseMonthKey(monthKey)
  return (year - start.getFullYear()) * 12 + (month - 1 - start.getMonth())
}

export function generateExtractPDF(input: ExtractInput) {
  const { monthKey, nameA, nameB, incomeA, incomeB, method } = input

  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const margin = 40

  // ── Coletar todas as despesas do mês: avulsos + fixos + parcelas
  const rows: Array<{
    date: string
    desc: string
    cat: string
    pessoa: string
    pago: string
    tipo: string
    forma: string
    valor: number
  }> = []

  input.expenses
    .filter((e) => e.monthKey === monthKey)
    .forEach((e) => {
      rows.push({
        date: new Date(e.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        desc: e.desc,
        cat: `${categoryEmoji(e.category, input.customCategories)} ${e.category}`.trim(),
        pessoa: e.scope === 'casal' ? 'Casal' : e.scope === 'A' ? nameA : nameB,
        pago: e.scope === 'casal' ? (e.paidBy === 'A' ? nameA : nameB) : '—',
        tipo: 'Avulso',
        forma: paymentMethodLabel(e.paymentMethod) ?? '—',
        valor: e.amount,
      })
    })

  input.fixedCosts
    .filter((f) => f.active)
    .forEach((f) => {
      rows.push({
        date: f.dueDay ? String(f.dueDay).padStart(2, '0') : '—',
        desc: f.desc,
        cat: `${categoryEmoji(f.category, input.customCategories)} ${f.category}`.trim(),
        pessoa: f.scope === 'casal' ? 'Casal' : f.scope === 'A' ? nameA : nameB,
        pago: f.scope === 'casal' ? (f.paidBy === 'A' ? nameA : nameB) : '—',
        tipo: 'Fixo',
        forma: paymentMethodLabel(f.paymentMethod) ?? '—',
        valor: f.amount,
      })
    })

  input.installments.forEach((i) => {
    const elapsed = monthsBetween(i.startedAt, monthKey)
    if (elapsed >= 0 && elapsed < i.totalParcelas) {
      rows.push({
        date: i.dueDay ? String(i.dueDay).padStart(2, '0') : '—',
        desc: `${i.desc} (${elapsed + 1}/${i.totalParcelas})`,
        cat: `${categoryEmoji(i.category, input.customCategories)} ${i.category}`.trim(),
        pessoa: i.scope === 'casal' ? 'Casal' : i.scope === 'A' ? nameA : nameB,
        pago: i.scope === 'casal' ? (i.paidBy === 'A' ? nameA : nameB) : '—',
        tipo: 'Parcela',
        forma: paymentMethodLabel(i.paymentMethod) ?? '—',
        valor: i.parcelaMensal,
      })
    }
  })

  rows.sort((a, b) => a.date.localeCompare(b.date))

  // ── Totais
  const total = rows.reduce((s, r) => s + r.valor, 0)
  const totalCasal = rows.filter((r) => r.pessoa === 'Casal').reduce((s, r) => s + r.valor, 0)
  const totalA = rows.filter((r) => r.pessoa === nameA).reduce((s, r) => s + r.valor, 0)
  const totalB = rows.filter((r) => r.pessoa === nameB).reduce((s, r) => s + r.valor, 0)
  const casalA = rows.filter((r) => r.pessoa === 'Casal' && r.pago === nameA).reduce((s, r) => s + r.valor, 0)

  const iA = parseFloat(incomeA) || 0
  const iB = parseFloat(incomeB) || 0
  const fairShareA = method === '50/50' || iA + iB === 0
    ? totalCasal / 2
    : totalCasal * (iA / (iA + iB))
  const balanceA = casalA - fairShareA
  const quemDeve = Math.abs(balanceA) < 0.01
    ? null
    : balanceA > 0
      ? { de: nameB, para: nameA, valor: balanceA }
      : { de: nameA, para: nameB, valor: Math.abs(balanceA) }

  const byCategory = new Map<string, number>()
  rows.forEach((r) => byCategory.set(r.cat, (byCategory.get(r.cat) ?? 0) + r.valor))
  const catRows = Array.from(byCategory.entries()).sort((a, b) => b[1] - a[1])

  // ─────────────────────────────────────────────── HEADER
  doc.setFillColor(11, 21, 56) // azul-noite Pacto
  doc.rect(0, 0, pageW, 100, 'F')

  // Marca compacta: círculo dividido (prata à esquerda, dourado à direita) + ponto central
  const cx = margin + 8
  const cy = 48
  const r = 8
  // metade esquerda — prata
  doc.setLineWidth(2.2)
  doc.setLineCap('round')
  doc.setDrawColor(195, 198, 207)
  doc.lines([[0, -r * 1.4], [r * 1.4, 0], [0, r * 1.4]], cx, cy + r, [1, 1], 'S', false)
  // metade direita — dourado
  doc.setDrawColor(212, 175, 106)
  doc.lines([[0, -r * 1.4], [-r * 1.4, 0], [0, r * 1.4]], cx, cy + r, [1, 1], 'S', false)
  // ponto central
  doc.setFillColor(210, 210, 215)
  doc.circle(cx, cy, 1.3, 'F')

  doc.setTextColor(220, 220, 230)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('PACTO', cx + 16, cy + 3, { charSpace: 3 })

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.text(`Extrato · ${monthLabel(monthKey)}`, margin, 80)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(180, 180, 190)
  doc.text(
    `${nameA} & ${nameB} · Divisão ${method === '50/50' ? '50/50' : 'proporcional'}`,
    margin, 84,
  )

  let cursorY = 130

  // ─────────────────────────────────────────────── RESUMO
  doc.setTextColor(60, 60, 60)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('RESUMO', margin, cursorY)
  cursorY += 14

  doc.setDrawColor(220, 220, 220)
  doc.setLineWidth(0.5)

  const resumoBox = (x: number, label: string, value: string, w: number) => {
    doc.setDrawColor(220, 220, 220)
    doc.roundedRect(x, cursorY, w, 50, 6, 6, 'S')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(120, 120, 120)
    doc.text(label.toUpperCase(), x + 10, cursorY + 16)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.setTextColor(30, 30, 35)
    doc.text(value, x + 10, cursorY + 36)
  }

  const colW = (pageW - margin * 2 - 20) / 3
  resumoBox(margin, 'Total do mês', formatBRL(total), colW)
  resumoBox(margin + colW + 10, 'Casal', formatBRL(totalCasal), colW)
  resumoBox(margin + (colW + 10) * 2, 'Despesas', String(rows.length), colW)
  cursorY += 65

  // Saldo final (quem deve)
  if (quemDeve) {
    doc.setFillColor(255, 245, 245)
    doc.setDrawColor(248, 113, 113)
    doc.roundedRect(margin, cursorY, pageW - margin * 2, 50, 6, 6, 'FD')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(120, 60, 60)
    doc.text('SALDO A EQUILIBRAR', margin + 12, cursorY + 18)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.setTextColor(180, 50, 50)
    doc.text(`${quemDeve.de} deve ${formatBRL(quemDeve.valor)} para ${quemDeve.para}`, margin + 12, cursorY + 36)
    cursorY += 60
  } else if (total > 0) {
    doc.setFillColor(240, 253, 244)
    doc.setDrawColor(52, 211, 153)
    doc.roundedRect(margin, cursorY, pageW - margin * 2, 36, 6, 6, 'FD')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(20, 130, 80)
    doc.text('Saldo zerado · ninguém deve nada neste mês', margin + 12, cursorY + 23)
    cursorY += 46
  } else {
    cursorY += 10
  }

  // ─────────────────────────────────────────────── TABELA DESPESAS
  if (rows.length > 0) {
    cursorY += 8
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(60, 60, 60)
    doc.text('DESPESAS', margin, cursorY)
    cursorY += 8

    autoTable(doc, {
      startY: cursorY,
      head: [['Dia', 'Descrição', 'Categoria', 'É de', 'Pago por', 'Tipo', 'Forma', 'Valor']],
      body: rows.map((r) => [
        r.date,
        r.desc,
        r.cat,
        r.pessoa,
        r.pago,
        r.tipo,
        r.forma,
        formatBRL(r.valor),
      ]),
      styles: {
        font: 'helvetica',
        fontSize: 8,
        cellPadding: 5,
        textColor: [40, 40, 50],
      },
      headStyles: {
        fillColor: [22, 22, 28],
        textColor: [240, 240, 245],
        fontStyle: 'bold',
        fontSize: 8,
      },
      alternateRowStyles: {
        fillColor: [248, 248, 250],
      },
      columnStyles: {
        0: { cellWidth: 28, halign: 'center' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 70 },
        3: { cellWidth: 44, halign: 'center' },
        4: { cellWidth: 52, halign: 'center' },
        5: { cellWidth: 44, halign: 'center' },
        6: { cellWidth: 58, halign: 'center' },
        7: { cellWidth: 64, halign: 'right', fontStyle: 'bold' },
      },
      margin: { left: margin, right: margin },
    })

    cursorY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 20
  }

  // ─────────────────────────────────────────────── BREAKDOWN POR CATEGORIA
  if (catRows.length > 0) {
    if (cursorY > doc.internal.pageSize.getHeight() - 200) {
      doc.addPage()
      cursorY = 60
    }

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(60, 60, 60)
    doc.text('POR CATEGORIA', margin, cursorY)
    cursorY += 8

    autoTable(doc, {
      startY: cursorY,
      head: [['Categoria', '% do total', 'Valor']],
      body: catRows.map(([cat, val]) => [
        cat,
        `${((val / total) * 100).toFixed(1)}%`,
        formatBRL(val),
      ]),
      styles: { font: 'helvetica', fontSize: 9, cellPadding: 6 },
      headStyles: { fillColor: [22, 22, 28], textColor: [240, 240, 245], fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 80, halign: 'right' },
        2: { cellWidth: 90, halign: 'right', fontStyle: 'bold' },
      },
      margin: { left: margin, right: margin },
    })

    cursorY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 20
  }

  // ─────────────────────────────────────────────── BREAKDOWN POR PESSOA
  if (cursorY > doc.internal.pageSize.getHeight() - 140) {
    doc.addPage()
    cursorY = 60
  }
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(60, 60, 60)
  doc.text('POR PESSOA', margin, cursorY)
  cursorY += 8

  autoTable(doc, {
    startY: cursorY,
    head: [['Pessoa', 'Compartilhado', 'Pessoal', 'Total', 'Renda', 'Compromisso']],
    body: [
      [
        nameA,
        formatBRL(casalA),
        formatBRL(totalA),
        formatBRL(casalA + totalA),
        iA > 0 ? formatBRL(iA) : '—',
        iA > 0 ? `${(((casalA + totalA) / iA) * 100).toFixed(0)}%` : '—',
      ],
      [
        nameB,
        formatBRL(totalCasal - casalA),
        formatBRL(totalB),
        formatBRL((totalCasal - casalA) + totalB),
        iB > 0 ? formatBRL(iB) : '—',
        iB > 0 ? `${((((totalCasal - casalA) + totalB) / iB) * 100).toFixed(0)}%` : '—',
      ],
    ],
    styles: { font: 'helvetica', fontSize: 9, cellPadding: 6 },
    headStyles: { fillColor: [22, 22, 28], textColor: [240, 240, 245], fontStyle: 'bold' },
    columnStyles: {
      5: { halign: 'right' },
    },
    margin: { left: margin, right: margin },
  })

  // ─────────────────────────────────────────────── FOOTER
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(
      `Gerado em ${new Date().toLocaleString('pt-BR')} · Pacto · ${i}/${pageCount}`,
      pageW / 2,
      doc.internal.pageSize.getHeight() - 20,
      { align: 'center' },
    )
  }

  doc.save(`pacto-${monthKey}.pdf`)
}
