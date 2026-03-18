"use client";

import dynamic from "next/dynamic";

const PetDetailMap = dynamic(() => import("./PetDetailMap"), { ssr: false });

export default function PetDetailMapWrapper({
  lat, lng, status,
}: {
  lat: number; lng: number; status: string;
}) {
  return <PetDetailMap lat={lat} lng={lng} status={status} />;
}
