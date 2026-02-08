import React, { useState, useEffect } from 'react';
import { SPACING } from '../styles/tokens';
import ax from '../services/ax';
import conf from '../services/conf';

const DebugBar = () => {
    const [info, setInfo] = useState(null);
    const [open, setOpen] = useState(false);

    // Auto-refresh เมื่อเปิด Panel (Live Monitor)
    useEffect(() => {
        const fetchOnce = async () => {
            try {
                const { data } = await ax.get(conf.debugLoadBalancer);
                setInfo(data);
            } catch (err) {
                console.error('Debug Error', err);
            }
        };

        fetchOnce();
    }, []);

    return (
        <>
            {/* Debug Trigger Button (Small & Clean) */}
            <button
                type="button"
                className="nes-btn is-error" // สีแดงเด่นแต่เล็ก
                onClick={() => setOpen(!open)}
                style={{
                    position: 'fixed',
                    bottom: SPACING.md,
                    right: SPACING.md,
                    zIndex: 9999,
                    width: '40px',        // บังคับขนาดให้เล็ก
                    height: '40px',
                    padding: 0,           // เอา padding เดิมออก
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '2px 2px 0px #000' // เงาแบบ Pixel art
                }}
            >
                {open ? '×' : '🐞'}
            </button>

            {/* Debug Panel (Minimal Info) */}
            {open && info && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: '70px', // สูงกว่าปุ่มนิดหน่อย
                        right: SPACING.md,
                        zIndex: 9999,
                        minWidth: '280px',
                    }}
                >
                    <div className="nes-container is-dark is-rounded" style={{ padding: '1rem' }}>

                        {/* Header เล็กๆ */}
                        <div style={{
                            marginBottom: '10px',
                            borderBottom: '2px dashed #fff',
                            paddingBottom: '5px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span style={{ color: '#00d1b2' }}>LB Monitor</span>
                            <span style={{ fontSize: '10px', color: '#ccc' }}>Live</span>
                        </div>

                        {/* ข้อมูล */}
                        <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '5px' }}>

                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Container:</span>
                                <span className="nes-text is-primary">{info.container_id}</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Worker PID:</span>
                                <span className="nes-text is-warning">{info.worker_pid}</span>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default DebugBar;