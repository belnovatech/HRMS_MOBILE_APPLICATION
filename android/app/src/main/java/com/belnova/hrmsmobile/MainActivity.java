package com.belnova.hrmsmobile;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(NativeDocumentManagerPlugin.class);
        super.onCreate(savedInstanceState);
    }
}

