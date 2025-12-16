import { PanelPlugin } from '@grafana/data';
import { SimpleOptions } from './types';
import { SimplePanel } from './components/SimplePanel';

export const plugin = new PanelPlugin<SimpleOptions>(SimplePanel).setPanelOptions((builder) => {
  return builder
    .addTextInput({
      path: 'text',
      name: 'Panel note',
      description: 'Short note that appears under the main stats',
      defaultValue: 'Data-powered insight panel',
    })
    .addBooleanSwitch({
      path: 'showSeriesCount',
      name: 'Show series counter',
      defaultValue: false,
    })
    .addRadio({
      path: 'seriesCountSize',
      defaultValue: 'sm',
      name: 'Series counter size',
      settings: {
        options: [
          {
            value: 'sm',
            label: 'Small',
          },
          {
            value: 'md',
            label: 'Medium',
          },
          {
            value: 'lg',
            label: 'Large',
          },
        ],
      },
      showIf: (config) => config.showSeriesCount,
    })
    .addColorPicker({
      path: 'accentColor',
      name: 'Accent color',
      description: 'Used for headline and stat highlight',
      defaultValue: '#5c6fef',
    })
    .addSelect({
      path: 'stat',
      name: 'Primary stat',
      defaultValue: 'last',
      settings: {
        options: [
          { value: 'last', label: 'Last' },
          { value: 'avg', label: 'Average' },
          { value: 'min', label: 'Minimum' },
          { value: 'max', label: 'Maximum' },
        ],
      },
    })
    .addBooleanSwitch({
      path: 'showSparkline',
      name: 'Show sparkline',
      description: 'Small trendline from the first numeric field',
      defaultValue: true,
    })
    .addBooleanSwitch({
      path: 'compact',
      name: 'Compact layout',
      description: 'Tighter spacing for dense dashboards',
      defaultValue: false,
    })
    .addSliderInput({
      path: 'forecastPoints',
      name: 'Forecast horizon',
      description: 'How many future points to project',
      defaultValue: 5,
      settings: {
        min: 1,
        max: 20,
        step: 1,
      },
    })
    .addSelect({
      path: 'forecastMode',
      name: 'Default AI model',
      defaultValue: 'linearTrend',
      settings: {
        options: [
          { value: 'linearTrend', label: 'Linear trend' },
          { value: 'movingAverage', label: 'Moving average' },
          { value: 'expSmooth', label: 'Exponential smoothing' },
        ],
      },
    })
    .addSliderInput({
      path: 'expAlpha',
      name: 'Exp smoothing alpha',
      description: 'Only used for exponential smoothing',
      defaultValue: 0.5,
      settings: {
        min: 0.05,
        max: 0.95,
        step: 0.05,
      },
    })
    .addBooleanSwitch({
      path: 'showAnomalies',
      name: 'Show anomaly highlights',
      description: 'Mark outliers above Z threshold on sparkline',
      defaultValue: true,
    })
    .addSliderInput({
      path: 'anomalyZ',
      name: 'Anomaly Z-threshold',
      description: 'Higher = fewer anomalies',
      defaultValue: 2,
      settings: {
        min: 1,
        max: 4,
        step: 0.25,
      },
    })
    .addBooleanSwitch({
      path: 'showForecastBand',
      name: 'Show forecast confidence band',
      description: 'Visualize uncertainty over the forecast horizon',
      defaultValue: true,
    })
    .addSliderInput({
      path: 'forecastSigma',
      name: 'Band sigma multiplier',
      description: 'Controls band width; higher = wider uncertainty',
      defaultValue: 1,
      settings: {
        min: 0.5,
        max: 3,
        step: 0.25,
      },
    });
});
