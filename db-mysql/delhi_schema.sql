-- SafeHaven Delhi Database Schema
-- Integrated dataset: Delhi Police + NCRB + Safetipin + DMRC GTFS Metro + OSM POIs
-- Extended geo tables: see delhi_geo_schema.sql + metro_stations_data.sql

CREATE DATABASE IF NOT EXISTS project;
USE project;

CREATE TABLE IF NOT EXISTS User (
    UserID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    Role ENUM('Regular', 'Admin') NOT NULL DEFAULT 'Regular'
);

CREATE TABLE IF NOT EXISTS Location (
    LocationID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Area VARCHAR(100) NOT NULL,
    Address TEXT NOT NULL,
    Latitude DECIMAL(9,6) NOT NULL,
    Longitude DECIMAL(9,6) NOT NULL
);

CREATE TABLE IF NOT EXISTS SafetipinFeatures (
    FeatureID INT PRIMARY KEY AUTO_INCREMENT,
    LocationID INT NOT NULL UNIQUE,
    LightingScore DECIMAL(3,1) NOT NULL CHECK (LightingScore BETWEEN 1 AND 10),
    Walkability DECIMAL(3,1) NOT NULL CHECK (Walkability BETWEEN 1 AND 10),
    Visibility DECIMAL(3,1) NOT NULL CHECK (Visibility BETWEEN 1 AND 10),
    PublicTransport DECIMAL(3,1) NOT NULL CHECK (PublicTransport BETWEEN 1 AND 10),
    PeopleDensity DECIMAL(3,1) NOT NULL CHECK (PeopleDensity BETWEEN 1 AND 10),
    SecurityFeeling DECIMAL(3,1) NOT NULL CHECK (SecurityFeeling BETWEEN 1 AND 10),
    FOREIGN KEY (LocationID) REFERENCES Location(LocationID) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS CrimeReport (
    ReportID INT PRIMARY KEY AUTO_INCREMENT,
    LocationID INT NOT NULL,
    CrimeType VARCHAR(100) NOT NULL,
    Description TEXT,
    CrimeDate DATE NOT NULL,
    CrimeTime TIME NOT NULL,
    PoliceStation VARCHAR(150),
    Severity INT NOT NULL CHECK (Severity BETWEEN 1 AND 5),
    Source VARCHAR(100) DEFAULT 'Delhi Police',
    FOREIGN KEY (LocationID) REFERENCES Location(LocationID) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Review (
    ReviewID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT NOT NULL,
    LocationID INT NOT NULL,
    Rating INT CHECK (Rating BETWEEN 1 AND 5),
    ReviewText TEXT,
    ReviewDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ReviewTime TIME,
    Gender ENUM('Female', 'Male', 'Other') DEFAULT 'Female',
    Moderated BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (UserID) REFERENCES User(UserID) ON DELETE CASCADE,
    FOREIGN KEY (LocationID) REFERENCES Location(LocationID) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Listing (
    ListingID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(150) NOT NULL,
    Category ENUM('Police Station', 'Café', 'Metro', 'Hostel', 'Public Restroom', 'Others') NOT NULL,
    ContactInfo VARCHAR(255),
    VerificationStatus BOOLEAN DEFAULT FALSE,
    LocationID INT NOT NULL,
    FOREIGN KEY (LocationID) REFERENCES Location(LocationID) ON DELETE CASCADE
);
