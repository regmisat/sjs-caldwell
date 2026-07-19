"use client";

import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const communityPartners = [
  {
    name: "The New Jersey Coalition Against Human Trafficking",
    website: "https://www.safernj.org/",
  },
  {
    name: "Caldwell University Counseling Services",
    website: "https://www.caldwell.edu/counseling-center/",
  },
  {
    name: "YWCA Northern NJ Chapter",
    website: "https://www.ywcannj.org",
  },
  {
    name: "Caldwell University Social Justice Minor",
    website: "https://www.caldwell.edu/academics/minors/",
  },
  {
    name: "League of Women Voters",
    website: "https://www.lwv.org/",
  },
  {
    name: "Garden State Equality",
    website: "https://gardenstateequality.org",
  },
  {
    name: "Girls on the Run",
    website: "https://www.girlsontherunnj.org/",
  },
  {
    name: "Sisters of St. Dominic Caldwell University",
    website: "",
  },
  // {
  //   name: "Caldwell University's Women's Initiative (Alumni Affairs)",
  //   website: "",
  // },
  {
    name: "New Jersey Institute for Social Justice",
    website: "https://www.njisj.org",
  },
];

export default function CommunityPartners() {
  return (
    <>
      <div className="relative max-w-screen min-h-screen">
        <div
          className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/caldwell.jpg')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70"></div>
        </div>

        <Header showSchedule={true} />

        <div className="relative z-10 w-full min-h-screen pt-28 sm:pt-32 pb-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10 sm:mb-12">
              <Image
                src="/logo_white.png"
                alt="Social Justice Institute"
                width={140}
                height={140}
                className="object-contain mx-auto mb-6"
              />
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-tight mb-4 font-serif">
                Community Partners
              </h1>
              <div className="w-24 h-1 bg-white mx-auto mt-5"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {communityPartners.map((partner) => (
                <div
                  key={partner.name}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-5 sm:p-6 border border-white/20 shadow-xl flex flex-col justify-between"
                >
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">
                    {partner.name}
                  </h2>

                  {partner.website ? (
                    <p className="text-white/90 text-sm sm:text-base mb-2">
                      Website:{" "}
                      <a
                        href={partner.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline decoration-white/70 hover:decoration-white font-medium"
                      >
                        {partner.website}
                      </a>
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
