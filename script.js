/**
 * ERM Process Diagram - JavaScript
 * Handles dynamic arrow generation and interactive features
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        arrowColor: '#BD9D64',
        arrowThickness: 3,
        arrowAnimation: true,
        hoverGlow: true
    };

    // DOM Elements
    let arrowsSVG;
    let steps;

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

        // Generate arrows after a small delay to ensure layout is ready
        setTimeout(() => {
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

        // Get step positions
        const stepPositions = Array.from(steps).map(step => {
            const rect = step.getBoundingClientRect();
            const containerRect = step.closest('.process-container').getBoundingClientRect();
            
            return {
                centerX: rect.left + rect.width / 2 - containerRect.left,
                centerY: rect.top + rect.height / 2 - containerRect.top
            };
        });

        // Generate arrows between consecutive steps
        for (let i = 0; i < stepPositions.length; i++) {
            const current = stepPositions[i];
            const next = stepPositions[(i + 1) % stepPositions.length];
            
            const path = createCurvedArrow(svgNS, current, next, i);
            arrowsSVG.appendChild(path);
        }
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
     * Create a curved arrow path between two points
     */
    function createCurvedArrow(svgNS, from, to, index) {
        const path = document.createElementNS(svgNS, 'path');
        
        // Calculate control points for curved path
        const dx = to.centerX - from.centerX;
        const dy = to.centerY - from.centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Adjust control point based on step position
        const curvature = 0.3;
        const controlX = (from.centerX + to.centerX) / 2 + Math.cos(Math.PI / 3) * distance * curvature;
        const controlY = (from.centerY + to.centerY) / 2 + Math.sin(Math.PI / 3) * distance * curvature;
        
        // Adjust start and end points to be closer to step centers
        const offset = 20;
        const angle = Math.atan2(dy, dx);
        const startX = from.centerX + Math.cos(angle) * offset;
        const startY = from.centerY + Math.sin(angle) * offset;
        
        const reverseAngle = Math.atan2(to.centerY - from.centerY, to.centerX - from.centerX);
        const endX = to.centerX - Math.cos(reverseAngle) * offset;
        const endY = to.centerY - Math.sin(reverseAngle) * offset;
        
        // Create quadratic Bezier curve
        const pathData = `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;
        
        path.setAttribute('d', pathData);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', CONFIG.arrowColor);
        path.setAttribute('stroke-width', CONFIG.arrowThickness);
        path.setAttribute('marker-end', 'url(#arrowhead)');
        path.setAttribute('opacity', '1.0');
        
        // Add hover glow effect if enabled
        if (CONFIG.hoverGlow) {
            path.classList.add('arrow-path');
        }
        
        // Add animation class if enabled
        if (CONFIG.arrowAnimation) {
            path.classList.add('animated');
        }
        
        return path;
    }

    /**
     * Attach event listeners to steps (simplified - no hover effects)
     */
    function attachEventListeners() {
        // Event listeners removed as requested - no hover effects
        steps.forEach((step, index) => {
            // Keyboard support only
            step.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    console.log(`Selected step ${index + 1}`);
                }
            });
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
            
            // Regenerate arrows
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
