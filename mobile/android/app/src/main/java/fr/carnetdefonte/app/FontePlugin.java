package fr.carnetdefonte.app;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.os.VibratorManager;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/** Fonctions natives de Carnet de fonte : minuteur de repos sur l'écran verrouillé, widget, vibreur. */
@CapacitorPlugin(name = "Fonte")
public class FontePlugin extends Plugin {
    static FontePlugin instance;
    static volatile boolean foreground = true;

    @Override
    public void load() {
        instance = this;
        Rest.channels(getContext());
    }

    @Override
    protected void handleOnResume() { foreground = true; }

    @Override
    protected void handleOnPause() { foreground = false; }

    static void emit(String action, long end, int total) {
        FontePlugin p = instance;
        if (p == null) return;
        JSObject o = new JSObject();
        o.put("action", action);
        o.put("end", end);
        o.put("total", total);
        p.notifyListeners("rest", o, true);
    }

    @PluginMethod
    public void restStart(PluginCall call) {
        Double end = call.getDouble("end", 0.0);
        Integer total = call.getInt("total", 0);
        String title = call.getString("title", "Repos");
        String body = call.getString("body", "");
        Rest.start(getContext(), end.longValue(), total, title, body);
        call.resolve();
    }

    @PluginMethod
    public void restStop(PluginCall call) {
        Rest.stop(getContext());
        call.resolve();
    }

    @PluginMethod
    public void restGet(PluginCall call) {
        SharedPreferences p = Rest.prefs(getContext());
        JSObject r = new JSObject();
        r.put("end", p.getLong("end", 0));
        r.put("total", p.getInt("total", 0));
        call.resolve(r);
    }

    @PluginMethod
    public void widget(PluginCall call) {
        Context c = getContext();
        c.getSharedPreferences(FonteWidget.PREFS, Context.MODE_PRIVATE).edit()
            .putString("title", call.getString("title", "Carnet de fonte"))
            .putString("line1", call.getString("line1", ""))
            .putString("line2", call.getString("line2", ""))
            .apply();
        FonteWidget.updateAll(c);
        call.resolve();
    }

    @PluginMethod
    public void haptic(PluginCall call) {
        vibrate(getContext(), call.getString("type", "tap"));
        call.resolve();
    }

    @SuppressWarnings("deprecation")
    static void vibrate(Context c, String type) {
        try {
            Vibrator v;
            if (Build.VERSION.SDK_INT >= 31) {
                VibratorManager vm = (VibratorManager) c.getSystemService(Context.VIBRATOR_MANAGER_SERVICE);
                v = vm.getDefaultVibrator();
            } else {
                v = (Vibrator) c.getSystemService(Context.VIBRATOR_SERVICE);
            }
            if (v == null || !v.hasVibrator()) return;
            VibrationEffect e;
            if ("end".equals(type)) {
                e = VibrationEffect.createWaveform(new long[]{0, 220, 120, 220, 120, 420}, -1);
            } else if ("pr".equals(type)) {
                e = VibrationEffect.createWaveform(new long[]{0, 60, 50, 60, 50, 200}, -1);
            } else if (Build.VERSION.SDK_INT >= 29) {
                e = VibrationEffect.createPredefined("heavy".equals(type) ? VibrationEffect.EFFECT_HEAVY_CLICK : VibrationEffect.EFFECT_CLICK);
            } else {
                e = VibrationEffect.createOneShot("heavy".equals(type) ? 45 : 20, VibrationEffect.DEFAULT_AMPLITUDE);
            }
            v.vibrate(e);
        } catch (Exception ignored) { }
    }
}
