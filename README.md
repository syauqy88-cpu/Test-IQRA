
# Advancekids IQRA PINTAR

A modern, AI-powered IQRA and Juz Amma learning application designed for children.

## 🚀 Deployment to Netlify

1. **Upload to GitHub**: Create a new repository on GitHub and push all files.
2. **Connect to Netlify**:
   - Go to [Netlify](https://www.netlify.com/) and click "Add new site" > "Import from existing project".
   - Select your GitHub repository.
3. **Set Environment Variables**:
   - In Netlify, go to **Site settings** > **Environment variables**.
   - Add a variable named `API_KEY`.
   - Paste your Google Gemini API Key as the value.
4. **Deploy**: Trigger a manual deploy or push to `main`.

## 📱 Using with FlutterFlow (APK)

1. **Host the App**: Use the Netlify URL generated above (e.g., `https://your-site.netlify.app`).
2. **FlutterFlow Setup**:
   - Add a `WebView` widget to your FlutterFlow project.
   - Set the `Initial URL` to your Netlify URL.
   - Enable `JavaScript Execution`.
   - Enable `Allow Camera/Microphone` if using AI voice features.
3. **Build APK**: Use FlutterFlow's build tool to generate the `.apk` file.

## 🔐 Admin Access
To access the syllabus management or unlock all levels:
1. Click **"Akses Pentadbir"** on the login screen.
2. On first use, create your own password.
3. Use that password for future logins.

---
© 2024 Advancekids Media
