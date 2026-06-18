export namespace models {
	
	export class BalancePoint {
	    TradeNum: number;
	    Balance: number;
	    Profit: number;
	    // Go type: time
	    Date: any;
	    SubStrategy: string;
	
	    static createFrom(source: any = {}) {
	        return new BalancePoint(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.TradeNum = source["TradeNum"];
	        this.Balance = source["Balance"];
	        this.Profit = source["Profit"];
	        this.Date = this.convertValues(source["Date"], null);
	        this.SubStrategy = source["SubStrategy"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class ColumnInfo {
	    Name: string;
	    IsParameter: boolean;
	    DataType: string;
	
	    static createFrom(source: any = {}) {
	        return new ColumnInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.IsParameter = source["IsParameter"];
	        this.DataType = source["DataType"];
	    }
	}
	export class Deal {
	    // Go type: time
	    OpenTime: any;
	    // Go type: time
	    CloseTime: any;
	    Ticket: number;
	    Symbol: string;
	    Direction: string;
	    Type: string;
	    Lots: number;
	    OpenPrice: number;
	    ClosePrice: number;
	    Swap: number;
	    Commission: number;
	    Profit: number;
	    Balance: number;
	    Comment: string;
	    SubStrategy: string;
	
	    static createFrom(source: any = {}) {
	        return new Deal(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.OpenTime = this.convertValues(source["OpenTime"], null);
	        this.CloseTime = this.convertValues(source["CloseTime"], null);
	        this.Ticket = source["Ticket"];
	        this.Symbol = source["Symbol"];
	        this.Direction = source["Direction"];
	        this.Type = source["Type"];
	        this.Lots = source["Lots"];
	        this.OpenPrice = source["OpenPrice"];
	        this.ClosePrice = source["ClosePrice"];
	        this.Swap = source["Swap"];
	        this.Commission = source["Commission"];
	        this.Profit = source["Profit"];
	        this.Balance = source["Balance"];
	        this.Comment = source["Comment"];
	        this.SubStrategy = source["SubStrategy"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class EASettings {
	    Expert: string;
	    Symbol: string;
	    Period: string;
	    DateRange: string;
	    InitialDeposit: number;
	    Leverage: string;
	    Currency: string;
	    Inputs: Record<string, string>;
	
	    static createFrom(source: any = {}) {
	        return new EASettings(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Expert = source["Expert"];
	        this.Symbol = source["Symbol"];
	        this.Period = source["Period"];
	        this.DateRange = source["DateRange"];
	        this.InitialDeposit = source["InitialDeposit"];
	        this.Leverage = source["Leverage"];
	        this.Currency = source["Currency"];
	        this.Inputs = source["Inputs"];
	    }
	}
	export class MonthlyReturn {
	    Year: number;
	    Month: number;
	    Value: number;
	
	    static createFrom(source: any = {}) {
	        return new MonthlyReturn(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Year = source["Year"];
	        this.Month = source["Month"];
	        this.Value = source["Value"];
	    }
	}
	export class NativeStats {
	    TotalNetProfit: number;
	    GrossProfit: number;
	    GrossLoss: number;
	    ProfitFactor: number;
	    RecoveryFactor: number;
	    SharpeRatio: number;
	    ZScore: number;
	    ZScorePct: number;
	    AHPR: number;
	    GHPR: number;
	    LRCorrelation: number;
	    LRStdError: number;
	    ExpectedPayoff: number;
	    MaxBalanceDDPct: number;
	    MaxBalanceDDAbs: number;
	    MaxEquityDDPct: number;
	    MaxEquityDDAbs: number;
	    TotalTrades: number;
	    WinTrades: number;
	    LossTrades: number;
	
	    static createFrom(source: any = {}) {
	        return new NativeStats(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.TotalNetProfit = source["TotalNetProfit"];
	        this.GrossProfit = source["GrossProfit"];
	        this.GrossLoss = source["GrossLoss"];
	        this.ProfitFactor = source["ProfitFactor"];
	        this.RecoveryFactor = source["RecoveryFactor"];
	        this.SharpeRatio = source["SharpeRatio"];
	        this.ZScore = source["ZScore"];
	        this.ZScorePct = source["ZScorePct"];
	        this.AHPR = source["AHPR"];
	        this.GHPR = source["GHPR"];
	        this.LRCorrelation = source["LRCorrelation"];
	        this.LRStdError = source["LRStdError"];
	        this.ExpectedPayoff = source["ExpectedPayoff"];
	        this.MaxBalanceDDPct = source["MaxBalanceDDPct"];
	        this.MaxBalanceDDAbs = source["MaxBalanceDDAbs"];
	        this.MaxEquityDDPct = source["MaxEquityDDPct"];
	        this.MaxEquityDDAbs = source["MaxEquityDDAbs"];
	        this.TotalTrades = source["TotalTrades"];
	        this.WinTrades = source["WinTrades"];
	        this.LossTrades = source["LossTrades"];
	    }
	}
	export class OptPass {
	    PassNum: number;
	    Values: Record<string, number>;
	
	    static createFrom(source: any = {}) {
	        return new OptPass(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.PassNum = source["PassNum"];
	        this.Values = source["Values"];
	    }
	}
	export class OptimizerReport {
	    FilePath: string;
	    TotalPasses: number;
	    Columns: ColumnInfo[];
	    Passes: OptPass[];
	
	    static createFrom(source: any = {}) {
	        return new OptimizerReport(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.FilePath = source["FilePath"];
	        this.TotalPasses = source["TotalPasses"];
	        this.Columns = this.convertValues(source["Columns"], ColumnInfo);
	        this.Passes = this.convertValues(source["Passes"], OptPass);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Order {
	    // Go type: time
	    OpenTime: any;
	    Order: number;
	    Symbol: string;
	    Type: string;
	    Volume: number;
	    Price: number;
	    SL: number;
	    TP: number;
	    // Go type: time
	    Time: any;
	    State: string;
	    Comment: string;
	
	    static createFrom(source: any = {}) {
	        return new Order(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.OpenTime = this.convertValues(source["OpenTime"], null);
	        this.Order = source["Order"];
	        this.Symbol = source["Symbol"];
	        this.Type = source["Type"];
	        this.Volume = source["Volume"];
	        this.Price = source["Price"];
	        this.SL = source["SL"];
	        this.TP = source["TP"];
	        this.Time = this.convertValues(source["Time"], null);
	        this.State = source["State"];
	        this.Comment = source["Comment"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class ParsedTesterReport {
	    Settings: EASettings;
	    NativeStats: NativeStats;
	    Deals: Deal[];
	    Orders: Order[];
	
	    static createFrom(source: any = {}) {
	        return new ParsedTesterReport(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Settings = this.convertValues(source["Settings"], EASettings);
	        this.NativeStats = this.convertValues(source["NativeStats"], NativeStats);
	        this.Deals = this.convertValues(source["Deals"], Deal);
	        this.Orders = this.convertValues(source["Orders"], Order);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class SubStrategyStats {
	    Label: string;
	    TradeCount: number;
	    WinRate: number;
	    AvgProfit: number;
	    TotalProfit: number;
	    ProfitFactor: number;
	
	    static createFrom(source: any = {}) {
	        return new SubStrategyStats(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Label = source["Label"];
	        this.TradeCount = source["TradeCount"];
	        this.WinRate = source["WinRate"];
	        this.AvgProfit = source["AvgProfit"];
	        this.TotalProfit = source["TotalProfit"];
	        this.ProfitFactor = source["ProfitFactor"];
	    }
	}
	export class TesterMetrics {
	    N: number;
	    ME: number;
	    SD: number;
	    ZScore: number;
	    ZProbability: number;
	    AHPR: number;
	    GHPR: number;
	    SharpeRatio: number;
	    LRCorrelation: number;
	    LRStdError: number;
	    ProfitFactor: number;
	    WinRate: number;
	    SubStrategies: Record<string, SubStrategyStats>;
	    BalanceSeries: BalancePoint[];
	    MonthlyReturns: MonthlyReturn[];
	
	    static createFrom(source: any = {}) {
	        return new TesterMetrics(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.N = source["N"];
	        this.ME = source["ME"];
	        this.SD = source["SD"];
	        this.ZScore = source["ZScore"];
	        this.ZProbability = source["ZProbability"];
	        this.AHPR = source["AHPR"];
	        this.GHPR = source["GHPR"];
	        this.SharpeRatio = source["SharpeRatio"];
	        this.LRCorrelation = source["LRCorrelation"];
	        this.LRStdError = source["LRStdError"];
	        this.ProfitFactor = source["ProfitFactor"];
	        this.WinRate = source["WinRate"];
	        this.SubStrategies = this.convertValues(source["SubStrategies"], SubStrategyStats, true);
	        this.BalanceSeries = this.convertValues(source["BalanceSeries"], BalancePoint);
	        this.MonthlyReturns = this.convertValues(source["MonthlyReturns"], MonthlyReturn);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

