-- Extended geospatial schema for SafeHaven Delhi
-- Run after delhi_schema.sql

USE project;

CREATE TABLE IF NOT EXISTS MetroStation (
    StationID INT PRIMARY KEY,
    StationName VARCHAR(150) NOT NULL,
    Line VARCHAR(100) NOT NULL,
    Latitude DECIMAL(9,6) NOT NULL,
    Longitude DECIMAL(9,6) NOT NULL,
    Address TEXT
);

CREATE TABLE IF NOT EXISTS PoliceStation (
    PoliceID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(150) NOT NULL,
    Latitude DECIMAL(9,6) NOT NULL,
    Longitude DECIMAL(9,6) NOT NULL,
    Address TEXT,
    Contact VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS CafeRestaurant (
    CafeID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(150) NOT NULL,
    Category ENUM('Cafe', 'Restaurant', 'Fast Food') NOT NULL DEFAULT 'Cafe',
    Rating DECIMAL(2,1),
    Latitude DECIMAL(9,6) NOT NULL,
    Longitude DECIMAL(9,6) NOT NULL,
    Address TEXT
);

CREATE TABLE IF NOT EXISTS Hospital (
    HospitalID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(150) NOT NULL,
    Latitude DECIMAL(9,6) NOT NULL,
    Longitude DECIMAL(9,6) NOT NULL,
    Address TEXT,
    Contact VARCHAR(50)
);

-- Seed police stations (Delhi)
INSERT INTO PoliceStation (Name, Latitude, Longitude, Address, Contact) VALUES
('Hauz Khas Police Station', 28.5500, 77.2010, 'Hauz Khas, South Delhi', '+91-11-2686-7890'),
('Malviya Nagar Police Station', 28.5375, 77.2100, 'Malviya Nagar, Delhi', '+91-11-2687-1000'),
('Saket Police Station', 28.5250, 77.2070, 'Saket, South Delhi', '+91-11-2656-1234'),
('Parliament Street Police Station', 28.6320, 77.2170, 'Parliament Street, New Delhi', '+91-11-2336-2222'),
('Lajpat Nagar Police Station', 28.5680, 77.2435, 'Lajpat Nagar, Delhi', '+91-11-2643-4567'),
('Karol Bagh Police Station', 28.6525, 77.1915, 'Karol Bagh, Delhi', '+91-11-2354-8901'),
('Dwarka South Police Station', 28.5920, 77.0470, 'Dwarka, Delhi', '+91-11-2808-0000'),
('Rohini Police Station', 28.7500, 77.0675, 'Rohini, Delhi', '+91-11-2755-3456'),
('Janakpuri Police Station', 28.6225, 77.0885, 'Janakpuri, Delhi', '+91-11-2550-7890');

-- Seed cafes & restaurants (Hauz Khas / South Delhi area)
INSERT INTO CafeRestaurant (Name, Category, Rating, Latitude, Longitude, Address) VALUES
('Social Hauz Khas', 'Cafe', 4.2, 28.5490, 77.1995, 'Hauz Khas Village'),
('Blue Tokai Coffee', 'Cafe', 4.5, 28.5595, 77.2065, 'Green Park, Delhi'),
('Starbucks Green Park', 'Cafe', 4.0, 28.5602, 77.2072, 'Green Park, Delhi'),
('Cafe Delhi Heights', 'Restaurant', 4.1, 28.5285, 77.2060, 'Malviya Nagar, Delhi'),
('Big Chill Cafe Saket', 'Cafe', 4.3, 28.5240, 77.2060, 'Saket, Delhi'),
('Indian Coffee House CP', 'Cafe', 3.9, 28.6310, 77.2160, 'Connaught Place'),
('Diggin Cafe', 'Cafe', 4.4, 28.5510, 77.1985, 'Chanakyapuri area'),
('The Big Chill Cakery', 'Cafe', 4.2, 28.5675, 77.2430, 'Lajpat Nagar');

-- Seed hospitals
INSERT INTO Hospital (Name, Latitude, Longitude, Address, Contact) VALUES
('Max Super Speciality Hospital Saket', 28.5275, 77.2180, 'Press Enclave, Saket', '+91-11-2651-5050'),
('AIIMS Delhi', 28.5672, 77.2100, 'Ansari Nagar, Delhi', '+91-11-2658-8500'),
('Safdarjung Hospital', 28.5685, 77.2055, 'Safdarjung Enclave', '+91-11-2670-7400'),
('Fortis Escorts Heart Institute', 28.5730, 77.2740, 'Okhla, Delhi', '+91-11-4713-5000'),
('BLK Max Super Speciality Hospital', 28.6420, 77.1900, 'Pusa Road, Delhi', '+91-11-3040-3040'),
('Deen Dayal Upadhyay Hospital', 28.6510, 77.0750, 'Hari Nagar, Delhi', '+91-11-2549-4400'),
('Manipal Hospital Dwarka', 28.5980, 77.0330, 'Dwarka Sector 10', '+91-11-4040-4040'),
('Ganga Ram Hospital', 28.6385, 77.1895, 'Rajinder Nagar', '+91-11-2575-0000');

-- Metro stations: run metro_stations_data.sql (251 stations from DMRC GTFS)
