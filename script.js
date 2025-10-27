/**
 * ERM Process Diagram - JavaScript
 * Handles dynamic arrow generation with perfect circular flow using SVG paths
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        arrowColor: '#BD9D64',
        arrowThickness: 4,
        arrowOffset: 40, // Distance from card center for arrow start/end
        hoverGlowColor: '#D4B682',
        hoverGlowThickness: 5
    };

    // DOM Elements
    let arrowsSVG;
    let steps;

    /**
     * Position steps in a perfect circle
     */
    function positionStepsInCircle() {
        const container = document.querySelector('.process-container');
        const containerRect = container.getBoundingClientRect();
        
        // Get the actual usable width and height
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;
        
        // Use the smaller dimension as the base for a square
        const size = Math.min(containerWidth, containerHeight);
        
        // Center coordinates
        const centerX = containerWidth / 2;
        const centerY = containerHeight / 2;
        
        // Radius for the circle (adjust to fit all 4 cards nicely)
        const radius = size * 0.35;
        
        steps.forEach((step, index) => {
            // Calculate angle for each step (starting from top, going clockwise)
            // For 4 steps: 0° (top), 90° (right), 180° (bottom), 270° (left)
            const angle = (index * (360 / steps.length) - 90) * (Math.PI / 180);
            
            // Calculate position on circle
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            // Position the step relative to the container
            step.style.left = (x / containerWidth * 100) + '%';
            step.style.top = (y / containerHeight * 100) + '%';
            step.style.transform = 'translate(-50%, -50%)';
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

        // Position steps and generate arrows after a small delay to ensure layout is ready
        setTimeout(() => {
            positionStepsInCircle();
            generateArrows();
            attachEventListeners();
        }, 100);
    }

    /**
     * Generate SVG arrows connecting the steps
     */
    function generateArrows() {
        const svgNS = 'http://www.w3.org/2000/svg';
        const arrowDefs = createArrowMarker(svgNS);
        arrowsSVG.appendChild(arrowDefs);

        // Calculate container center
        const container = document.querySelector('.process-container');
        const containerRect = container.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;
        const size = Math.min(containerWidth, containerHeight);
        
        // Center coordinates
        const centerX = containerWidth / 2;
        const centerY = containerHeight / 2;
        
        // Calculate radius for perfect circle
        const radius = size * 0.35;
        
        // Calculate positions for each step on the circle
        const stepPositions = Array.from(steps).map((step, index) => {
            // Calculate angle for each step (starting from top, going clockwise)
            const angle = (index * (360 / steps.length) - 90) * (Math.PI / 180);
            
            return {
                centerX: centerX + Math.cos(angle) * radius,
                centerY: centerY + Math.sin(angle) * radius
            };
        });

        // Generate arrows between consecutive steps with smooth Bezier curves
        for (let i = 0; i < stepPositions.length; i++) {
            const current = stepPositions[i];
            const next = stepPositions[(i + 1) % stepPositions.length];
            
            const path = createCurvedArrow(svgNS, current, next, i, centerX, centerY, radius, i);
            arrowsSVG.appendChild(path);
        }
        
        // Add hover effect listeners to paths
        attachArrowHoverEffects();
    }

    /**
     * Create SVG arrow marker definition
     */
    function createArrowMarker(svgNS) {
        const defs = document.createElementNS(svgNS, 'defs');
        
        const marker = document.createElementNS(svgNS, 'marker');
        marker.setAttribute('id', 'arrowhead');
        marker.setAttribute('markerWidth', '10');
        marker.setAttribute('markerHeight', '10');
        marker.setAttribute('refX', '9');
        marker.setAttribute('refY', '3');
        marker.setAttribute('orient', 'auto');
        
        const polygon = document.createElementNS(svgNS, 'polygon');
        polygon.setAttribute('points', '0 0, 10 3, 0 6');
        polygon.setAttribute('fill', CONFIG.arrowColor);
        
        marker.appendChild(polygon);
        defs.appendChild(marker);
        
        return defs;
    }

    /**
     * Create a smooth curved arrow path using cubic Bézier curves for perfect circular flow
     */
    function createCurvedArrow(svgNS, from, to, index, centerX, centerY, radius, stepIndex) {
        // Calculate angles from center
        const fromAngle = Math.atan2(from.centerY - centerY, from.centerX - centerX);
        const toAngle = Math.atan2(to.centerY - centerY, to.centerX - centerX);
        
        // Calculate angle difference
        let angleDiff = toAngle - fromAngle;
        if (angleDiff < 0) angleDiff += 2 * Math.PI;
        
        // Use arc for better circular flow, but with cubic bezier for smoother curves
        // Calculate control points that extend outward for smooth curve
        const controlPointRadius = radius * 1.15; // Extend control points outward
        
        const startAngle = fromAngle;
        const endAngle = toAngle;
        const midAngle = (startAngle + endAngle) / 2;
        
        // Calculate start and end points with offset from card centers
        const startX = centerX + Math.cos(startAngle) * (radius - CONFIG.arrowOffset);
        const startY = centerY + Math.sin(startAngle) * (radius - CONFIG.arrowOffset);
        
        const endX = centerX + Math.cos(endAngle) * (radius - CONFIG.arrowOffset);
        const endY = centerY + Math.sin(endAngle) * (radius - CONFIG.arrowOffset);
        
        // Create cubic bezier control points for smooth curve
        const control1X = centerX + Math.cos(startAngle) * controlPointRadius;
        const control1Y = centerY + Math.sin(startAngle) * controlPointRadius;
        const control2X = centerX + Math.cos(endAngle) * controlPointRadius;
        const control2Y = centerY + Math.sin(endAngle) * controlPointRadius;
        
        // Create smooth cubic Bezier curve path
        const pathData = `M ${startX} ${startY} C ${control1X} ${control1Y}, ${control2X} ${control2Y}, ${endX} ${endY}`;
        
        // Create main path element
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
     * Attach event listeners to steps with hover effects
     */
    function attachEventListeners() {
        steps.forEach((step, index) => {
            // Add hover effect for the card
            step.addEventListener('mouseenter', function() {
                highlightStepArrow(index);
            });
            
            step.addEventListener('mouseleave', function() {
                removeArrowHighlights();
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
                highlightStepArrow(stepIndex);
            });
            
            path.addEventListener('mouseleave', function() {
                removeArrowHighlights();
            });
        });
    }
    
    /**
     * Highlight arrow when hovering over a step
     */
    function highlightStepArrow(stepIndex) {
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
     * Remove arrow highlights
     */
    function removeArrowHighlights() {
        const arrowPaths = document.querySelectorAll('.arrow-path');
        arrowPaths.forEach(path => {
            path.setAttribute('stroke', CONFIG.arrowColor);
            path.setAttribute('stroke-width', CONFIG.arrowThickness);
            path.classList.remove('highlighted');
        });
    }

    /**
     * Recalculate arrows on window resize
     */
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            // Clear existing arrows
            const existingArrows = arrowsSVG.querySelectorAll('defs, path');
            existingArrows.forEach(el => el.remove());
            
            // Reposition steps and regenerate arrows
            positionStepsInCircle();
            generateArrows();
        }, 250);
    });

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

// No additional CSS needed - all hover effects removed
