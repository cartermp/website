# CalTrack API Documentation

## Overview
The CalTrack API provides authenticated access to calorie tracking data with comprehensive export and analytics capabilities.

## Authentication
All API endpoints require authentication via one of these methods:

### 1. API Key (Recommended for programmatic access)
Add header: `x-api-key: YOUR_API_KEY`

### 2. Session Authentication
Use existing NextAuth session (browser-based access)

## Base URL
`https://phillipcarter.dev/api/v1/caltrack`

## Endpoints

### Export Endpoints

#### GET /export/entries
Export individual calorie entries with flexible filtering.

**Query Parameters:**
- `start_date` (optional): ISO date string (YYYY-MM-DD)
- `end_date` (optional): ISO date string (YYYY-MM-DD)
- `meal_type` (optional): Filter by meal type (`Breakfast`, `Lunch`, `Dinner`, `Snacks`)
- `format` (optional): Response format (`json` or `csv`, default: `json`)

**Example:**
```bash
curl -H "x-api-key: YOUR_KEY" \
  "https://your-domain.com/api/v1/caltrack/export/entries?start_date=2024-01-01&format=csv"
```

**Response (JSON):**
```json
{
  "entries": [
    {
      "date": "2024-01-15",
      "meal_type": "Breakfast",
      "meal_name": "Oatmeal with berries",
      "calories": 350,
      "timestamp": 1705363200
    }
  ],
  "meta": {
    "total_count": 150,
    "start_date": "2024-01-01",
    "end_date": null,
    "meal_type_filter": null,
    "format": "json"
  }
}
```

#### GET /export/daily-stats
Export aggregated daily statistics.

**Query Parameters:**
- `start_date` (optional): ISO date string
- `end_date` (optional): ISO date string
- `format` (optional): `json` or `csv`

**Response (JSON):**
```json
{
  "daily_stats": [
    {
      "date": "2024-01-15",
      "total_calories": 2150,
      "breakdown": {
        "breakfast": 350,
        "lunch": 650,
        "dinner": 850,
        "snacks": 300
      },
      "updated_at": "2024-01-15T20:30:00Z",
      "timestamp": 1705363200
    }
  ],
  "meta": {
    "total_count": 30,
    "start_date": "2024-01-01",
    "end_date": null,
    "format": "json"
  }
}
```

#### GET /export/summary
Export comprehensive summary statistics and insights.

**Query Parameters:**
- `start_date` (optional): ISO date string
- `end_date` (optional): ISO date string
- `format` (optional): `json` or `csv`

**Response (JSON):**
```json
{
  "summary": {
    "overall": {
      "total_days": 90,
      "avg_daily_calories": 2150.75,
      "max_daily_calories": 2800,
      "min_daily_calories": 1650,
      "stddev_daily_calories": 245.30
    },
    "meal_types": [
      {
        "meal_type": "Dinner",
        "entry_count": 85,
        "avg_calories": 750.50,
        "total_calories": 63792,
        "max_calories": 1200,
        "min_calories": 400
      }
    ],
    "top_foods": [
      {
        "meal_name": "Chicken breast",
        "frequency": 25,
        "avg_calories": 300,
        "total_calories": 7500
      }
    ],
    "weekly_trends": [...],
    "monthly_breakdown": [...]
  },
  "meta": {
    "start_date": "2024-01-01",
    "end_date": null,
    "format": "json",
    "generated_at": "2024-01-15T12:00:00Z"
  }
}
```

### Analytics Endpoints

#### GET /analytics/trends
Analyze calorie trends over time with moving averages and trend direction.

**Query Parameters:**
- `start_date` (optional): ISO date string
- `end_date` (optional): ISO date string
- `interval` (optional): `daily`, `weekly`, or `monthly` (default: `daily`)
- `format` (optional): `json` or `csv`

**Response (JSON):**
```json
{
  "trends": [
    {
      "period": "2024-01-15",
      "interval_type": "day",
      "avg_calories": 2150,
      "max_calories": 2150,
      "min_calories": 2150,
      "days_count": 1,
      "moving_average": 2125.5,
      "meal_breakdown": {
        "breakfast": 350,
        "lunch": 650,
        "dinner": 850,
        "snacks": 300
      }
    }
  ],
  "trend_analysis": {
    "direction": "stable",
    "slope": 2.5,
    "total_periods": 30
  },
  "meta": {
    "interval": "daily",
    "start_date": "2024-01-01",
    "end_date": null,
    "format": "json",
    "moving_average_periods": 7
  }
}
```

#### GET /analytics/patterns
Discover eating patterns and habits.

**Query Parameters:**
- `start_date` (optional): ISO date string
- `end_date` (optional): ISO date string
- `format` (optional): `json` or `csv`

**Response (JSON):**
```json
{
  "patterns": {
    "day_of_week": [
      {
        "day_of_week": 1,
        "day_name": "Monday",
        "total_days": 12,
        "avg_daily_calories": 2100,
        "meal_breakdown": {
          "breakfast": 350,
          "lunch": 650,
          "dinner": 800,
          "snacks": 300
        }
      }
    ],
    "meal_timing": [
      {
        "meal_type": "Breakfast",
        "total_entries": 85,
        "avg_calories_per_entry": 350,
        "days_with_meal": 85,
        "frequency_percentage": 94.4
      }
    ],
    "calorie_distribution": [
      {
        "calorie_range": "Moderate (1800-2199)",
        "days_count": 45,
        "percentage": 50.0
      }
    ],
    "eating_consistency": [
      {
        "meals_per_day": 4,
        "days_count": 60,
        "percentage": 66.7,
        "avg_calories": 2200
      }
    ],
    "weekend_vs_weekday": [
      {
        "day_type": "Weekday",
        "total_days": 65,
        "avg_daily_calories": 2100,
        "avg_meals_per_day": 3.8,
        "meal_breakdown": {
          "breakfast": 350,
          "lunch": 650,
          "dinner": 800,
          "snacks": 300
        }
      }
    ]
  },
  "meta": {
    "start_date": "2024-01-01",
    "end_date": null,
    "format": "json",
    "analysis_period": "3 months"
  }
}
```

#### GET /analytics/foods
Analyze food consumption patterns and statistics.

**Query Parameters:**
- `start_date` (optional): ISO date string
- `end_date` (optional): ISO date string
- `meal_type` (optional): Filter by meal type
- `limit` (optional): Limit results (default: 50)
- `format` (optional): `json` or `csv`

**Response (JSON):**
```json
{
  "food_analytics": {
    "top_foods_by_frequency": [
      {
        "meal_name": "Chicken breast",
        "frequency": 25,
        "avg_calories": 300,
        "min_calories": 250,
        "max_calories": 350,
        "total_calories": 7500,
        "days_consumed": 20,
        "meal_types": ["Lunch", "Dinner"]
      }
    ],
    "top_foods_by_calories": [...],
    "top_foods_by_total_calories": [...],
    "food_diversity": {
      "unique_foods": 156,
      "total_entries": 450,
      "diversity_ratio": 34.7
    },
    "foods_by_meal_type": [...],
    "calorie_efficiency": [...],
    "recent_foods": [...]
  },
  "meta": {
    "start_date": "2024-01-01",
    "end_date": null,
    "meal_type_filter": null,
    "limit": 50,
    "format": "json"
  }
}
```

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to export entries"
}
```

## Rate Limiting
API endpoints are not currently rate-limited but may be in the future. Use responsibly.

## Data Formats

### CSV Export
When using `format=csv`, responses will be returned as CSV files with appropriate headers for download.

### Date Formats
- Use ISO 8601 date format: `YYYY-MM-DD`
- Example: `2024-01-15`

### Meal Types
Valid meal types: `Breakfast`, `Lunch`, `Dinner`, `Snacks`

## Environment Variables Required
- `API_KEY`: Your API key for authentication
- `ALLOWED_EMAIL`: Email address for session-based authentication
- `DATABASE_URL`: Neon database connection string

## Example Usage

### Export last 30 days as CSV
```bash
curl -H "x-api-key: YOUR_KEY" \
  "https://your-domain.com/api/v1/caltrack/export/entries?start_date=2024-01-01&format=csv" \
  -o caltrack-data.csv
```

### Get weekly trends
```bash
curl -H "x-api-key: YOUR_KEY" \
  "https://your-domain.com/api/v1/caltrack/analytics/trends?interval=weekly&start_date=2024-01-01"
```

### Analyze breakfast patterns
```bash
curl -H "x-api-key: YOUR_KEY" \
  "https://your-domain.com/api/v1/caltrack/analytics/foods?meal_type=Breakfast&limit=20"
```