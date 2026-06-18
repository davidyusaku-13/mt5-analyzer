package export

import (
	"encoding/csv"
	"fmt"
	"mt5-analyzer/internal/models"
	"os"
)

func ExportTradesToCSV(trades []models.Deal, outputPath string) error {
	f, err := os.Create(outputPath)
	if err != nil {
		return err
	}
	defer f.Close()

	w := csv.NewWriter(f)
	defer w.Flush()

	header := []string{"#", "Open Time", "Close Time", "Type", "Lots", "Open Price", "Close Price", "Profit", "Balance", "Sub-Strategy"}
	if err := w.Write(header); err != nil {
		return err
	}

	for i, t := range trades {
		row := []string{
			fmt.Sprintf("%d", i+1),
			t.OpenTime.Format("2006-01-02 15:04:05"),
			t.CloseTime.Format("2006-01-02 15:04:05"),
			t.Type,
			fmt.Sprintf("%.2f", t.Lots),
			fmt.Sprintf("%.5f", t.OpenPrice),
			fmt.Sprintf("%.5f", t.ClosePrice),
			fmt.Sprintf("%.2f", t.Profit),
			fmt.Sprintf("%.2f", t.Balance),
			t.SubStrategy,
		}
		if err := w.Write(row); err != nil {
			return err
		}
	}

	return nil
}

func ExportPassesToCSV(report *models.OptimizerReport, outputPath string) error {
	f, err := os.Create(outputPath)
	if err != nil {
		return err
	}
	defer f.Close()

	w := csv.NewWriter(f)
	defer w.Flush()

	if len(report.Columns) == 0 {
		return nil
	}

	var header []string
	for _, c := range report.Columns {
		header = append(header, c.Name)
	}

	if err := w.Write(header); err != nil {
		return err
	}

	for _, p := range report.Passes {
		var row []string
		for _, c := range report.Columns {
			val := p.Values[c.Name]
			row = append(row, fmt.Sprintf("%v", val))
		}
		if err := w.Write(row); err != nil {
			return err
		}
	}

	return nil
}
