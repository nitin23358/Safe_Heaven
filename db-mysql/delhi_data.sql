USE project;

-- Delhi Locations
INSERT INTO Location (Name, Area, Address, Latitude, Longitude) VALUES
('Saket District Centre', 'Saket', 'Saket, South Delhi, Delhi 110017', 28.5244, 77.2066),
('Hauz Khas Village', 'Hauz Khas', 'Hauz Khas, South Delhi, Delhi 110016', 28.5494, 77.2000),
('Dwarka Sector 21', 'Dwarka', 'Dwarka Sector 21, West Delhi, Delhi 110077', 28.5921, 77.0460),
('Connaught Place Inner Circle', 'Connaught Place', 'Connaught Place, New Delhi, Delhi 110001', 28.6315, 77.2167),
('Lajpat Nagar Central Market', 'Lajpat Nagar', 'Lajpat Nagar II, South Delhi, Delhi 110024', 28.5677, 77.2431),
('Karol Bagh Market', 'Karol Bagh', 'Karol Bagh, Central Delhi, Delhi 110005', 28.6519, 77.1909),
('Rohini Sector 10', 'Rohini', 'Rohini Sector 10, North West Delhi, Delhi 110085', 28.7495, 77.0670),
('Janakpuri District Centre', 'Janakpuri', 'Janakpuri, West Delhi, Delhi 110058', 28.6219, 77.0879);

-- Safetipin Features (lighting, walkability, visibility, etc.)
INSERT INTO SafetipinFeatures (LocationID, LightingScore, Walkability, Visibility, PublicTransport, PeopleDensity, SecurityFeeling) VALUES
(1, 7.5, 8.0, 7.0, 8.5, 7.5, 7.2),
(2, 5.5, 6.5, 5.0, 7.0, 8.5, 4.8),
(3, 8.0, 7.5, 7.5, 6.5, 6.0, 7.8),
(4, 6.5, 8.5, 6.0, 9.5, 9.5, 5.5),
(5, 7.0, 7.5, 6.5, 8.0, 8.0, 6.5),
(6, 5.0, 6.0, 4.5, 8.5, 9.0, 4.2),
(7, 7.5, 7.0, 7.0, 5.5, 5.5, 7.0),
(8, 6.8, 7.0, 6.5, 7.5, 7.0, 6.2);

-- Crime Reports (Delhi Police / NCRB style)
INSERT INTO CrimeReport (LocationID, CrimeType, Description, CrimeDate, CrimeTime, PoliceStation, Severity, Source) VALUES
(1, 'Theft', 'Mobile phone snatching near metro exit', '2024-11-05', '21:30:00', 'Saket Police Station', 2, 'Delhi Police'),
(1, 'Harassment', 'Verbal harassment reported by commuter', '2024-11-12', '22:15:00', 'Saket Police Station', 3, 'Delhi Police'),
(2, 'Assault', 'Physical altercation outside restaurant', '2024-10-20', '23:45:00', 'Hauz Khas Police Station', 4, 'NCRB'),
(2, 'Sexual Harassment', 'Stalking incident reported near park', '2024-11-01', '20:00:00', 'Malviya Nagar Police Station', 5, 'Delhi Police'),
(2, 'Theft', 'Purse snatching in crowded lane', '2024-11-08', '19:30:00', 'Hauz Khas Police Station', 3, 'Delhi Police'),
(3, 'Robbery', 'Chain snatching on main road', '2024-10-15', '18:00:00', 'Dwarka South Police Station', 3, 'Delhi Police'),
(4, 'Pickpocketing', 'Wallet stolen in crowded market', '2024-11-10', '17:00:00', 'Connaught Place Police Station', 2, 'Delhi Police'),
(4, 'Fraud', 'Scam targeting tourists', '2024-10-28', '14:00:00', 'Connaught Place Police Station', 2, 'NCRB'),
(4, 'Harassment', 'Eve-teasing near metro station', '2024-11-15', '21:00:00', 'Parliament Street PS', 4, 'Delhi Police'),
(5, 'Theft', 'Shoplifting incident in market', '2024-11-03', '16:30:00', 'Lajpat Nagar Police Station', 2, 'Delhi Police'),
(6, 'Assault', 'Fight between shopkeepers', '2024-10-25', '20:30:00', 'Karol Bagh Police Station', 3, 'Delhi Police'),
(6, 'Sexual Harassment', 'Harassment in crowded bazaar', '2024-11-07', '19:00:00', 'Karol Bagh Police Station', 4, 'NCRB'),
(7, 'Theft', 'Vehicle break-in reported', '2024-11-02', '02:00:00', 'Rohini Police Station', 2, 'Delhi Police'),
(8, 'Robbery', 'Armed robbery attempt foiled', '2024-10-30', '22:30:00', 'Janakpuri Police Station', 4, 'Delhi Police');

-- User Reviews (community generated)
INSERT INTO Review (UserID, LocationID, Rating, ReviewText, ReviewDate, ReviewTime, Gender) VALUES
(1, 1, 5, 'Well-lit area, felt safe even at 9 PM. Good police presence.', '2024-11-01 18:00:00', '18:00:00', 'Female'),
(2, 1, 4, 'Safe during day, slightly less comfortable late night.', '2024-11-05 20:00:00', '20:00:00', 'Female'),
(3, 2, 2, 'Avoid Hauz Khas lanes after 10 PM. Poor lighting in some areas.', '2024-11-03 23:00:00', '23:00:00', 'Female'),
(4, 2, 3, 'Crowded but some isolated spots feel unsafe.', '2024-11-08 21:30:00', '21:30:00', 'Male'),
(5, 3, 5, 'Dwarka feels very safe. Good metro connectivity.', '2024-11-02 17:00:00', '17:00:00', 'Female'),
(6, 4, 2, 'CP is crowded but pickpockets are common. Stay alert.', '2024-11-10 19:00:00', '19:00:00', 'Female'),
(7, 5, 4, 'Lajpat Nagar market is busy and generally safe in evening.', '2024-11-06 18:30:00', '18:30:00', 'Female'),
(8, 6, 2, 'Karol Bagh feels unsafe after dark. Limited street lighting.', '2024-11-04 21:00:00', '21:00:00', 'Female'),
(9, 7, 4, 'Rohini residential area is peaceful and safe.', '2024-11-07 19:00:00', '19:00:00', 'Female'),
(10, 8, 3, 'Janakpuri is okay during day but cautious at night.', '2024-11-09 20:00:00', '20:00:00', 'Female');

-- Safe Zones (Police, Cafe, Metro, Hostel)
INSERT INTO Listing (Name, Category, ContactInfo, VerificationStatus, LocationID) VALUES
('Saket Police Station', 'Police Station', '+91-11-2656-1234', TRUE, 1),
('Big Chill Cafe Saket', 'Café', 'bigchill@saket.com', TRUE, 1),
('Yellow Line Saket Metro', 'Metro', 'DMRC Saket', TRUE, 1),
('Hauz Khas Police Station', 'Police Station', '+91-11-2686-7890', TRUE, 2),
('Social Hauz Khas', 'Café', 'social@hauz.com', TRUE, 2),
('Green Park Metro Station', 'Metro', 'DMRC Green Park', TRUE, 2),
('Dwarka Women Hostel', 'Hostel', 'dwarkahostel@example.com', TRUE, 3),
('Dwarka Sector 21 Metro', 'Metro', 'DMRC Dwarka 21', TRUE, 3),
('Parliament Street Police Station', 'Police Station', '+91-11-2336-2222', TRUE, 4),
('Indian Coffee House CP', 'Café', 'ich@cp.com', TRUE, 4),
('Rajiv Chowk Metro', 'Metro', 'DMRC Rajiv Chowk', TRUE, 4),
('Lajpat Nagar Police Station', 'Police Station', '+91-11-2643-4567', TRUE, 5),
('Lajpat Nagar Metro', 'Metro', 'DMRC Lajpat Nagar', TRUE, 5),
('Karol Bagh Police Station', 'Police Station', '+91-11-2354-8901', TRUE, 6),
('Rohini Police Station', 'Police Station', '+91-11-2755-3456', TRUE, 7),
('Janakpuri Police Station', 'Police Station', '+91-11-2550-7890', TRUE, 8);
