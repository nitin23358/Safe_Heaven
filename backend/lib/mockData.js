const safetipinFeatures = {
  1: { LightingScore: 7.5, Walkability: 8.0, Visibility: 7.0, PublicTransport: 8.5, PeopleDensity: 7.5, SecurityFeeling: 7.2 },
  2: { LightingScore: 5.5, Walkability: 6.5, Visibility: 5.0, PublicTransport: 7.0, PeopleDensity: 8.5, SecurityFeeling: 4.8 },
  3: { LightingScore: 8.0, Walkability: 7.5, Visibility: 7.5, PublicTransport: 6.5, PeopleDensity: 6.0, SecurityFeeling: 7.8 },
  4: { LightingScore: 6.5, Walkability: 8.5, Visibility: 6.0, PublicTransport: 9.5, PeopleDensity: 9.5, SecurityFeeling: 5.5 },
  5: { LightingScore: 7.0, Walkability: 7.5, Visibility: 6.5, PublicTransport: 8.0, PeopleDensity: 8.0, SecurityFeeling: 6.5 },
  6: { LightingScore: 5.0, Walkability: 6.0, Visibility: 4.5, PublicTransport: 8.5, PeopleDensity: 9.0, SecurityFeeling: 4.2 },
  7: { LightingScore: 7.5, Walkability: 7.0, Visibility: 7.0, PublicTransport: 5.5, PeopleDensity: 5.5, SecurityFeeling: 7.0 },
  8: { LightingScore: 6.8, Walkability: 7.0, Visibility: 6.5, PublicTransport: 7.5, PeopleDensity: 7.0, SecurityFeeling: 6.2 },
};

const locations = [
  { LocationID: 1, Name: 'Saket District Centre', Area: 'Saket', Address: 'Saket, South Delhi, Delhi 110017', Latitude: 28.5244, Longitude: 77.2066 },
  { LocationID: 2, Name: 'Hauz Khas Village', Area: 'Hauz Khas', Address: 'Hauz Khas, South Delhi, Delhi 110016', Latitude: 28.5494, Longitude: 77.2000 },
  { LocationID: 3, Name: 'Dwarka Sector 21', Area: 'Dwarka', Address: 'Dwarka Sector 21, West Delhi, Delhi 110077', Latitude: 28.5921, Longitude: 77.0460 },
  { LocationID: 4, Name: 'Connaught Place Inner Circle', Area: 'Connaught Place', Address: 'Connaught Place, New Delhi, Delhi 110001', Latitude: 28.6315, Longitude: 77.2167 },
  { LocationID: 5, Name: 'Lajpat Nagar Central Market', Area: 'Lajpat Nagar', Address: 'Lajpat Nagar II, South Delhi, Delhi 110024', Latitude: 28.5677, Longitude: 77.2431 },
  { LocationID: 6, Name: 'Karol Bagh Market', Area: 'Karol Bagh', Address: 'Karol Bagh, Central Delhi, Delhi 110005', Latitude: 28.6519, Longitude: 77.1909 },
  { LocationID: 7, Name: 'Rohini Sector 10', Area: 'Rohini', Address: 'Rohini Sector 10, North West Delhi, Delhi 110085', Latitude: 28.7495, Longitude: 77.0670 },
  { LocationID: 8, Name: 'Janakpuri District Centre', Area: 'Janakpuri', Address: 'Janakpuri, West Delhi, Delhi 110058', Latitude: 28.6219, Longitude: 77.0879 },
];

const crimeReports = [
  { ReportID: 1, LocationID: 1, CrimeType: 'Theft', Description: 'Mobile phone snatching near metro exit', DateTime: '2024-11-05 21:30:00', CrimeDate: '2024-11-05', CrimeTime: '21:30:00', PoliceStation: 'Saket Police Station', Severity: 2, Source: 'Delhi Police' },
  { ReportID: 2, LocationID: 1, CrimeType: 'Harassment', Description: 'Verbal harassment reported by commuter', DateTime: '2024-11-12 22:15:00', CrimeDate: '2024-11-12', CrimeTime: '22:15:00', PoliceStation: 'Saket Police Station', Severity: 3, Source: 'Delhi Police' },
  { ReportID: 3, LocationID: 2, CrimeType: 'Assault', Description: 'Physical altercation outside restaurant', DateTime: '2024-10-20 23:45:00', CrimeDate: '2024-10-20', CrimeTime: '23:45:00', PoliceStation: 'Hauz Khas Police Station', Severity: 4, Source: 'NCRB' },
  { ReportID: 4, LocationID: 2, CrimeType: 'Sexual Harassment', Description: 'Stalking incident reported near park', DateTime: '2024-11-01 20:00:00', CrimeDate: '2024-11-01', CrimeTime: '20:00:00', PoliceStation: 'Malviya Nagar Police Station', Severity: 5, Source: 'Delhi Police' },
  { ReportID: 5, LocationID: 2, CrimeType: 'Theft', Description: 'Purse snatching in crowded lane', DateTime: '2024-11-08 19:30:00', CrimeDate: '2024-11-08', CrimeTime: '19:30:00', PoliceStation: 'Hauz Khas Police Station', Severity: 3, Source: 'Delhi Police' },
  { ReportID: 6, LocationID: 3, CrimeType: 'Robbery', Description: 'Chain snatching on main road', DateTime: '2024-10-15 18:00:00', CrimeDate: '2024-10-15', CrimeTime: '18:00:00', PoliceStation: 'Dwarka South Police Station', Severity: 3, Source: 'Delhi Police' },
  { ReportID: 7, LocationID: 4, CrimeType: 'Pickpocketing', Description: 'Wallet stolen in crowded market', DateTime: '2024-11-10 17:00:00', CrimeDate: '2024-11-10', CrimeTime: '17:00:00', PoliceStation: 'Connaught Place Police Station', Severity: 2, Source: 'Delhi Police' },
  { ReportID: 8, LocationID: 4, CrimeType: 'Fraud', Description: 'Scam targeting tourists', DateTime: '2024-10-28 14:00:00', CrimeDate: '2024-10-28', CrimeTime: '14:00:00', PoliceStation: 'Connaught Place Police Station', Severity: 2, Source: 'NCRB' },
  { ReportID: 9, LocationID: 4, CrimeType: 'Harassment', Description: 'Eve-teasing near metro station', DateTime: '2024-11-15 21:00:00', CrimeDate: '2024-11-15', CrimeTime: '21:00:00', PoliceStation: 'Parliament Street PS', Severity: 4, Source: 'Delhi Police' },
  { ReportID: 10, LocationID: 5, CrimeType: 'Theft', Description: 'Shoplifting incident in market', DateTime: '2024-11-03 16:30:00', CrimeDate: '2024-11-03', CrimeTime: '16:30:00', PoliceStation: 'Lajpat Nagar Police Station', Severity: 2, Source: 'Delhi Police' },
  { ReportID: 11, LocationID: 6, CrimeType: 'Assault', Description: 'Fight between shopkeepers', DateTime: '2024-10-25 20:30:00', CrimeDate: '2024-10-25', CrimeTime: '20:30:00', PoliceStation: 'Karol Bagh Police Station', Severity: 3, Source: 'Delhi Police' },
  { ReportID: 12, LocationID: 6, CrimeType: 'Sexual Harassment', Description: 'Harassment in crowded bazaar', DateTime: '2024-11-07 19:00:00', CrimeDate: '2024-11-07', CrimeTime: '19:00:00', PoliceStation: 'Karol Bagh Police Station', Severity: 4, Source: 'NCRB' },
  { ReportID: 13, LocationID: 7, CrimeType: 'Theft', Description: 'Vehicle break-in reported', DateTime: '2024-11-02 02:00:00', CrimeDate: '2024-11-02', CrimeTime: '02:00:00', PoliceStation: 'Rohini Police Station', Severity: 2, Source: 'Delhi Police' },
  { ReportID: 14, LocationID: 8, CrimeType: 'Robbery', Description: 'Armed robbery attempt foiled', DateTime: '2024-10-30 22:30:00', CrimeDate: '2024-10-30', CrimeTime: '22:30:00', PoliceStation: 'Janakpuri Police Station', Severity: 4, Source: 'Delhi Police' },
];

const reviews = [
  { ReviewID: 1, UserID: 1, LocationID: 1, Rating: 5, ReviewText: 'Well-lit area, felt safe even at 9 PM. Good police presence.', ReviewDate: '2024-11-01 18:00:00', Gender: 'Female', LocationName: 'Saket', UserName: 'Priya Sharma' },
  { ReviewID: 2, UserID: 2, LocationID: 1, Rating: 4, ReviewText: 'Safe during day, slightly less comfortable late night.', ReviewDate: '2024-11-05 20:00:00', Gender: 'Female', LocationName: 'Saket', UserName: 'Ananya Singh' },
  { ReviewID: 3, UserID: 3, LocationID: 2, Rating: 2, ReviewText: 'Avoid Hauz Khas lanes after 10 PM. Poor lighting in some areas.', ReviewDate: '2024-11-03 23:00:00', Gender: 'Female', LocationName: 'Hauz Khas', UserName: 'Meera Patel' },
  { ReviewID: 4, UserID: 4, LocationID: 2, Rating: 3, ReviewText: 'Crowded but some isolated spots feel unsafe.', ReviewDate: '2024-11-08 21:30:00', Gender: 'Male', LocationName: 'Hauz Khas', UserName: 'Rahul Verma' },
  { ReviewID: 5, UserID: 5, LocationID: 3, Rating: 5, ReviewText: 'Dwarka feels very safe. Good metro connectivity.', ReviewDate: '2024-11-02 17:00:00', Gender: 'Female', LocationName: 'Dwarka', UserName: 'Kavya Iyer' },
  { ReviewID: 6, UserID: 6, LocationID: 4, Rating: 2, ReviewText: 'CP is crowded but pickpockets are common. Stay alert.', ReviewDate: '2024-11-10 19:00:00', Gender: 'Female', LocationName: 'Connaught Place', UserName: 'Sanya Das' },
  { ReviewID: 7, UserID: 7, LocationID: 5, Rating: 4, ReviewText: 'Lajpat Nagar market is busy and generally safe in evening.', ReviewDate: '2024-11-06 18:30:00', Gender: 'Female', LocationName: 'Lajpat Nagar', UserName: 'Neha Aggarwal' },
  { ReviewID: 8, UserID: 8, LocationID: 6, Rating: 2, ReviewText: 'Karol Bagh feels unsafe after dark. Limited street lighting.', ReviewDate: '2024-11-04 21:00:00', Gender: 'Female', LocationName: 'Karol Bagh', UserName: 'Divya Kapoor' },
  { ReviewID: 9, UserID: 9, LocationID: 7, Rating: 4, ReviewText: 'Rohini residential area is peaceful and safe.', ReviewDate: '2024-11-07 19:00:00', Gender: 'Female', LocationName: 'Rohini', UserName: 'Isha Mehta' },
  { ReviewID: 10, UserID: 10, LocationID: 8, Rating: 3, ReviewText: 'Janakpuri is okay during day but cautious at night.', ReviewDate: '2024-11-09 20:00:00', Gender: 'Female', LocationName: 'Janakpuri', UserName: 'Tanvi Rao' },
];

const safeZones = [
  { ListingID: 1, Name: 'Saket Police Station', Category: 'Police Station', ContactInfo: '+91-11-2656-1234', VerificationStatus: 1, LocationID: 1, location_name: 'Saket', Address: 'Saket, South Delhi', Latitude: 28.5250, Longitude: 77.2070 },
  { ListingID: 2, Name: 'Big Chill Cafe Saket', Category: 'Café', ContactInfo: 'bigchill@saket.com', VerificationStatus: 1, LocationID: 1, location_name: 'Saket', Address: 'Saket, South Delhi', Latitude: 28.5240, Longitude: 77.2060 },
  { ListingID: 3, Name: 'Yellow Line Saket Metro', Category: 'Metro', ContactInfo: 'DMRC Saket', VerificationStatus: 1, LocationID: 1, location_name: 'Saket', Address: 'Saket Metro Station', Latitude: 28.5235, Longitude: 77.2055 },
  { ListingID: 4, Name: 'Hauz Khas Police Station', Category: 'Police Station', ContactInfo: '+91-11-2686-7890', VerificationStatus: 1, LocationID: 2, location_name: 'Hauz Khas', Address: 'Hauz Khas, South Delhi', Latitude: 28.5500, Longitude: 77.2010 },
  { ListingID: 5, Name: 'Social Hauz Khas', Category: 'Café', ContactInfo: 'social@hauz.com', VerificationStatus: 1, LocationID: 2, location_name: 'Hauz Khas', Address: 'Hauz Khas Village', Latitude: 28.5490, Longitude: 77.1995 },
  { ListingID: 6, Name: 'Green Park Metro Station', Category: 'Metro', ContactInfo: 'DMRC Green Park', VerificationStatus: 1, LocationID: 2, location_name: 'Hauz Khas', Address: 'Green Park, Delhi', Latitude: 28.5598, Longitude: 77.2069 },
  { ListingID: 7, Name: 'Dwarka Women Hostel', Category: 'Hostel', ContactInfo: 'dwarkahostel@example.com', VerificationStatus: 1, LocationID: 3, location_name: 'Dwarka', Address: 'Dwarka Sector 21', Latitude: 28.5925, Longitude: 77.0465 },
  { ListingID: 8, Name: 'Dwarka Sector 21 Metro', Category: 'Metro', ContactInfo: 'DMRC Dwarka 21', VerificationStatus: 1, LocationID: 3, location_name: 'Dwarka', Address: 'Dwarka Sector 21', Latitude: 28.5915, Longitude: 77.0455 },
  { ListingID: 9, Name: 'Parliament Street Police Station', Category: 'Police Station', ContactInfo: '+91-11-2336-2222', VerificationStatus: 1, LocationID: 4, location_name: 'Connaught Place', Address: 'Parliament Street, New Delhi', Latitude: 28.6320, Longitude: 77.2170 },
  { ListingID: 10, Name: 'Indian Coffee House CP', Category: 'Café', ContactInfo: 'ich@cp.com', VerificationStatus: 1, LocationID: 4, location_name: 'Connaught Place', Address: 'Connaught Place', Latitude: 28.6310, Longitude: 77.2160 },
  { ListingID: 11, Name: 'Rajiv Chowk Metro', Category: 'Metro', ContactInfo: 'DMRC Rajiv Chowk', VerificationStatus: 1, LocationID: 4, location_name: 'Connaught Place', Address: 'Rajiv Chowk, CP', Latitude: 28.6328, Longitude: 77.2197 },
  { ListingID: 12, Name: 'Lajpat Nagar Police Station', Category: 'Police Station', ContactInfo: '+91-11-2643-4567', VerificationStatus: 1, LocationID: 5, location_name: 'Lajpat Nagar', Address: 'Lajpat Nagar, Delhi', Latitude: 28.5680, Longitude: 77.2435 },
  { ListingID: 13, Name: 'Lajpat Nagar Metro', Category: 'Metro', ContactInfo: 'DMRC Lajpat Nagar', VerificationStatus: 1, LocationID: 5, location_name: 'Lajpat Nagar', Address: 'Lajpat Nagar Metro', Latitude: 28.5663, Longitude: 77.2431 },
  { ListingID: 14, Name: 'Karol Bagh Police Station', Category: 'Police Station', ContactInfo: '+91-11-2354-8901', VerificationStatus: 1, LocationID: 6, location_name: 'Karol Bagh', Address: 'Karol Bagh, Delhi', Latitude: 28.6525, Longitude: 77.1915 },
  { ListingID: 15, Name: 'Rohini Police Station', Category: 'Police Station', ContactInfo: '+91-11-2755-3456', VerificationStatus: 1, LocationID: 7, location_name: 'Rohini', Address: 'Rohini, Delhi', Latitude: 28.7500, Longitude: 77.0675 },
  { ListingID: 16, Name: 'Janakpuri Police Station', Category: 'Police Station', ContactInfo: '+91-11-2550-7890', VerificationStatus: 1, LocationID: 8, location_name: 'Janakpuri', Address: 'Janakpuri, Delhi', Latitude: 28.6225, Longitude: 77.0885 },
];

function getLocations(search) {
  if (!search) return locations;
  const term = search.toLowerCase();
  return locations.filter(
    (l) =>
      l.Name.toLowerCase().includes(term) ||
      l.Area.toLowerCase().includes(term)
  );
}

function getLocationById(id) {
  return locations.find((l) => l.LocationID === Number(id));
}

function getSafetipinFeatures(locationId) {
  return safetipinFeatures[Number(locationId)] || null;
}

function getCrimeReportsForLocation(locationId) {
  return crimeReports.filter((c) => c.LocationID === Number(locationId));
}

function getReviewsForLocation(locationId) {
  return reviews.filter((r) => r.LocationID === Number(locationId));
}

function getAllSafeZones() {
  return safeZones;
}

function getTopRatedLocations() {
  const ratings = {};
  reviews.forEach((r) => {
    if (!ratings[r.LocationID]) ratings[r.LocationID] = { sum: 0, count: 0 };
    ratings[r.LocationID].sum += r.Rating;
    ratings[r.LocationID].count += 1;
  });

  return locations
    .filter((l) => ratings[l.LocationID])
    .map((l) => ({
      ...l,
      AvgRating: (ratings[l.LocationID].sum / ratings[l.LocationID].count).toFixed(1),
    }))
    .sort((a, b) => parseFloat(b.AvgRating) - parseFloat(a.AvgRating))
    .slice(0, 5);
}

function calcSafetyScore(locationId) {
  const crimes = getCrimeReportsForLocation(locationId);
  const locReviews = getReviewsForLocation(locationId);
  const crimePenalty = Math.min(5, crimes.length * 0.5);
  const reviewScore = locReviews.reduce((acc, r) => acc + r.Rating, 0) / locReviews.length || 0;
  const safetyScore = Math.max(0, 10 - crimePenalty + (reviewScore - 3));
  const avgRating = reviewScore || 0;
  return {
    crimeReports: crimes,
    reviews: locReviews,
    safetyScore: Math.min(10, Math.max(0, safetyScore)),
    avgRating: avgRating.toFixed(1),
  };
}

module.exports = {
  locations,
  crimeReports,
  reviews,
  safeZones,
  safetipinFeatures,
  getLocations,
  getLocationById,
  getSafetipinFeatures,
  getCrimeReportsForLocation,
  getReviewsForLocation,
  getAllSafeZones,
  getTopRatedLocations,
  calcSafetyScore,
};
