import Image from "next/image";

export default function AdminAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full bg-navy flex items-center justify-center px-6 overflow-hidden">
      <Image
        src="/hero_images/jose-ignacio-faro.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(8,13,24,0.65) 0%, rgba(15,30,52,0.7) 50%, rgba(8,13,24,0.85) 100%)",
        }}
      />
      <div className="relative z-10 w-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
