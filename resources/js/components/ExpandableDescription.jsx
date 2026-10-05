import React, { useState, useRef, useEffect } from 'react';

// Komponen khusus untuk menangani read-more deskripsi
const ExpandableDescription = ({ children }) => {
    const [expanded, setExpanded] = useState(false);
    const [isLongText, setIsLongText] = useState(false);
    const textRef = useRef(null);

    // Setara dengan x-init="$nextTick(...)"
    useEffect(() => {
        if (textRef.current) {
            // Cek apakah tinggi scroll lebih besar dari tinggi elemen yang dibatasi
            setIsLongText(textRef.current.scrollHeight > textRef.current.clientHeight);
        }
    }, [children]);

    return (
        <div className="relative">
            <p 
                ref={textRef} 
                className={`transition-all duration-200 ${expanded ? '' : 'line-clamp-3 overflow-hidden'}`}
            >
                {children}
            </p>

            {/* Tombol hanya muncul jika teksnya memang melebihi 3 baris */}
            {isLongText && (
                <button 
                    onClick={() => setExpanded(!expanded)} 
                    className="text-xs text-teal-normal-01 hover:text-teal-normal-02 font-medium mt-1 focus:outline-none inline-block"
                >
                    {expanded ? 'Tampilkan Lebih Sedikit' : 'Lihat Selengkapnya'}
                </button>
            )}
        </div>
    );
};

export default ExpandableDescription;