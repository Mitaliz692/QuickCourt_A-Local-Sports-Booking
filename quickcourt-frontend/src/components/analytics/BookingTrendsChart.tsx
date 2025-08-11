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
  ChartOptions,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { Box, FormControl, InputLabel, Select, MenuItem, Paper, Typography } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { formatChartCurrency, formatCurrencyDetailed } from '../../utils/currency';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface TrendData {
  _id: {
    year: number;
    month: number;
    day?: number;
    week?: number;
  };
  totalBookings: number;
  totalRevenue: number;
  confirmedBookings: number;
  cancelledBookings: number;
  avgBookingValue: number;
}

interface BookingTrendsChartProps {
  data: TrendData[];
  period: string;
  onPeriodChange: (period: string) => void;
  chartType: 'line' | 'bar';
  onChartTypeChange: (type: 'line' | 'bar') => void;
  isLoading?: boolean;
}

const BookingTrendsChart: React.FC<BookingTrendsChartProps> = ({
  data,
  period,
  onPeriodChange,
  chartType,
  onChartTypeChange,
  isLoading = false
}) => {
  const formatLabel = (item: TrendData['_id']) => {
    if (item.day) {
      return `${item.year}-${String(item.month).padStart(2, '0')}-${String(item.day).padStart(2, '0')}`;
    } else if (item.week) {
      return `${item.year}-W${item.week}`;
    } else {
      return `${item.year}-${String(item.month).padStart(2, '0')}`;
    }
  };

  const chartData = {
    labels: data.map(item => formatLabel(item._id)),
    datasets: [
      {
        label: 'Total Bookings',
        data: data.map(item => item.totalBookings),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
      },
      {
        label: 'Confirmed Bookings',
        data: data.map(item => item.confirmedBookings),
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.1,
      },
      {
        label: 'Cancelled Bookings',
        data: data.map(item => item.cancelledBookings),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.1,
      }
    ],
  };

  const options: ChartOptions<'line' | 'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Booking Trends - ${period.charAt(0).toUpperCase() + period.slice(1)}`,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          afterLabel: (context) => {
            const dataIndex = context.dataIndex;
            const revenue = data[dataIndex]?.totalRevenue || 0;
            const avgValue = data[dataIndex]?.avgBookingValue || 0;
            return [
              `Revenue: ${formatChartCurrency(revenue)}`,
              `Avg Booking: ${formatChartCurrency(avgValue)}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: period === 'daily' ? 'Date' : period === 'weekly' ? 'Week' : 'Month'
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

  const handlePeriodChange = (event: SelectChangeEvent) => {
    onPeriodChange(event.target.value);
  };

  const handleChartTypeChange = (event: SelectChangeEvent) => {
    onChartTypeChange(event.target.value as 'line' | 'bar');
  };

  if (isLoading) {
    return (
      <Paper sx={{ p: 3, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>Loading chart data...</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Booking Trends</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Period</InputLabel>
            <Select
              value={period}
              label="Period"
              onChange={handlePeriodChange}
            >
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Chart Type</InputLabel>
            <Select
              value={chartType}
              label="Chart Type"
              onChange={handleChartTypeChange}
            >
              <MenuItem value="line">Line Chart</MenuItem>
              <MenuItem value="bar">Bar Chart</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
      
      <Box sx={{ height: 400 }}>
        {data.length === 0 ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Typography color="text.secondary">No booking data available</Typography>
          </Box>
        ) : (
          chartType === 'line' ? (
            <Line data={chartData} options={options} />
          ) : (
            <Bar data={chartData} options={options} />
          )
        )}
      </Box>
    </Paper>
  );
};

export default BookingTrendsChart;
