# Capacitor rules
-keep class com.getcapacitor.** { *; }
-keep interface com.getcapacitor.** { *; }
-keep class * extends com.getcapacitor.Plugin { *; }
-keep class * extends com.getcapacitor.Bridge { *; }

# Google Play Services
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.android.gms.**

# Firebase (if used)
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**

# Maintain line numbers for easier debugging of stack traces
-keepattributes SourceFile,LineNumberTable

# Standard optimizations
-optimizations !code/simplification/arithmetic,!field/*,!class/merging/*
-optimizationpasses 5
-allowaccessmodification

# Obfuscation
-repackageclasses ''
-allowaccessmodification
-dontusemixedcaseclassnames
-verbose

# Specific to your app's dependencies
-keep class com.capacitor.notifications.** { *; }
-keep class com.capacitor.storage.** { *; }
-keep class com.capacitor.app.** { *; }

# Webview JS Interface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
