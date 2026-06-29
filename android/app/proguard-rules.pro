# Ardiyesiz Giriş — ProGuard / R8 rules
# TWA uses the androidbrowserhelper library; keep its public API
-keep class com.google.androidbrowserhelper.** { *; }
