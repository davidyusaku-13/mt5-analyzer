package stats

import (
	"mt5-analyzer/internal/parser"
	"testing"
)

func TestMetricsAgainstNative(t *testing.T) {
	report, err := parser.ParseTesterReport("../../test/ReportTester-25110922.xlsx")
	if err != nil {
		t.Fatalf("Failed to parse report: %v", err)
	}

	metrics := ComputeMetrics(report.Deals, report.Settings.InitialDeposit)

	if metrics.N != 330 {
		t.Errorf("Expected N=330, got %d", metrics.N)
	}

	t.Logf("Native Expected Payoff: %f, Computed: %f", report.NativeStats.ExpectedPayoff, metrics.ME)
	t.Logf("Native Sharpe Ratio: %f, Computed: %f", report.NativeStats.SharpeRatio, metrics.SharpeRatio)
	t.Logf("Native Z-Score: %f, Computed: %f", report.NativeStats.ZScore, metrics.ZScore)
	t.Logf("ME: %f, SD: %f, ME/SD: %f", metrics.ME, metrics.SD, metrics.ME/metrics.SD)
	t.Logf("AHPR: %f", metrics.AHPR)
}
