// Ardiyesiz Giriş — App module (TWA)
import java.util.Properties

plugins {
    id("com.android.application")
}

android {
    namespace = "com.ardiyesizgiris.web"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.ardiyesizgiris.web"
        minSdk = 21
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        manifestPlaceholders["hostName"] = "www.ardiyesizgiris.com"
        manifestPlaceholders["defaultUrl"] = "https://www.ardiyesizgiris.com"
        manifestPlaceholders["applicationName"] = "Ardiyesiz Giriş"
        manifestPlaceholders["statusBarColor"] = "#10b981"
        manifestPlaceholders["backgroundColor"] = "#ffffff"
        manifestPlaceholders["launchUrl"] = "/"
    }

    signingConfigs {
        create("release") {
            // Load keystore properties from external file (not committed)
            val keystoreProps = Properties()
            val keystoreFile = rootProject.file("keystore.properties")
            if (keystoreFile.exists()) {
                keystoreProps.load(keystoreFile.inputStream())
                storeFile = rootProject.file(keystoreProps.getProperty("storeFile"))
                storePassword = keystoreProps.getProperty("storePassword")
                keyAlias = keystoreProps.getProperty("keyAlias")
                keyPassword = keystoreProps.getProperty("keyPassword")
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("release")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    // TWA (Trusted Web Activity) — Google's official PWA wrapper library
    implementation("com.google.androidbrowserhelper:androidbrowserhelper:2.5.0")
}
