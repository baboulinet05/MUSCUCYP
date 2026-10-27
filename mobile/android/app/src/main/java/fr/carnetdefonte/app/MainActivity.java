package fr.carnetdefonte.app;

import android.os.Bundle;

import androidx.activity.EdgeToEdge;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(FontePlugin.class);
        // Affichage bord à bord (Android 15+) ; Capacitor gère les marges via les variables --safe-area-inset-*
        EdgeToEdge.enable(this);
        super.onCreate(savedInstanceState);
    }
}
