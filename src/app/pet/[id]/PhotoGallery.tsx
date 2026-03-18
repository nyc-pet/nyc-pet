"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  photos: string[];
  alt: string;
  emoji: string;
  petName: string;
  postedOn: string;
  statusLabel: string;
  statusPill: string;
  breed: string | null;
}

export default function PhotoGallery({ photos, alt, emoji, petName, postedOn, statusLabel, statusPill, breed }: Props) {
  const [active, setActive] = useState(0);

  function prev() { setActive((i) => (i - 1 + photos.length) % photos.length); }
  function next() { setActive((i) => (i + 1) % photos.length); }

  return (
    <div className="w-full bg-black">
      {/* Main image */}
      <div className="relative w-full h-[55vh] min-h-[360px]">
        {photos.length > 0 ? (
          <Image
            key={active}
            src={photos[active]}
            alt={`${alt} photo ${active + 1}`}
            fill
            className="object-cover transition-opacity duration-300"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[10rem] bg-gradient-to-br from-gray-100 to-gray-200">
            {emoji}
          </div>
        )}

        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

        {/* Prev / Next arrows */}
        {photos.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Photo counter */}
        {photos.length > 1 && (
          <span className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white font-nunito text-xs font-semibold px-3 py-1.5 rounded-full">
            {active + 1} / {photos.length}
          </span>
        )}

        {/* Pet name + status badge */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-8 pt-16 pointer-events-none">
          <p className="font-nunito text-white/60 text-sm mb-1">Posted on {postedOn}</p>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-fredoka text-5xl font-semibold text-white leading-tight drop-shadow-lg">
              {petName}
            </h1>
            <span className={`font-fredoka font-semibold text-sm px-4 py-2 rounded-full shadow-lg ${statusPill}`}>
              {statusLabel}
            </span>
          </div>
          {breed && <p className="font-nunito text-white/70 text-base mt-1">{breed}</p>}
        </div>
      </div>

      {/* Thumbnail strip */}
      {photos.length > 1 && (
        <div className="flex gap-2 bg-black/90 px-4 py-3">
          {photos.map((url, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative w-20 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                i === active ? "border-[#1c314e] opacity-100 scale-105" : "border-transparent opacity-50 hover:opacity-80"
              }`}
            >
              <Image src={url} alt={`Thumbnail ${i + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Dot indicators */}
      {photos.length > 1 && (
        <div className="flex justify-center gap-1.5 py-2 bg-black/90">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`rounded-full transition-all ${i === active ? "w-4 h-2 bg-[#1c314e]" : "w-2 h-2 bg-white/30 hover:bg-white/60"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
