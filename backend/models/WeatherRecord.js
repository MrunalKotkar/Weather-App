const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WeatherRecord = sequelize.define(
  'WeatherRecord',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    location_input: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Raw location string entered by user',
    },
    resolved_location: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Location name resolved by geocoding API',
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    date_from: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    date_to: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    temperature_min: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Min temperature in Celsius',
    },
    temperature_max: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Max temperature in Celsius',
    },
    temperature_avg: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Average temperature in Celsius',
    },
    humidity: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    wind_speed: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    weather_icon: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    weather_data: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Full raw API response stored as JSON',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'weather_records',
    timestamps: true,
    underscored: true,
  }
);

module.exports = WeatherRecord;
