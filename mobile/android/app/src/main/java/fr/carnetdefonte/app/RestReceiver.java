package fr.carnetdefonte.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;

/** Boutons de la notification du minuteur, et fin du repos. */
public class RestReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context c, Intent i) {
        String a = i.getAction();
        SharedPreferences p = Rest.prefs(c);
        if (Rest.A_PLUS.equals(a)) {
            long end = Math.max(p.getLong("end", 0), System.currentTimeMillis()) + 30000;
            int total = p.getInt("total", 0) + 30;
            Rest.start(c, end, total, p.getString("title", "Repos"), p.getString("body", ""));
            FontePlugin.emit("plus", end, total);
        } else if (Rest.A_SKIP.equals(a)) {
            Rest.stop(c);
            FontePlugin.emit("skip", 0, 0);
        } else if (Rest.A_END.equals(a)) {
            if (p.getLong("end", 0) == 0) return;
            Rest.ended(c);
            FontePlugin.emit("end", 0, 0);
        }
    }
}
