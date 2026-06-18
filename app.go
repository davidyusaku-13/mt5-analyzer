package main

import (
	"context"
	"fmt"
	"os"
	"mt5-analyzer/internal/export"
	"mt5-analyzer/internal/models"
	"mt5-analyzer/internal/parser"
	"mt5-analyzer/internal/stats"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) ParseTesterReport(filePath string) (*models.ParsedTesterReport, error) {
	return parser.ParseTesterReport(filePath)
}

func (a *App) ComputeMetrics(trades []models.Deal, initialDeposit float64) models.TesterMetrics {
	return stats.ComputeMetrics(trades, initialDeposit)
}

func (a *App) ExportTradesToCSV(trades []models.Deal, outputPath string) error {
	return export.ExportTradesToCSV(trades, outputPath)
}

func (a *App) ParseOptimizerReport(filePath string) (*models.OptimizerReport, error) {
	if filePath == "" {
		return nil, fmt.Errorf("no file selected")
	}

	return parser.ParseOptimizerReport(filePath)
}

func (a *App) SaveCSVFile(content string, defaultFilename string) error {
	filePath, err := runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		DefaultFilename: defaultFilename,
		Filters: []runtime.FileFilter{
			{DisplayName: "CSV Files (*.csv)", Pattern: "*.csv"},
		},
	})
	if err != nil {
		return err
	}
	if filePath == "" {
		return nil // user cancelled
	}
	return os.WriteFile(filePath, []byte(content), 0644)
}

func (a *App) ExportPassesToCSV(report *models.OptimizerReport, outputPath string) error {
	return export.ExportPassesToCSV(report, outputPath)
}

func (a *App) OpenTesterFileDialog() (string, error) {
	return runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select ReportTester XLSX",
		Filters: []runtime.FileFilter{
			{
				DisplayName: "Excel Files",
				Pattern:     "*.xlsx",
			},
		},
	})
}

func (a *App) OpenOptimizerFileDialog() (string, error) {
	return runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select ReportOptimizer XML",
		Filters: []runtime.FileFilter{
			{
				DisplayName: "XML Files",
				Pattern:     "*.xml",
			},
		},
	})
}
