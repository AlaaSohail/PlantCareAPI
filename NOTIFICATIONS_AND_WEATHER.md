# Plant Care - Push Notifications, Care Reminders, and Weather Alerts

This version keeps the existing API routes and adds production-ready notification support for:

- FCM push notifications
- recurring plant reminders
- scheduled watering/fertilizer/etc. tasks
- in-app notification history
- severe weather alerts from Open-Meteo using the user's saved latitude/longitude
- per-user notification preferences
- user timezone support

## 1. Required Render environment variables

Existing Firebase Admin values:

```env
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
```

Existing location variable:

```env
GEOAPIFY_KEY=...
```

Optional:

```env
CORS_ORIGINS=https://another-web-client.example.com
```

Do not commit `.env` or a Firebase service-account JSON file.

## 2. Run database migrations once

```bash
npm install
npm run migrate
```

`002_notifications_weather.sql` adds notification preferences, task/reminder delivery tracking, notification metadata, and weather-alert deduplication.

## 3. Background jobs

If the Render web service is always running, the API runs these jobs internally:

- reminder check: every minute
- task schedule check: every minute
- weather forecast check: hourly at minute 15

If the Render service can sleep, these background jobs are not reliable. For production use an always-on service, or configure a Render Cron Job and set this on the web service:

```env
DISABLE_INTERNAL_CRON=true
```

Then have the Cron Job run:

```bash
npm run jobs:run
```

For care reminders, a one-minute schedule is ideal. Weather itself is deduplicated so checking more often will not spam users.

## 4. Flutter: save/refresh the FCM token

After login and after the app JWT is saved:

```dart
final fcmToken = await FirebaseMessaging.instance.getToken();

if (fcmToken != null && fcmToken.isNotEmpty) {
  await api.put(
    '/users/fcm-token',
    data: {'fcmToken': fcmToken},
  );
}
```

Also send refreshed tokens, otherwise notifications can stop later:

```dart
FirebaseMessaging.instance.onTokenRefresh.listen((newToken) async {
  final appToken = getIt<CacheHelper>().getDataString(key: ApiKeys.token);

  if (appToken == null || appToken.isEmpty) return;

  try {
    await api.put(
      '/users/fcm-token',
      data: {'fcmToken': newToken},
    );
  } catch (_) {}
});
```

The API automatically removes invalid FCM tokens when Firebase reports that a registration token is no longer valid.

## 5. Notification settings

Get settings:

```http
GET /api/users/notification-settings
Authorization: Bearer <JWT>
```

Update settings:

```http
PUT /api/users/notification-settings
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "notifications_enabled": true,
  "task_notifications_enabled": true,
  "weather_alerts_enabled": true,
  "timezone": "Asia/Hebron"
}
```

When Flutter calls the existing location endpoint, the backend also tries to save the IANA timezone returned by Geoapify, so the task reminder time can be interpreted in the user's local timezone.

## 6. In-app notification center

```http
GET    /api/notifications
PATCH  /api/notifications/:id/read
PATCH  /api/notifications/read-all
DELETE /api/notifications/:id
```

The existing test route remains:

```http
POST /api/notifications/test
```

## 7. Plant reminders

Existing URLs remain compatible in shape:

```http
POST   /api/plants/:plantId/reminders
GET    /api/plants/:plantId/reminders
PUT    /api/plants/:plantId/reminders/:reminderId
PUT    /api/plants/:plantId/reminders/:reminderId/complete
DELETE /api/plants/:plantId/reminders/:reminderId
```

Create example:

```json
{
  "type": "watering",
  "title": "Water Monstera",
  "description": "Check the top soil first.",
  "reminder_date": "2026-09-19T16:30:00+03:00",
  "repeat_type": "weekly"
}
```

Supported repeat values: `once`, `daily`, `weekly`, `monthly`.

The API now verifies reminder ownership so one user cannot modify another user's reminder.

## 8. Recurring task schedules

Existing task endpoints continue to work:

```http
GET    /api/tasks/schedules
POST   /api/tasks/schedules
GET    /api/tasks/today?date=YYYY-MM-DD
PATCH  /api/tasks/:id
DELETE /api/tasks/:id
POST   /api/tasks/:id/complete
```

When `next_due_date + reminder_time` becomes due in the user's timezone, the API sends a push and writes the same event to the in-app notification table. `last_notified_due_date` prevents duplicate pushes.

## 9. Weather alerts

Flutter can continue using Open-Meteo directly for the weather card. The backend separately calls Open-Meteo because server-side checks are required when the app is closed.

Current weather-alert endpoint:

```http
GET /api/weather/alerts
Authorization: Bearer <JWT>
```

Response example:

```json
{
  "success": true,
  "has_warning": true,
  "alerts": [
    {
      "date": "2026-09-20",
      "alertType": "strong_wind+thunderstorm",
      "severity": "severe",
      "title": "Severe weather warning ⚠️",
      "message": "..."
    }
  ]
}
```

The background weather job currently warns for meaningful plant-care risks such as thunderstorms, strong wind gusts, heavy rain, or heavy snow. Alerts are stored and deduplicated so the same forecast event is not repeatedly pushed.

## 10. Notification tap routing in Flutter

Push payloads include a `type` field:

- `task` -> includes `taskId`, `plantId`, `taskType`
- `reminder` -> includes `reminderId`, `plantId`
- `weather` -> includes `severity`, `forecastDate`, `alertType`

Use `FirebaseMessaging.onMessageOpenedApp` and `FirebaseMessaging.instance.getInitialMessage()` to route the user to the correct screen when the app was backgrounded or terminated.

## 11. Important production note

The database currently stores one FCM token on each user. This is fine for the current mobile app. If you later support multiple simultaneous phones/tablets per account, migrate tokens to a separate `user_devices` table so each account can have multiple active FCM tokens.
