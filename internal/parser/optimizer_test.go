package parser

import (
	"testing"
)

func TestParseOptimizerReport(t *testing.T) {
	report, err := ParseOptimizerReport("../../test/ReportOptimizer-25110922.xml")
	if err != nil {
		t.Fatalf("Failed to parse optimizer report: %v", err)
	}

	if len(report.Passes) == 0 {
		t.Errorf("Expected passes > 0, got 0")
	}

	t.Logf("Total passes parsed: %d", report.TotalPasses)
	if len(report.Columns) < 10 {
		t.Errorf("Expected >= 10 columns, got %d", len(report.Columns))
	} else {
		t.Logf("Columns: %v", report.Columns)
	}
}
