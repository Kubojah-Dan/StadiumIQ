/**
 * AI-Predictive Crowd Surge Detection
 * Feature #1: Uses simulated LSTM logic to predict surges 30 mins ahead.
 */

export class SurgeResult {
  zoneId: string = '';
  surgeProbability: number = 0;
  alertLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
  estimatedSurgeTime: number = 0;
  mitigation: string = '';
}

export class CrowdSurgePredictor {
  // Mock LSTM prediction logic
  static predict(zoneId: string, historicalData: number[]): SurgeResult {
    const trend = this.calculateTrend(historicalData);
    const volatility = Math.random() * 0.2;
    const probability = Math.min(Math.max(trend + volatility, 0), 1);
    
    let alertLevel: SurgeResult['alertLevel'] = 'LOW';
    let mitigation = 'No action required';
    
    if (probability > 0.8) {
      alertLevel = 'CRITICAL';
      mitigation = 'Open Gate 7 immediately; redirect Section 12 ingress.';
    } else if (probability > 0.6) {
      alertLevel = 'HIGH';
      mitigation = 'Increase security presence at North Concourse.';
    } else if (probability > 0.4) {
      alertLevel = 'MODERATE';
      mitigation = 'Monitor trend; standby for gate redirection.';
    }
    
    return {
      zoneId,
      surgeProbability: probability,
      alertLevel,
      estimatedSurgeTime: Math.floor(Math.random() * 20) + 10,
      mitigation
    };
  }
  
  private static calculateTrend(data: number[]): number {
    if (data.length < 2) return 0.5;
    const last = data[data.length - 1];
    const prev = data[data.length - 2];
    return last > prev ? last + (last - prev) : last * 0.9;
  }
}
