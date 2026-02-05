import { useState, useRef, useEffect } from 'react';

// Constants
const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 450;
const MIN_WIDTH = 400;
const MIN_HEIGHT = 225;

// Fullscreen icons
const ICON_ENTER_FULLSCREEN = '⛶';
const ICON_EXIT_FULLSCREEN = '⊡';

/**
 * ResizableGameScreen Component
 * 
 * Displays a game iframe with resize and fullscreen capabilities.
 * 
 * @param {string} gameSlug - Game slug for iframe src
 * @param {string} gameTitle - Game title for iframe title
 * @param {number} gameId - Game ID for postMessage
 * @param {string} token - Auth token for postMessage
 * @param {boolean} isGuest - Guest status for postMessage
 */
function ResizableGameScreen({ gameSlug, gameTitle, gameId, token, isGuest }) {
    const [dimensions, setDimensions] = useState({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const containerRef = useRef(null);
    const iframeRef = useRef(null);
    const dragStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

    // ========== Resize Handlers ==========
    const handleResizeStart = (e) => {
        e.preventDefault();
        setIsDragging(true);
        dragStartRef.current = {
            x: e.clientX,
            y: e.clientY,
            width: dimensions.width,
            height: dimensions.height
        };
    };

    const handleResizeMove = (e) => {
        if (!isDragging) return;

        const deltaX = e.clientX - dragStartRef.current.x;
        const deltaY = e.clientY - dragStartRef.current.y;

        const newWidth = Math.max(MIN_WIDTH, dragStartRef.current.width + deltaX);
        const newHeight = Math.max(MIN_HEIGHT, dragStartRef.current.height + deltaY);

        setDimensions({ width: newWidth, height: newHeight });
    };

    const handleResizeEnd = () => {
        setIsDragging(false);
    };

    // Attach/detach resize event listeners
    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleResizeMove);
            document.addEventListener('mouseup', handleResizeEnd);
        }

        return () => {
            document.removeEventListener('mousemove', handleResizeMove);
            document.removeEventListener('mouseup', handleResizeEnd);
        };
    }, [isDragging, dimensions]);

    // ========== Fullscreen Handlers ==========
    const toggleFullscreen = async () => {
        if (!containerRef.current) return;

        try {
            if (!isFullscreen) {
                await requestFullscreen(containerRef.current);
                setIsFullscreen(true);
            } else {
                await exitFullscreen();
                setIsFullscreen(false);
            }
        } catch (error) {
            console.error('Fullscreen toggle failed:', error);
        }
    };

    // Listen for fullscreen changes (e.g., ESC key)
    useEffect(() => {
        const handleFullscreenChange = () => {
            const isCurrentlyFullscreen = !!document.fullscreenElement;
            setIsFullscreen(isCurrentlyFullscreen);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // ========== Game Initialization ==========
    const handleIframeLoad = (e) => {
        e.target.contentWindow.postMessage(
            {
                type: "INIT_GAME",
                gameId,
                token,
                isGuest,
            },
            "*"
        );
    };

    // ========== Render ==========
    return (
        <div
            ref={containerRef}
            className={isFullscreen ? 'fullscreen-mode' : ''}
            style={{
                position: 'relative',
                width: isFullscreen ? '100%' : `${dimensions.width}px`,
                height: isFullscreen ? '100%' : `${dimensions.height}px`,
                maxWidth: '100%'
            }}
        >
            {/* Game Container */}
            <div
                className="nes-container is-rounded"
                style={{
                    overflow: 'hidden',
                    padding: 0,
                    border: '4px solid black',
                    height: '100%',
                    width: '100%',
                    position: 'relative'
                }}
            >
                {/* Game Iframe */}
                <iframe
                    ref={iframeRef}
                    src={`/games/${gameSlug}/index.html`}
                    title={gameTitle}
                    style={{
                        height: "100%",
                        width: '100%',
                        border: 'none',
                        display: 'block'
                    }}
                    onLoad={handleIframeLoad}
                />

                {/* Drag Overlay (prevents iframe from capturing mouse events) */}
                {isDragging && <DragOverlay />}

                {/* Fullscreen Toggle Button */}
                <FullscreenButton
                    isFullscreen={isFullscreen}
                    onClick={toggleFullscreen}
                />
            </div>

            {/* Resize Handle */}
            {!isFullscreen && <ResizeHandle onMouseDown={handleResizeStart} />}
        </div>
    );
}

// ========== Sub-Components ==========

function DragOverlay() {
    return (
        <div
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 5,
                cursor: 'nwse-resize'
            }}
        />
    );
}

function FullscreenButton({ isFullscreen, onClick }) {
    return (
        <button
            className="nes-btn is-primary"
            onClick={onClick}
            style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                padding: '4px 8px',
                fontSize: '10px',
                zIndex: 10
            }}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
            {isFullscreen ? ICON_EXIT_FULLSCREEN : ICON_ENTER_FULLSCREEN}
        </button>
    );
}

function ResizeHandle({ onMouseDown }) {
    return (
        <div
            onMouseDown={onMouseDown}
            style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '20px',
                height: '20px',
                cursor: 'nwse-resize',
                background: 'linear-gradient(135deg, transparent 50%, #212529 50%)',
                borderBottomRightRadius: '4px',
                zIndex: 10
            }}
            title="Drag to resize"
        />
    );
}

// ========== Utility Functions ==========

async function requestFullscreen(element) {
    if (element.requestFullscreen) {
        await element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen();
    }
}

async function exitFullscreen() {
    if (document.exitFullscreen) {
        await document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
        await document.msExitFullscreen();
    }
}

export default ResizableGameScreen;
