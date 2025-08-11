import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { Box, FormControl, InputLabel, Select, MenuItem, Paper, Typography, Chip } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface HeatmapData {
  _id: {
    dayOfWeek: number;
    hour: number;
  };
  bookingCount: number;
  totalRevenue: number;
  avgRevenue: number;
}

interface PeakTime {
  _id: number;
  bookingCount: number;
  totalRevenue: number;
}

interface Insights {
  totalBookings: number;
  weekendPercentage: number;
  morningPercentage: number;
  afternoonPercentage: number;
  eveningPercentage: number;
}

interface PeakHoursChartProps {
  heatmapData: HeatmapData[];
  peakTimes: PeakTime[];
  insights: Insights;
  range: number;
  onRangeChange: (range: number) => void;
  chartType: 'heatmap' | 'area';
  onChartTypeChange: (type: 'heatmap' | 'area') => void;
  isLoading?: boolean;
}

const PeakHoursChart: React.FC<PeakHoursChartProps> = ({
  heatmapData,
  peakTimes,
  insights,
  range,
  onRangeChange,
  chartType,
  onChartTypeChange,
  isLoading = false
}) => {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Create heatmap matrix
  const createHeatmapMatrix = () => {
    const matrix: number[][] = Array(7).fill(0).map(() => Array(24).fill(0));
    
    heatmapData.forEach(item => {
      const dayIndex = item._id.dayOfWeek === 1 ? 0 : item._id.dayOfWeek - 1; // Sunday = 1 in MongoDB
      const hour = item._id.hour;
      matrix[dayIndex][hour] = item.bookingCount;
    });
    
    return matrix;
  };

  // Convert heatmap data to area chart format (hourly totals)
  const hourlyTotals = Array(24).fill(0);
  heatmapData.forEach(item => {
    hourlyTotals[item._id.hour] += item.bookingCount;
  });

  const areaChartData = {
    labels: hours.map(h => `${h}:00`),
    datasets: [
      {
        label: 'Bookings per Hour',
        data: hourlyTotals,
        fill: true,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.4,
      }
    ],
  };

  // Heatmap visualization using bar chart (simplified approach)
  const heatmapMatrix = createHeatmapMatrix();
  const maxBookings = Math.max(...heatmapData.map(item => item.bookingCount));
  
  // Create datasets for each day of the week
  const heatmapChartData = {
    labels: hours.map(h => `${h}:00`),
    datasets: dayNames.map((day, dayIndex) => ({
      label: day,
      data: heatmapMatrix[dayIndex],
      backgroundColor: `hsla(${(dayIndex * 50) % 360}, 70%, 60%, 0.7)`,
      borderColor: `hsla(${(dayIndex * 50) % 360}, 70%, 50%, 1)`,
      borderWidth: 1,
    }))
  };

  const areaOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Peak Booking Hours - Area Chart',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (context) => {
            const hour = context.dataIndex;
            const bookings = hourlyTotals[hour];
            return `${context.dataset.label}: ${bookings} bookings at ${hour}:00`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Hour of Day'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Number of Bookings'
        },
        beginAtZero: true
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  const heatmapOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Booking Heatmap - By Day and Hour',
      },
      tooltip: {
        callbacks: {
          title: (contexts) => {
            const hour = contexts[0].dataIndex;
            return `${hour}:00 - ${hour + 1}:00`;
          },
          label: (context) => {
            const day = context.dataset.label;
            const bookings = context.parsed.y;
            return `${day}: ${bookings} bookings`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Hour of Day'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Number of Bookings'
        },
        beginAtZero: true,
        stacked: false
      }
    }
  };

  const formatHour = (hour: number) => {
    return hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`;
  };

  const handleRangeChange = (event: SelectChangeEvent) => {
    onRangeChange(parseInt(event.target.value));
  };

  const handleChartTypeChange = (event: SelectChangeEvent) => {
    onChartTypeChange(event.target.value as 'heatmap' | 'area');
  };

  if (isLoading) {
    return (
      <Paper sx={{ p: 3, height: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>Loading peak hours data...</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Peak Booking Hours</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Range (Days)</InputLabel>
            <Select
              value={range.toString()}
              label="Range (Days)"
              onChange={handleRangeChange}
            >
              <MenuItem value="7">7 Days</MenuItem>
              <MenuItem value="14">14 Days</MenuItem>
              <MenuItem value="30">30 Days</MenuItem>
              <MenuItem value="60">60 Days</MenuItem>
              <MenuItem value="90">90 Days</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Chart Type</InputLabel>
            <Select
              value={chartType}
              label="Chart Type"
              onChange={handleChartTypeChange}
            >
              <MenuItem value="area">Area Chart</MenuItem>
              <MenuItem value="heatmap">Heatmap</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Box sx={{ height: 400, mb: 3 }}>
        {heatmapData.length === 0 ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Typography color="text.secondary">No booking hours data available</Typography>
          </Box>
        ) : (
          chartType === 'area' ? (
            <Line data={areaChartData} options={areaOptions} />
          ) : (
            <Bar data={heatmapChartData} options={heatmapOptions} />
          )
        )}
      </Box>

      {/* Peak Times Summary */}
      {peakTimes.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>Top 5 Peak Hours:</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {peakTimes.map((peak, index) => (
              <Chip
                key={peak._id}
                label={`#${index + 1} ${formatHour(peak._id)} (${peak.bookingCount} bookings)`}
                color={index === 0 ? 'primary' : 'default'}
                variant={index < 3 ? 'filled' : 'outlined'}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Insights */}
      {insights.totalBookings > 0 && (
        <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle2" gutterBottom>Booking Insights:</Typography>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary">
                {insights.weekendPercentage.toFixed(1)}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Weekend Bookings
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary">
                {insights.morningPercentage.toFixed(1)}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Morning (6AM-12PM)
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary">
                {insights.afternoonPercentage.toFixed(1)}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Afternoon (12PM-6PM)
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary">
                {insights.eveningPercentage.toFixed(1)}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Evening (6PM-12AM)
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default PeakHoursChart;
