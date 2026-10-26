package fr.carnetdefonte.app;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

/** Widget d'écran d'accueil : séance du jour et régularité. */
public class FonteWidget extends AppWidgetProvider {
    static final String PREFS = "fonte_widget";

    @Override
    public void onUpdate(Context c, AppWidgetManager m, int[] ids) {
        for (int id : ids) draw(c, m, id);
    }

    static void draw(Context c, AppWidgetManager m, int id) {
        SharedPreferences p = c.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        RemoteViews v = new RemoteViews(c.getPackageName(), R.layout.widget_fonte);
        v.setTextViewText(R.id.w_title, p.getString("title", "Carnet de fonte"));
        v.setTextViewText(R.id.w_line1, p.getString("line1", "Ouvre l'appli pour voir ta séance du jour"));
        v.setTextViewText(R.id.w_line2, p.getString("line2", ""));
        v.setOnClickPendingIntent(R.id.w_root, Rest.openApp(c));
        m.updateAppWidget(id, v);
    }

    static void updateAll(Context c) {
        AppWidgetManager m = AppWidgetManager.getInstance(c);
        int[] ids = m.getAppWidgetIds(new ComponentName(c, FonteWidget.class));
        for (int id : ids) draw(c, m, id);
    }
}
