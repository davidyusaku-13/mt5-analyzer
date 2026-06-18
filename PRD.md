# PRD — MT5 Analyzer Desktop App
**Stack:** Go Wails v2 · React · Chart.js / Recharts  
**Version:** 0.1 · Author: David · Status: Draft

---

## 1. Vision

Sebuah desktop app ringan berbasis Wails yang menggantikan workflow manual saat ini — membuka HTML/XLSX/XML di browser atau Excel lalu meng-copy angka ke kalkulator — dengan UI analitik terpadu yang bisa dijalankan offline, tanpa instalasi Python, langsung dari satu `.exe` / `.app`.

---

## 2. Problem Statement

| Pain Point | Kondisi Sekarang | Solusi di App |
|---|---|---|
| Evaluasi Tester report butuh run Python skill | Claude + bash setiap saat | Parser bawaan di Go, sekali klik |
| Optimizer 6.464 passes susah di-filter di Excel | Scroll manual, filter terbatas | Table interaktif + scatter plot built-in |
| Tidak ada satu view yang combine settings + stats + trades | Tiga file / tiga tab browser | Single-window, dua mode |
| Perlu teman online (Claude/Excel) untuk analisis | Harus ada koneksi | Fully offline after install |

---

## 3. Target User

**David** — quant trader individual yang develop dan backtest EAs di MetaTrader 5 untuk XAUUSD. Familiar dengan terminologi MQL5, nyaman dengan data kuantitatif, ingin workflow yang cepat dan tidak bergantung pada tool external untuk analisis rutin.

---

## 4. Scope

### In Scope (v1.0)
- **Mode A — Tester Analyzer:** baca & evaluasi `ReportTester-*.xlsx` (format MT5 Strategy Tester export ke Excel)
- **Mode B — Optimizer Analyzer:** baca & analisis `ReportOptimizer-*.xml` (SpreadsheetML dengan ribuan passes)
- Semua komputasi statistik dari artikel MQL5 §1492 dijalankan in-app (Go)
- Export hasil ke CSV

### Out of Scope (v1.0)
- Live MT5 connection / DDE / Socket
- Dukungan file `.html` (UTF-16 encoded) — bisa ditambah di v1.1
- Multi-symbol comparison dalam satu sesi
- Cloud sync / akun user

---

## 5. File Format Reference

> Berdasarkan inspeksi aktual file `ReportTester-25110922.xlsx` dan `ReportOptimizer-25110922.xml`.

### 5.1 ReportTester XLSX (Sheet1 — 1 sheet)

```
Baris 1–2  : Header ("Strategy Tester Report", nama broker/build)
Baris 3–35 : Settings block
   Row 4    Expert:   DailyBreakout
   Row 5    Symbol:   XAUUSD
   Row 6    Period:   M1 (2020.01.01 - 2026.06.13)
   Row 7+   Inputs:   key=value per baris (multi-group, dipisah header group)
   Row 33   Currency: USD
   Row 34   Initial Deposit: 100.0
   Row 35   Leverage: 1:100
Baris 36–57: Results block (key: value dalam kolom A, B, C, D, ...)
   Row 39   Total Net Profit   | Balance DD Absolute | Equity DD Absolute
   Row 40   Gross Profit       | Balance DD Maximal  | Equity DD Maximal
   Row 41   Gross Loss         | Balance DD Relative | Equity DD Relative
   Row 43   Profit Factor      | Expected Payoff     | Margin Level
   Row 44   Recovery Factor    | Sharpe Ratio        | Z-Score
   Row 45   AHPR               | LR Correlation      | OnTester result
   Row 46   GHPR               | LR Standard Error
   Row 48   Correlation (Profits,MFE) | ... | ...
   Row 49   Min/Max/Avg holding time
   Row 51   Total Trades | Short Trades | Long Trades
   Row 52   Total Deals  | Profit Trades | Loss Trades
   Row 53–57 Largest/Avg profit/loss, consecutive wins/losses
Baris 80   : "Orders" header
Baris 81   : Kolom Orders — Open Time, Order, Symbol, Type, Volume, Price, S/L, T/P, Time, State, Comment
Baris 82+  : Data orders (entry + exit pair)
...        : (setelah orders) Deals table
            Kolom: Open Time, Ticket, Symbol, Type, Dir(in/out), Lots, Price,
                   Ticket, Swap, Comm, Profit, Balance, Comment
```

**Kolom Deals yang dipakai untuk komputasi statistik:**

| Kolom | Kegunaan |
|---|---|
| Dir = `in` | Entry (Profit = 0) |
| Dir = `out` | Exit (Profit = realized P&L) |
| Balance | Running balance untuk HPR series |
| Comment (pada `in`) | Sub-strategy label (misal: "Range Breakout Buy") |

### 5.2 ReportOptimizer XML (SpreadsheetML, 18 kolom, 6.464 baris)

```
Pass | Result | Profit | Expected Payoff | Profit Factor | Recovery Factor |
Sharpe Ratio | Custom | Equity DD % | Trades |
stop_loss | take_profit | range_start_time | range_duration |
range_close_time | breakout_mode | max_range_size | min_range_size
```

Encoding: UTF-8 (kadang UTF-16, auto-detect). Format: `mso-application Excel.Sheet`, namespace `urn:schemas-microsoft-com:office:spreadsheet`.

---

## 6. Mode A — Tester Analyzer

### 6.1 Tujuan

Membaca satu file `ReportTester-*.xlsx` dan menampilkan evaluasi lengkap berbasis semua metrik dari [mql5.com/en/articles/1492](https://www.mql5.com/en/articles/1492).

### 6.2 User Flow

```
[Drag & Drop / Browse file XLSX]
        ↓
[Go backend parse: Settings + Results + Deals table]
        ↓
[Compute metrics: Z-Score, AHPR, GHPR, Sharpe, LR Corr, per-substrategy PF]
        ↓
[Dashboard tampil: Scorecard → Charts → Trade Table]
        ↓
[Optional: Export ke CSV]
```

### 6.3 Panel & Komponen UI

#### Panel 1 — Info Header
| Field | Source |
|---|---|
| EA Name | Settings → Expert |
| Symbol | Settings → Symbol |
| Period | Settings → Period |
| Initial Deposit | Settings → Initial Deposit |
| Leverage | Settings → Leverage |
| Currency | Settings → Currency |
| History Quality | Results → History Quality |

**Collapsible section:** Daftar lengkap EA Inputs (key=value pairs dari XLSX). Dirender sebagai table 2 kolom, digroup per section header (misal: `=== General & Risk Settings ====`).

---

#### Panel 2 — Scorecard (Computed + Native)

Setiap metric ditampilkan sebagai **KPI Card** dengan warna traffic light.

**§ Summary Native (langsung dari XLSX Results)**

| Metric | Format | Warna |
|---|---|---|
| Total Net Profit | Currency | Green jika > 0 |
| Gross Profit / Gross Loss | Currency | — |
| Profit Factor (native) | 2 decimal | ≥2.0 🟢 / 1.5–2.0 🟡 / <1.5 🔴 |
| Recovery Factor | 2 decimal | ≥3 🟢 / 1–3 🟡 / <1 🔴 |
| Sharpe Ratio (native) | 2 decimal | ≥3 🟢 / 1–3 🟡 / <1 🔴 |
| Z-Score (native) | X.XX (Y%) | |Z|<2 🟢 / ≥2 🔴 |
| AHPR | X.XXXX (X.XX%) | |
| GHPR | X.XXXX (X.XX%) | GHPR<1 🔴 |
| LR Correlation | 2 decimal | ≥0.90 🟢 / 0.70–0.89 🟡 / <0.50 🔴 |
| LR Standard Error | Currency | |
| Expected Payoff | Currency | >0 🟢 |
| Max Balance DD | % + $ | |
| Max Equity DD | % + $ | |

**§ Computed by App (Go backend, dari Deals table)**

| Metric | Formula | Threshold |
|---|---|---|
| Mathematical Expectation (ME) | `Σ profits / N` | ME>0 🟢 |
| Std Deviation of trades | `√(Σ(p-ME)²/(N-1))` | — |
| Z-Score (computed) | artikel §1492 | |Z|<2 🟢 |
| AHPR (computed) | `Σ HPR(i)/N` | — |
| GHPR (computed) | `(final/initial)^(1/N)` | <1 🔴 |
| Sharpe Ratio (computed) | `(AHPR-1)/SD(HPR)` | ≥3 🟢 |
| LR Correlation (computed) | Pearson r(balance, trade#) | ≥0.90 🟢 |
| LR Std Error | `√(Σresiduals²/(N-2))` | — |
| Total W/L Runs (R) | count of consecutive streaks | — |
| Win Rate | W/N | — |
| Avg Win / Avg Loss | per trade | — |
| Profit Factor (computed) | GrossProfit/|GrossLoss| | ≥2.0 🟢 |

> Nilai "computed" ditampilkan berdampingan dengan nilai "native" (dari XLSX) untuk cross-validation. Jika keduanya berbeda lebih dari 0.5%, tampilkan peringatan kuning.

**§ Per-Sub-Strategy Breakdown**

Di-detect dari kolom Comment pada Deals table `in` rows. Misal: `"Range Breakout Buy"`, `"Range Breakout Sell"`.

Untuk setiap sub-strategy:

| Metric | Tampil |
|---|---|
| Label | "Range Breakout Buy" |
| Trade count | N |
| Win rate | % |
| Avg profit per trade | $ |
| Profit Factor | computed |
| Total Profit | $ |

Ditampilkan sebagai **horizontal bar comparison chart** dan mini-tabel.

---

#### Panel 3 — Charts

**Chart 1 — Balance Curve**
- Line chart: x = trade number, y = balance ($)
- Overlay: Linear regression line (dari computed LR)
- Shaded area: ± LR Standard Error
- Tooltip: trade #, date, profit, balance, comment (sub-strategy)

**Chart 2 — Profit Distribution (Histogram)**
- Bins otomatis berdasar trade count
- Color: profit=biru / loss=merah
- Overlay: vertical line di ME

**Chart 3 — Drawdown Over Time**
- Area chart: running max DD % dari sequence trade
- x = trade number

**Chart 4 — Monthly Returns Heatmap**
- Grid: kolom = bulan, baris = tahun
- Color scale: merah (loss) → putih (0) → hijau (profit)
- Computed dari Deals table

**Chart 5 — Win/Loss Streak Distribution**
- Bar chart: x = streak length, y = count
- Separate untuk Win streaks dan Loss streaks

---

#### Panel 4 — Trade Table

Tabel paginated dari Deals table (`out` rows saja = closed trades):

| Kolom | Notes |
|---|---|
| # | Trade number |
| Open Time | dari `in` row |
| Close Time | dari `out` row |
| Type | Buy / Sell |
| Lots | Volume |
| Open Price | dari `in` |
| Close Price | dari `out` |
| Profit | $ |
| Balance | running |
| Comment / Sub-Strategy | dari `in` Comment |

Fitur tabel:
- Sort per kolom
- Filter: sub-strategy, win/loss, date range
- Export filtered rows ke CSV

---

#### Panel 5 — Narrative Interpretation

Auto-generated text summary berdasarkan computed metrics:

```
Contoh output:
"DailyBreakout (330 trades, 2020–2026):
 ✅ GHPR 1.0269 — profitable under compounding
 ✅ Sharpe 5.46 — excellent
 ⚠️  LR Correlation 0.60 — moderate, growth tidak smooth
 ✅ Z-Score 0.01 — trades independent, no streak dependency
 ⚠️  Max Equity DD 41.57% — perlu perhatian untuk live trading"
```

---

### 6.4 Go Backend Functions (Wails Binding)

```go
// Baca dan parse XLSX, return struct ParsedTesterReport
func (a *App) ParseTesterReport(filePath string) ParsedTesterReport

// Compute semua statistical metrics dari trades slice
func (a *App) ComputeMetrics(trades []Deal) TesterMetrics

// Export trade table ke CSV
func (a *App) ExportTradesToCSV(trades []Deal, outputPath string) error
```

**Data Structs:**

```go
type ParsedTesterReport struct {
    Settings    EASettings
    NativeStats NativeStats      // langsung dari XLSX Results
    Deals       []Deal           // dari Deals table
    Orders      []Order          // dari Orders table
}

type EASettings struct {
    Expert         string
    Symbol         string
    Period         string
    DateRange      string
    InitialDeposit float64
    Leverage       string
    Currency       string
    Inputs         map[string]string   // semua key=value EA params
}

type NativeStats struct {
    TotalNetProfit     float64
    GrossProfit        float64
    GrossLoss          float64
    ProfitFactor       float64
    RecoveryFactor     float64
    SharpeRatio        float64
    ZScore             float64
    ZScorePct          float64
    AHPR               float64
    GHPR               float64
    LRCorrelation      float64
    LRStdError         float64
    ExpectedPayoff     float64
    MaxBalanceDDPct    float64
    MaxBalanceDDAbs    float64
    MaxEquityDDPct     float64
    MaxEquityDDAbs     float64
    TotalTrades        int
    WinTrades          int
    LossTrades         int
    // ... dst
}

type Deal struct {
    OpenTime    time.Time
    CloseTime   time.Time
    Ticket      int
    Symbol      string
    Direction   string   // "in" | "out"
    Type        string   // "buy" | "sell"
    Lots        float64
    OpenPrice   float64
    ClosePrice  float64
    Swap        float64
    Commission  float64
    Profit      float64
    Balance     float64
    Comment     string
    SubStrategy string   // extracted from Comment
}

type TesterMetrics struct {
    N               int
    ME              float64
    SD              float64
    ZScore          float64
    ZProbability    float64
    AHPR            float64
    GHPR            float64
    SharpeRatio     float64
    LRCorrelation   float64
    LRStdError      float64
    ProfitFactor    float64
    WinRate         float64
    SubStrategies   map[string]SubStrategyStats
    BalanceSeries   []BalancePoint
    MonthlyReturns  []MonthlyReturn
}
```

---

## 7. Mode B — Optimizer Analyzer

### 7.1 Tujuan

Load `ReportOptimizer-*.xml` (bisa ribuan passes), filter, sort, dan temukan parameter region yang robust — menggantikan workflow Excel manual.

### 7.2 User Flow

```
[Drag & Drop / Browse file XML]
        ↓
[Go backend parse XML → array of OptPass structs]
        ↓  (progress bar karena bisa 6000+ baris)
[Summary: total passes, parameter columns detected]
        ↓
[Filter Panel → Apply → Filtered Results]
        ↓
[Views: Table | Scatter Plot | Heatmap | Top-N]
        ↓
[Export filtered passes ke CSV]
```

### 7.3 Auto-Detection Kolom

Parser Go mendeteksi kolom secara dinamis:
- **Performance columns** (fixed): Pass, Result, Profit, Expected Payoff, Profit Factor, Recovery Factor, Sharpe Ratio, Custom, Equity DD%, Trades
- **Parameter columns** (dynamic): semua kolom setelah Trades — detected dari header row. Contoh file ini: `stop_loss, take_profit, range_start_time, range_duration, range_close_time, breakout_mode, max_range_size, min_range_size`

---

### 7.4 Filter Panel

**Sliders / Inputs untuk setiap performance metric:**

| Filter | Default | Contoh Value |
|---|---|---|
| Min Profit | 0 | 100,000 |
| Min Profit Factor | 1.0 | 1.5 |
| Min Sharpe Ratio | 0 | 2.0 |
| Max Equity DD % | 100 | 40 |
| Min Trades | 30 | 100 |
| Min Recovery Factor | 0 | 2.0 |

Tombol: **[Apply Filter]** — **[Reset]** — **[Save Preset]**

Counter: `Showing 234 of 6,464 passes`

---

### 7.5 Views

#### View 1 — Passes Table (sortable)

Kolom: Pass # | Profit | PF | Sharpe | DD% | Trades | [semua param EA]

Fitur:
- Sort ascending/descending per kolom
- Highlight baris yang sama Pass # dengan titik di scatter plot (hover sync)
- Pagination (50 / 100 / 500 per page)
- Export ke CSV

#### View 2 — Scatter Plot (2D)

- **X axis:** pilih parameter EA (dropdown)
- **Y axis:** pilih performance metric (dropdown, default: Sharpe Ratio)
- **Color:** pilih performance metric ke-2 (default: Equity DD%)
- **Size:** pilih performance metric ke-3 (default: Trades count)
- Zoom & pan
- Hover tooltip: semua values untuk pass tersebut
- Klik titik → highlight di Table view

**Preset cepat:** tombol `PF vs Sharpe`, `DD% vs Profit`, `stop_loss vs Sharpe`

#### View 3 — Heatmap (2 Parameter)

- **X axis:** parameter EA pertama (misal: `stop_loss`)
- **Y axis:** parameter EA kedua (misal: `take_profit`)
- **Color:** performance metric (default: Profit Factor)
- Cell = rata-rata semua passes di intersection (x,y) tersebut
- Tooltip: nilai rata-rata + jumlah passes di cell

Sangat berguna untuk melihat **stable region** — cluster hijau di heatmap menunjukkan kombinasi parameter yang robust.

#### View 4 — Top-N Passes

Shortcut: tampilkan top 10 / 25 / 50 passes berdasarkan metric pilihan, diformat sebagai tabel highlight dengan semua kolom. Tombol **[Copy as Markdown Table]**.

---

### 7.6 Parameter Sensitivity Panel

Untuk setiap parameter EA, tampilkan:
- **Box plot:** distribusi performance metric per nilai parameter
- **Correlation score:** Pearson r antara parameter value dan performance metric
- Interpretasi: "stop_loss memiliki korelasi 0.72 dengan Sharpe Ratio — parameter sensitif"

---

### 7.7 Go Backend Functions

```go
// Parse XML optimizer, return summary dan semua passes
func (a *App) ParseOptimizerReport(filePath string) OptimizerReport

// Filter passes berdasarkan criteria
func (a *App) FilterPasses(passes []OptPass, criteria FilterCriteria) []OptPass

// Compute sensitivity per parameter
func (a *App) ComputeParameterSensitivity(
    passes []OptPass,
    paramCol string,
    metricCol string,
) SensitivityResult

// Export ke CSV
func (a *App) ExportPassesToCSV(passes []OptPass, outputPath string) error
```

**Data Structs:**

```go
type OptimizerReport struct {
    FilePath    string
    TotalPasses int
    Columns     []ColumnInfo   // auto-detected
    Passes      []OptPass
}

type ColumnInfo struct {
    Name        string
    IsParameter bool   // false = performance metric
    DataType    string // "float" | "int" | "bool"
}

type OptPass struct {
    PassNum    int
    Values     map[string]float64   // semua kolom
}

type FilterCriteria struct {
    MinProfit        *float64
    MinPF            *float64
    MinSharpe        *float64
    MaxEquityDD      *float64
    MinTrades        *int
    MinRecovery      *float64
}

type SensitivityResult struct {
    ParamName     string
    MetricName    string
    Correlation   float64
    BoxPlots      []BoxPlotData  // per unique param value
}
```

---

## 8. Arsitektur Teknis

### 8.1 Stack

```
┌─────────────────────────────────────────────┐
│            Wails v2 Desktop App             │
├─────────────────────┬───────────────────────┤
│   Go Backend        │   React Frontend      │
│                     │                       │
│ • XLSX parser       │ • React 18 + Vite     │
│   (excelize lib)    │ • Chart.js / Recharts │
│ • XML parser        │ • TailwindCSS         │
│ • Stats engine      │ • Tanstack Table      │
│ • CSV export        │ • React Router        │
│ • Wails bindings    │                       │
└─────────────────────┴───────────────────────┘
                    │
            Native OS Window
         (WebKit / WebView2 / GTK)
```

### 8.2 Struktur Folder

```
mt5-analyzer/
├── main.go
├── app.go                    ← Wails app struct + bindings
├── wails.json
├── build/
│   └── appicon.png
├── internal/
│   ├── parser/
│   │   ├── tester.go         ← XLSX parser
│   │   └── optimizer.go      ← XML parser
│   ├── stats/
│   │   ├── metrics.go        ← Z-Score, GHPR, Sharpe, LR dll
│   │   └── substrategy.go    ← per-substrategy breakdown
│   └── export/
│       └── csv.go
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── pages/
    │   │   ├── TesterMode.jsx
    │   │   └── OptimizerMode.jsx
    │   └── components/
    │       ├── ScoreCard.jsx
    │       ├── BalanceChart.jsx
    │       ├── HeatmapChart.jsx
    │       ├── ScatterPlot.jsx
    │       ├── TradeTable.jsx
    │       ├── PassesTable.jsx
    │       └── FilterPanel.jsx
    └── package.json
```

### 8.3 Dependencies Go

```go
// go.mod
require (
    github.com/wailsapp/wails/v2    // Wails framework
    github.com/xuri/excelize/v2     // XLSX read/write
    // XML: standard library encoding/xml sudah cukup
)
```

### 8.4 Dependencies Frontend

```json
{
  "dependencies": {
    "react": "^18",
    "recharts": "^2",
    "chart.js": "^4",
    "@tanstack/react-table": "^8",
    "tailwindcss": "^3",
    "react-dropzone": "^14"
  }
}
```

---

## 9. UX & Design Requirements

### 9.1 Layout Umum

```
┌─────────────────────────────────────────────────────────┐
│  [MT5 Analyzer]          [Tester Mode] [Optimizer Mode] │  ← Top nav
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Drop zone / file picker    (saat belum ada file)       │
│  atau                                                   │
│  Dashboard panels          (saat file sudah di-load)    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 9.2 Tester Mode Layout

```
[Info Header — collapsible]
[Scorecard grid — 4 kolom KPI cards]
[Charts — 2 kolom: Balance Curve | Monthly Heatmap]
[Charts — 2 kolom: Profit Histogram | Streak Distribution]
[Sub-Strategy Breakdown]
[Trade Table]
[Narrative Summary]
```

### 9.3 Optimizer Mode Layout

```
[File info: EA name, total passes, param columns]
[Filter Panel — horizontal bar]
[Tab: Table | Scatter | Heatmap | Top-N | Sensitivity]
```

### 9.4 Design Guidelines

- **Color scheme:** Dark theme — latar belakang `#0f1117`, card `#1a1d27`, aksen `#3b82f6`
- **Traffic light:** Merah `#ef4444` / Kuning `#f59e0b` / Hijau `#22c55e` (warna Tailwind)
- **Font:** Inter untuk UI, monospace untuk angka
- **Metric cards:** nilai besar + label kecil + badge warna
- Window minimum size: 1280 × 800

---

## 10. Statistical Metrics — Spec Detail

Semua formula mengikuti [mql5.com/en/articles/1492](https://www.mql5.com/en/articles/1492) secara eksak.

### Z-Score
```
Z = (N·(R - 0.5) - P) / √(P·(P - N) / (N - 1))
R = jumlah consecutive W/L runs
P = 2·W·L
W = trades menang, L = trades kalah
```

Threshold: |Z| ≥ 2.0 → ada trade dependency, |Z| < 2.0 → independen.

### AHPR & GHPR
```
HPR(i) = balance_after(i) / balance_before(i)   ← hanya untuk closed trades
AHPR   = Σ HPR(i) / N
GHPR   = (balance_final / balance_initial) ^ (1/N)
```

### Sharpe Ratio
```
SD_HPR = √(Σ(HPR(i) - AHPR)² / (N-1))
Sharpe = (AHPR - 1) / SD_HPR
```
Risk-free rate = 0 (standar untuk backtest).

### LR Correlation & Std Error
```
Fit: y = a·x + b  (least squares, x = trade index 1..N, y = balance)
LR Correlation = Pearson r(balance_series, [1..N])
LR Std Error   = √(Σ(balance(i) - predicted(i))² / (N-2))
```

### Mathematical Expectation
```
ME = Σ profit(i) / N    (hanya closed trades, profit = net P&L)
```

### Per-Sub-Strategy Profit Factor
```
Group trades by Comment label
PF(label) = Σ profit(i>0) / |Σ profit(i<0)|    untuk trades i dalam group label
```

---

## 11. Non-Functional Requirements

| Aspek | Target |
|---|---|
| Startup time | < 2 detik |
| Parse ReportTester (1.400 baris XLSX) | < 500ms |
| Parse ReportOptimizer (6.464 passes XML) | < 1 detik |
| Filter + re-render Optimizer table | < 200ms |
| Memory usage | < 150MB normal |
| Platform | Windows 10/11 (primary), macOS 12+ (secondary) |
| Offline | Fully offline setelah install |
| Build size | < 30MB single binary |

---

## 12. Open Questions

| # | Pertanyaan | Prioritas |
|---|---|---|
| Q1 | Apakah perlu support file `.html` (UTF-16) selain XLSX? | Medium |
| Q2 | Apakah sub-strategy detection perlu configurable regex, atau hardcode dari Comment? | Low |
| Q3 | Untuk Optimizer heatmap — cell dengan 0 passes ditampilkan abu-abu atau hidden? | Low |
| Q4 | Export ke format lain selain CSV (Excel, JSON)? | Low |
| Q5 | Perlu persist last-opened file saat app restart? | Medium |

---

## 13. Milestones

### Phase 1 — Foundation (Minggu 1–2)
- [ ] Setup Wails v2 project + React + Tailwind
- [ ] Go XLSX parser untuk Tester report (Settings + NativeStats + Deals table)
- [ ] Go XML parser untuk Optimizer report
- [ ] Implementasi semua formula statistik di `internal/stats/`
- [ ] Unit tests untuk metrics (cross-check dengan Python skill yang sudah ada)

### Phase 2 — Tester Mode (Minggu 3–4)
- [ ] File drop zone
- [ ] Info Header + EA Inputs panel
- [ ] Scorecard KPI cards dengan traffic light
- [ ] Balance Curve chart dengan LR overlay
- [ ] Monthly Returns Heatmap
- [ ] Per-Sub-Strategy breakdown
- [ ] Trade Table (paginated, sortable, filterable)
- [ ] Export CSV

### Phase 3 — Optimizer Mode (Minggu 5–6)
- [ ] File loading dengan progress bar
- [ ] Filter Panel
- [ ] Passes Table (paginated, sortable)
- [ ] Scatter Plot (dynamic X/Y/Color/Size)
- [ ] 2D Heatmap
- [ ] Top-N view
- [ ] Export CSV

### Phase 4 — Polish (Minggu 7)
- [ ] Parameter Sensitivity panel
- [ ] Narrative Summary auto-generator
- [ ] Dark theme refinement
- [ ] Native window menus (File > Open, Export)
- [ ] Error handling (file rusak, kolom missing, N<30 warning)
- [ ] Build & packaging (Windows .exe, macOS .app)

---

## 14. Acceptance Criteria

### Tester Mode
- [ ] Semua 12 computed metrics match Python skill output ± 0.01%
- [ ] Balance Curve benar secara visual (tes visual dengan report yang sudah diketahui hasilnya)
- [ ] Per-sub-strategy PF dihitung benar untuk minimal 2 sub-strategy berbeda
- [ ] Trade Table export CSV dapat dibuka di Excel tanpa error

### Optimizer Mode
- [ ] 6.464 passes dari file sample ter-load dalam < 1 detik
- [ ] Filter kombinasi (Sharpe ≥ 2, DD ≤ 40, Trades ≥ 100) menghasilkan count yang sama seperti filter manual di Excel
- [ ] Scatter plot titik dapat di-hover dan di-klik untuk sync ke tabel
- [ ] Heatmap `stop_loss` vs `take_profit` menunjukkan distribusi warna yang masuk akal

---

*Dokumen ini hidup — update setiap kali ada keputusan arsitektur atau perubahan scope.*