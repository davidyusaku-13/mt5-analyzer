package parser

import (
	"encoding/xml"
	"io"
	"mt5-analyzer/internal/models"
	"os"
	"strconv"
	"strings"
)

func ParseOptimizerReport(filePath string) (*models.OptimizerReport, error) {
	f, err := os.Open(filePath)
	if err != nil {
		return nil, err
	}
	defer f.Close()

	decoder := xml.NewDecoder(f)

	report := &models.OptimizerReport{
		FilePath: filePath,
	}

	var columns []string
	headerFound := false

	for {
		t, err := decoder.Token()
		if err == io.EOF {
			break
		}
		if err != nil {
			return nil, err
		}

		switch se := t.(type) {
		case xml.StartElement:
			if se.Name.Local == "Row" {
				var row []string
				// Read cells inside the row
				for {
					t2, err2 := decoder.Token()
					if err2 != nil {
						break
					}
					switch se2 := t2.(type) {
					case xml.StartElement:
						if se2.Name.Local == "Data" {
							var data string
							decoder.DecodeElement(&data, &se2)
							row = append(row, data)
						}
					case xml.EndElement:
						if se2.Name.Local == "Row" {
							goto RowDone
						}
					}
				}
			RowDone:
				if !headerFound && len(row) > 0 && row[0] == "Pass" {
					headerFound = true
					columns = row
					for i, colName := range columns {
						isParam := i > 9 // First 10 columns are metrics (Pass..Trades)
						report.Columns = append(report.Columns, models.ColumnInfo{
							Name:        colName,
							IsParameter: isParam,
							DataType:    "float",
						})
					}
				} else if headerFound && len(row) > 0 {
					passNum, _ := strconv.Atoi(row[0])
					pass := models.OptPass{
						PassNum: passNum,
						Values:  make(map[string]float64),
					}
					for i, valStr := range row {
						if i < len(columns) {
							v, _ := strconv.ParseFloat(strings.ReplaceAll(valStr, " ", ""), 64)
							pass.Values[columns[i]] = v
						}
					}
					report.Passes = append(report.Passes, pass)
				}
			}
		}
	}

	report.TotalPasses = len(report.Passes)
	return report, nil
}
