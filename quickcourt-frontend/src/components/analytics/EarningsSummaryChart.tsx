import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Box, FormControl, InputLabel, Select, MenuItem, Paper, Typography } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { formatChartCurrency, formatCurrencyDetailed } from '../../utils/currency';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface EarningsData {
  _id: {
    year: number;
    month: number;
    day?: number;
    week?: number;
  };
  totalEarnings: number;
  bookingCount: number;
  avgBookingValue: number;
}

interface VenueBreakdown {
  _id: string;
  venueName: string;
  totalEarnings: number;
  bookingCount: number;
  avgBookingValue: number;
}

interface EarningsSummaryChartProps {
  earningsData: EarningsData[];
  venueBreakdown: VenueBreakdown[];
  period: string;
  onPeriodChange: (period: string) => void;
  chartType: 'bar' | 'doughnut';
  onChartTypeChange: (type: 'bar' | 'doughnut') => void;
  isLoading?: boolean;
}

const EarningsSummaryChart: React.FC<EarningsSummaryChartProps> = ({
  earningsData,
  venueBreakdown,
  period,
  onPeriodChange,
  chartType,
  onChartTypeChange,
  isLoading = false
}) => {
  const formatLabel = (item: EarningsData['_id']) => {
    if (item.day) {
      return `${item.year}-${String(item.month).padStart(2, '0')}-${String(item.day).padStart(2, '0')}`;
    } else if (item.week) {
      return `${item.year}-W${item.week}`;
    } else {
      return `${item.year}-${String(item.month).padStart(2, '0')}`;
    }
  };

  // Generate colors for venues
  const generateColors = (count: number) => {
    const colors = [
      'rgba(255, 99, 132, 0.8)',
      'rgba(54, 162, 235, 0.8)',
      'rgba(255, 205, 86, 0.8)',
      'rgba(75, 192, 192, 0.8)',
      'rgba(153, 102, 255, 0.8)',
      'rgba(255, 159, 64, 0.8)',
      'rgba(199, 199, 199, 0.8)',
      'rgba(83, 102, 255, 0.8)',
    ];
    
    return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
  };

  // Bar chart data (earnings over time)
  const barChartData = {
    labels: earningsData.map(item => formatLabel(item._id)),
    datasets: [
      {
        label: 'Total Earnings (₹)',
        data: earningsData.map(item => item.totalEarnings),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      }
    ],
  };

  // Doughnut chart data (venue breakdown)
  const doughnutChartData = {
    labels: venueBreakdown.map(venue => venue.venueName),
    datasets: [
      {
        label: 'Earnings by Venue',
        data: venueBreakdown.map(venue => venue.totalEarnings),
        backgroundColor: generateColors(venueBreakdown.length),
        borderWidth: 2,
      }
    ],
  };

  const barOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Earnings Over Time - ${period.charAt(0).toUpperCase() + period.slice(1)}`,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const dataIndex = context.dataIndex;
            const earnings = earningsData[dataIndex]?.totalEarnings || 0;
            const bookings = earningsData[dataIndex]?.bookingCount || 0;
            const avgValue = earningsData[dataIndex]?.avgBookingValue || 0;
            return [
              `Earnings: ${formatChartCurrency(earnings)}`,
              `Bookings: ${bookings}`,
              `Avg Value: ${formatChartCurrency(avgValue)}`
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
          text: 'Earnings (₹)'
        },
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatChartCurrency(Number(value));
          }
        }
      }
    }
  };

  const doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: 'Earnings by Venue',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const venue = venueBreakdown[context.dataIndex];
            const total = venueBreakdown.reduce((sum, v) => sum + v.totalEarnings, 0);
            const percentage = ((venue.totalEarnings / total) * 100).toFixed(1);
            return [
              `${venue.venueName}: ${formatChartCurrency(venue.totalEarnings)}`,
              `${percentage}% of total earnings`,
              `${venue.bookingCount} bookings`
            ];
          }
        }
      }
    }
  };

  const handlePeriodChange = (event: SelectChangeEvent) => {
    onPeriodChange(event.target.value);
  };

  const handleChartTypeChange = (event: SelectChangeEvent) => {
    onChartTypeChange(event.target.value as 'bar' | 'doughnut');
  };

  if (isLoading) {
    return (
      <Paper sx={{ p: 3, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>Loading earnings data...</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Earnings Summary</Typography>
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
              <MenuItem value="bar">Bar Chart</MenuItem>
              <MenuItem value="doughnut">Doughnut Chart</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Box sx={{ height: 400 }}>
        {chartType === 'bar' ? (
          earningsData.length === 0 ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Typography color="text.secondary">No earnings data available</Typography>
            </Box>
          ) : (
            <Bar data={barChartData} options={barOptions} />
          )
        ) : (
          venueBreakdown.length === 0 ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Typography color="text.secondary">No venue earnings data available</Typography>
            </Box>
          ) : (
            <Box sx={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Doughnut data={doughnutChartData} options={doughnutOptions} />
            </Box>
          )
        )}
      </Box>

      {/* Summary Stats */}
      {venueBreakdown.length > 0 && (
        <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle2" gutterBottom>Top Performing Venues:</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {venueBreakdown.slice(0, 3).map((venue, index) => (
              <Box key={venue._id} sx={{ textAlign: 'center', p: 2, minWidth: 150, flex: 1 }}>
                <Typography variant="body2" fontWeight="bold">
                  #{index + 1} {venue.venueName}
                </Typography>
                <Typography variant="body2" color="primary">
                  {formatChartCurrency(venue.totalEarnings)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {venue.bookingCount} bookings
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default EarningsSummaryChart;
