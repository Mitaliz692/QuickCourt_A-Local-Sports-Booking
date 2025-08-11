import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Tab,
  Tabs,
  Container,
} from '@mui/material';
import { TrendingUp, AttachMoney, Schedule, Analytics } from '@mui/icons-material';
import BookingTrendsChart from './BookingTrendsChart';
import EarningsSummaryChart from './EarningsSummaryChart';
import PeakHoursChart from './PeakHoursChart';
import { formatCurrency, formatIndianNumber } from '../../utils/currency';
import axios from 'axios';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AnalyticsDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Trends data
  const [trendsData, setTrendsData] = useState([]);
  const [trendsPeriod, setTrendsPeriod] = useState('daily');
  const [trendsChartType, setTrendsChartType] = useState<'line' | 'bar'>('line');
  const [trendsLoading, setTrendsLoading] = useState(false);

  // Earnings data
  const [earningsData, setEarningsData] = useState([]);
  const [venueBreakdown, setVenueBreakdown] = useState([]);
  const [earningsPeriod, setEarningsPeriod] = useState('monthly');
  const [earningsChartType, setEarningsChartType] = useState<'bar' | 'doughnut'>('bar');
  const [earningsLoading, setEarningsLoading] = useState(false);

  // Peak hours data
  const [heatmapData, setHeatmapData] = useState([]);
  const [peakTimes, setPeakTimes] = useState([]);
  const [insights, setInsights] = useState({
    totalBookings: 0,
    weekendPercentage: 0,
    morningPercentage: 0,
    afternoonPercentage: 0,
    eveningPercentage: 0
  });
  const [peakHoursRange, setPeakHoursRange] = useState(30);
  const [peakHoursChartType, setPeakHoursChartType] = useState<'heatmap' | 'area'>('area');
  const [peakHoursLoading, setPeakHoursLoading] = useState(false);

  // Summary stats
  const [summaryStats, setSummaryStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    avgBookingValue: 0,
    confirmedRate: 0
  });

  const fetchTrendsData = async (period: string = trendsPeriod) => {
    console.log('Fetching trends data for period:', period);
    setTrendsLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Token available:', !!token);
      
      const response = await axios.get(`http://localhost:5000/api/bookings/analytics/trends?period=${period}&range=30`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Trends response:', response.data);

      if (response.data.success) {
        setTrendsData(response.data.data.trends);
        setSummaryStats(prev => ({
          ...prev,
          ...response.data.data.summary
        }));
      }
    } catch (error) {
      console.error('Error fetching trends data:', error);
      setError('Failed to load booking trends data');
    } finally {
      setTrendsLoading(false);
    }
  };

  const fetchEarningsData = async (period: string = earningsPeriod) => {
    setEarningsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/bookings/analytics/earnings?period=${period}&range=12`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setEarningsData(response.data.data.earnings);
        setVenueBreakdown(response.data.data.venueBreakdown);
        setSummaryStats(prev => ({
          ...prev,
          totalRevenue: response.data.data.summary.totalEarnings || 0,
          avgBookingValue: response.data.data.summary.avgBookingValue || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching earnings data:', error);
      setError('Failed to load earnings data');
    } finally {
      setEarningsLoading(false);
    }
  };

  const fetchPeakHoursData = async (range: number = peakHoursRange) => {
    setPeakHoursLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/bookings/analytics/peak-hours?range=${range}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setHeatmapData(response.data.data.heatmapData);
        setPeakTimes(response.data.data.peakTimes);
        setInsights(response.data.data.insights);
      }
    } catch (error) {
      console.error('Error fetching peak hours data:', error);
      setError('Failed to load peak hours data');
    } finally {
      setPeakHoursLoading(false);
    }
  };

  useEffect(() => {
    console.log('AnalyticsDashboard component mounted');
    const loadInitialData = async () => {
      setLoading(true);
      setError(null);
      
      console.log('Loading initial analytics data...');
      await Promise.all([
        fetchTrendsData(),
        fetchEarningsData(),
        fetchPeakHoursData()
      ]);
      
      setLoading(false);
      console.log('Initial analytics data loaded');
    };

    loadInitialData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleTrendsPeriodChange = (period: string) => {
    setTrendsPeriod(period);
    fetchTrendsData(period);
  };

  const handleEarningsPeriodChange = (period: string) => {
    setEarningsPeriod(period);
    fetchEarningsData(period);
  };

  const handlePeakHoursRangeChange = (range: number) => {
    setPeakHoursRange(range);
    fetchPeakHoursData(range);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Analytics Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track your facility's performance with detailed booking analytics
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 4 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="textSecondary" gutterBottom variant="h6">
                  Total Bookings
                </Typography>
                <Typography variant="h4">
                  {summaryStats.totalBookings || 0}
                </Typography>
              </Box>
              <Analytics color="primary" sx={{ fontSize: 40 }} />
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="textSecondary" gutterBottom variant="h6">
                  Total Revenue
                </Typography>
                <Typography variant="h4">
                  {formatIndianNumber(summaryStats.totalRevenue || 0)}
                </Typography>
              </Box>
              <AttachMoney color="primary" sx={{ fontSize: 40 }} />
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="textSecondary" gutterBottom variant="h6">
                  Avg Booking Value
                </Typography>
                <Typography variant="h4">
                  {formatCurrency(summaryStats.avgBookingValue || 0)}
                </Typography>
              </Box>
              <TrendingUp color="primary" sx={{ fontSize: 40 }} />
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="textSecondary" gutterBottom variant="h6">
                  Confirmation Rate
                </Typography>
                <Typography variant="h4">
                  {((summaryStats.confirmedRate || 0) * 100).toFixed(1)}%
                </Typography>
              </Box>
              <Schedule color="primary" sx={{ fontSize: 40 }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Charts Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="analytics charts tabs">
          <Tab label="Booking Trends" />
          <Tab label="Earnings Summary" />
          <Tab label="Peak Hours" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <BookingTrendsChart
          data={trendsData}
          period={trendsPeriod}
          onPeriodChange={handleTrendsPeriodChange}
          chartType={trendsChartType}
          onChartTypeChange={setTrendsChartType}
          isLoading={trendsLoading}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <EarningsSummaryChart
          earningsData={earningsData}
          venueBreakdown={venueBreakdown}
          period={earningsPeriod}
          onPeriodChange={handleEarningsPeriodChange}
          chartType={earningsChartType}
          onChartTypeChange={setEarningsChartType}
          isLoading={earningsLoading}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <PeakHoursChart
          heatmapData={heatmapData}
          peakTimes={peakTimes}
          insights={insights}
          range={peakHoursRange}
          onRangeChange={handlePeakHoursRangeChange}
          chartType={peakHoursChartType}
          onChartTypeChange={setPeakHoursChartType}
          isLoading={peakHoursLoading}
        />
      </TabPanel>
    </Container>
  );
};

export default AnalyticsDashboard;
