import { useState, useCallback, useRef } from 'react';

export const useWebcam = (onMessageSent?: (content: string, imageUrl?: string) => void) => {
    const [isActive, setIsActive] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const startWebcam = useCallback(async () => {
        setError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current?.play();
                    setIsActive(true);
                };
            }
        } catch (err) {
            console.error('Webcam access error:', err);
            setError("Camera access denied, sir. I cannot see without your authorisation.");
            setIsActive(false);
        }
    }, []);

    const stopWebcam = useCallback(() => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setIsActive(false);
    }, []);

    const captureAndSend = useCallback(async () => {
        // Requirement 1: First line log
        console.log("Camera button clicked");

        try {
            // Requirement 3: Detailed logs and flow
            console.log("Requesting camera access...");
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            console.log("Camera access granted");

            // Create temporary video element for capture
            const video = document.createElement('video');
            video.srcObject = stream;

            await new Promise(resolve => {
                video.onloadedmetadata = () => {
                    video.play();
                    // Requirement 1: Wait for readiness
                    setTimeout(resolve, 500);
                };
            });

            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error("Could not get canvas context");

            ctx.drawImage(video, 0, 0);
            const base64 = canvas.toDataURL('image/jpeg', 0.8);

            // Requirement 3: Log capture
            console.log("Image captured:", base64.length, "chars");

            // Requirement 3: Stop all tracks
            stream.getTracks().forEach(track => track.stop());

            // Requirement 5: Show thumbnail immediately (via callback to onSendMessage)
            if (onMessageSent) {
                onMessageSent("Analysing visual data, sir...", base64);
            }

            setIsAnalyzing(true);
            // Requirement 3: Log sending
            console.log("Sending to vision model...");

            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'J.A.R.V.I.S. Vision',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    // Requirement 2: Vision Model
                    model: "meta-llama/llama-3.2-11b-vision-instruct:free",
                    // Requirement 3: Specific Payload Format
                    messages: [{
                        role: "user",
                        content: [
                            {
                                type: "image_url",
                                image_url: { url: base64 }
                            },
                            {
                                type: "text",
                                text: "You are J.A.R.V.I.S. Describe exactly what you see in this image in Jarvis's voice, addressing the user as sir. Be specific about objects, people, colors, and context."
                            }
                        ]
                    }],
                    max_tokens: 500
                }),
            });

            // Requirement 3: Status check
            console.log("Vision response:", response.status);

            if (!response.ok) throw new Error("Vision API error");
            const data = await response.json();
            const description = data.choices[0]?.message?.content || "Sir, visual analysis returned no results.";

            if (onMessageSent) {
                onMessageSent(description);
            }

        } catch (err) {
            console.error("Vision Error:", err);
            if (onMessageSent) {
                onMessageSent("Vision sensors offline, sir. Calibration required.");
            }
        } finally {
            setIsAnalyzing(false);
        }
    }, [onMessageSent]);

    return { isActive, isAnalyzing, error, videoRef, canvasRef, startWebcam, stopWebcam, captureAndSend };
};
