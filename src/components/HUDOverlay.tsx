import React, { useEffect, useRef } from 'react';

interface HUDOverlayProps {
    active: boolean;
}

const HUDOverlay: React.FC<HUDOverlayProps> = ({ active }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rafRef = useRef<number>(0);
    const scrollXRef = useRef<number>(0);
    const hexStreamsRef = useRef<{ y: number, text: string }[][]>([]);
    const biometricsRef = useRef({ hr: 72, alt: 912 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            scrollXRef.current = canvas.width;

            // Initialize hex streams
            const cols = 3;
            const rows = 20;
            const streams: { y: number, text: string }[][] = [];
            for (let i = 0; i < cols * 2; i++) {
                const stream: { y: number, text: string }[] = [];
                for (let j = 0; j < rows; j++) {
                    stream.push({
                        y: (canvas.height / rows) * j,
                        text: Math.floor(Math.random() * 0xFF).toString(16).toUpperCase().padStart(2, '0')
                    });
                }
                streams.push(stream);
            }
            hexStreamsRef.current = streams;
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        const biometricsInterval = setInterval(() => {
            biometricsRef.current = {
                hr: 70 + Math.floor(Math.random() * 15),
                alt: 900 + Math.floor(Math.random() * 30)
            };
        }, 2000);

        return () => {
            window.removeEventListener('resize', handleResize);
            clearInterval(biometricsInterval);
        };
    }, []);

    const draw = (time: number) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!active) return;

        const { width: w, height: h } = canvas;
        const accent = getComputedStyle(document.documentElement).getPropertyValue('--jarvis-accent').trim() || '#38bdf8';

        // 1. Corner Brackets
        ctx.strokeStyle = accent;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.4;

        const drawBracket = (x: number, y: number, rot: number) => {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(Math.sin(time / 2000) * 0.08 + rot);
            ctx.beginPath();
            ctx.moveTo(30, 0);
            ctx.lineTo(0, 0);
            ctx.lineTo(0, 30);
            ctx.stroke();
            ctx.restore();
        };

        drawBracket(40, 40, 0); // TL
        drawBracket(w - 40, 40, Math.PI / 2); // TR
        drawBracket(w - 40, h - 40, Math.PI); // BR
        drawBracket(40, h - 40, -Math.PI / 2); // BL

        // 2. Hex Streams
        ctx.font = '9px monospace';
        ctx.fillStyle = accent;
        ctx.textAlign = 'center';
        ctx.globalAlpha = 0.12;

        const xCols = [20, 40, 60, w - 20, w - 40, w - 60];
        hexStreamsRef.current.forEach((stream, i) => {
            const x = xCols[i];
            stream.forEach((row) => {
                row.y -= 0.4;
                if (row.y < 0) row.y = h;
                if (Math.random() < 0.01) {
                    row.text = Math.floor(Math.random() * 0xFF).toString(16).toUpperCase().padStart(2, '0');
                }
                ctx.fillText(row.text, x, row.y);
            });
        });

        // 3. Top Marquee
        ctx.font = '11px monospace';
        ctx.globalAlpha = 0.35;
        ctx.textAlign = 'left';
        const marqueeText = "  J.A.R.V.I.S. v7.3  //  NEURAL CORE ACTIVE  //  ALL SYSTEMS NOMINAL  //  LOCAL TIME: " + new Date().toLocaleTimeString() + "  //  ";
        const textWidth = ctx.measureText(marqueeText).width;

        scrollXRef.current -= 0.7;
        if (scrollXRef.current + textWidth < 0) {
            scrollXRef.current = w;
        }
        ctx.fillText(marqueeText, scrollXRef.current, 22);

        // 4. Bottom Biometrics
        ctx.globalAlpha = 0.06;
        ctx.fillStyle = accent;
        ctx.fillRect(0, h - 40, w, 40);

        ctx.globalAlpha = 0.5;
        ctx.textAlign = 'center';
        const bioText = `HEART RATE: ${biometricsRef.current.hr}bpm   |   ALTITUDE: ${biometricsRef.current.alt}m   |   THREAT LEVEL: LOW   |   SUIT INTEGRITY: 100%`;
        ctx.fillText(bioText, w / 2, h - 12);

        // 5. Arc Reactor
        const cx = 70;
        const cy = h - 70;

        ctx.lineWidth = 1;
        // Outer
        ctx.globalAlpha = 0.2;
        ctx.beginPath();
        ctx.arc(cx, cy, 22, 0, Math.PI * 2);
        ctx.stroke();

        // Middle
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        ctx.stroke();

        // Inner
        ctx.globalAlpha = 0.5 + Math.sin(time / 700) * 0.3;
        ctx.beginPath();
        ctx.arc(cx, cy, 7, 0, Math.PI * 2);
        ctx.fill();

        rafRef.current = requestAnimationFrame(draw);
    };

    useEffect(() => {
        if (active) {
            rafRef.current = requestAnimationFrame(draw);
        } else {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        }
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [active]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full pointer-events-none z-[9]"
            style={{ opacity: active ? 1 : 0, transition: 'opacity 0.5s ease-in-out' }}
        />
    );
};

export default HUDOverlay;
