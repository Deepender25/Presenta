<h1 align="center"> Presenta </h1>
<p align="center"> Create Stunning Video Mockups & Screenshots with Professional Device Frames. </p>

<p align="center">
  <img alt="Build" src="https://img.shields.io/badge/Build-Passing-brightgreen?style=for-the-badge">
  <img alt="Python" src="https://img.shields.io/badge/Python-3.8+-blue?style=for-the-badge&logo=python">
  <img alt="License" src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge">
  <img alt="Vercel" src="https://img.shields.io/badge/Deployed-Vercel-black?style=for-the-badge&logo=vercel">
</p>

***

## 📚 Table of Contents

*   [⭐ Overview](#-overview)
*   [✨ Key Features](#-key-features)
*   [🛠️ Tech Stack & Architecture](#-tech-stack--architecture)
*   [📁 Project Structure](#-project-structure)
*   [🚀 Getting Started](#-getting-started)
*   [🔧 Usage](#-usage)
*   [🌍 Deployment](#-deployment)
*   [🤝 Contributing](#-contributing)
*   [📝 License](#-license)

***

## ⭐ Overview

**Presenta** is a powerful web-based application designed to elevate your presentation game. It helps creators, developers, and designers generate high-quality video mockups and screenshots by wrapping content in realistic device frames.

### The Problem

> Presenting digital products often requires complex tools like After Effects or generic mockup generators that lack flexibility. Users struggle to create smooth, realistic scrolling animations or precise screenshots without diving into heavy proprietary software.

### The Solution

Presenta provides a lightweight, browser-based solution. By combining a **FastAPI** backend with a high-performance **Vanilla JS** frontend, it offers real-time rendering on an HTML Canvas. Users can upload images or videos, apply device skins (like Browsers or iPhones), and define custom animation paths.

The tool includes a sophisticated **Smart Dropdown** system for better UI usability and **Security** best practices (Rate Limiting, Trusted Hosts) to ensure a safe production environment.

***

## ✨ Key Features

Presenta is engineered for both ease of use and professional output.

#### 🎨 **Device Mockup Engine**
Instantly wrap your content in professional frames.
*   **Browser Window:** A modern, clean browser interface with a customizable address bar.
*   **Mobile Devices:** Realistic iPhone frames for mobile content showcases.
*   **Responsive:** Automatically adjusts to 16:9, 9:16, or 1:1 aspect ratios.

#### 🎬 **Advanced Animation Control**
Create silky smooth scrolling videos without keyframing nightmares.
*   **Human-Like Scrolling:** Simulates natural reading patterns with pauses and variable speeds.
*   **Custom Timeline:** Add drag-and-drop stops on the timeline to control exactly where the scroll pauses.
*   **Live Preview:** Hover over timeline stops to instantly preview the frame.

#### 🔧 **Smart UI Components**
Experience a glitch-free interface.
*   **Intelligent Dropdowns:** Menus automatically detect screen edges and flip upwards to prevent clipping.
*   **Dynamic Resizing:** Dropdown lists adjust their height based on available viewport space.
*   **Scroll & Click Safety:** Enhanced event handling ensures menus stay open during interaction but close when necessary.

#### 🔒 **Enterprise-Grade Security**
Built with production safety in mind.
*   **Rate Limiting:** Protects resources with `slowapi` (60 requests/min).
*   **Secure Headers:** Implements blocking XSS, Clickjacking, and MIME-sniffing protections.
*   **Host Validation:** Strictly verifies Host headers to prevent injection attacks.

***

## 🛠️ Tech Stack & Architecture

Presenta leverages a modern, clean architecture for maximum performance and easy deployment.

| Technology | Purpose | Why it was Chosen |
| :--- | :--- | :--- |
| **Python (FastAPI)** | Backend Server | High performance, easy async support, and great ecosystem for security middleware. |
| **Vanilla JavaScript** | Frontend Logic | Zero-dependency approach ensures blazing fast load times and direct DOM manipulation. |
| **HTML5 Canvas** | Rendering Engine | Allows for real-time video compositing and frame generation in the browser. |
| **Vercel** | Hosting & Deployment | Seamless serverless deployment for Python apps with global CDN distribution. |

***

## 📁 Project Structure

The project is organized to separate concerns between the backend API and the frontend presentation logic.

```
📂 Presenta/
├── 📄 main.py                  # Entry point: FastAPI app, Middleware, and Routes.
├── 📄 requirements.txt         # Python dependencies (FastAPI, SlowAPI, etc.).
├── 📄 vercel.json              # Configuration for Serverless deployment.
├── 📂 static/
│   ├── 📂 css/                 # Modern, variable-based CSS (style.css, dropdown.css).
│   └── 📂 js/
│       ├── 📄 app.js           # UI Interaction logic (Listeners, Dropdowns).
│       └── 📄 renderer.js      # Core Canvas rendering and animation engine.
├── 📂 templates/
│   └── 📄 index.html           # Main application view (Jinja2 Template).
└── 📄 README.md                # Project documentation.
```

***

## 🚀 Getting Started

Follow these steps to set up Presenta on your local machine.

### Prerequisites

*   **Python:** Version 3.8 or higher.
*   **Pip:** Python package installer.

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/your-username/presenta.git
cd presenta
```

#### 2. Create Virtual Environment

```bash
# Windows
python -m venv venv
.\venv\Scripts\Activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

#### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

***

## 🔧 Usage

### Development Server

Run the application locally using the built-in server or Uvicorn.

```bash
python main.py
```

Open your browser and navigate to:
`http://127.0.0.1:8000`

### 🌍 Deployment

Presenta is optimized for **Vercel**.

1.  **Install Vercel CLI:**
    ```bash
    npm i -g vercel
    ```

2.  **Deploy:**
    ```bash
    vercel --prod
    ```

The `vercel.json` file handles the routing and Python runtime configuration automatically.

***

## 🤝 Contributing

Contributions are welcome! Whether it's a new device frame, valid CSS tweaks, or better animation curves.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

***

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">Made with ❤️ for Creators</p>
<p align="center">
  <a href="#-overview">⬆️ Back to Top</a>
</p>
