# 🌤️ Atmosphere — Weather Dashboard

> A premium, responsive weather dashboard built with HTML5, CSS3, and Vanilla JavaScript. Get real-time weather information, hourly forecasts, 5-day predictions, air quality data, location-based weather, favorites, recent searches, and more.

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=for-the-badge)](https://your-username.github.io/weather-dashboard)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/your-username/weather-dashboard)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

---

## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Weather Information](#-weather-information)
- [Forecast](#-forecast)
- [Location Services](#-location-services)
- [Favorites & History](#-favorites--history)
- [Themes & Units](#-themes--units)
- [User Experience](#-user-experience)
- [Tech Stack](#-tech-stack)
- [APIs & Browser Features](#-apis--browser-features)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [API Key Setup](#-api-key-setup)
- [Usage](#-usage)
- [How It Works](#-how-it-works)
- [Responsive Design](#-responsive-design)
- [Accessibility](#-accessibility)
- [Error Handling](#-error-handling)
- [Testing](#-testing)
- [Browser Support](#-browser-support)
- [Known Limitations](#-known-limitations)
- [Future Improvements](#-future-improvements)
- [Contributing](#-contributing)
- [License](#-license)
- [Author](#-author)
- [Acknowledgments](#-acknowledgments)

---

## 🌟 About

**Atmosphere** is a modern weather dashboard designed as a frontend development project using only standard web technologies.

The application allows users to search for weather information by city, detect their current location, view detailed weather conditions, explore hourly and daily forecasts, save favorite cities, review recent searches, switch between Celsius and Fahrenheit, and use light or dark themes.

The interface is designed to provide a polished, professional experience while keeping the project completely frontend-based.

---

## ✨ Features

### 🌡️ Current Weather

- Real-time weather data
- City and country information
- Current temperature
- Feels-like temperature
- Weather condition
- Weather description
- Dynamic weather icons
- Humidity
- Wind speed
- Wind direction
- Atmospheric pressure
- Visibility
- Cloud coverage
- Sunrise time
- Sunset time
- Local date and time
- Time-zone information

### 🌤️ Weather Conditions

The application supports multiple weather conditions, including:

- ☀️ Clear / Sunny
- 🌙 Clear Night
- ⛅ Partly Cloudy
- ☁️ Cloudy
- 🌧️ Rain
- 🌦️ Drizzle
- ⛈️ Thunderstorms
- ❄️ Snow
- 🌫️ Mist / Fog
- 🌧️ Heavy Rain
- ☁️ Overcast

Weather icons are rendered dynamically according to the weather API response.

---

## 📊 Forecast

### Hourly Forecast

The application provides an upcoming hourly forecast including:

- Time
- Temperature
- Weather icon
- Weather condition
- Temperature trend

The application displays approximately the next 24 hours using available forecast intervals.

### 📈 Temperature Trend

A dynamic SVG temperature chart visualizes upcoming temperature changes.

The chart includes:

- Temperature points
- Connecting trend line
- Temperature labels
- Visual area graph
- Automatic Celsius/Fahrenheit conversion
- Accessibility label

### 📅 5-Day Forecast

The daily forecast provides:

- Day
- Date
- Weather icon
- Weather condition
- Maximum temperature
- Minimum temperature

Forecast data is automatically grouped by local calendar date.

---

## 📍 Location Services

### Search by City

Users can enter a city name and retrieve its current weather.

Example:

```text
Lahore
London
Dubai
New York
Tokyo
Paris
Islamabad
Karachi
```

### 📍 Use My Location

The application supports browser-based geolocation.

When the user selects **My Location**:

1. The browser requests location permission.
2. Latitude and longitude are obtained.
3. Weather data is requested using the coordinates.
4. The current weather is displayed.

The application also handles:

- Permission denied
- Location unavailable
- Request timeout
- Unsupported browser

---

## ⭐ Favorites & Recent Searches

### Favorites

Users can save frequently viewed cities.

Features include:

- Add city to favorites
- Remove city from favorites
- Visual saved state
- Persistent storage
- Quick weather lookup
- Clear all favorites

### Recent Searches

The application automatically stores recently searched cities.

Features include:

- Recent city history
- Quick search
- Duplicate prevention
- Persistent storage
- Remove individual searches
- Clear all recent searches

Data is stored locally using the browser's `localStorage`.

---

## 🌓 Themes & Units

### Dark & Light Mode

The application supports:

- Light theme
- Dark theme
- Automatic system preference detection
- Persistent theme preference

The selected theme is remembered using `localStorage`.

### 🌡️ Temperature Units

Users can switch between:

- Celsius (°C)
- Fahrenheit (°F)

Weather data is requested in metric units and converted client-side for Fahrenheit display.

Wind speed is also converted appropriately:

- Metric: km/h
- Imperial: mph

---

## 🧠 Smart Weather Summary

Atmosphere generates a simple human-readable weather summary based on current conditions.

The summary considers:

- Temperature
- Humidity
- Wind
- Weather condition

Example:

```text
Expect clear sky with mild temperatures around 24°C,
moderate humidity and a light breeze.
```

---

## ⚠️ Weather Advisories

The application generates contextual weather advisories when necessary.

Examples include:

- High heat warnings
- Freezing temperature warnings
- High humidity warnings
- Strong wind warnings
- Heavy rain warnings
- Thunderstorm warnings
- Low visibility warnings

These recommendations are generated dynamically from the weather data.

---

## 🌬️ Air Quality

When available from the API, the dashboard can display:

- Air Quality Index
- AQI category
- PM2.5 concentration

Supported AQI categories include:

- Good
- Fair
- Moderate
- Poor
- Very Poor

Air-quality requests are treated as an optional enhancement so that failure of the air-quality endpoint does not prevent the main weather application from working.

---

## 🎨 Dynamic Weather Environment

The interface dynamically adapts to weather conditions.

Background states can represent:

- Clear daytime
- Clear nighttime
- Cloudy weather
- Rain
- Snow
- Fog
- Thunderstorms

The visual environment changes according to the current weather condition and day/night state.

---

## 💾 Local Storage

The application uses browser `localStorage` to persist:

- Theme preference
- Temperature unit
- Recent searches
- Favorite cities

Stored data is validated before being used to prevent corrupted local storage from breaking the application.

---

## ⌨️ Keyboard Shortcuts

The application includes keyboard-friendly controls.

### `/`

Press `/` to focus the city search field.

### `Escape`

Press `Escape` to leave the active search field.

The application also supports normal keyboard navigation across interactive controls.

---

## 🔄 Loading States

While weather information is being retrieved, the application displays a loading state.

During loading:

- Search controls are temporarily disabled
- Location controls are temporarily disabled
- Existing content is replaced with a skeleton state
- The user receives visual feedback

This prevents accidental duplicate requests.

---

## ❌ Error Handling

The application provides user-friendly error messages for common API and browser problems.

Supported errors include:

### Invalid API Key

```text
Invalid API key
```

### City Not Found

```text
City not found
```

### Network Error

```text
Unable to fetch weather
```

### Rate Limit

```text
Too many requests
```

### Location Permission

```text
Location permission denied
```

### Invalid API Response

```text
Invalid response
```

Errors are displayed through a dedicated UI instead of exposing raw API errors to users.

---

## 🛠️ Tech Stack

### Frontend

- **HTML5**
- **CSS3**
- **Vanilla JavaScript (ES6+)**

### JavaScript Concepts

- `fetch()`
- Promises
- `async/await`
- JSON
- DOM manipulation
- Event listeners
- Template rendering
- Classes
- Array methods
- LocalStorage
- Geolocation API
- Error handling
- Dynamic SVG generation

### CSS Concepts

- CSS variables
- Flexbox
- CSS Grid
- Responsive layouts
- Media queries
- Transitions
- Animations
- Theme variables
- Loading states
- Modern UI components

---

## 🌐 APIs & Browser Features

### OpenWeatherMap API

The application uses OpenWeatherMap for weather information.

Main endpoints include:

```text
Current Weather:
https://api.openweathermap.org/data/2.5/weather

5-Day Forecast:
https://api.openweathermap.org/data/2.5/forecast

Air Pollution:
https://api.openweathermap.org/data/2.5/air_pollution
```

### Browser APIs

The project also uses:

- Fetch API
- Geolocation API
- LocalStorage API
- DOM API
- Media Query API

---


## 🔑 API Key Setup

Create an account on OpenWeatherMap and generate an API key.

Then open:

```text
config.js
```

Add your key:

```javascript
window.ATMOSPHERE_CONFIG = {
    API_KEY: "YOUR_API_KEY_HERE",
    API_BASE: "https://api.openweathermap.org/data/2.5"
};
```

Replace:

```text
YOUR_API_KEY_HERE
```

with your actual API key.

> **Important:** Never publish a private production API key in a public GitHub repository. For a frontend-only internship project, use a development/test key and understand that client-side API keys can be viewed by users.

---

## 🚀 Running the Application

The project is designed as a frontend application.

You can run it using VS Code Live Server.

Open:

```text
index.html
```

with Live Server.

You can also open `index.html` directly in a browser, although some browser security restrictions may affect certain API or geolocation behavior.

For the most reliable experience, use:

```text
http://localhost
```

or another local development server.

---

## 🎯 Usage

### 1. Search for Weather

Enter a city name:

```text
Lahore
```

Then press:

```text
Enter
```

or click the search button.

The application retrieves and displays the latest available weather information.

### 2. Use Current Location

Click:

```text
My Location
```

Allow location access when prompted.

The application uses your latitude and longitude to retrieve weather information.

### 3. Change Temperature Unit

Use:

```text
°C
°F
```

to switch between Celsius and Fahrenheit.

### 4. Change Theme

Use the theme button to switch between:

```text
Light Mode
Dark Mode
```

Your preference is saved automatically.

### 5. Save a Favorite

Click the favorite button on the current weather panel.

The city will be stored locally and can be accessed later.

### 6. Use Recent Searches

Select a city from the Recent Searches section to retrieve its weather again.

---

## 🔍 How It Works

The application follows a simple frontend weather-data pipeline:

```text
User Input
     ↓
City Search / Geolocation
     ↓
Fetch API Request
     ↓
OpenWeatherMap API
     ↓
JSON Response
     ↓
JavaScript State
     ↓
DOM Rendering
     ↓
Weather Dashboard
```

For a city search:

```javascript
fetch("/weather?q=City")
```

For location-based weather:

```javascript
fetch("/weather?lat=LATITUDE&lon=LONGITUDE")
```

The JSON response is processed and converted into UI components dynamically.

---

## 🧩 Code Architecture

The JavaScript application is organized into logical sections.

```text
1. Configuration
2. DOM Cache
3. Local Storage
4. Application State
5. Formatting Helpers
6. Weather Icon Library
7. API Layer
8. Weather Summary
9. Weather Advisories
10. Rendering
11. UI State Management
12. Controllers
13. Event Wiring
14. Application Boot
```

This structure keeps the application maintainable and makes individual features easier to modify.

---

## 🔐 Security Considerations

This project is a frontend-only application.

Because JavaScript executes inside the user's browser, an API key included in frontend code cannot be treated as a secret.

For production applications, API requests should normally be routed through a backend service where sensitive credentials can be protected.

For this internship project, the API key is isolated inside:

```text
config.js
```

and the rest of the application accesses it through:

```javascript
window.ATMOSPHERE_CONFIG
```

Do not commit private production credentials to GitHub.

---

## 📱 Responsive Design

The interface is designed to work across:

### Desktop

```text
1920px
1440px
1280px
```

### Tablet

```text
1024px
768px
```

### Mobile

```text
480px
375px
320px
```

The layout adapts using:

- CSS Grid
- Flexbox
- Responsive typography
- Media queries
- Flexible containers
- Mobile-friendly controls

---

## ♿ Accessibility

Accessibility considerations include:

- Semantic HTML
- ARIA labels
- ARIA pressed states
- Keyboard navigation
- Visible interactive states
- Screen-reader-friendly controls
- Descriptive weather icons
- Accessible error messages
- Focusable buttons
- Meaningful button labels

Dynamic weather icons include appropriate accessibility labels.

---

## 🧪 Testing

The application should be tested against the following scenarios.

### Test 1 — Valid City

```text
Input:
Lahore

Expected:
Current weather information appears.
```

### Test 2 — Invalid City

```text
Input:
XYZInvalidCity123

Expected:
City not found message appears.
```

### Test 3 — Empty Search

```text
Input:
Empty

Expected:
Enter a city name message appears.
```

### Test 4 — Celsius/Fahrenheit

```text
Action:
Switch from °C to °F

Expected:
Temperature values update correctly.
```

### Test 5 — Dark Mode

```text
Action:
Toggle theme

Expected:
Dashboard changes to dark mode.
```

### Test 6 — Favorites

```text
Action:
Save a city

Expected:
City appears in favorites.
```

### Test 7 — Recent Searches

```text
Action:
Search multiple cities

Expected:
Cities appear in recent searches.
```

### Test 8 — Geolocation

```text
Action:
Click My Location

Expected:
Browser requests permission and weather is loaded.
```

### Test 9 — API Failure

```text
Action:
Use an invalid API key

Expected:
Friendly API error appears.
```

### Test 10 — Network Failure

```text
Action:
Disable internet connection

Expected:
Network error message appears.
```

---

## 🌐 Browser Support

The application targets modern browsers supporting ES6+ JavaScript and modern Web APIs.

| Browser | Support |
|---|---|
| Google Chrome | ✅ |
| Microsoft Edge | ✅ |
| Mozilla Firefox | ✅ |
| Safari | ✅ |
| Opera | ✅ |

For geolocation, browser permission and secure-context requirements may apply.

---

## ⚠️ Known Limitations

### API Dependency

The application requires an active weather API connection.

Without a valid API key or internet connection, live weather data cannot be retrieved.

### API Rate Limits

The API provider may enforce request limits depending on the account plan.

### Geolocation

Geolocation depends on:

- Browser support
- User permission
- Device location services
- Secure context requirements

### API Key Exposure

Because this is a frontend-only project, the API key is visible to anyone who can inspect the application.

A production application should use a backend proxy or server-side API integration.

---

## 🔮 Future Improvements

Possible future enhancements include:

- [ ] Weather alerts
- [ ] Severe weather notifications
- [ ] Interactive weather map
- [ ] Radar visualization
- [ ] Precipitation probability
- [ ] UV index
- [ ] Dew point
- [ ] Visibility map
- [ ] Sunrise/sunset visualization
- [ ] Multiple-city comparison
- [ ] Weather history
- [ ] Historical charts
- [ ] Extended 10-day forecast
- [ ] PWA support
- [ ] Offline caching
- [ ] Installable mobile application
- [ ] Push notifications
- [ ] Automatic location detection
- [ ] Weather widgets
- [ ] Share weather results
- [ ] Export weather reports
- [ ] More advanced data visualization

---

## 🎨 Customization

The visual design can be customized through CSS variables.

Example:

```css
:root {
    --primary: #4a7cf7;
    --background: #e8edf5;
    --text: #1a1f2e;
}
```

You can customize:

- Colors
- Typography
- Spacing
- Borders
- Shadows
- Backgrounds
- Animations
- Weather states

---


## 🤝 Contributing

Contributions are welcome.

### Steps

```bash
git fork
git clone
git checkout -b feature/new-feature
```

Make your changes, test the application, commit your work, and submit a pull request.

### Contribution Guidelines

- Keep the code readable
- Follow existing project structure
- Avoid unnecessary dependencies
- Test new functionality
- Update documentation when necessary
- Do not commit API credentials
- Maintain responsive behavior

---

## 📝 License

This project is distributed under the MIT License.

See:

```text
LICENSE
```

for complete license information.

---

## 👩‍💻 Author

**Mahnoor Yasir**
---



## 🙏 Acknowledgments

Special thanks to:

- **OpenWeatherMap** — Weather data API
- **MDN Web Docs** — Web development documentation
- **GitHub** — Version control and repository hosting
- **Visual Studio Code** — Development environment
- **Internee.pk** — Internship task and learning opportunity

---

## 📊 Project Status

```text
Status: Completed
Type: Frontend Development Project
Category: Weather Application
Architecture: Client-Side
```

### Core Requirements

- [x] City weather search
- [x] Temperature display
- [x] Humidity display
- [x] Weather conditions
- [x] Weather icons
- [x] Invalid city handling
- [x] Fetch API
- [x] JSON processing
- [x] Dynamic DOM updates
- [x] Geolocation
- [x] Dynamic weather environment
- [x] Hourly forecast
- [x] 5-day forecast
- [x] Temperature chart
- [x] Air quality
- [x] Favorites
- [x] Recent searches
- [x] Dark/light mode
- [x] Celsius/Fahrenheit
- [x] Responsive design
- [x] Accessibility
- [x] Local storage
- [x] Loading states
- [x] Error handling

---

## ⭐ Show Your Support

If you find this project useful or interesting, consider giving the repository a star.

```text
⭐ Star the repository
🍴 Fork the repository
🐛 Report issues
💡 Suggest improvements
```

---

## 📞 Contact

For questions, feedback, or collaboration:

```text
GitHub:
https://github.com/mahnoor-yasir

LinkedIn:
https://www.linkedin.com/in/mahnoor-yasir

Email:
mahnooryasir04@gmail.com
```

---

## 📌 Important Note

This application is created as a frontend development project and demonstrates practical use of:

```text
HTML5
CSS3
Vanilla JavaScript
Fetch API
OpenWeatherMap API
Geolocation API
LocalStorage API
DOM Manipulation
Responsive Web Design
Accessibility
```

The project does not require:

```text
React
Vue
Angular
Node.js
Express
TypeScript
Tailwind CSS
```

The core application runs entirely on the frontend.

---

## 🌤️ Final Overview

**Atmosphere** combines real-time weather data with a polished, responsive interface to demonstrate practical frontend development skills.

The project covers the complete workflow of a modern API-based frontend application:

```text
User Interaction
       ↓
Input Validation
       ↓
API Request
       ↓
JSON Response
       ↓
Data Processing
       ↓
Dynamic DOM Rendering
       ↓
Responsive Weather Dashboard
```

Built with clean frontend technologies and designed for a professional internship-level portfolio.

---

**Built with HTML5 • CSS3 • Vanilla JavaScript**

**Atmosphere — Weather, beautifully presented.**
