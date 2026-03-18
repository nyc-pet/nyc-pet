import Image from "next/image";

interface Props {
  className?: string;
  size?: number;
  color?: "white" | "dark" | "blue";
}

const filters = {
  white: "brightness(0) invert(1)",
  dark:  "brightness(0)",
  blue:  "brightness(0) saturate(100%) invert(24%) sepia(90%) saturate(500%) hue-rotate(190deg) brightness(90%)",
};

export default function PawIcon({ className = "", size = 24, color = "white" }: Props) {
  return (
    <Image
      src="/logo-paw.png"
      alt="paw"
      width={size}
      height={size}
      className={className}
      style={{ filter: filters[color] }}
    />
  );
}
