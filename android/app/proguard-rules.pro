# ============================================================================
# KTS Markets - Production ProGuard / R8 Obfuscation & Shrinking Rules
# React Native 0.74.x + Hermes + Firebase + Navigation + Vector Icons
# ============================================================================

# --- General Optimization & Code Scrambling ---
-repackageclasses
-allowaccessmodification
-dontusemixedcaseclassnames
-dontskipnonpubliclibraryclasses
-verbose

# --- Keep line numbers and source files for crash reporting ---
-keepattributes SourceFile,LineNumberTable,EnclosingMethod,InnerClasses,Signature,*Annotation*

# --- React Native Core & JNI ---
-keep class com.facebook.react.** { *; }
-keep class com.facebook.jni.** { *; }
-keep interface com.facebook.react.bridge.JavaScriptModule { *; }
-keep interface com.facebook.react.bridge.NativeModule { *; }
-keepclassmembers class * extends com.facebook.react.bridge.NativeModule {
    @com.facebook.react.bridge.ReactMethod *;
    @com.facebook.react.bridge.ReactMethodSync *;
}
-keepclassmembers class * {
    @com.facebook.react.uimanager.annotations.ReactProp *;
    @com.facebook.react.uimanager.annotations.ReactPropGroup *;
}
-dontwarn com.facebook.react.**

# --- Hermes JS Engine ---
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# --- React Native Screens & Gesture Handler ---
-keep class com.swmansion.rnscreens.** { *; }
-keep class com.swmansion.gesturehandler.** { *; }
-dontwarn com.swmansion.**

# --- Firebase (Messaging, App) & Google Play Services ---
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**

# --- Google Sign-In ---
-keep class com.reactnativegooglesignin.** { *; }

# --- Async Storage ---
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# --- React Native Vector Icons ---
-keep class com.oblador.vectoricons.** { *; }

# --- React Native WebView ---
-keep class com.reactnativecommunity.webview.** { *; }
-dontwarn com.reactnativecommunity.webview.**

# --- Image Picker ---
-keep class com.imagepicker.** { *; }

# --- OkHttp & Okio (Networking) ---
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn javax.annotation.**
