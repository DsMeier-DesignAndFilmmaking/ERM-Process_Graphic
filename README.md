# ERM Process Diagram

A professional, interactive circular Enterprise Risk Management (ERM) process diagram for Purdue University's Audit website.

## 📋 Overview

This project displays a circular process flow diagram representing the 4 phases of Enterprise Risk Management. The diagram features:
- Circular layout with 4 distinct process steps
- Animated arrows connecting each step
- Interactive hover effects and highlights
- Responsive design for desktop, tablet, and mobile devices
- Professional color scheme matching Purdue branding
- Accessible design with keyboard navigation support

## 🎨 Features

### Visual Design
- **Color Scheme**: Black background with gold/tan phase boxes and white description boxes
- **Typography**: Clean sans-serif font with varying weights for hierarchy
- **Layout**: Circular arrangement with steps positioned around the perimeter

### Interactive Features
- **Hover Effects**: Steps scale up and change color on hover
- **Animated Arrows**: Curved SVG arrows connecting each step
- **Responsive**: Adapts to different screen sizes
- **Accessible**: Keyboard navigation and ARIA labels included

### Process Steps
1. **Identification** - Phase 1
2. **Assessment** - Phase 2
3. **Migration** - Phase 3
4. **Monitoring & Communication** - Phase 4

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No server or build tools required

### Installation
1. Download or clone the project files
2. Ensure all files are in the same directory:
   - `index.html`
   - `style.css`
   - `script.js`
   - `README.md`

### Running the Project
1. Open `index.html` in a web browser
2. The diagram will be displayed and fully interactive

### Alternative (Local Server)
For best results, use a local development server:

**Python 3:**
```bash
python -m http.server 8000
```
Then navigate to `http://localhost:8000`

**Node.js (with http-server):**
```bash
npm install -g http-server
http-server
```

**VS Code Live Server Extension:**
- Install the "Live Server" extension
- Right-click `index.html` and select "Open with Live Server"

## 📁 Project Structure

```
erm-process/
│
├── index.html      # Main HTML structure
├── style.css       # Styling and layout
├── script.js       # Interactive features and arrow generation
└── README.md       # This file
```

## 🎯 Customization

### Changing Colors
Edit the CSS variables in `style.css`:
```css
:root {
    --bg-dark: #000000;          /* Background color */
    --phase-gold: #BD9D64;        /* Phase box color */
    --text-light: #FFFFFF;        /* Light text */
    --text-dark: #000000;         /* Dark text */
    --accent-hover: #D4B682;      /* Hover color */
}
```

### Adding/Removing Steps
1. Add or remove step divs in `index.html`
2. Update the positioning CSS for each `.step-n` class
3. The JavaScript will automatically adjust arrows

### Modifying Content
Edit the step content in `index.html`:
- Change step titles in `.step-title`
- Update descriptions in `.step-description`
- Modify phase labels in `.step-label`

## 🌐 Browser Compatibility

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Opera (latest)

## 📱 Responsive Breakpoints

- **Desktop**: 1024px and above
- **Tablet**: 768px - 1023px
- **Mobile**: 480px - 767px
- **Small Mobile**: Below 480px

## ♿ Accessibility Features

- Semantic HTML5 elements
- ARIA labels on interactive elements
- Keyboard navigation support (Tab, Enter, Space)
- Focus indicators for keyboard users
- High contrast colors

## 🛠️ Technical Details

### Technologies Used
- **HTML5**: Semantic markup
- **CSS3**: Flexbox, animations, custom properties
- **JavaScript (ES6)**: Arrow generation, event handling
- **SVG**: Dynamic arrow paths

### Key Features Implementation
- **Circular Layout**: CSS absolute positioning with calculated coordinates
- **SVG Arrows**: Dynamically generated using Bezier curves
- **Responsive Design**: CSS media queries and relative units
- **Animations**: CSS transitions and transforms

## 📝 License

This project is created for Purdue University's Audit website.

## 🤝 Contributing

For updates or modifications, please follow the existing code structure and maintain accessibility standards.

## 📧 Support

For questions or issues, please contact the Purdue University Audit department.

---

**Version**: 1.0  
**Last Updated**: 2024  
**Maintained by**: Purdue University Audit Team
