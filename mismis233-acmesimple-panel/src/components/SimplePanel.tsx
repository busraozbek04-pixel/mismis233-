import React, { useEffect, useMemo, useState } from 'react';
import { FieldType, PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
import { css, cx } from '@emotion/css';
import { useStyles2, useTheme2 } from '@grafana/ui';
import { PanelDataErrorView } from '@grafana/runtime';

interface Props extends PanelProps<SimpleOptions> {}

type StatChoice = SimpleOptions['stat'];
type ForecastMode = SimpleOptions['forecastMode'];

const getStyles = (compact: boolean) => ({
  wrapper: css`
    font-family: Open Sans;
    position: relative;
    width: 100%;
    height: 100%;
    padding: ${compact ? '12px' : '16px'};
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: ${compact ? '10px' : '14px'};
  `,
  header: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    flex-wrap: wrap;
  `,
  badge: css`
    font-weight: 700;
    letter-spacing: 0.3px;
    padding: 6px 10px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.08);
  `,
  meta: css`
    display: flex;
    gap: 10px;
    align-items: baseline;
    color: inherit;
    opacity: 0.8;
  `,
  grid: css`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: ${compact ? '10px' : '14px'};
    flex: 1;
  `,
  card: css`
    border-radius: 12px;
    padding: ${compact ? '12px' : '16px'};
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.06);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    display: flex;
    flex-direction: column;
    gap: 8px;
    transition: transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease;
    cursor: pointer;

    &:hover {
      transform: translateY(-2px);
      border-color: rgba(255, 255, 255, 0.14);
      box-shadow: 0 10px 28px rgba(0, 0, 0, 0.16);
    }
  `,
  label: css`
    font-size: 12px;
    letter-spacing: 0.2px;
    text-transform: uppercase;
    opacity: 0.7;
  `,
  stat: css`
    font-size: ${compact ? '26px' : '32px'};
    font-weight: 800;
    line-height: 1.2;
    letter-spacing: -0.5px;
  `,
  hint: css`
    font-size: 12px;
    opacity: 0.7;
  `,
  sparklineBox: css`
    height: ${compact ? '90px' : '110px'};
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    gap: 6px;
  `,
  sparkline: css`
    width: 100%;
    height: 70%;
  `,
  anomalyDot: css`
    fill: #ff5f6d;
    stroke: #fff;
    stroke-width: 1;
  `,
  anomalyBadge: css`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 10px;
    background: rgba(255, 95, 109, 0.14);
    color: inherit;
    font-size: 12px;
    font-weight: 700;
  `,
  forecastBadge: css`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 10px;
    background: rgba(92, 111, 239, 0.12);
    color: inherit;
    font-size: 12px;
    font-weight: 700;
  `,
  modelSwitcher: css`
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  `,
  modelButton: css`
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: 10px;
    padding: 6px 10px;
    background: rgba(255, 255, 255, 0.04);
    cursor: pointer;
    transition: border-color 120ms ease, background 120ms ease, transform 120ms ease;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.2px;

    &:hover {
      border-color: rgba(255, 255, 255, 0.28);
      background: rgba(255, 255, 255, 0.08);
      transform: translateY(-1px);
    }
  `,
  modelButtonActive: css`
    border-color: rgba(92, 111, 239, 0.9);
    background: rgba(92, 111, 239, 0.18);
    color: #fff;
  `,
  note: css`
    font-size: 13px;
    line-height: 1.4;
    opacity: 0.85;
  `,
  seriesCount: css`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.06);
  `,
});

const formatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });

function computeStats(values: number[]) {
  const last = values[values.length - 1];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((acc, v) => acc + v, 0) / values.length;
  return { last, min, max, avg };
}

function buildSparklinePath(values: number[], width: number, height: number) {
  if (!values.length) {
    return '';
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');
}

function buildForecastSegmentPath(
  history: number[],
  forecastValues: number[],
  width: number,
  height: number
) {
  if (!forecastValues.length || history.length < 1) {
    return '';
  }

  const combined = [...history, ...forecastValues];
  const min = Math.min(...combined);
  const max = Math.max(...combined);
  const range = max - min || 1;

  const totalPoints = combined.length - 1;
  const startIndex = history.length - 1;

  return [history[history.length - 1], ...forecastValues]
    .map((value, step) => {
      const globalIndex = startIndex + step;
      const x = (globalIndex / Math.max(totalPoints, 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${step === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');
}

function forecast(values: number[], mode: ForecastMode, points: number, alpha: number) {
  if (!values.length || points <= 0) {
    return [];
  }

  const cloned = [...values];
  const result: number[] = [];

  if (mode === 'movingAverage') {
    const windowSize = Math.min(5, cloned.length);
    for (let i = 0; i < points; i++) {
      const slice = cloned.slice(-windowSize);
      const mean = slice.reduce((a, b) => a + b, 0) / slice.length;
      result.push(mean);
      cloned.push(mean);
    }
    return result;
  }

  if (mode === 'linearTrend') {
    // simple linear regression y = a + bx over index
    const n = cloned.length;
    const sumX = (n * (n - 1)) / 2;
    const sumX2 = ((n - 1) * n * (2 * n - 1)) / 6;
    const sumY = cloned.reduce((a, b) => a + b, 0);
    const sumXY = cloned.reduce((acc, y, i) => acc + i * y, 0);
    const denominator = n * sumX2 - sumX * sumX || 1;
    const slope = (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;
    for (let i = 0; i < points; i++) {
      const x = n + i;
      result.push(intercept + slope * x);
    }
    return result;
  }

  // expSmooth
  let last = cloned[0];
  for (const v of cloned) {
    last = alpha * v + (1 - alpha) * last;
  }
  for (let i = 0; i < points; i++) {
    last = alpha * last + (1 - alpha) * last;
    result.push(last);
  }
  return result;
}

function buildForecastBandPolygon(
  source: number[],
  forecastValues: number[],
  sigma: number,
  width: number,
  height: number
) {
  if (!forecastValues.length || !source.length) {
    return '';
  }

  const combined = [...source, ...forecastValues];
  const min = Math.min(...combined);
  const max = Math.max(...combined);
  const range = max - min || 1;

  const startIndex = source.length - 1;
  const endIndex = source.length + forecastValues.length - 1;
  const totalPoints = combined.length - 1;

  const mean = combined.reduce((a, b) => a + b, 0) / combined.length;
  const std =
    Math.sqrt(combined.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / combined.length) || 1;

  const upper = forecastValues.map((v) => v + sigma * std);
  const lower = forecastValues.map((v) => v - sigma * std);

  const upperPath = upper
    .map((v, i) => {
      const idx = startIndex + i;
      const x = (idx / Math.max(totalPoints, 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');

  const lowerPath = lower
    .map((v, i) => {
      const idx = endIndex - i;
      const x = (idx / Math.max(totalPoints, 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${i === 0 ? 'L' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');

  return `${upperPath} ${lowerPath} Z`;
}

function zScoreAnomalies(values: number[], zThreshold: number) {
  if (values.length < 2) {
    return [];
  }
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (values.length - 1);
  const std = Math.sqrt(variance) || 1;
  return values
    .map((v, i) => ({ v, i, z: (v - mean) / std }))
    .filter(({ z }) => Math.abs(z) >= zThreshold);
}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height, fieldConfig, id }) => {
  const theme = useTheme2();
  const styles = useStyles2(() => getStyles(options.compact));
  const [activeStat, setActiveStat] = useState<StatChoice>(options.stat);
  const [activeModel, setActiveModel] = useState<ForecastMode>(options.forecastMode);

  useEffect(() => {
    setActiveStat(options.stat);
  }, [options.stat]);

  useEffect(() => {
    setActiveModel(options.forecastMode);
  }, [options.forecastMode]);

  const { numericValues, firstSeriesValues } = useMemo(() => {
    const values: number[] = [];
    const firstFieldValues: number[] = [];

    for (const frame of data.series) {
      for (const field of frame.fields) {
        if (field.type === FieldType.number) {
          if (firstFieldValues.length === 0) {
            for (const raw of field.values.toArray()) {
              if (typeof raw === 'number' && Number.isFinite(raw)) {
                firstFieldValues.push(raw);
              }
            }
          }

          for (const raw of field.values.toArray()) {
            if (typeof raw === 'number' && Number.isFinite(raw)) {
              values.push(raw);
            }
          }
        }
      }
    }

    return { numericValues: values, firstSeriesValues: firstFieldValues };
  }, [data.series]);

  if (numericValues.length === 0) {
    return (
      <PanelDataErrorView
        fieldConfig={fieldConfig}
        panelId={id}
        data={data}
        needsNumberField
      />
    );
  }

  const stats = computeStats(numericValues);
  const statOrder: StatChoice[] = ['last', 'avg', 'min', 'max'];
  const cycleStat = () => {
    const idx = statOrder.indexOf(activeStat);
    setActiveStat(statOrder[(idx + 1) % statOrder.length]);
  };
  const activeValue = stats[activeStat];
  const accent = options.accentColor || theme.colors.primary.text;
  const seriesCountSize = {
    sm: '12px',
    md: '14px',
    lg: '16px',
  }[options.seriesCountSize];

  const sparklineWidth = Math.max(width - 48, 120);
  const sparklineSource = firstSeriesValues.length ? firstSeriesValues : numericValues;
  const sparklinePath = options.showSparkline ? buildSparklinePath(sparklineSource, sparklineWidth, 60) : '';
  const horizon = Math.max(1, options.forecastPoints);
  const forecastValues = forecast(sparklineSource, activeModel, horizon, options.expAlpha || 0.5);
  const combinedForPath = [...sparklineSource, ...forecastValues];
  const combinedPath = options.showSparkline ? buildSparklinePath(combinedForPath, sparklineWidth, 60) : '';
  const forecastSegmentPath =
    options.showSparkline && forecastValues.length
      ? buildForecastSegmentPath(sparklineSource, forecastValues, sparklineWidth, 60)
      : '';
  const lastForecast = forecastValues[forecastValues.length - 1];
  const forecastDelta = lastForecast !== undefined ? lastForecast - sparklineSource[sparklineSource.length - 1] : 0;
  const anomalies = options.showAnomalies ? zScoreAnomalies(sparklineSource, options.anomalyZ || 2) : [];
  const bandPath =
    options.showSparkline && options.showForecastBand
      ? buildForecastBandPolygon(sparklineSource, forecastValues, options.forecastSigma || 1, sparklineWidth, 60)
      : '';

  return (
    <div
      className={cx(
        styles.wrapper,
        css`
          color: ${theme.colors.text.primary};
          background: linear-gradient(135deg, rgba(92, 111, 239, 0.08), rgba(92, 111, 239, 0.02));
        `
      )}
      style={{ minHeight: height }}
    >
      <div className={styles.header}>
        <div className={styles.badge} style={{ color: accent }}>
          Developed by BUSRA OZBEK
        </div>
        <div className={styles.meta}>
          <span>{options.text}</span>
          {options.showSeriesCount && (
            <span className={styles.seriesCount} data-testid="simple-panel-series-counter" style={{ fontSize: seriesCountSize }}>
              Series: {data.series.length}
            </span>
          )}
        </div>
      </div>

      <div className={styles.modelSwitcher}>
        {(['linearTrend', 'movingAverage', 'expSmooth'] as ForecastMode[]).map((mode) => (
          <button
            key={mode}
            className={cx(styles.modelButton, mode === activeModel && styles.modelButtonActive)}
            onClick={() => setActiveModel(mode)}
          >
            {mode === 'linearTrend' && 'AI: Linear trend'}
            {mode === 'movingAverage' && 'AI: Moving avg'}
            {mode === 'expSmooth' && 'AI: Exp smoothing'}
          </button>
        ))}
        <span className={styles.forecastBadge}>
          {horizon}pt forecast · Δ {formatter.format(forecastDelta)}
        </span>
        {options.showAnomalies && (
          <span className={styles.anomalyBadge}>
            Anomalies: {anomalies.length} (|z| ≥ {options.anomalyZ})
          </span>
        )}
      </div>

      <div className={styles.grid}>
        <div className={styles.card} onClick={cycleStat}>
          <div className={styles.label}>Primary stat ({activeStat})</div>
          <div className={styles.stat} style={{ color: accent }}>
            {formatter.format(activeValue)}
          </div>
          <div className={styles.hint}>Click to cycle stats (last/avg/min/max)</div>
        </div>

        <div className={styles.card} onClick={() => setActiveStat('last')}>
          <div className={styles.label}>Range overview</div>
          <div className={styles.hint}>
            Min {formatter.format(stats.min)} → Max {formatter.format(stats.max)} | Δ{' '}
            {formatter.format(stats.max - stats.min)}
          </div>
          {options.showSparkline && (
            <div className={styles.sparklineBox}>
              <svg className={styles.sparkline} viewBox={`0 0 ${sparklineWidth} 60`} preserveAspectRatio="none">
                {bandPath && (
                  <path d={bandPath} fill={accent} fillOpacity="0.12" stroke="none" />
                )}
                <path d={sparklinePath} fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" />
                <path
                  d={combinedPath}
                  fill="none"
                  stroke={theme.colors.text.secondary}
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                  strokeLinecap="round"
                />
                {forecastSegmentPath && (
                  <path
                    d={forecastSegmentPath}
                    fill="none"
                    stroke={theme.colors.warning.main}
                    strokeWidth="2.2"
                    strokeDasharray="6 3"
                    strokeLinecap="round"
                  />
                )}
                {anomalies.map(({ i, v }) => {
                  const x = (i / Math.max(sparklineSource.length - 1, 1)) * sparklineWidth;
                  const min = Math.min(...sparklineSource);
                  const max = Math.max(...sparklineSource);
                  const range = max - min || 1;
                  const y = 60 - ((v - min) / range) * 60;
                  return <circle key={i} cx={x} cy={y} r="3.5" className={styles.anomalyDot} />;
                })}
              </svg>
              <div className={styles.hint}>
                Sparkline + AI forecast ({activeModel}) last→future {horizon}pt
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
