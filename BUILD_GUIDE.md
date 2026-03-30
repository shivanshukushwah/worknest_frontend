# Worknest Standalone APK Build Guide

Follow these steps to generate a standalone APK for your Android device.

## Prerequisites
1. Ensure you have the [EAS CLI](https://docs.expo.dev/build/setup/) installed:
   ```bash
   npm install -g eas-cli
   ```
2. Log in to your Expo account:
   ```bash
   eas login
   ```

---

## Option 1: Cloud Build (Recommended)
This uses Expo's servers to build the APK. You don't need Android Studio installed.

1. **Start the build**:
   ```bash
   eas build -p android --profile production
   ```
2. **Follow the prompts**:
   - If asked to "Generate a new Android Keystore", select **Yes**.
   - If asked about "EAS Project ID", select **Yes** to link it.
3. **Download**: Once finished, EAS will provide a URL to download the `.apk` file.
4. **Install**: Transfer the APK to your phone and install it!

---

## Option 2: Local Build (Requires Android SDK)
This builds the APK on your own machine using Gradle.

1. **Prebuild the project**:
   ```bash
   npx expo prebuild
   ```
2. **Build the APK**:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```
3. **Find the file**: The APK will be located at:
   `android/app/build/outputs/apk/release/app-release.apk`

---

## Option 3: GitHub Actions (Easiest & Most Reliable)
This uses GitHub's runners to build your APK automatically. No local setup or Expo cloud limits!

1. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Update build config"
   git push origin main
   ```
2. **Trigger the build**:
   - Go to your GitHub repository in your browser.
   - Click the **Actions** tab.
   - Select **Build Android APK** from the left sidebar.
   - Click the **Run workflow** dropdown and then the **Run workflow** button.
3. **Download**: Once finished, download the `worknest-apk` artifact from the bottom of the run page.
4. **Install**: Unzip the file on your laptop, transfer the `.apk` inside to your phone, and install!

---

## Troubleshooting
- **API URL**: Ensure your `EXPO_PUBLIC_API_URL` in `.env` is set to your production backend (Render URL).
- **Permissions**: I have already added `CAMERA` and `STORAGE` permissions in `app.json`.
- **Package Name**: The app is configured with `com.worknest.app`.

> [!TIP]
> Use **Option 1 (Cloud Build)** if you want the easiest experience and don't want to deal with local Android environment issues.
