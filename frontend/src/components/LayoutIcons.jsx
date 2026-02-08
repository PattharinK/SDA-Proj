/**
 * Pixel-style icon components for layout toggle
 */

// Grid Icon (3x3 grid of squares)
export const GridIcon = () => (
    <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 4px)',
        gap: '2px',
        width: '18px',
        height: '18px'
    }}>
        {[...Array(9)].map((_, i) => (
            <div
                key={i}
                style={{
                    width: '4px',
                    height: '4px',
                    backgroundColor: 'currentColor',
                    imageRendering: 'pixelated'
                }}
            />
        ))}
    </div>
);

// List Icon (3 horizontal bars)
export const ListIcon = () => (
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '3px',
        width: '18px',
        height: '18px',
        justifyContent: 'center'
    }}>
        {[...Array(3)].map((_, i) => (
            <div
                key={i}
                style={{
                    width: '100%',
                    height: '3px',
                    backgroundColor: 'currentColor',
                    imageRendering: 'pixelated'
                }}
            />
        ))}
    </div>
);
