"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import type { PetPost } from "@/lib/types";
import "leaflet/dist/leaflet.css";

function makePinIcon(color: string, pulseColor: string) {
  return L.divIcon({
    className: "",
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -46],
    html: `
      <div class="map-pin-bounce" style="position:relative;width:36px;height:44px;">
        <div class="map-pin-pulse" style="
          position:absolute;top:4px;left:4px;
          width:28px;height:28px;border-radius:50%;
          background:${pulseColor};
        "></div>
        <svg viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg" style="position:absolute;inset:0;width:36px;height:44px;filter:drop-shadow(0 3px 6px rgba(0,0,0,0.35))">
          <path d="M18 2C10.268 2 4 8.268 4 16c0 10.5 14 26 14 26s14-15.5 14-26C32 8.268 25.732 2 18 2z" fill="${color}"/>
          <circle cx="18" cy="16" r="6" fill="white" opacity="0.9"/>
        </svg>
      </div>`,
  });
}

const LOST_ICON  = makePinIcon("#ef4444", "rgba(239,68,68,0.4)");
const FOUND_ICON = makePinIcon("#22c55e", "rgba(34,197,94,0.4)");

function RecenterMap({ posts }: { posts: PetPost[] }) {
  const map = useMap();
  useEffect(() => {
    if (posts.length > 0) {
      const bounds = L.latLngBounds(posts.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 12 });
    }
  }, [map, posts]);
  return null;
}

export default function PetMap({ posts }: { posts: PetPost[] }) {
  // Center chosen to show all 5 boroughs comfortably
  const NYC_CENTER: [number, number] = [40.650, -73.940];

  return (
    <MapContainer
      center={NYC_CENTER}
      zoom={10}
      className="w-full h-full"
      scrollWheelZoom={true}
      style={{ background: "#242f3e" }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
        maxZoom={20}
      />
      {posts.length > 0 && <RecenterMap posts={posts} />}
      {posts.map((post) => (
        <Marker
          key={post.id}
          position={[post.lat, post.lng]}
          icon={post.status === "lost" ? LOST_ICON : FOUND_ICON}
        >
          <Popup>
            <div className="text-sm">
              <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-1 ${post.status === "lost" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                {post.status === "lost" ? "Lost" : "Found"}
              </span>
              <p className="font-semibold">
                {post.name ? `${post.name} · ` : ""}{post.species}
              </p>
              <p className="text-gray-500 text-xs">{post.last_seen_address}</p>
              <Link href={`/pet/${post.id}`} className="text-blue-500 text-xs font-medium mt-1 block hover:underline">
                View details →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
