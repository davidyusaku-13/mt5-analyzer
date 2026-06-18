package main

import (
	"fmt"
	"log"
	"mt5-analyzer/internal/parser"
	"mt5-analyzer/internal/stats"
)

func main() {
	filePath := `E:\code\mt5-analyzer\test\ReportTester-25110922.xlsx`
	report, err := parser.ParseTesterReport(filePath)
	if err != nil {
		log.Fatalf("Parse error: %v", err)
	}

	metrics := stats.ComputeMetrics(report.Deals, report.Settings.InitialDeposit)

	fmt.Printf("Native Total Net Profit: %.2f\n", report.NativeStats.TotalNetProfit)
	var computedProfit float64
	for _, tr := range report.Deals {
		if tr.Direction == "out" || tr.Direction == "in/out" || tr.Direction == "out/in" {
			computedProfit += tr.Profit + tr.Commission + tr.Swap
		}
	}
	fmt.Printf("Computed Total Net Profit (Closed deals: Profit + Comm + Swap): %.2f\n", computedProfit)
	
	if len(report.Deals) > 0 {
		finalBalance := report.Deals[len(report.Deals)-1].Balance
		fmt.Printf("Initial Deposit: %.2f\n", report.Settings.InitialDeposit)
		fmt.Printf("Final Balance: %.2f\n", finalBalance)
		fmt.Printf("Balance Difference (Net Profit): %.2f\n", finalBalance - report.Settings.InitialDeposit)
	}
	
	fmt.Printf("\nNative Expected Payoff: %.2f\n", report.NativeStats.ExpectedPayoff)
	fmt.Printf("Computed Expected Payoff: %.2f\n", metrics.ME)

	fmt.Printf("\nNative Total Trades: %d\n", report.NativeStats.TotalTrades)
	fmt.Printf("Computed Total Trades: %d\n", metrics.N)
}
