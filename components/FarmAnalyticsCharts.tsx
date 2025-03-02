import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  useWindowDimensions,
  LayoutChangeEvent,
} from "react-native";
import { Surface, useTheme, Text } from "react-native-paper";
import { LineChart, BarChart, PieChart } from "react-native-chart-kit";
import ChartWrapper from "./ChartWrapper";

// Use dynamic sizing based on container width rather than fixed screen percentage
const getChartDimensions = (containerWidth: number) => {
  // Use the full container width for charts with minimal padding
  const CHART_WIDTH = Math.min(containerWidth - 8, 600); // Increased max width and reduced padding
  const CHART_HEIGHT = 220; // Keep the same height

  // Calculate half width for side-by-side charts (accounting for gap)
  const HALF_CHART_WIDTH = Math.floor((CHART_WIDTH - 6) / 2);

  return { CHART_WIDTH, CHART_HEIGHT, HALF_CHART_WIDTH };
};

export interface FarmAnalyticsData {
  tillageNames: string[];
  profits: number[];
  revenue: number[];
  projectedProfits: number[];
  breakEvenPoint: number;
}

interface TooltipData {
  x: number;
  y: number;
  index: number;
  value: number;
}

export const FarmAnalyticsCharts = ({ data }: { data: FarmAnalyticsData }) => {
  const theme = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = useState(windowWidth - 64); // Default with padding
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);

  // Get responsive chart dimensions based on measured container width
  const { CHART_WIDTH, CHART_HEIGHT, HALF_CHART_WIDTH } =
    getChartDimensions(containerWidth);

  // Measure the actual container width when layout changes
  const onContainerLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    if (width > 0 && width !== containerWidth) {
      setContainerWidth(width);
    }
  };

  // Base colors with good contrast
  const baseColors = [
    "rgba(43, 63, 229, 0.8)", // Blue
    "rgba(250, 192, 19, 0.8)", // Yellow
    "rgba(253, 135, 135, 0.8)", // Pink
    "rgba(75, 192, 192, 0.8)", // Teal
    "rgba(153, 102, 255, 0.8)", // Purple
    "rgba(255, 159, 64, 0.8)", // Orange
    "rgba(231, 233, 237, 0.8)", // Grey
    "rgba(102, 255, 102, 0.8)", // Green
  ];

  // Generate colors for any number of data points
  const generateColors = (count: number): string[] => {
    if (count <= baseColors.length) {
      return baseColors.slice(0, count);
    }

    // If we need more colors, generate them by adjusting hue
    const additionalColors = Array.from(
      { length: count - baseColors.length },
      (_, index) => {
        const hue = (360 / count) * (baseColors.length + index);
        return `hsla(${hue}, 70%, 60%, 0.8)`;
      }
    );

    return [...baseColors, ...additionalColors];
  };

  const chartColors = generateColors(data.tillageNames.length);

  const chartConfig = {
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    color: (opacity = 1) => chartColors[0],
    labelColor: (opacity = 1) => theme.colors.onSurface,
    strokeWidth: 3,
    barPercentage: 0.95, // Increased from 0.9
    spacing: 0.02, // Reduced from 0.05
    barRadius: 4,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    propsForLabels: {
      fontSize: 10, // Reduced font size for better fit in side-by-side layout
    },
    propsForVerticalLabels: {
      fontSize: 10, // Reduced font size
    },
    propsForHorizontalLabels: {
      fontSize: 10, // Reduced font size
    },
    formatYLabel: (value: string) => `$${value}`,
    propsForDots: {
      r: "5",
      strokeWidth: "2",
      stroke: theme.colors.surface,
    },
  };

  const commonProps = {
    width: CHART_WIDTH,
    height: CHART_HEIGHT,
    chartConfig: chartConfig,
    yAxisLabel: "$",
    yAxisSuffix: "",
    paddingLeft: "15",
    withInnerLines: false,
    withOuterLines: true,
    withVerticalLines: false,
    withHorizontalLines: true,
    withVerticalLabels: true,
    withHorizontalLabels: true,
    fromZero: true,
    onDataPointClick: ({ index, value, x, y }: any) => {
      const adjustedX = x - 40;
      const adjustedY = y - 60;
      setTooltipData({ index, value, x: adjustedX, y: adjustedY });
      setTimeout(() => setTooltipData(null), 2000);
    },
  };

  return (
    <View style={styles.container} onLayout={onContainerLayout}>
      <Surface style={[styles.chartCard, styles.keyCard]}>
        <Text style={styles.chartTitle}>Color Key</Text>
        <View style={styles.keyContainer}>
          {data.tillageNames.map((name, index) => (
            <View key={index} style={styles.keyItem}>
              <View
                style={[
                  styles.colorBox,
                  { backgroundColor: chartColors[index] },
                ]}
              />
              <Text style={styles.keyText}>{name}</Text>
            </View>
          ))}
        </View>
      </Surface>

      {/* Bar chart and Pie chart side by side */}
      <View style={styles.chartsRow}>
        <Surface style={[styles.chartCard, styles.halfWidthCard]}>
          <Text style={styles.chartTitle}>Profit by Tillage Method</Text>
          <View style={styles.chartContainer}>
            <ChartWrapper>
              <BarChart
                {...commonProps}
                width={HALF_CHART_WIDTH * 1.75}
                data={{
                  labels: data.tillageNames.map(
                    (name) => name.split(" ").pop() || name
                  ),
                  datasets: [
                    {
                      data: data.profits,
                      colors: chartColors.map((color) => () => color),
                    },
                  ],
                }}
                height={CHART_HEIGHT}
                yAxisLabel="$"
                verticalLabelRotation={45}
                showValuesOnTopOfBars
                withCustomBarColorFromData
                flatColor
                fromZero
                segments={4}
                style={styles.chart}
                withHorizontalLabels={true}
                horizontalLabelRotation={0}
              />
            </ChartWrapper>
            <Text style={styles.xAxisLabel}>Tillage Method</Text>
            <Text style={styles.yAxisLabel}>Profit ($)</Text>
            {tooltipData && (
              <View
                style={[
                  styles.tooltip,
                  {
                    position: "absolute",
                    top: tooltipData.y,
                    left: tooltipData.x,
                  },
                ]}
              >
                <Text style={styles.tooltipText}>
                  {`${data.tillageNames[tooltipData.index]}\n$${
                    data.profits[tooltipData.index]
                  }`}
                </Text>
              </View>
            )}
          </View>
        </Surface>

        <Surface style={[styles.chartCard, styles.halfWidthCard]}>
          <Text style={styles.chartTitle}>Profit Distribution</Text>
          <View style={styles.pieChartContainer}>
            <View style={styles.pieChartWrapper}>
              <ChartWrapper>
                <PieChart
                  {...commonProps}
                  width={HALF_CHART_WIDTH * 1.5}
                  height={CHART_HEIGHT * 1.2}
                  data={data.tillageNames.map((name, index) => ({
                    name: `${name.split(" ").pop() || name}`,
                    population: data.profits[index],
                    color: chartColors[index],
                    legendFontSize: 12,
                  }))}
                  accessor="population"
                  backgroundColor="transparent"
                  absolute
                  hasLegend={false}
                  center={[HALF_CHART_WIDTH * 0.55, CHART_HEIGHT * 0.001]}
                  style={styles.chart}
                />
              </ChartWrapper>
            </View>
          </View>
        </Surface>
      </View>

      <Surface style={styles.chartCard}>
        <Text style={styles.chartTitle}>Revenue vs Profit Over Time</Text>
        <View style={styles.chartContainer}>
          <ChartWrapper>
            <LineChart
              {...commonProps}
              width={CHART_WIDTH * 1.85}
              height={CHART_HEIGHT}
              data={{
                labels: ["1", "2", "3"],
                datasets: [
                  {
                    data: data.revenue,
                    color: (opacity = 1) => "rgba(6, 79, 240, 1)",
                    strokeWidth: 2,
                  },
                  {
                    data: data.profits,
                    color: (opacity = 1) => "rgba(255, 48, 48, 1)",
                    strokeWidth: 2,
                  },
                ],
                legend: ["Revenue", "Profit"],
              }}
              bezier
              style={styles.chart}
            />
          </ChartWrapper>
          <Text style={styles.xAxisLabel}>Time Period</Text>
          <Text style={styles.yAxisLabel}>Amount ($)</Text>
          {tooltipData && (
            <View style={[styles.tooltip, { top: 50 }]}>
              <Text style={styles.tooltipText}>
                {`Revenue: $${data.revenue[tooltipData.index]}\nProfit: $${
                  data.profits[tooltipData.index]
                }`}
              </Text>
            </View>
          )}
        </View>
      </Surface>

      <Surface style={styles.chartCard}>
        <Text style={styles.chartTitle}>
          Projected Profits and Break-even Point
        </Text>
        <View style={styles.chartContainer}>
          <ChartWrapper>
            <LineChart
              {...commonProps}
              width={CHART_WIDTH * 1.85}
              height={CHART_HEIGHT}
              data={{
                labels: ["1", "2", "3", "4", "5", "6"],
                datasets: [
                  {
                    data: data.projectedProfits,
                    color: (opacity = 1) => "rgba(6, 79, 240, 1)",
                    strokeWidth: 2,
                  },
                  {
                    data: Array(6).fill(data.breakEvenPoint),
                    color: (opacity = 1) => "rgba(255, 48, 48, 1)",
                    strokeWidth: 2,
                    withDots: false,
                  },
                ],
                legend: ["Expected Profit", "Break-even"],
              }}
              bezier
              style={styles.chart}
            />
          </ChartWrapper>
          <Text style={styles.xAxisLabel}>Time Period</Text>
          <Text style={styles.yAxisLabel}>Amount ($)</Text>
          {tooltipData && (
            <View style={[styles.tooltip, { top: 50 }]}>
              <Text style={styles.tooltipText}>
                {`Expected: $${
                  data.projectedProfits[tooltipData.index]
                }\nBreak-even: $${data.breakEvenPoint}`}
              </Text>
            </View>
          )}
        </View>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 2, // Further reduced padding
    gap: 6, // Further reduced gap
    width: "100%",
    maxWidth: "100%",
  },
  chartsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 6,
  },
  halfWidthCard: {
    flex: 1,
    minWidth: "48%",
  },
  chartCard: {
    borderRadius: 8,
    padding: 6, // Reduced padding
    elevation: 2,
    marginVertical: 3, // Reduced margin
    width: "100%",
  },
  chart: {
    marginVertical: 2, // Reduced margin
    borderRadius: 8,
    alignSelf: "center",
    width: "100%", // Ensure chart takes full width
  },
  chartContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 25, // Reduced from 35 to give more horizontal space
    width: "100%", // Ensure container takes full width
  },
  tooltip: {
    position: "absolute",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    padding: 8,
    borderRadius: 4,
    zIndex: 1000,
    minWidth: 80,
  },
  tooltipText: {
    color: "white",
    fontSize: 12,
    textAlign: "center",
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  xAxisLabel: {
    textAlign: "center",
    fontSize: 12,
    marginTop: 8,
  },
  yAxisLabel: {
    position: "absolute",
    left: -25, // Reduced from -35
    top: "50%",
    transform: [{ rotate: "-90deg" }],
    fontSize: 12,
  },
  pieChartContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    width: "100%",
    overflow: "visible", // Allow the chart to overflow its container
    height: 264, // Fixed height (220 * 1.2)
  },
  pieChartWrapper: {
    position: "relative",
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  keyCard: {
    marginBottom: 10,
    padding: 15,
  },
  keyContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginTop: 5,
  },
  keyItem: {
    flexDirection: "row",
    alignItems: "center",
    margin: 5,
  },
  colorBox: {
    width: 15,
    height: 15,
    borderRadius: 3,
    marginRight: 5,
  },
  keyText: {
    fontSize: 12,
  },
});
