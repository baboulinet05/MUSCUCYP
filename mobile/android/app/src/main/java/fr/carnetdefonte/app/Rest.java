package fr.carnetdefonte.app;

import android.app.AlarmManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

/** Minuteur de repos : notification avec compte à rebours, boutons « +30 s » et « Passer », alerte à la fin. */
final class Rest {
    static final String CH_TIMER = "minuteur";
    static final String CH_END = "repos";
    static final int ID_TIMER = 41;
    static final int ID_END = 42;
    static final String A_PLUS = "fr.carnetdefonte.app.REST_PLUS";
    static final String A_SKIP = "fr.carnetdefonte.app.REST_SKIP";
    static final String A_END = "fr.carnetdefonte.app.REST_END";

    private Rest() { }

    static SharedPreferences prefs(Context c) {
        return c.getSharedPreferences("fonte_rest", Context.MODE_PRIVATE);
    }

    static void channels(Context c) {
        if (Build.VERSION.SDK_INT < 26) return;
        NotificationManager nm = c.getSystemService(NotificationManager.class);
        if (nm == null) return;
        NotificationChannel t = new NotificationChannel(CH_TIMER, "Minuteur de repos", NotificationManager.IMPORTANCE_LOW);
        t.setDescription("Compte à rebours du repos, visible sur l'écran verrouillé");
        t.setShowBadge(false);
        t.setLockscreenVisibility(NotificationCompat.VISIBILITY_PUBLIC);
        nm.createNotificationChannel(t);
        NotificationChannel e = new NotificationChannel(CH_END, "Fin du repos", NotificationManager.IMPORTANCE_HIGH);
        e.setDescription("Prévient quand le temps de repos est écoulé");
        e.enableVibration(true);
        e.setLockscreenVisibility(NotificationCompat.VISIBILITY_PUBLIC);
        nm.createNotificationChannel(e);
    }

    private static PendingIntent broadcast(Context c, String action, int code) {
        Intent i = new Intent(c, RestReceiver.class).setAction(action);
        return PendingIntent.getBroadcast(c, code, i, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
    }

    static PendingIntent openApp(Context c) {
        Intent i = c.getPackageManager().getLaunchIntentForPackage(c.getPackageName());
        if (i == null) i = new Intent(c, MainActivity.class);
        i.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        return PendingIntent.getActivity(c, 7, i, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
    }

    static void start(Context c, long end, int total, String title, String body) {
        long now = System.currentTimeMillis();
        if (end <= now + 500) { stop(c); return; }
        prefs(c).edit().putLong("end", end).putInt("total", total).putString("title", title).putString("body", body).apply();
        channels(c);
        NotificationManagerCompat nm = NotificationManagerCompat.from(c);
        try { nm.cancel(ID_END); } catch (Exception ignored) { }
        NotificationCompat.Builder b = new NotificationCompat.Builder(c, CH_TIMER)
            .setSmallIcon(R.drawable.ic_stat_fonte)
            .setColor(0xFFEE4B3F)
            .setContentTitle(title)
            .setContentText(body == null || body.isEmpty() ? "Repos en cours" : body)
            .setWhen(end)
            .setShowWhen(true)
            .setUsesChronometer(true)
            .setChronometerCountDown(true)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setSilent(true)
            .setCategory(NotificationCompat.CATEGORY_STOPWATCH)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setTimeoutAfter(end - now + 1000)
            .setContentIntent(openApp(c))
            .addAction(0, "+30 s", broadcast(c, A_PLUS, 1))
            .addAction(0, "Passer", broadcast(c, A_SKIP, 2));
        try { nm.notify(ID_TIMER, b.build()); } catch (SecurityException ignored) { }
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        if (am != null) {
            PendingIntent pi = broadcast(c, A_END, 3);
            try {
                if (Build.VERSION.SDK_INT >= 31 && !am.canScheduleExactAlarms()) am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, end, pi);
                else am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, end, pi);
            } catch (SecurityException e) {
                am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, end, pi);
            }
        }
    }

    static void stop(Context c) {
        prefs(c).edit().putLong("end", 0).apply();
        NotificationManagerCompat nm = NotificationManagerCompat.from(c);
        nm.cancel(ID_TIMER);
        nm.cancel(ID_END);
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        if (am != null) am.cancel(broadcast(c, A_END, 3));
    }

    static void ended(Context c) {
        SharedPreferences p = prefs(c);
        String body = p.getString("body", "");
        p.edit().putLong("end", 0).apply();
        NotificationManagerCompat nm = NotificationManagerCompat.from(c);
        nm.cancel(ID_TIMER);
        if (FontePlugin.foreground && FontePlugin.instance != null) return; // l'appli est ouverte : elle sonne elle-même
        NotificationCompat.Builder b = new NotificationCompat.Builder(c, CH_END)
            .setSmallIcon(R.drawable.ic_stat_fonte)
            .setColor(0xFFEE4B3F)
            .setContentTitle("Repos terminé")
            .setContentText(body == null || body.isEmpty() ? "À la série suivante !" : body)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setAutoCancel(true)
            .setContentIntent(openApp(c));
        try { nm.notify(ID_END, b.build()); } catch (SecurityException ignored) { }
        FontePlugin.vibrate(c, "end");
    }
}
