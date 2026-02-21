<div align="center">
  <img src="https://via.placeholder.com/150x150.png?text=Presenta+Logo" alt="Presenta Logo" width="120" height="120">
  
  # ✨ Presenta ✨
  
  **Create Stunning Video Mockups & Screenshots with Professional Device Frames.**
  
  <p align="center">
    <img alt="Build" src="https://img.shields.io/badge/Build-Passing-brightgreen?style=for-the-badge&logo=github">
    <img alt="Python" src="https://img.shields.io/badge/Python-3.8+-blue?style=for-the-badge&logo=python">
    <img alt="FastAPI" src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white">
    <img alt="Vercel" src="https://img.shields.io/badge/Deployed-Vercel-black?style=for-the-badge&logo=vercel">
    <img alt="License" src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge">
  </p>

  <p align="center">
    <a href="#-overview">Overview</a> •
    <a href="#-gallery--demos">Gallery</a> •
    <a href="#-key-features">Features</a> •
    <a href="#-getting-started">Getting Started</a>
  </p>
</div>

---

## 📸 Gallery & Demos

Check out what you can create with **Presenta**! Below are some examples of our video exports and high-quality screenshots.

### 🎥 Videos
<div align="center">
  <table>
    <tr>
      <td align="center">
        <!-- 🔥 To use videos hosted in this repository, place 'demo1.mp4' in an 'assets' folder and push to GitHub. 🔥 -->
        <video width="400" autoplay loop muted playsinline>
          <source src="./assets/demo1.mp4" type="video/mp4">
          Your browser does not support the video tag.
        </video>
        <br/><b>Smooth Scrolling Demo</b>
      </td>
      <td align="center">
        <!-- 🔥 To use videos hosted in this repository, place 'demo2.mp4' in an 'assets' folder and push to GitHub. 🔥 -->
        <video width="400" autoplay loop muted playsinline>
          <source src="./assets/demo2.mp4" type="video/mp4">
          Your browser does not support the video tag.
        </video>
        <br/><b>Device Frame Export</b>
      </td>
    </tr>
  </table>
</div>

### 🖼️ Screenshots
<div align="center">
  <table>
    <tr>
      <td align="center">
        <!-- 🔥 Place 'screenshot1.png' in the 'assets' folder and push to GitHub. 🔥 -->
        <img src="./assets/screenshot1.png" alt="Screenshot 1 Example" width="400"/>
        <br/><b>Browser Window Frame</b>
      </td>
      <td align="center">
        <!-- 🔥 Place 'screenshot2.png' in the 'assets' folder and push to GitHub. 🔥 -->
        <img src="./assets/screenshot2.png" alt="Screenshot 2 Example" width="400"/>
        <br/><b>Mobile Mockup View</b>
      </td>
    </tr>
  </table>
</div>

---

## ⭐ Overview

**Presenta** is a powerful web-based application designed to elevate your presentation game. It helps creators, developers, and designers generate high-quality video mockups and screenshots by wrapping content in realistic device frames.

### The Problem 😩
> Presenting digital products often requires complex tools like After Effects or generic mockup generators that lack flexibility. Users struggle to create smooth, realistic scrolling animations or precise screenshots without diving into heavy proprietary software.

### The Solution 💡
Presenta provides a lightweight, browser-based solution. By combining a **FastAPI** backend with a high-performance **Vanilla JS** frontend, it offers real-time rendering on an HTML Canvas. Users can upload images or videos, apply device skins (like Browsers or iPhones), and define custom animation paths.

The tool includes a sophisticated **Smart Dropdown** system for better UI usability and **Security** best practices (Rate Limiting, Trusted Hosts) to ensure a safe production environment.

---

## ✨ Key Features

Presenta is engineered for both ease of use and professional output.

#### 🎨 **Device Mockup Engine**
Instantly wrap your content in professional frames.
*   🖥️ **Browser Window:** A modern, clean browser interface with a customizable address bar.
*   📱 **Mobile Devices:** Realistic iPhone frames for mobile content showcases.
*   📐 **Responsive:** Automatically adjusts to 16:9, 9:16, or 1:1 aspect ratios.

#### 🎬 **Advanced Animation Control**
Create silky smooth scrolling videos without keyframing nightmares.
*   🌊 **Human-Like Scrolling:** Simulates natural reading patterns with pauses and variable speeds.
*   ⏱️ **Custom Timeline:** Add drag-and-drop stops on the timeline to control exactly where the scroll pauses.
*   👀 **Live Preview:** Hover over timeline stops to instantly preview the frame.

#### 🔧 **Smart UI Components**
Experience a glitch-free interface.
*   🧠 **Intelligent Dropdowns:** Menus automatically detect screen edges and flip upwards to prevent clipping.
*   📏 **Dynamic Resizing:** Dropdown lists adjust their height based on available viewport space.
*   🛡️ **Scroll & Click Safety:** Enhanced event handling ensures menus stay open during interaction but close when necessary.

#### 🔒 **Enterprise-Grade Security**
Built with production safety in mind.
*   🚦 **Rate Limiting:** Protects resources with `slowapi` (60 requests/min).
*   🔐 **Secure Headers:** Implements blocking XSS, Clickjacking, and MIME-sniffing protections.
*   🕵️ **Host Validation:** Strictly verifies Host headers to prevent injection attacks.

---

## 🛠️ Tech Stack & Architecture

Presenta leverages a modern, clean architecture for maximum performance and easy deployment.

| Technology | Purpose | Why it was Chosen |
| :--- | :--- | :--- |
| **Python (FastAPI)** | Backend Server | High performance, easy async support, and great ecosystem for security middleware. |
| **Vanilla JavaScript**| Frontend Logic | Zero-dependency approach ensures blazing fast load times and direct DOM manipulation. |
| **HTML5 Canvas** | Rendering Engine | Allows for real-time video compositing and frame generation in the browser. |
| **Vercel** | Hosting | Seamless serverless deployment for Python apps with global CDN distribution. |

---

## 📁 Project Structure

```bash
📂 Presenta/
├── 📄 main.py                  # Entry point: FastAPI app, Middleware, and Routes
├── 📄 requirements.txt         # Python dependencies
├── 📄 vercel.json              # Config for Serverless deployment
├── 📂 static/
│   ├── 📂 css/                 # Modern, variable-based CSS
│   └── 📂 js/
│       ├── 📄 app.js           # UI Interaction logic
│       └── 📄 renderer.js      # Core Canvas rendering and animation engine
├── 📂 templates/
│   └── 📄 index.html           # Main application view (Jinja2)
└── 📄 README.md                # Project documentation
```

---

## 🚀 Getting Started

Follow these steps to set up Presenta on your local machine.

### Prerequisites
- **Python** 3.8+
- **pip** package manager

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/presenta.git
cd presenta
```

### 2. Create Virtual Environment
```bash
# Windows
python -m venv venv
.\venv\Scripts\Activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run Development Server
```bash
python main.py
```
Open your browser and navigate to: [http://127.0.0.1:8000](http://127.0.0.1:8000)

---

## 🌍 Deployment

Presenta is optimized for **Vercel**.
1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel --prod`
*(The `vercel.json` file handles all routing and Python runtime configuration automatically)*

---

## 🤝 Contributing

Contributions are always welcome! Whether it's a new device frame, CSS tweaks, or better animation curves.
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License
Distributed under the MIT License. See `LICENSE` for more information.

<div align="center">
  <i>Made with ❤️ for Creators.</i><br>
  <a href="#-presenta-">⬆️ Back to Top</a>
</div>
