type SeriesSize = 'sm' | 'md' | 'lg';
type StatChoice = 'last' | 'min' | 'max' | 'avg';
type ForecastMode = 'movingAverage' | 'linearTrend' | 'expSmooth';

export interface SimpleOptions {
  text: string;
  showSeriesCount: boolean;
  seriesCountSize: SeriesSize;
  accentColor: string;
  stat: StatChoice;
  showSparkline: boolean;
  compact: boolean;
  forecastPoints: number;
  forecastMode: ForecastMode;
  expAlpha: number;
  showAnomalies: boolean;
  anomalyZ: number;
  showForecastBand: boolean;
  forecastSigma: number;
}
