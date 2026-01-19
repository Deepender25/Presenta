# Presenta

Presenta is a powerful, web-based tool designed to create professional video mockups and screenshots. It allows users to wrap their content in device frames, animate scrolling behaviors, and export high-quality media for presentations, portfolios, and social media.

## Features

### Device Mockups
- **Browser Window**: Clean, modern browser interface with customizable URL bar.
- **Mobile Devices**: Realistic iPhone device frames.
- **Responsive Frames**: Dynamic resizing to fit various aspect ratios (16:9, 9:16, 1:1).

### Animation Engine
- **Scroll Modes**: 
    - **Linear**: Smooth, constant-speed scrolling.
    - **Human-Like**: Natural scrolling patterns with pauses and variable speeds.
- **Custom Timeline**: 
    - **Keyframes**: Add and adjust custom stop points along the scroll timeline.
    - **Visual Feedback**: Real-time previews of scroll positions.

### Customization
- **Backgrounds**: Support for solid colors, gradients, and custom image uploads.
- **Styling**: Adjustable corner radius, shadow intensity, and padding.
- **Layout**: Portrait and landscape orientation support.

### Export
- **Formats**: Support for MP4 video and high-resolution PNG screenshots.
- **Performance**: Client-side rendering ensures privacy and speed.

## Technology Stack

- **Backend**: FastAPI (Python) - Handles static file serving and security implementation.
- **Frontend**: Vanilla JavaScript - Zero-dependency architecture for maximum performance.
- **Rendering**: HTML5 Canvas - Real-time compositing and recording.
- **Styling**: CSS3 - Modern Flexbox/Grid layouts with a custom design system.

## Getting Started

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/presenta.git
   ```

2. Navigate to the project directory:
   ```bash
   cd presenta
   ```

3. Create and activate a virtual environment:
   ```bash
   # Windows
   python -m venv venv
   .\venv\Scripts\Activate

   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Running Locally

Start the development server:
```bash
python main.py
```

The application will be available at `http://127.0.0.1:8000`.

## Deployment

This project is configured for deployment on Vercel using the Python serverless runtime.

1. Install the Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel --prod
   ```

Configuration is handled via `vercel.json` to route requests to the FastAPI application.

## Security

The application implements several security best practices:
- **Rate Limiting**: Protects against abuse using `slowapi`.
- **Headers**: Enforces strict transport security and content policies.
- **CORS**: Restricts resource sharing to trusted origins.
- **Host Validation**: Prevents host header injection attacks.

## License

This project is open source and available under the MIT License.
