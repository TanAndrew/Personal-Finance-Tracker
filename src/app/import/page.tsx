'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import { addTransaction } from '@/lib/storage'
import { EXPENSE_CATEGORIES } from '@/types'

type Step = 'upload' | 'map' | 'preview' | 'done'

interface ParsedRow {
  date: string
  description: string
  amount: string
  category: string
  type: 'expense' | 'income'
}

const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, 'Salary', 'Freelance', 'Investment Returns', 'Cashback', 'Others']

export default function ImportPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<Step>('upload')
  const [fileName, setFileName] = useState('')
  const [headers, setHeaders] = useState<string[]>([])
  const [rawRows, setRawRows] = useState<string[][]>([])
  const [mapping, setMapping] = useState({ date: '', amount: '', description: '', category: '' })
  const [preview, setPreview] = useState<ParsedRow[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [importCount, setImportCount] = useState(0)

  const parseCSV = (text: string): string[][] => {
    return text
      .trim()
      .split('\n')
      .map(line =>
        line.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''))
      )
  }

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.csv')) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const rows = parseCSV(text)
      if (rows.length < 2) return
      setHeaders(rows[0])
      setRawRows(rows.slice(1))
      setMapping({ date: rows[0][0] ?? '', amount: '', description: '', category: '' })
      setStep('map')
    }
    reader.readAsText(file)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const buildPreview = () => {
    const dateIdx = headers.indexOf(mapping.date)
    const amountIdx = headers.indexOf(mapping.amount)
    const descIdx = headers.indexOf(mapping.description)
    const catIdx = mapping.category ? headers.indexOf(mapping.category) : -1

    const rows: ParsedRow[] = rawRows.slice(0, 10).map(row => {
      const rawAmount = row[amountIdx] ?? '0'
      const numericAmount = parseFloat(rawAmount.replace(/[^0-9.-]/g, '')) || 0
      const type = numericAmount < 0 ? 'income' : 'expense'
      return {
        date: row[dateIdx] ?? '',
        description: row[descIdx] ?? '',
        amount: Math.abs(numericAmount).toFixed(2),
        category: catIdx >= 0 ? (row[catIdx] ?? 'Others') : 'Others',
        type,
      }
    })
    setPreview(rows)
    setStep('preview')
  }

  const handleImport = () => {
    const dateIdx = headers.indexOf(mapping.date)
    const amountIdx = headers.indexOf(mapping.amount)
    const descIdx = headers.indexOf(mapping.description)
    const catIdx = mapping.category ? headers.indexOf(mapping.category) : -1

    let count = 0
    for (const row of rawRows) {
      const rawAmount = row[amountIdx] ?? '0'
      const numericAmount = parseFloat(rawAmount.replace(/[^0-9.-]/g, ''))
      if (isNaN(numericAmount)) continue
      const type = numericAmount < 0 ? 'income' : 'expense'
      const rawDate = row[dateIdx] ?? ''
      const parsed = new Date(rawDate)
      const date = isNaN(parsed.getTime()) ? new Date().toISOString().split('T')[0] : parsed.toISOString().split('T')[0]
      const rawCat = catIdx >= 0 ? (row[catIdx] ?? '') : ''
      const category = ALL_CATEGORIES.find(c => c.toLowerCase() === rawCat.toLowerCase()) ?? 'Others'
      addTransaction({
        type,
        amount: Math.abs(numericAmount),
        category,
        note: row[descIdx] ?? '',
        date,
      })
      count++
    }
    setImportCount(count)
    setStep('done')
  }

  const canMap = mapping.date && mapping.amount && mapping.description

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: '#141218' }}>
      <header className="sticky top-0 z-40 px-6 h-20 flex items-center gap-4" style={{ backgroundColor: '#141218', borderBottom: '4px solid #000' }}>
        <button onClick={() => router.back()} className="font-label text-xs uppercase neo-border neo-shadow-active px-3 py-1" style={{ backgroundColor: '#211f24', color: '#e6e0e9' }}>← Back</button>
        <h1 className="font-headline text-2xl uppercase" style={{ color: '#e6e0e9' }}>CSV Import</h1>
      </header>

      {/* Step indicator */}
      <div className="flex px-6 py-4 gap-2">
        {(['upload', 'map', 'preview'] as const).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <span
              className="font-label text-[10px] uppercase px-2 py-1 neo-border"
              style={{
                backgroundColor: step === s ? '#cfbcff' : ((['upload', 'map', 'preview'].indexOf(step) > i || step === 'done') ? '#b5f23d' : '#211f24'),
                color: '#000',
              }}
            >
              {String(i + 1).padStart(2, '0')} {s}
            </span>
            {i < 2 && <span style={{ color: '#948e9c' }}>—</span>}
          </div>
        ))}
      </div>

      <div className="px-6 py-4">
        {/* STEP 1: Upload */}
        {step === 'upload' && (
          <div>
            <p className="font-label text-xs uppercase tracking-widest mb-6" style={{ color: '#948e9c' }}>Upload your bank export or transaction file</p>
            <div
              className="neo-border neo-shadow p-10 text-center cursor-pointer"
              style={{ backgroundColor: dragOver ? '#2b292f' : '#211f24', borderStyle: 'dashed', borderWidth: '3px' }}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <p className="font-display text-4xl mb-4" style={{ color: '#cfbcff' }}>↑</p>
              <p className="font-headline text-sm uppercase mb-2" style={{ color: '#e6e0e9' }}>Drop CSV here</p>
              <p className="font-label text-xs uppercase" style={{ color: '#948e9c' }}>or click to browse</p>
              <span className="inline-block mt-4 font-label text-[10px] uppercase neo-border px-2 py-1" style={{ backgroundColor: '#cfbcff', color: '#000' }}>.CSV ONLY</span>
            </div>
            <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileInput} />
          </div>
        )}

        {/* STEP 2: Column Mapping */}
        {step === 'map' && (
          <div>
            <div className="neo-border neo-shadow px-4 py-3 mb-6 flex items-center justify-between" style={{ backgroundColor: '#211f24' }}>
              <span className="font-label text-xs uppercase" style={{ color: '#948e9c' }}>File</span>
              <span className="font-label text-sm" style={{ color: '#b5f23d' }}>{fileName}</span>
            </div>
            <p className="font-label text-xs uppercase tracking-widest mb-4" style={{ color: '#948e9c' }}>Map your CSV columns</p>
            <div className="space-y-4">
              {([
                { key: 'date', label: 'Transaction Date', required: true },
                { key: 'amount', label: 'Amount', required: true },
                { key: 'description', label: 'Description / Note', required: true },
                { key: 'category', label: 'Category (optional)', required: false },
              ] as const).map(({ key, label, required }) => (
                <div key={key} className="neo-border neo-shadow p-4" style={{ backgroundColor: '#211f24' }}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-label text-xs uppercase" style={{ color: '#e6e0e9' }}>{label}</span>
                    {required && <span className="font-label text-[10px] neo-border px-1" style={{ backgroundColor: '#ff6b00', color: '#000' }}>REQUIRED</span>}
                  </div>
                  <select
                    className="w-full font-label text-sm uppercase neo-border px-3 py-2 appearance-none"
                    style={{ backgroundColor: '#141218', color: '#e6e0e9', borderColor: '#000' }}
                    value={mapping[key]}
                    onChange={e => setMapping(m => ({ ...m, [key]: e.target.value }))}
                  >
                    <option value="">— select column —</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <button
              className="w-full mt-6 font-headline text-sm uppercase neo-border neo-shadow neo-shadow-active py-4"
              style={{ backgroundColor: canMap ? '#b5f23d' : '#36343a', color: canMap ? '#000' : '#948e9c' }}
              disabled={!canMap}
              onClick={buildPreview}
            >
              Preview Data →
            </button>
          </div>
        )}

        {/* STEP 3: Preview */}
        {step === 'preview' && (
          <div>
            <p className="font-label text-xs uppercase tracking-widest mb-4" style={{ color: '#948e9c' }}>
              Showing first {preview.length} of {rawRows.length} rows
            </p>
            <div className="neo-border neo-shadow overflow-hidden mb-6" style={{ backgroundColor: '#211f24' }}>
              <div className="grid grid-cols-3 px-4 py-2" style={{ borderBottom: '3px solid #000', backgroundColor: '#2b292f' }}>
                <span className="font-label text-[10px] uppercase" style={{ color: '#948e9c' }}>Date</span>
                <span className="font-label text-[10px] uppercase" style={{ color: '#948e9c' }}>Description</span>
                <span className="font-label text-[10px] uppercase text-right" style={{ color: '#948e9c' }}>Amount</span>
              </div>
              {preview.map((row, i) => (
                <div key={i} className="grid grid-cols-3 px-4 py-3 items-center" style={{ borderBottom: i < preview.length - 1 ? '1px solid #36343a' : 'none' }}>
                  <span className="font-label text-xs" style={{ color: '#cbc4d2' }}>{row.date}</span>
                  <span className="font-label text-xs truncate pr-2" style={{ color: '#e6e0e9' }}>{row.description}</span>
                  <span className="font-label text-sm text-right" style={{ color: row.type === 'income' ? '#b5f23d' : '#e6e0e9' }}>
                    {row.type === 'income' ? '+' : '-'}${row.amount}
                  </span>
                </div>
              ))}
            </div>
            <div className="neo-border neo-shadow p-4 mb-6" style={{ backgroundColor: '#211f24' }}>
              <p className="font-label text-xs uppercase" style={{ color: '#948e9c' }}>
                Total rows to import: <span style={{ color: '#b5f23d' }}>{rawRows.length}</span>
              </p>
              <p className="font-label text-[10px] uppercase mt-1" style={{ color: '#948e9c' }}>
                Negative amounts → income · Positive → expense
              </p>
            </div>
            <div className="flex gap-3">
              <button
                className="flex-1 font-headline text-sm uppercase neo-border neo-shadow-active py-4"
                style={{ backgroundColor: '#211f24', color: '#e6e0e9' }}
                onClick={() => setStep('map')}
              >
                ← Remap
              </button>
              <button
                className="flex-1 font-headline text-sm uppercase neo-border neo-shadow neo-shadow-active py-4"
                style={{ backgroundColor: '#cfbcff', color: '#000' }}
                onClick={handleImport}
              >
                Import All
              </button>
            </div>
          </div>
        )}

        {/* DONE */}
        {step === 'done' && (
          <div className="text-center py-12">
            <div className="neo-border neo-shadow p-8 inline-block mb-6" style={{ backgroundColor: '#211f24' }}>
              <p className="font-display text-5xl" style={{ color: '#b5f23d' }}>✓</p>
            </div>
            <p className="font-headline text-lg uppercase mb-2" style={{ color: '#e6e0e9' }}>Import Complete</p>
            <p className="font-label text-xs uppercase tracking-widest mb-8" style={{ color: '#948e9c' }}>
              {importCount} transaction{importCount !== 1 ? 's' : ''} added
            </p>
            <div className="flex flex-col gap-3">
              <button
                className="w-full font-headline text-sm uppercase neo-border neo-shadow neo-shadow-active py-4"
                style={{ backgroundColor: '#b5f23d', color: '#000' }}
                onClick={() => router.push('/transactions')}
              >
                View Transactions
              </button>
              <button
                className="w-full font-headline text-sm uppercase neo-border neo-shadow-active py-4"
                style={{ backgroundColor: '#211f24', color: '#e6e0e9' }}
                onClick={() => { setStep('upload'); setFileName(''); setHeaders([]); setRawRows([]); setPreview([]) }}
              >
                Import Another File
              </button>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
