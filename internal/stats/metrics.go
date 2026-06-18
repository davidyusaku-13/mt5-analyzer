package stats

import (
	"math"
	"mt5-analyzer/internal/models"
	"time"
)

func ComputeMetrics(trades []models.Deal, initialDeposit float64) models.TesterMetrics {
	var m models.TesterMetrics

	if len(trades) == 0 {
		return m
	}

	var closedTrades []models.Deal
	for _, tr := range trades {
		if tr.Direction == "out" || tr.Direction == "in/out" || tr.Direction == "out/in" {
			closedTrades = append(closedTrades, tr)
		}
	}
	trades = closedTrades

	if len(trades) == 0 {
		return m
	}

	var N int
	var W, L int
	var runs int
	var lastWasWin bool
	var grossProfit, grossLoss float64

	m.BalanceSeries = make([]models.BalancePoint, 0, len(trades))
	
	// We need HPRs
	var hprs []float64

	for i, tr := range trades {
		// Only consider closed trades (where Dir = out or it has a profit)
		// Assuming 'trades' already only contains the sequence of closed positions
		// or if it's the Deals table, we only look at trades that change balance
		
		isWin := tr.Profit > 0
		if isWin {
			W++
			grossProfit += tr.Profit
		} else {
			L++
			grossLoss += math.Abs(tr.Profit)
		}
		
		// Run count for Z-Score
		if i == 0 {
			runs = 1
			lastWasWin = isWin
		} else {
			if isWin != lastWasWin {
				runs++
				lastWasWin = isWin
			}
		}

		m.ME += tr.Profit
		
		// Balance before this trade
		balBefore := initialDeposit
		if i > 0 {
			balBefore = trades[i-1].Balance
		}
		
		hpr := 1.0
		if balBefore > 0 {
			hpr = tr.Balance / balBefore
		}
		hprs = append(hprs, hpr)
		m.AHPR += hpr

		m.BalanceSeries = append(m.BalanceSeries, models.BalancePoint{
			TradeNum:    i + 1,
			Balance:     tr.Balance,
			Profit:      tr.Profit,
			Date:        tr.OpenTime,
			SubStrategy: tr.SubStrategy,
		})
	}

	N = len(trades)
	m.N = N

	if N > 0 {
		// Calculate true expected payoff using the overall balance difference
		trueNetProfit := trades[N-1].Balance - initialDeposit
		m.ME = trueNetProfit / float64(N)
		
		m.AHPR /= float64(N)
		m.WinRate = float64(W) / float64(N)
	}

	if grossLoss > 0 {
		m.ProfitFactor = grossProfit / grossLoss
	} else {
		m.ProfitFactor = grossProfit
	}

	if initialDeposit > 0 && trades[N-1].Balance > 0 {
		m.GHPR = math.Pow(trades[N-1].Balance/initialDeposit, 1.0/float64(N))
	}

	// 2nd pass for SD
	var sumSqDiff, sumHPRSqDiff float64
	for i, tr := range trades {
		diff := tr.Profit - m.ME
		sumSqDiff += diff * diff
		
		hprDiff := hprs[i] - m.AHPR
		sumHPRSqDiff += hprDiff * hprDiff
	}

	if N > 1 {
		m.SD = math.Sqrt(sumSqDiff / float64(N-1))
		sdHPR := math.Sqrt(sumHPRSqDiff / float64(N-1))
		if sdHPR > 0 {
			m.SharpeRatio = (m.AHPR - 1.0) / sdHPR
		}
	}

	// Z-Score
	P := 2.0 * float64(W) * float64(L)
	if P > 0 && N > 1 {
		zNum := float64(N)*(float64(runs)-0.5) - P
		zDen := math.Sqrt(P * (P - float64(N)) / float64(N-1))
		if zDen != 0 {
			m.ZScore = zNum / zDen
		}
	}

	// Linear Regression
	var sumX, sumY, sumXY, sumX2 float64
	for i, p := range m.BalanceSeries {
		x := float64(i + 1)
		y := p.Balance
		sumX += x
		sumY += y
		sumXY += x * y
		sumX2 += x * x
	}

	var a, b float64
	nFloat := float64(N)
	denom := nFloat*sumX2 - sumX*sumX
	if denom != 0 {
		a = (nFloat*sumXY - sumX*sumY) / denom
		b = (sumY - a*sumX) / nFloat
	}

	// Correlation & Std Err
	var sumResSq, numCorr, denX, denY float64
	meanX := sumX / nFloat
	meanY := sumY / nFloat
	
	for i, p := range m.BalanceSeries {
		x := float64(i + 1)
		y := p.Balance
		
		pred := a*x + b
		res := y - pred
		sumResSq += res * res
		
		dx := x - meanX
		dy := y - meanY
		numCorr += dx * dy
		denX += dx * dx
		denY += dy * dy
	}

	if N > 2 {
		m.LRStdError = math.Sqrt(sumResSq / float64(N-2))
	}
	
	if denX > 0 && denY > 0 {
		m.LRCorrelation = numCorr / math.Sqrt(denX*denY)
	}

	// Sub-Strategies
	m.SubStrategies = ComputeSubStrategies(trades)

	// Monthly Returns
	m.MonthlyReturns = ComputeMonthlyReturns(trades)

	return m
}

func ComputeSubStrategies(trades []models.Deal) map[string]models.SubStrategyStats {
	stats := make(map[string]models.SubStrategyStats)
	// group by SubStrategy
	
	for _, t := range trades {
		label := t.SubStrategy
		if label == "" {
			label = "Default"
		}
		
		s := stats[label]
		s.Label = label
		s.TradeCount++
		s.TotalProfit += t.Profit
		if t.Profit > 0 {
			s.WinRate++ // Using as win count temporarily
			s.ProfitFactor += t.Profit // temporary gross profit
		} else {
			s.AvgProfit += math.Abs(t.Profit) // temporary gross loss
		}
		stats[label] = s
	}
	
	for k, s := range stats {
		if s.AvgProfit > 0 {
			s.ProfitFactor = s.ProfitFactor / s.AvgProfit
		} else {
			s.ProfitFactor = s.ProfitFactor
		}
		
		if s.TradeCount > 0 {
			s.AvgProfit = s.TotalProfit / float64(s.TradeCount)
			s.WinRate = s.WinRate / float64(s.TradeCount)
		}
		stats[k] = s
	}

	return stats
}

func ComputeMonthlyReturns(trades []models.Deal) []models.MonthlyReturn {
	var ret []models.MonthlyReturn
	if len(trades) == 0 {
		return ret
	}

	// bucket by year-month
	type ym struct {
		y int
		m time.Month
	}
	buckets := make(map[ym]float64)
	keys := []ym{}

	for _, t := range trades {
		if t.CloseTime.IsZero() {
			t.CloseTime = t.OpenTime
		}
		k := ym{t.CloseTime.Year(), t.CloseTime.Month()}
		if _, exists := buckets[k]; !exists {
			keys = append(keys, k)
		}
		buckets[k] += t.Profit
	}

	for _, k := range keys {
		ret = append(ret, models.MonthlyReturn{
			Year:  k.y,
			Month: k.m,
			Value: buckets[k],
		})
	}
	return ret
}
