'use client'

import { useState } from 'react'
import { Card, Btn, Inp, ProgressBar } from './ui'
import { newId } from '@/lib/id'
import type { Goal } from './types'

interface Props {
  goals: Goal[]
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>
}

export default function TabMetas({ goals, setGoals }: Props) {
  const [form, setForm] = useState({ name: '', target: '', saved: '' })

  function add() {
    if (!form.name || !form.target) return
    setGoals((prev) => [
      ...prev,
      {
        name: form.name,
        target: parseFloat(form.target),
        saved: parseFloat(form.saved) || 0,
        id: newId(),
        createdAt: Date.now(),
      },
    ])
    setForm({ name: '', target: '', saved: '' })
  }

  return (
    <>
      <Card>
        <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 14 }}>🎯 Nova meta do casal</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Inp
            placeholder="Ex: Viagem pra Europa ✈️"
            value={form.name}
            onChange={(v) => setForm((p) => ({ ...p, name: v }))}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Inp
              placeholder="Valor total (R$)"
              value={form.target}
              onChange={(v) => setForm((p) => ({ ...p, target: v }))}
              type="number"
            />
            <Inp
              placeholder="Já guardaram (R$)"
              value={form.saved}
              onChange={(v) => setForm((p) => ({ ...p, saved: v }))}
              type="number"
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Btn label="Adicionar 🎯" onClick={add} color="#4ECDC4" />
          </div>
        </div>
      </Card>

      {goals.length === 0 && (
        <div style={{ textAlign: 'center', color: '#ccc', padding: '30px 0' }}>
          Nenhuma meta ainda. Sonhem juntos! 💭
        </div>
      )}

      {goals.map((g) => {
        const pct = Math.min((g.saved / g.target) * 100, 100)
        const falta = Math.max(g.target - g.saved, 0)
        return (
          <div
            key={g.id}
            style={{
              background: '#fff',
              borderRadius: 18,
              padding: '18px',
              marginBottom: 14,
              boxShadow: '0 2px 10px #0000000a',
              border: '1.5px solid #f0f0f0',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ fontWeight: 800, fontSize: 16 }}>{g.name}</div>
              <button
                onClick={() => setGoals((prev) => prev.filter((x) => x.id !== g.id))}
                style={{ background: 'none', border: 'none', color: '#ddd', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}
              >
                ✕
              </button>
            </div>
            <div style={{ marginBottom: 12 }}>
              <ProgressBar pct={pct} color="#4ECDC4" label={`${pct.toFixed(0)}% concluído`} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {[
                { l: 'META', v: `R$ ${g.target.toFixed(0)}`, bg: '#f7f7f8', c: '#333' },
                { l: 'GUARDADO', v: `R$ ${g.saved.toFixed(0)}`, bg: '#f0fffe', c: '#4ECDC4' },
                { l: 'FALTA', v: `R$ ${falta.toFixed(0)}`, bg: '#fff5f5', c: '#FF6B6B' },
              ].map((s) => (
                <div key={s.l} style={{ background: s.bg, borderRadius: 12, padding: '10px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#aaa', marginBottom: 2 }}>{s.l}</div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: s.c }}>{s.v}</div>
                </div>
              ))}
            </div>
            {pct >= 100 && (
              <div
                style={{
                  marginTop: 12,
                  textAlign: 'center',
                  background: 'linear-gradient(90deg,#4ECDC422,#FF6B6B22)',
                  borderRadius: 12,
                  padding: '10px',
                }}
              >
                <span style={{ fontWeight: 800, fontSize: 15 }}>🎉 Meta alcançada! Hora de comemorar!</span>
              </div>
            )}
          </div>
        )
      })}
    </>
  )
}
