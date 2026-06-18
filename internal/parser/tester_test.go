package parser

import (
	"testing"
)

func TestParseTesterReport(t *testing.T) {
	report, err := ParseTesterReport("../../test/ReportTester-25110922.xlsx")
	if err != nil {
		t.Fatalf("Failed to parse report: %v", err)
	}

	if report.Settings.Expert != "DailyBreakout" {
		t.Errorf("Expected Expert 'DailyBreakout', got '%s'", report.Settings.Expert)
	}
	if report.Settings.Symbol != "XAUUSD" {
		t.Errorf("Expected Symbol 'XAUUSD', got '%s'", report.Settings.Symbol)
	}
	if report.Settings.InitialDeposit != 100.0 {
		t.Errorf("Expected InitialDeposit 100.0, got %f", report.Settings.InitialDeposit)
	}

	if report.NativeStats.TotalNetProfit != 640809.34 {
		t.Errorf("Expected TotalNetProfit 640809.34, got %f", report.NativeStats.TotalNetProfit)
	}

	if len(report.Deals) == 0 {
		t.Error("Deals are empty")
	} else {
		t.Logf("Parsed %d deals", len(report.Deals))
	}
}
