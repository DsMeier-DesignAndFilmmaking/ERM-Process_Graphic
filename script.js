/**
 * ERM Process Diagram - Version 3
 * Math-based circular positioning with smooth Bezier curve arrows
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        arrowColor: '#BD9D64',
        arrowThickness: 4,
        arrowOffset: 35, // Distance from card center to arrow start/end
        hoverGlowColor: '#D4B682',
        hoverGlowThickness: 6,
        circleRadiusRatio: 0.35 // Percentage of container for circle radius
    };

    // DOM Elements
    let arrowsSVG;
    let steps;

    /**
     * Position steps in a mathematically perfect circle using sine/cosine
     */
    function positionStepsInCircle() {
        const container = document.querySelector('.process-container');
        const containerRect = container.getBoundingClientRect();
        
        // Get actual container dimensions
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;
        const size = Math.min(containerWidth, containerHeight);
        
        // Calculate center point
        const centerX = containerWidth / 2;
        const centerY = containerHeight / 2;
        
        // Calculate circle radius
        const radius = size * CONFIG.circleRadiusRatio;
        
        // Number of steps
        const numSteps = steps.length;
        
        // Calculate angle increment for each step (360 degrees / number of steps)
        const angleIncrement = (2 * Math.PI) / numSteps;
        
        // Starting angle (top of circle, -90 degrees in radians)
        const startAngle = -Math.PI / 2;
        
        // Position each step using sine/cosine calculations
        steps.forEach((step, index) => {
            // Calculate angle for this step (starting from top, going clockwise)
            const angle = startAngle + (angleIncrement * index);
            
            // Calculate x and y positions using sine/cosine
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            // Position the step
            step.style.left = x + 'px';
            step.style.top = y + 'px';
        });
        
        return { centerX, centerY, radius };
    }

    /**
     * Initialize the diagram
     */
    function init() {
        arrowsSVG = document.querySelector('.arrows');
        steps = document.querySelectorAll('.step');
        
        if (!arrowsSVG || steps.length === 0) {
            console.error('Required elements not found');
            return;
        }

        // Position steps and generate arrows after layout is ready
        setTimeout(() => {
            const circleData = positionStepsInCircle();
            setupSVG(circleData);
            generateArrows(circleData);
            attachEventListeners();
        }, 100);
    }

    /**
     * Setup SVG with proper dimensions and arrow marker definitions
     */
    function setupSVG(circleData) {
        const container = document.querySelector('.process-container');
        const containerRect = container.getBoundingClientRect();
        
        // Set SVG dimensions to match container
        arrowsSVG.setAttribute('width', containerRect.width);
        arrowsSVG.setAttribute('height', containerRect.height);
        arrowsSVG.setAttribute('viewBox', `0 0 ${containerRect.width} ${containerRect.height}`);
        
        // Create arrow marker definition
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        
        marker.setAttribute('id', 'arrowhead');
        marker.setAttribute('markerWidth', '10');
        marker.setAttribute('markerHeight', '10');
        marker.setAttribute('refX', '9');
        marker.setAttribute('refY', '3');
        marker.setAttribute('orient', 'auto');
        
        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute('points', '0 0, 10 3, 0 6');
        polygon.setAttribute('fill', CONFIG.arrowColor);
        
        marker.appendChild(polygon);
        defs.appendChild(marker);
        arrowsSVG.appendChild(defs);
    }

    /**
     * Generate smooth cubic Bezier curve arrows connecting the steps
     */
    function generateArrows(circleData) {
        const svgNS = 'http://www.w3.org/2000/svg';
        const { centerX, centerY, radius } = circleData;
        
        // Clear existing arrows
        const existingPaths = arrowsSVG.querySelectorAll('path');
        existingPaths.forEach(path => path.remove());
        
        // Calculate step positions on the circle
        const numSteps = steps.length;
        const angleIncrement = (2 * Math.PI) / numSteps;
        const startAngle = -Math.PI / 2;
        
        // Generate arrows between consecutive steps
        for (let i = 0; i < numSteps; i++) {
            const currentAngle = startAngle + (angleIncrement * i);
            const nextAngle = startAngle + (angleIncrement * ((i + 1) % numSteps));
            
            const path = createSmoothBezierArrow(
                svgNS,
                currentAngle,
                nextAngle,
                centerX,
                centerY,
                radius,
                i
            );
            
            arrowsSVG.appendChild(path);
        }
        
        // Attach hover effects to arrows
        attachArrowHoverEffects();
    }

    /**
     * Create a smooth curved arrow using cubic Bezier curves
     */
    function createSmoothBezierArrow(svgNS, fromAngle, toAngle, centerX, centerY, radius, stepIndex) {
        // Calculate arrow start and end points with offset from card centers
        const startX = centerX + Math.cos(fromAngle) * (radius - CONFIG.arrowOffset);
        const startY = centerY + Math.sin(fromAngle) * (radius - CONFIG.arrowOffset);
        
        const endX = centerX + Math.cos(toAngle) * (radius - CONFIG.arrowOffset);
        const endY = centerY + Math.sin(toAngle) * (radius - CONFIG.arrowOffset);
        
        // Calculate angle difference for proper curve direction
        let angleDiff = toAngle - fromAngle;
        if (angleDiff < 0) angleDiff += 2 * Math.PI;
        
        // Calculate control points with moderate outward curve
        // Use 1.15x radius for a subtle, elegant curve
        const controlRadius = radius * 1.15;
        
        // Control points positioned at angles between start and end for smooth flow
        // This creates a gentle circular arc without being too pronounced
        const controlAngle1 = fromAngle + (angleDiff * 0.4);
        const controlAngle2 = fromAngle + (angleDiff * 0.6);
        
        const control1X = centerX + Math.cos(controlAngle1) * controlRadius;
        const control1Y = centerY + Math.sin(controlAngle1) * controlRadius;
        const control2X = centerX + Math.cos(controlAngle2) * controlRadius;
        const control2Y = centerY + Math.sin(controlAngle2) * controlRadius;
        
        // Create cubic Bezier curve path
        const pathData = `M ${startX} ${startY} C ${control1X} ${control1Y}, ${control2X} ${control2Y}, ${endX} ${endY}`;
        
        // Create SVG path element
        const path = document.createElementNS(svgNS, 'path');
        path.setAttribute('d', pathData);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', CONFIG.arrowColor);
        path.setAttribute('stroke-width', CONFIG.arrowThickness);
        path.setAttribute('marker-end', 'url(#arrowhead)');
        path.classList.add('arrow-path');
        path.dataset.stepIndex = stepIndex;
        
        return path;
    }

    /**
     * Attach event listeners to steps
     */
    function attachEventListeners() {
        steps.forEach((step, index) => {
            // Hover effects for cards
            step.addEventListener('mouseenter', function() {
                highlightStepAndArrow(index);
            });
            
            step.addEventListener('mouseleave', function() {
                removeHighlights();
            });
            
            // Keyboard support
            step.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    console.log(`Selected step ${index + 1}`);
                }
            });
        });
    }

    /**
     * Attach hover effects to arrow paths
     */
    function attachArrowHoverEffects() {
        const arrowPaths = document.querySelectorAll('.arrow-path');
        arrowPaths.forEach(path => {
            path.addEventListener('mouseenter', function() {
                const stepIndex = parseInt(this.dataset.stepIndex);
                highlightStepAndArrow(stepIndex);
            });
            
            path.addEventListener('mouseleave', function() {
                removeHighlights();
            });
        });
    }

    /**
     * Highlight step card and its connecting arrow
     */
    function highlightStepAndArrow(stepIndex) {
        // Highlight the card
        if (steps[stepIndex]) {
            steps[stepIndex].classList.add('highlighted');
        }
        
        // Highlight the arrow
        const arrowPaths = document.querySelectorAll('.arrow-path');
        arrowPaths.forEach((path, index) => {
            if (index === stepIndex) {
                path.setAttribute('stroke', CONFIG.hoverGlowColor);
                path.setAttribute('stroke-width', CONFIG.hoverGlowThickness);
                path.classList.add('highlighted');
            }
        });
    }

    /**
     * Remove all highlights
     */
    function removeHighlights() {
        steps.forEach(step => step.classList.remove('highlighted'));
        
        const arrowPaths = document.querySelectorAll('.arrow-path');
        arrowPaths.forEach(path => {
            path.setAttribute('stroke', CONFIG.arrowColor);
            path.setAttribute('stroke-width', CONFIG.arrowThickness);
            path.classList.remove('highlighted');
        });
    }

    /**
     * Recalculate everything on window resize
     */
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            const circleData = positionStepsInCircle();
            setupSVG(circleData);
            generateArrows(circleData);
        }, 250);
    });

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
