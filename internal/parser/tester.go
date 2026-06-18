package parser

import (
	"mt5-analyzer/internal/models"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/xuri/excelize/v2"
)

func ParseTesterReport(filePath string) (*models.ParsedTesterReport, error) {
	tmpFile, err := ConvertUTF16XLSXToUTF8(filePath)
	if err != nil {
		return nil, err
	}
	defer os.Remove(tmpFile)

	f, err := excelize.OpenFile(tmpFile)
	if err != nil {
		return nil, err
	}
	defer f.Close()

	sheetName := f.GetSheetName(0)
	if sheetName == "" {
		sheetName = "Sheet1"
	}

	rows, err := f.GetRows(sheetName)
	if err != nil {
		return nil, err
	}

	report := &models.ParsedTesterReport{
		Settings: models.EASettings{
			Inputs: make(map[string]string),
		},
	}

	parseSettings(rows, &report.Settings)
	parseResults(rows, &report.NativeStats)
	parseOrdersAndDeals(rows, report)

	return report, nil
}

func extractNonEmptyCells(row []string) []string {
	var cells []string
	for _, c := range row {
		val := strings.TrimSpace(c)
		if val != "" {
			cells = append(cells, val)
		}
	}
	return cells
}

func parseSettings(rows [][]string, settings *models.EASettings) {
	for i := 2; i < 35 && i < len(rows); i++ {
		cells := extractNonEmptyCells(rows[i])
		if len(cells) == 0 {
			continue
		}
		
		key := cells[0]
		
		if len(cells) == 1 && !strings.HasSuffix(key, ":") {
			// e.g. "magic_number=12345" inside Inputs
			parts := strings.SplitN(key, "=", 2)
			if len(parts) == 2 {
				settings.Inputs[strings.TrimSpace(parts[0])] = strings.TrimSpace(parts[1])
			}
			continue
		}
		
		if len(cells) < 2 {
			continue
		}
		
		val := cells[1]

		switch key {
		case "Expert:":
			settings.Expert = val
		case "Symbol:":
			settings.Symbol = val
		case "Period:":
			settings.Period = val
		case "Currency:":
			settings.Currency = val
		case "Initial Deposit:":
			// "1 00.00" -> "100.00"
			v, _ := strconv.ParseFloat(strings.ReplaceAll(val, " ", ""), 64)
			settings.InitialDeposit = v
		case "Leverage:":
			settings.Leverage = val
		case "Inputs:":
			// usually the start of inputs block, val is "=== General & Risk Settings ==="
			settings.Inputs["_category_"+val] = val 
		default:
			if strings.HasSuffix(key, ":") {
				// unhandled setting
			}
		}
	}
}

func parseFloatSpecial(s string) float64 {
	// removes spaces "6408 09.34" -> "640809.34"
	s = strings.ReplaceAll(s, " ", "")
	// If there's parenthesis like "122503.89(40.66%)", extract the first number
	if idx := strings.Index(s, "("); idx != -1 {
		s = s[:idx]
	}
	// "52.32%" -> "52.32"
	s = strings.ReplaceAll(s, "%", "")
	v, _ := strconv.ParseFloat(s, 64)
	return v
}

func parseResults(rows [][]string, stats *models.NativeStats) {
	for i := 37; i < 57 && i < len(rows); i++ {
		cells := extractNonEmptyCells(rows[i])
		for j := 0; j < len(cells)-1; j += 2 {
			key := strings.TrimSuffix(cells[j], ":")
			valStr := cells[j+1]
			
			val := parseFloatSpecial(valStr)

			switch key {
			case "Total Net Profit":
				stats.TotalNetProfit = val
			case "Gross Profit":
				stats.GrossProfit = val
			case "Gross Loss":
				stats.GrossLoss = val
			case "Profit Factor":
				stats.ProfitFactor = val
			case "Recovery Factor":
				stats.RecoveryFactor = val
			case "Sharpe Ratio":
				stats.SharpeRatio = val
			case "Expected Payoff":
				stats.ExpectedPayoff = val
			case "LR Correlation":
				stats.LRCorrelation = val
			case "LR Standard Error":
				stats.LRStdError = val
			case "Total Trades", "Total Deals":
				stats.TotalTrades = int(val)
			case "Balance Drawdown Absolute":
				stats.MaxBalanceDDAbs = val
			case "Equity Drawdown Absolute":
				stats.MaxEquityDDAbs = val
			case "Balance Drawdown Maximal":
				stats.MaxBalanceDDAbs = val
				if idx := strings.Index(valStr, "("); idx != -1 {
					stats.MaxBalanceDDPct = parseFloatSpecial(valStr[idx+1:])
				}
			case "Equity Drawdown Maximal":
				stats.MaxEquityDDAbs = val
				if idx := strings.Index(valStr, "("); idx != -1 {
					stats.MaxEquityDDPct = parseFloatSpecial(valStr[idx+1:])
				}
			case "AHPR":
				stats.AHPR = val
			case "GHPR":
				stats.GHPR = val
			case "Z-Score":
				stats.ZScore = val
			}
		}
	}
}

func parseOrdersAndDeals(rows [][]string, report *models.ParsedTesterReport) {
	orderStart := -1
	for i, row := range rows {
		cells := extractNonEmptyCells(row)
		if len(cells) > 0 && cells[0] == "Orders" {
			orderStart = i + 2
			break
		}
	}

	if orderStart == -1 {
		return
	}

	dealsStart := -1
	for i := orderStart; i < len(rows); i++ {
		cells := extractNonEmptyCells(rows[i])
		if len(cells) > 0 && cells[0] == "Deals" {
			dealsStart = i + 2
			break
		}
	}

	if dealsStart != -1 {
		for i := dealsStart; i < len(rows); i++ {
			cells := extractNonEmptyCells(rows[i])
			if len(cells) < 12 {
				continue
			}
			
			// 0:Open Time, 1:Ticket, 2:Symbol, 3:Type, 4:Dir, 5:Lots, 6:Price, 7:Ticket, 8:Swap, 9:Comm, 10:Profit, 11:Balance, 12:Comment
			deal := models.Deal{}
			deal.OpenTime, _ = time.Parse("2006.01.02 15:04:05", cells[0])
			deal.Ticket, _ = strconv.Atoi(cells[1])
			deal.Symbol = cells[2]
			deal.Type = cells[3]
			deal.Direction = cells[4]
			deal.Lots, _ = strconv.ParseFloat(cells[5], 64)
			deal.OpenPrice, _ = strconv.ParseFloat(cells[6], 64)
			deal.Swap, _ = strconv.ParseFloat(cells[8], 64)
			deal.Commission, _ = strconv.ParseFloat(cells[9], 64)
			deal.Profit = parseFloatSpecial(cells[10])
			deal.Balance = parseFloatSpecial(cells[11])
			if len(cells) > 12 {
				deal.Comment = strings.Join(cells[12:], " ")
				deal.SubStrategy = deal.Comment
			}
			report.Deals = append(report.Deals, deal)
		}
	}
}
