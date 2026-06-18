package models

import "time"

type ParsedTesterReport struct {
	Settings    EASettings
	NativeStats NativeStats
	Deals       []Deal
	Orders      []Order
}

type EASettings struct {
	Expert         string
	Symbol         string
	Period         string
	DateRange      string
	InitialDeposit float64
	Leverage       string
	Currency       string
	Inputs         map[string]string
}

type NativeStats struct {
	TotalNetProfit  float64
	GrossProfit     float64
	GrossLoss       float64
	ProfitFactor    float64
	RecoveryFactor  float64
	SharpeRatio     float64
	ZScore          float64
	ZScorePct       float64
	AHPR            float64
	GHPR            float64
	LRCorrelation   float64
	LRStdError      float64
	ExpectedPayoff  float64
	MaxBalanceDDPct float64
	MaxBalanceDDAbs float64
	MaxEquityDDPct  float64
	MaxEquityDDAbs  float64
	TotalTrades     int
	WinTrades       int
	LossTrades      int
}

type Deal struct {
	OpenTime    time.Time
	CloseTime   time.Time
	Ticket      int
	Symbol      string
	Direction   string // "in" | "out"
	Type        string // "buy" | "sell"
	Lots        float64
	OpenPrice   float64
	ClosePrice  float64
	Swap        float64
	Commission  float64
	Profit      float64
	Balance     float64
	Comment     string
	SubStrategy string // extracted from Comment
}

type Order struct {
	OpenTime time.Time
	Order    int
	Symbol   string
	Type     string
	Volume   float64
	Price    float64
	SL       float64
	TP       float64
	Time     time.Time
	State    string
	Comment  string
}

type SubStrategyStats struct {
	Label       string
	TradeCount  int
	WinRate     float64
	AvgProfit   float64
	TotalProfit float64
	ProfitFactor float64
}

type BalancePoint struct {
	TradeNum    int
	Balance     float64
	Profit      float64
	Date        time.Time
	SubStrategy string
}

type MonthlyReturn struct {
	Year  int
	Month time.Month
	Value float64
}

type TesterMetrics struct {
	N              int
	ME             float64
	SD             float64
	ZScore         float64
	ZProbability   float64
	AHPR           float64
	GHPR           float64
	SharpeRatio    float64
	LRCorrelation  float64
	LRStdError     float64
	ProfitFactor   float64
	WinRate        float64
	SubStrategies  map[string]SubStrategyStats
	BalanceSeries  []BalancePoint
	MonthlyReturns []MonthlyReturn
}

type OptimizerReport struct {
	FilePath    string
	TotalPasses int
	Columns     []ColumnInfo
	Passes      []OptPass
}

type ColumnInfo struct {
	Name        string
	IsParameter bool
	DataType    string
}

type OptPass struct {
	PassNum int
	Values  map[string]float64
}

type FilterCriteria struct {
	MinProfit   *float64
	MinPF       *float64
	MinSharpe   *float64
	MaxEquityDD *float64
	MinTrades   *int
	MinRecovery *float64
}

type BoxPlotData struct {
	Value float64
	Min   float64
	Q1    float64
	Med   float64
	Q3    float64
	Max   float64
}

type SensitivityResult struct {
	ParamName   string
	MetricName  string
	Correlation float64
	BoxPlots    []BoxPlotData
}
