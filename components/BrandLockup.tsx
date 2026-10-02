import Image from "next/image";

interface BrandLockupProps {
  animated?: boolean;
  variant?: "splash" | "sidebar";
}

export default function BrandLockup({
  animated = false,
  variant = "splash",
}: BrandLockupProps) {
  const splash = variant === "splash";

  return (
    <div className={`flex flex-col ${splash ? "items-center" : "items-start"}`}>
      <Image
        src="/assets/logo-mark.png"
        alt=""
        width={544}
        height={444}
        priority={splash}
        className={`object-contain ${
          splash
            ? `w-44 sm:w-52 ${animated ? "animate-logo-mark" : ""}`
            : "w-24 animate-float"
        }`}
      />
      <h1
        className={`m-0 flex items-end leading-none ${splash ? "mt-1 justify-center" : "mt-2 justify-start"}`}
      >
        <Image
          src="/assets/logo-trend.png"
          alt="Trend"
          width={398}
          height={136}
          priority={splash}
          className={`w-auto object-contain object-left ${
            splash ? `h-10 sm:h-12 ${animated ? "animate-word-trend" : ""}` : "h-6"
          }`}
        />
        <Image
          src="/assets/logo-skope.png"
          alt="Skope"
          width={426}
          height={136}
          priority={splash}
          className={`w-auto object-contain object-left ${
            splash ? `h-10 sm:h-12 ${animated ? "animate-word-skope" : ""}` : "h-6"
          }`}
        />
      </h1>
    </div>
  );
}
