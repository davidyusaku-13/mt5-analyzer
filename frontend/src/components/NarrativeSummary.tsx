export default function NarrativeSummary({ native, computed }: { native: any; computed: any }) {
  if (!computed) return null;

  const getAlert = (condition: boolean, goodMsg: string, badMsg: string) => {
    return condition ? (
      <li className="flex items-start text-sm">
        <span className="mr-2">✅</span>
        <span className="text-gray-400">{goodMsg}</span>
      </li>
    ) : (
      <li className="flex items-start text-sm">
        <span className="mr-2">⚠️</span>
        <span className="text-gray-400">{badMsg}</span>
      </li>
    );
  };

  const generateSummary = () => {
    if (!native) return "";
    let summary = "This Expert Advisor ";
    
    if (computed.GHPR > 1.0) {
      summary += "exhibits strong profitability and compounding potential";
    } else {
      summary += "struggles to remain profitable under compounding";
    }

    if (native?.MaxEquityDDPct >= 40) {
      summary += ", but suffers from a dangerously high drawdown of " + native.MaxEquityDDPct.toFixed(1) + "%. ";
    } else {
      summary += " while maintaining a safe drawdown profile (" + native?.MaxEquityDDPct?.toFixed(1) + "%). ";
    }

    if (Math.abs(computed.ZScore) >= 2) {
      summary += "However, its trades are highly dependent on streaks, meaning wins/losses tend to cluster. ";
    } else {
      summary += "Its trades show excellent statistical independence with no predictable streaks. ";
    }

    if (computed.SharpeRatio >= 1) {
      summary += "Overall, the risk-adjusted returns are excellent.";
    } else {
      summary += "Overall, the risk-adjusted returns are poor and may not justify the risk taken.";
    }

    return summary;
  };

  return (
    <div className="glass-panel p-4 rounded-xl border border-gray-800 mt-4 glass-panel">
      <h3 className="text-lg font-bold text-blue-400 mb-3">AI Narrative Interpretation</h3>
      <p className="text-gray-100 mb-4 italic leading-relaxed border-l-4 border-blue-500 pl-3">"{generateSummary()}"</p>
      <ul className="space-y-2">
        {getAlert(
          Math.abs(computed.ZScore) < 2,
          `Z-Score is ${computed.ZScore.toFixed(2)} (< 2): Trades are independent. No streak dependency.`,
          `Z-Score is ${computed.ZScore.toFixed(2)} (>= 2): Trades exhibit streak dependency.`
        )}
        {getAlert(
          computed.SharpeRatio >= 1,
          `Sharpe Ratio is ${computed.SharpeRatio.toFixed(2)} (>= 1.0): Good risk-adjusted returns.`,
          `Sharpe Ratio is ${computed.SharpeRatio.toFixed(2)} (< 1.0): Returns may not justify the risk.`
        )}
        {getAlert(
          computed.GHPR > 1,
          `GHPR is ${computed.GHPR.toFixed(4)} (> 1.0): Profitable under compounding.`,
          `GHPR is ${computed.GHPR.toFixed(4)} (<= 1.0): Strategy loses money under compounding.`
        )}
        {getAlert(
          native?.MaxEquityDDPct < 40,
          `Max Equity Drawdown is ${native?.MaxEquityDDPct?.toFixed(2)}% (< 40%): Acceptable risk profile.`,
          `Max Equity Drawdown is ${native?.MaxEquityDDPct?.toFixed(2)}% (>= 40%): High risk of ruin.`
        )}
      </ul>
    </div>
  );
}
