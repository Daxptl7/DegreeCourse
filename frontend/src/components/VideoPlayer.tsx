import React, { useEffect, useRef } from 'react';

const VideoPlayer = ({ stream, isMuted = false }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(err => console.error("Error playing video:", err));
        }
    }, [stream]);

    return (
        <div className="w-full h-full bg-black">
            <video
                ref={videoRef}
                muted={isMuted}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
            />
        </div>
    );
};

export default VideoPlayer;
