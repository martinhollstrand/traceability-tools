import Image from "next/image";
import { cn } from "@/lib/utils";

type PartnerLogosProps = {
  className?: string;
};

export function PartnerLogos({ className }: PartnerLogosProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-8", className)}>
      <Image
        src="/Logotyper_fot A4.png"
        alt="Partner logos - Interreg, European Union, Science Park Borås, and others"
        width={900}
        height={120}
        className="h-auto max-h-28 w-auto rounded-xl"
      />
      <div className="flex items-center justify-center gap-6">
        <Image
          src="/TF2030_Logotyp_Mark_Pos.png"
          alt="Textile & Fashion 2030"
          width={80}
          height={80}
          className="h-auto max-h-14 w-auto"
        />
        <Image
          src="/PEAK63N_Logo_blue.png"
          alt="Peak 63°N Outdoor Lab"
          width={180}
          height={80}
          className="h-auto max-h-12 w-auto"
        />
      </div>
    </div>
  );
}
