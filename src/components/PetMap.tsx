"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import type { PetPost } from "@/lib/types";
import "leaflet/dist/leaflet.css";

// Fix default marker icons in Next.js
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const LOST_ICON = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const FOUND_ICON = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

function RecenterMap({ posts }: { posts: PetPost[] }) {
  const map = useMap();
  useEffect(() => {
    if (posts.length > 0) {
      const bounds = L.latLngBounds(posts.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [map, posts]);
  return null;
}

export default function PetMap({ posts }: { posts: PetPost[] }) {
  const NYC_CENTER: [number, number] = [40.7128, -74.006];

  return (
    <MapContainer
      center={NYC_CENTER}
      zoom={11}
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
