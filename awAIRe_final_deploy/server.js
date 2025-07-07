import express from 'express';
import cors from "cors";
import path from 'path';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Mock threat data - Updated for Manassas, VA area
const mockThreats = [
  {
    id: '1',
    type: 'Weather',
    title: 'Chlorine Release',
    description: 'Refactor Threat Zones Due to Changing Wind Conditions ',
    severity: 'critical',
    status: 'active',
    lastUpdated: '0 minutes ago',
    estimatedAffected: 2500,
  },

  {
    id: '2',
    type: 'wildfire',
    title: 'Chlorine Release',
    description: 'Ambient Release of Chlorine Gas. Active threat zones shown',
    severity: 'medium',
    status: 'monitoring',
   
    lastUpdated: '9 minutes ago',
    estimatedAffected: 1200,
  }
];


// Mock incident summary data for the ALOHA Source Point
const incidentSummary = {
  incidentId: 'CHLORINE-78701',
  incidentType: 'Chemical Release',
  status: 'ACTIVE',
  priority: 'HIGH',
  location: {
    address: '123 Industrial Blvd, Manassas, VA 20110',
    coordinates: { lat: 38.833333, lng: -77.500000 }
  },
  chemical: {
    name: 'CHLORINE',
    concentration: '20 ppm',
    releaseType: 'Continuous leak',
    estimatedDuration: '2-4 hours'
  },
  threatZones: {
    red: { distance: '1484 yards', level: 'AEGL-3 (60 min)', description: 'Life-threatening exposure' },
    orange: { distance: '1.9 miles', level: 'AEGL-2 (60 min)', description: 'Serious health effects' },
    yellow: { distance: '3.1 miles', level: 'AEGL-1 (60 min)', description: 'Mild irritation' }
  },
  weather: {
    windSpeed: '6 mph',
    windDirection: 'East',
    temperature: '72°F',
    humidity: '65%'
  },
  response: {
    unitsDispatched: ['HAZ-1', 'ENG-12', 'TRUCK-5', 'CHIEF-1'],
    evacuationStatus: 'Shelter in place - Red zone',
    estimatedAffected: 2500,
    hospitalNotifications: 'Sent to Prince William Hospital, Novant Health'
  },
  timeline: [
    { time: '15:00', event: 'Initial report received' },
    { time: '15:03', event: 'First responders dispatched' },
    { time: '15:08', event: 'Hazmat team on scene' },
    { time: '15:12', event: 'Threat zones established' },
    { time: '15:15', event: 'Evacuation orders issued' }
  ]
};

// API Routes
app.get('/api/threats', (req, res) => {
  res.json(mockThreats);
});

// New endpoint for incident summary
app.get('/api/incident-summary/:id', (req, res) => {
  const incidentId = req.params.id;
  
  // For now, return the same summary regardless of ID
  // In a real application, you'd fetch specific incident data
  res.json({
    success: true,
    data: incidentSummary
  });
});

// Configuration page route
app.get('/configure', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'configure.html'));
});

// Optimize page route
app.get('/optimize', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'optimize.html'));
});

app.post('/insert_file', (req, res) => {
  // Access POST data
  const postData = req.body;

  // Process the data
  console.log('Received POST data:', postData);

  res.send('Data received successfully');
});

app.get('/api/access_data', (req, res) =>{
  try{
  
  res.json(postData);
  //res.json(test_val)

  }
  catch(e){
    console.error(e);
    res.status(500).send('Server error');
  }
  

});







// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});