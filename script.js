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
     * Lines are clipped by card edges to create clean segments
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
        
        // Calculate arrow radius (circle path - cards are on this radius)
        const arrowRadius = radius;
        
        // Generate arrows along the perfect circle with card edge clipping
        for (let i = 0; i < numSteps; i++) {
            const currentAngle = startAngle + (angleIncrement * i);
            const nextAngle = startAngle + (angleIncrement * ((i + 1) % numSteps));
            
            // Get card dimensions to calculate clipping points
            const currentStep = steps[i];
            const stepRect = currentStep.getBoundingClientRect();
            const cardWidth = stepRect.width;
            const cardHeight = stepRect.height;
            
            // Calculate how far the card extends in each direction
            // Half the card width/height represents the margin from center
            const cardMargin = cardWidth / 3; // Distance from card center to edge
            
            // Calculate start point: on the circle but outside the current card edge
            // Move away from card along the radius
            const startOffset = arrowRadius + cardMargin;
            const startX = centerX + Math.cos(currentAngle) * startOffset;
            const startY = centerY + Math.sin(currentAngle) * startOffset;
            
            // Calculate end point: on the circle but outside the next card edge
            const nextStep = steps[(i + 1) % numSteps];
            const nextStepRect = nextStep.getBoundingClientRect();
            const nextCardWidth = nextStepRect.width;
            const nextCardMargin = nextCardWidth / 3;
            
            const endOffset = arrowRadius + nextCardMargin;
            const endX = centerX + Math.cos(nextAngle) * endOffset;
            const endY = centerY + Math.sin(nextAngle) * endOffset;
            
            // Create arc path along the circle
            // Use the full circle radius for the arc
            // Large arc flag: 0 for arcs < 180 degrees, 1 for arcs >= 180 degrees
            const largeArcFlag = angleIncrement > Math.PI ? 1 : 0;
            
            // Create arc path (clockwise sweep)
            const pathData = `M ${startX} ${startY} A ${arrowRadius} ${arrowRadius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;
            
            // Create SVG path element
            const path = document.createElementNS(svgNS, 'path');
            path.setAttribute('d', pathData);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', CONFIG.arrowColor);
            path.setAttribute('stroke-width', CONFIG.arrowThickness);
            path.setAttribute('marker-end', 'url(#arrowhead)');
            path.classList.add('arrow-path');
            path.dataset.stepIndex = i;
            
            arrowsSVG.appendChild(path);
        }
        
        // Attach hover effects to arrows
        attachArrowHoverEffects();
    }

    // createSmoothBezierArrow function removed - now using arc paths

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
