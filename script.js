/**
 * ERM Process Diagram - Version 4
 * 4-phase circular process with distinct colored arrow segments
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        arrowColors: ['#000000', '#000000', '#000000', '#000000'], // All arrows black
        arrowThickness: 4,
        arrowOffset: -31.5, // Offset to increase radius by 10%
        angleTrimDegrees: 27, // Trim to make arrows 40% of original length (36° total)
        arrowPadding: 0, // No padding - align with block centers
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
     * Setup SVG with proper dimensions and arrow marker definitions for each phase
     */
    function setupSVG(circleData) {
        const container = document.querySelector('.process-container');
        const containerRect = container.getBoundingClientRect();
        
        // Set SVG dimensions to match container
        arrowsSVG.setAttribute('width', containerRect.width);
        arrowsSVG.setAttribute('height', containerRect.height);
        arrowsSVG.setAttribute('viewBox', `0 0 ${containerRect.width} ${containerRect.height}`);
        
        // Create arrow marker definitions for each phase
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        
        CONFIG.arrowColors.forEach((color, index) => {
            const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
            
            marker.setAttribute('id', `arrowhead-phase-${index + 1}`);
            marker.setAttribute('markerWidth', '6');
            marker.setAttribute('markerHeight', '6');
            marker.setAttribute('refX', '5');
            marker.setAttribute('refY', '3');
            marker.setAttribute('orient', 'auto');
            
            const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            polygon.setAttribute('points', '0 0, 6 3, 0 6');
            polygon.setAttribute('fill', color);
            
            marker.appendChild(polygon);
            defs.appendChild(marker);
        });
        
        arrowsSVG.appendChild(defs);
    }

    /**
     * Generate 4 distinct colored quarter-circle arrow segments for each phase
     */
    function generateArrows(circleData) {
        const svgNS = 'http://www.w3.org/2000/svg';
        const { centerX, centerY, radius } = circleData;
        
        // Clear existing arrows and labels
        const existingPaths = arrowsSVG.querySelectorAll('path');
        existingPaths.forEach(path => path.remove());
        const existingTexts = arrowsSVG.querySelectorAll('text');
        existingTexts.forEach(text => text.remove());
        const existingGroups = arrowsSVG.querySelectorAll('g');
        existingGroups.forEach(group => group.remove());
        
        // Calculate step positions on the circle
        const numSteps = steps.length;
        const angleIncrement = (2 * Math.PI) / numSteps;
        const startAngle = -Math.PI / 2; // Start at top (-90 degrees)
        
        // Calculate arrow radius (circle minus offset, then add padding)
        const arrowRadius = radius - CONFIG.arrowOffset + CONFIG.arrowPadding;
        
        // Convert trim degrees to radians
        const angleTrimRadians = (CONFIG.angleTrimDegrees * Math.PI) / 180;
        
        // Generate 4 quarter-circle arrow segments
        for (let i = 0; i < numSteps; i++) {
            const currentAngle = startAngle + (angleIncrement * i);
            const nextAngle = startAngle + (angleIncrement * ((i + 1) % numSteps));
            
            // Trim angles to clear block edges (add trim to start, subtract from end)
            // For Phase 1→2 arrow (i=1), reduce START trim by 20% (0.8 multiplier) to extend beginning closer to Phase 2
            const startTrimRadians = (i === 1) ? angleTrimRadians * 0.8 : angleTrimRadians;
            let arrowStartAngle = currentAngle + startTrimRadians;
            let arrowEndAngle = nextAngle - angleTrimRadians;
            
            // Ensure angles are in the correct range for each quadrant
            // Normalize angles to [0, 2π] range
            if (arrowStartAngle < 0) arrowStartAngle += 2 * Math.PI;
            if (arrowEndAngle < 0) arrowEndAngle += 2 * Math.PI;
            if (arrowEndAngle < arrowStartAngle) arrowEndAngle += 2 * Math.PI;
            
            // Calculate start and end points on the circle (with padding)
            const startX = centerX + Math.cos(arrowStartAngle) * arrowRadius;
            const startY = centerY + Math.sin(arrowStartAngle) * arrowRadius;
            const endX = centerX + Math.cos(arrowEndAngle) * arrowRadius;
            const endY = centerY + Math.sin(arrowEndAngle) * arrowRadius;
            
            // Create trimmed arc path with padding
            // Calculate angle span to determine large arc flag
            const arcSpan = arrowEndAngle - arrowStartAngle;
            const largeArcFlag = Math.abs(arcSpan) > Math.PI ? 1 : 0;
            const pathData = `M ${startX} ${startY} A ${arrowRadius} ${arrowRadius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;
            
            // Create SVG path element with phase-specific color
            const path = document.createElementNS(svgNS, 'path');
            path.setAttribute('d', pathData);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', CONFIG.arrowColors[i]);
            path.setAttribute('stroke-width', CONFIG.arrowThickness);
            path.setAttribute('marker-end', `url(#arrowhead-phase-${i + 1})`);
            path.classList.add('arrow-path');
            path.dataset.stepIndex = i;
            
            arrowsSVG.appendChild(path);
        }
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
     * Highlight step card and its connecting arrow
     */
    function highlightStepAndArrow(stepIndex) {
        // Highlight the card
        if (steps[stepIndex]) {
            steps[stepIndex].classList.add('highlighted');
        }
        
        // Highlight the arrow with increased thickness (keeping its phase color)
        const arrowPaths = document.querySelectorAll('.arrow-path');
        arrowPaths.forEach((path, index) => {
            if (index === stepIndex) {
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
        arrowPaths.forEach((path, index) => {
            path.setAttribute('stroke', CONFIG.arrowColors[index]);
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
