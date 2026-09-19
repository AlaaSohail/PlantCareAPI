const axios = require("axios");

const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";

const THUNDERSTORM_CODES = new Set([95, 96, 99]);
const HEAVY_RAIN_CODES = new Set([65, 67, 82]);
const HEAVY_SNOW_CODES = new Set([75, 77, 86]);

const fetchWeatherForecast = async (latitude, longitude) => {
    const response = await axios.get(WEATHER_URL, {
        timeout: 12000,
        params: {
            latitude,
            longitude,
            daily: [
                "weather_code",
                "precipitation_probability_max",
                "precipitation_sum",
                "rain_sum",
                "snowfall_sum",
                "wind_gusts_10m_max",
            ].join(","),
            timezone: "auto",
            forecast_days: 3,
            wind_speed_unit: "kmh",
        },
    });

    return response.data;
};

const getSeverityRank = (severity) => ({ info: 0, warning: 1, severe: 2 }[severity] ?? 0);

const evaluateWeatherAlerts = (forecast) => {
    const daily = forecast?.daily || {};
    const dates = daily.time || [];
    const alerts = [];

    for (let i = 0; i < dates.length; i += 1) {
        const date = dates[i];
        const weatherCode = Number(daily.weather_code?.[i] ?? 0);
        const rain = Number(daily.rain_sum?.[i] ?? 0);
        const precipitation = Number(daily.precipitation_sum?.[i] ?? 0);
        const precipitationProbability = Number(
            daily.precipitation_probability_max?.[i] ?? 0
        );
        const snowfall = Number(daily.snowfall_sum?.[i] ?? 0);
        const windGust = Number(daily.wind_gusts_10m_max?.[i] ?? 0);

        const reasons = [];
        let severity = "warning";

        if (THUNDERSTORM_CODES.has(weatherCode)) {
            reasons.push("thunderstorm");
            if ([96, 99].includes(weatherCode)) severity = "severe";
        }

        if (HEAVY_RAIN_CODES.has(weatherCode) || rain >= 25 || precipitation >= 30) {
            reasons.push("heavy_rain");
            if (rain >= 50 || precipitation >= 60) severity = "severe";
        }

        if (HEAVY_SNOW_CODES.has(weatherCode) || snowfall >= 5) {
            reasons.push("heavy_snow");
            if (snowfall >= 15) severity = "severe";
        }

        if (windGust >= 60) {
            reasons.push("strong_wind");
            if (windGust >= 80) severity = "severe";
        }

        if (!reasons.length) continue;

        const uniqueReasons = [...new Set(reasons)].sort();
        const parts = [];

        if (uniqueReasons.includes("thunderstorm")) parts.push("thunderstorms");
        if (uniqueReasons.includes("strong_wind")) parts.push(`wind gusts up to ${Math.round(windGust)} km/h`);
        if (uniqueReasons.includes("heavy_rain")) parts.push(`heavy rain around ${Math.round(Math.max(rain, precipitation))} mm`);
        if (uniqueReasons.includes("heavy_snow")) parts.push(`snowfall around ${Math.round(snowfall)} cm`);

        const title = severity === "severe" ? "Severe weather warning ⚠️" : "Weather alert ⚠️";
        const message = `Forecast for ${date}: ${parts.join(", ")}. Protect sensitive plants and avoid unnecessary watering.`;
        const alertType = uniqueReasons.join("+");

        alerts.push({
            date,
            alertType,
            severity,
            title,
            message,
            alertKey: `weather:${date}:${alertType}`,
            metadata: {
                weatherCode,
                rain,
                precipitation,
                precipitationProbability,
                snowfall,
                windGust,
                timezone: forecast?.timezone || null,
            },
        });
    }

    return alerts.sort((a, b) => getSeverityRank(b.severity) - getSeverityRank(a.severity));
};

const getWeatherAlertsForLocation = async (latitude, longitude) => {
    const forecast = await fetchWeatherForecast(latitude, longitude);
    return {
        timezone: forecast.timezone,
        alerts: evaluateWeatherAlerts(forecast),
        forecast,
    };
};

module.exports = {
    fetchWeatherForecast,
    evaluateWeatherAlerts,
    getWeatherAlertsForLocation,
};
