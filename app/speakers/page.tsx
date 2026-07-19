"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import { SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";

interface Speaker {
  id: string;
  name: string;
  title: string | null;
  bio: string | null;
  photo_url: string | null;
  is_keynote: boolean;
  book_links: any;
  sessions: Array<{
    id: string;
    title: string;
    start_time: string;
    end_time: string;
    location: string | null;
  }>;
}

interface FeaturedSpeaker {
  id: string;
  name: string;
  title: string;
  photo: string;
  bio: string[];
}

const featuredSpeakers: FeaturedSpeaker[] = [
  {
    id: "featured-ltgov",
    name: "Lt. Governor Dr. Dale G. Caldwell",
    title: "New Jersey's 4th Lieutenant Governor & 35th Secretary of State",
    photo: "/speakers/ltgov.jpg",
    bio: [
      "Dr. Dale G. Caldwell is New Jersey's 4th Lieutenant Governor and 35th Secretary of State, serving with Governor Mikie Sherrill. As Secretary of State, Dr. Caldwell leads the New Jersey Department of State and serves as New Jersey's chief election officer. In this role, he brings decades of leadership experience across government, education, community development, faith, and business to expand opportunity across the state and build a more affordable Garden State.",
      "Service, faith, and justice are deeply rooted in his family legacy. Dr. Caldwell's mother was an educator, and his father, the Rev. Gilbert Caldwell, was a prominent civil rights leader who marched alongside the Rev. Dr. Martin Luther King Jr. This legacy continues to shape his leadership philosophy and commitment to equity and opportunity.",
      "Prior to his election, Dr. Caldwell served as President of Centenary University, where he led transformative initiatives focused on access, innovation, workforce development, and student success. His career includes senior leadership roles as Executive Director of the Rothman Institute of Innovation and Entrepreneurship at Fairleigh Dickinson University; President of the Educational Services Commission of New Jersey (ESCNJ); Deputy Commissioner of the New Jersey Department of Community Affairs; Founding Executive Director of the Newark Alliance; and Senior Manager at Deloitte Consulting.",
      "Dr. Caldwell has also dedicated his life to serving his church and his community. For many years, he has served as a United Methodist pastor at Covenant United Methodist Church in Plainfield, New Jersey, where he leads a congregation grounded in inclusivity, compassion, and community engagement. His ministry is guided by Proverbs 31:8\u20139, which calls on leaders to \u201Cspeak up for those who cannot speak for themselves.\u201D Dr. Caldwell also dedicated more than a quarter-century to public education and community service, volunteering on the New Brunswick Board of Education for 26 years, including six years as Board President. His lifelong commitment to civic engagement reflects a belief that strong communities are built through partnership, accountability, and service.",
      "An accomplished athlete and advocate for sports equity, Dr. Caldwell is an avid tennis player and coach. He served as President and CEO of the USTA Eastern Section, founded the Black Tennis Hall of Fame, and is a member of the Eastern Tennis Hall of Fame.",
      "Dr. Caldwell is a graduate of Princeton University, earned his MBA from the Wharton School of the University of Pennsylvania, and completed his Doctorate in Education Administration at Seton Hall University. He resides in New Brunswick, New Jersey, and is the proud father of his daughter, Ashley, who studies public policy at Rutgers University.",
    ],
  },
  {
    id: "featured-mciver",
    name: "Congresswoman LaMonica McIver",
    title: "U.S. Representative, NJ 10th Congressional District",
    photo: "/speakers/congresswoman-mclver.jpg",
    bio: [
      "The first Black woman to represent NJ-10 and the youngest ever to be elected to the United States House of Representatives from New Jersey, LaMonica McIver was sworn into Congress on September 23, 2024. She is a member of the House Small Business and Homeland Security Committees.",
      "McIver has been shattering records in elected office since her start in public service. In 2018, she was elected as the youngest woman ever to the Newark City Council where she proudly served for six years, serving three as council president. She was a stalwart champion for the needs and aspirations of every resident of Newark\u2019s Central Ward, and now she\u2019s bringing that same fight to the halls of Congress for all who live and work in the 10th Congressional District.",
      "McIver ran for Congress because she knows far too many families are struggling to make ends meet, facing skyrocketing costs of food, housing, healthcare and education. She\u2019s also seeing the devastating impact of climate change playing out throughout the district in the form of catastrophic flooding that threatens lives, homes and livelihoods. Too often, these challenges are treated as separate issues, but McIver knows they are deeply interconnected and require comprehensive solutions that she is committed to working on in Washington.",
      "McIver was born and raised in Newark\u2019s Central Ward, where she still resides with her husband and daughter. As a proud product of Newark\u2019s educational system, her passion for public service was ignited early by influential mentors like Mildred Crump, Ras Baraka and other local leaders.",
      "Her journey into politics began at the age of 10, when she first mobilized other youth and highlighted the importance of civic engagement. Her early experiences, paired with her academic achievements\u2014a degree in English Literature from Bloomfield College and a master\u2019s degree in educational leadership and policy from Seton Hall University\u2014set her on a path to merge education and public service in the pursuit of improving people\u2019s lives.",
      "Her leadership in the education sector, including her role as personnel director for Montclair Public Schools, underscores her commitment to institutional growth. From her start as a future business leader for Newark Public Schools to her work in key HR roles across multiple school districts, McIver has consistently demonstrated vision, adaptability and a true dedication to education. Most recently, she served as public affairs manager for PSE&G.",
      "In 2012, McIver founded Newark G.A.L.S., Inc., a nonprofit devoted to nurturing future female leaders. Under her leadership, the organization has impacted over 3,000 young women through transformative programs, leaving a lasting imprint on the future of the city and the state.",
      "As the youngest woman ever elected to the Newark Municipal Council and now to Congress from New Jersey, McIver is redefining what\u2019s possible for future leaders. From her roots in Newark to her rise as a national thought leader, she stands as a symbol of empowerment, leadership and transformative change\u2014and her journey is only just getting started.",
    ],
  },
  {
    id: "featured-melville",
    name: "Director Yolanda N. Melville",
    title: "Director, New Jersey Division on Civil Rights",
    photo: "/speakers/yolanda-melville.png",
    bio: [
      "Yolanda N. Melville is the Director of the New Jersey Division on Civil Rights. Melville previously served as Senior Counsel to Attorney General Platkin and Director of Community Engagement, a liaison to stakeholders across the state tasked with connecting them with the Office of the Attorney General\u2019s initiatives.",
      "Melville has served as both a moderator and nationally recognized speaker on leadership and professional development, voting rights and housing issues. She has collaborated with some of the country\u2019s greatest social justice leaders and has served in various leadership roles within state and national civil rights organizations.",
      "She has received numerous awards including the Dr. Martin Luther King, Jr. \u201CChampion for Justice\u201D Honoree for the New Jersey State Governor\u2019s Jefferson Awards (2019); Outstanding Young Professional Honoree for the Greater Atlantic City Chamber of Commerce Business Excellence Awards (2022); and Atlantic County Bar Association\u2019s Benjamin A. Rimm Young Lawyer of the Year Award (2023).",
      "Before joining the Office of the Attorney General, Melville was a partner at Cooper Levenson, P.A., where she represented public and corporate clients in various stages of civil litigation in federal and state courts. Melville clerked for the Honorable Susan F. Maven in the Superior Court of New Jersey, Appellate Division. She received her B.A. in English and Government from the College of William and Mary, M.S. in Criminal Justice from Virginia Commonwealth University, and J.D. from Howard University Law School, where she was the managing editor of the Human Rights and Globalization Law Review.",
    ],
  },
];

export default function Speakers() {
  const router = useRouter();
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSpeaker, setExpandedSpeaker] = useState<string | null>(null);

  useEffect(() => {
    fetchSpeakers();
  }, []);

  const fetchSpeakers = async () => {
    try {
      const res = await fetch("/api/speakers");
      const data = await res.json();
      setSpeakers(data.speakers || []);
    } catch (error) {
      console.error("Error fetching speakers:", error);
    } finally {
      setLoading(false);
    }
  };

  const keynoteSpeaker = speakers.find((s) => s.is_keynote);
  const breakoutSpeakers = speakers.filter((s) => !s.is_keynote);

  if (loading) {
    return (
      <>
        <div className="relative max-w-screen min-h-screen">
          {/* Background Image */}
          <div
            className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('/caldwell.jpg')",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60"></div>
          </div>

          {/* Header Navigation */}
          <Header showSchedule={true} />

          {/* Loading Content */}
          <div className="relative z-10 flex flex-col items-center justify-center w-full min-h-screen py-24 sm:py-28 px-4">
            <div className="max-w-5xl mx-auto text-center w-full">
            

              {/* Heading Skeleton */}
              <div className="mb-12 sm:mb-16">
                <Skeleton className="h-12 sm:h-16 w-64 sm:w-80 mx-auto mb-4 bg-white/20" />
                <Skeleton className="h-1 w-20 sm:w-32 mx-auto bg-red-500/40" />
              </div>

              <div className="space-y-12 sm:space-y-16">
                {/* Keynote Speaker Skeleton */}
                <div className="rounded-3xl border border-red-400/30 bg-red-950/30 p-6 sm:p-12">
                  <Skeleton className="h-7 w-40 mx-auto mb-10 bg-red-400/30 rounded-full" />
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                    <Skeleton className="w-52 h-52 sm:w-64 sm:h-64 rounded-full bg-white/20 flex-shrink-0" />
                    <div className="flex-1 w-full space-y-4">
                      <Skeleton className="h-10 w-72 bg-white/20" />
                      <Skeleton className="h-6 w-56 bg-white/20" />
                      <Skeleton className="h-32 w-full bg-white/20" />
                    </div>
                  </div>
                </div>

                {/* Featured Speakers Skeleton */}
                <div>
                  <Skeleton className="h-7 w-28 mx-auto mb-4 bg-amber-400/30 rounded-full" />
                  <Skeleton className="h-10 w-64 mx-auto mb-8 bg-white/20" />
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-amber-400/20 bg-white/5 p-6 sm:p-8 mb-6 last:mb-0"
                    >
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        <Skeleton className="w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-white/20 flex-shrink-0" />
                        <div className="flex-1 w-full space-y-3">
                          <Skeleton className="h-5 w-32 bg-amber-400/20 rounded-full" />
                          <Skeleton className="h-7 w-60 bg-white/20" />
                          <Skeleton className="h-5 w-80 bg-white/20" />
                          <Skeleton className="h-24 w-full bg-white/20" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Breakout Speakers Skeleton */}
                <div className="bg-white/8 backdrop-blur-md rounded-2xl p-6 sm:p-10 border border-white/15">
                  <Skeleton className="h-8 w-64 mb-8 bg-white/20" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
                      >
                        <div className="flex items-center space-x-4 mb-4">
                          <Skeleton className="w-16 h-16 rounded-full bg-white/20" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-5 w-32 bg-white/20" />
                            <Skeleton className="h-4 w-40 bg-white/20" />
                          </div>
                        </div>
                        <Skeleton className="h-20 w-full bg-white/20" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <div className="relative max-w-screen min-h-screen">
        {/* Background Image */}
        <div
          className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/caldwell.jpg')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60"></div>
        </div>

        {/* Header Navigation */}
        <Header showSchedule={true} />

        {/* Main Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full min-h-screen py-24 sm:py-28 px-4">
          <div className="max-w-5xl mx-auto text-center w-full">
            

            {/* Heading */}
            <div className="mb-12 sm:mb-16">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-tight mb-4 font-serif">
                Our Speakers
              </h1>
              <div className="w-20 sm:w-32 h-1 bg-red-500 mx-auto"></div>
              <p className="mt-5 text-sm sm:text-base text-white/70 max-w-xl mx-auto">
                Distinguished leaders shaping conversations on truth, justice,
                and opportunity.
              </p>
            </div>

            <div className="space-y-12 sm:space-y-16">
              {/* Keynote Speaker — spotlight */}
              {keynoteSpeaker && (
                <section className="relative overflow-hidden rounded-3xl border border-red-400/40 bg-gradient-to-br from-red-950/50 via-black/40 to-black/50 shadow-2xl backdrop-blur-md">
                  <div
                    className="pointer-events-none absolute inset-0 opacity-40"
                    style={{
                      background:
                        "radial-gradient(ellipse 80% 60% at 20% 0%, rgba(239,68,68,0.35), transparent 55%)",
                    }}
                  />
                  <div className="relative p-6 sm:p-10 md:p-12">
                    <div className="mb-8 sm:mb-10 flex flex-col items-center gap-3">
                      <span className="inline-flex items-center gap-2 rounded-full border border-red-400/50 bg-red-500/20 px-4 py-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-red-100">
                      
                        Keynote Speaker
                      </span>
                      <h2 className="sr-only">Keynote Speaker</h2>
                    </div>

                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-10">
                      {/* Portrait */}
                      <div className="relative flex-shrink-0">
                        <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-red-400 via-red-500/80 to-amber-500/60 opacity-80 blur-[2px]" />
                        <div className="relative w-52 h-52 sm:w-64 sm:h-64 md:w-72 md:h-72 rounded-full overflow-hidden border-[3px] border-white/40 shadow-2xl ring-4 ring-red-500/20">
                          {keynoteSpeaker.photo_url ? (
                            <Image
                              src={keynoteSpeaker.photo_url}
                              alt={keynoteSpeaker.name}
                              width={288}
                              height={288}
                              className="object-cover object-top w-full h-full"
                              priority
                            />
                          ) : (
                            <div className="w-full h-full bg-red-900/40 flex items-center justify-center">
                              <span className="text-6xl sm:text-7xl font-bold text-white">
                                {keynoteSpeaker.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 text-center md:text-left space-y-5 min-w-0">
                        <div>
                          <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white font-serif tracking-tight leading-tight">
                            {keynoteSpeaker.name}
                          </h3>
                          {keynoteSpeaker.title && (
                            <p className="mt-3 text-base sm:text-lg md:text-xl text-red-100/90 italic leading-snug">
                              {keynoteSpeaker.title}
                            </p>
                          )}
                        </div>

                        {keynoteSpeaker.bio && (
                          <div className="text-left space-y-4 text-white/95">
                            {expandedSpeaker === keynoteSpeaker.id ? (
                              <div
                                className="prose prose-invert prose-sm sm:prose-base prose-p:text-white/90 prose-headings:text-white prose-strong:text-white prose-ul:text-white prose-ol:text-white prose-li:text-white max-w-none"
                                dangerouslySetInnerHTML={{
                                  __html: keynoteSpeaker.bio.replaceAll(
                                    "&nbsp;",
                                    " ",
                                  ),
                                }}
                              />
                            ) : (
                              <div
                                className="prose prose-invert prose-sm sm:prose-base prose-p:text-white/85 prose-headings:text-white prose-strong:text-white max-w-none"
                                dangerouslySetInnerHTML={{
                                  __html:
                                    keynoteSpeaker.bio
                                      .replaceAll("&nbsp;", " ")
                                      .split("</p>")[0] + "</p>",
                                }}
                              />
                            )}

                            {keynoteSpeaker.bio.split("</p>").length > 1 && (
                              <button
                                onClick={() =>
                                  setExpandedSpeaker(
                                    expandedSpeaker === keynoteSpeaker.id
                                      ? null
                                      : keynoteSpeaker.id,
                                  )
                                }
                                className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-red-200 hover:text-white transition-colors duration-200 group"
                              >
                                <span className="underline underline-offset-4 decoration-red-300/50 group-hover:decoration-white">
                                  {expandedSpeaker === keynoteSpeaker.id
                                    ? "See Less"
                                    : "See More"}
                                </span>
                                <svg
                                  className={`w-4 h-4 transition-transform duration-300 ${
                                    expandedSpeaker === keynoteSpeaker.id
                                      ? "rotate-180"
                                      : ""
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                              </button>
                            )}
                          </div>
                        )}

                        {keynoteSpeaker.sessions &&
                          keynoteSpeaker.sessions.length > 0 && (
                            <div className="w-full text-left pt-2">
                              <p className="text-xs font-bold uppercase tracking-wider text-red-200/80 mb-3">
                                Presenting at
                              </p>
                              <div className="space-y-2">
                                {keynoteSpeaker.sessions.map((session) => (
                                  <div
                                    key={session.id}
                                    className="rounded-xl bg-white/10 p-3.5 border border-red-400/20"
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1">
                                        <p className="text-white font-medium text-sm">
                                          {session.title}
                                        </p>
                                        {session.location && (
                                          <div className="flex items-center gap-1 text-xs text-white/70 mt-1">
                                            <svg
                                              className="w-3 h-3 flex-shrink-0"
                                              fill="none"
                                              stroke="currentColor"
                                              viewBox="0 0 24 24"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                              />
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                              />
                                            </svg>
                                            {session.location}
                                          </div>
                                        )}
                                      </div>
                                      <div className="text-xs text-red-100/80 whitespace-nowrap font-medium">
                                        {new Date(
                                          session.start_time,
                                        ).toLocaleTimeString("en-US", {
                                          hour: "numeric",
                                          minute: "2-digit",
                                          hour12: true,
                                        })}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Featured Speakers */}
              <section>
                <div className="mb-8 sm:mb-10 text-center">
                 
                  <h2 className="text-3xl sm:text-4xl font-bold text-white font-serif">
                    Featured Speakers
                  </h2>
                  <div className="mt-3 w-16 h-0.5 bg-amber-400/80 mx-auto" />
                </div>

                <div className="space-y-6 sm:space-y-8">
                  {featuredSpeakers.map((speaker, index) => {
                    const isExpanded = expandedSpeaker === speaker.id;
                    const previewText = speaker.bio[0];
                    const hasMore = speaker.bio.length > 1;
                    const isLead = index === 0;

                    return (
                      <article
                        key={speaker.id}
                        className={`relative overflow-hidden rounded-2xl border backdrop-blur-md transition-all duration-300 hover:border-amber-400/40 ${
                          isLead
                            ? "border-amber-400/35 bg-gradient-to-br from-amber-950/35 via-black/35 to-black/45 p-6 sm:p-9 shadow-2xl"
                            : "border-white/15 bg-white/10 p-5 sm:p-7 shadow-xl"
                        }`}
                      >
                        {isLead && (
                          <div
                            className="pointer-events-none absolute inset-0 opacity-30"
                            style={{
                              background:
                                "radial-gradient(ellipse 70% 50% at 10% 0%, rgba(251,191,36,0.25), transparent 50%)",
                            }}
                          />
                        )}

                        <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-7">
                          <div className="relative flex-shrink-0">
                            <div
                              className={`absolute -inset-0.5 rounded-full opacity-70 blur-[1px] ${
                                isLead
                                  ? "bg-gradient-to-br from-amber-300 via-amber-500/70 to-red-400/50"
                                  : "bg-gradient-to-br from-white/40 to-white/10"
                              }`}
                            />
                            <div
                              className={`relative rounded-full overflow-hidden border-[3px] shadow-xl ${
                                isLead
                                  ? "w-40 h-40 sm:w-52 sm:h-52 border-amber-200/50 ring-4 ring-amber-500/15"
                                  : "w-32 h-32 sm:w-40 sm:h-40 border-white/35"
                              }`}
                            >
                              <Image
                                src={speaker.photo}
                                alt={speaker.name}
                                width={isLead ? 208 : 160}
                                height={isLead ? 208 : 160}
                                className="object-cover object-top w-full h-full"
                              />
                            </div>
                          </div>

                          <div className="flex-1 text-center sm:text-left min-w-0">
                            <div className="mb-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                  isLead
                                    ? "bg-amber-500/25 text-amber-100 border border-amber-400/40"
                                    : "bg-white/10 text-white/80 border border-white/20"
                                }`}
                              >
                                Featured Speaker
                              </span>
                            </div>
                            <h3
                              className={`font-bold text-white font-serif leading-tight ${
                                isLead
                                  ? "text-2xl sm:text-3xl md:text-4xl"
                                  : "text-xl sm:text-2xl"
                              }`}
                            >
                              {speaker.name}
                            </h3>
                            <p
                              className={`italic mt-2 mb-4 leading-snug ${
                                isLead
                                  ? "text-sm sm:text-base text-amber-50/90"
                                  : "text-sm sm:text-base text-white/80"
                              }`}
                            >
                              {speaker.title}
                            </p>

                            <div className="text-sm sm:text-base text-white/90 leading-relaxed space-y-3 text-left">
                              <p>{previewText}</p>
                              {isExpanded &&
                                speaker.bio
                                  .slice(1)
                                  .map((paragraph, idx) => (
                                    <p key={idx}>{paragraph}</p>
                                  ))}
                            </div>

                            {hasMore && (
                              <button
                                onClick={() =>
                                  setExpandedSpeaker(
                                    isExpanded ? null : speaker.id,
                                  )
                                }
                                className={`mt-4 inline-flex items-center gap-1.5 text-sm font-semibold transition-colors duration-200 group ${
                                  isLead
                                    ? "text-amber-200 hover:text-white"
                                    : "text-white/80 hover:text-white"
                                }`}
                              >
                                <span
                                  className={`underline underline-offset-4 group-hover:decoration-white ${
                                    isLead
                                      ? "decoration-amber-300/50"
                                      : "decoration-white/40"
                                  }`}
                                >
                                  {isExpanded ? "See Less" : "See More"}
                                </span>
                                <svg
                                  className={`w-4 h-4 transition-transform duration-300 ${
                                    isExpanded ? "rotate-180" : ""
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>

              {/* Breakout Session Speakers */}
              {breakoutSpeakers.length > 0 ? (
                <div className="bg-white/8 backdrop-blur-md rounded-2xl p-6 sm:p-10 border border-white/15 shadow-xl">
                  <div className="space-y-2 mb-8 sm:mb-10 text-center sm:text-left">
                    <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] text-white/50">
                      Sessions
                    </p>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white font-serif">
                      Breakout Session Speakers
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {breakoutSpeakers.map((speaker) => (
                      <div
                        key={speaker.id}
                        className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
                      >
                        <div className="flex items-center text-left space-x-4 mb-4">
                          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/30">
                            {speaker.photo_url ? (
                              <Image
                                src={speaker.photo_url}
                                alt={speaker.name}
                                width={64}
                                height={64}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="w-full h-full bg-white/20 flex items-center justify-center">
                                <span className="text-2xl font-bold text-white">
                                  {speaker.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-white">
                              {speaker.name}
                            </h3>
                            {speaker.title && (
                              <p className="text-sm text-white/80">
                                {speaker.title}
                              </p>
                            )}
                          </div>
                        </div>
                        {speaker.bio && (
                          <div className="text-left max-w-3xl space-y-4 text-white">
                            {expandedSpeaker === speaker.id ? (
                              <div
                                className="prose prose-invert text-white prose-sm sm:prose-base prose-p:text-white prose-headings:text-white prose-strong:text-white prose-ul:text-white prose-ol:text-white prose-li:text-white max-w-none"
                                dangerouslySetInnerHTML={{
                                  __html: speaker.bio.replaceAll("&nbsp;", " "),
                                }}
                              />
                            ) : (
                              <div
                                className="prose prose-invert text-white prose-sm sm:prose-base prose-p:text-white prose-headings:text-white prose-strong:text-white max-w-none"
                                dangerouslySetInnerHTML={{
                                  __html:
                                    speaker.bio
                                      .replaceAll("&nbsp;", " ")
                                      .split("</p>")[0] + "</p>",
                                }}
                              />
                            )}

                            {speaker.bio.replaceAll("&nbsp;", " ").split("</p>")
                              .length > 2 && (
                              <button
                                onClick={() =>
                                  setExpandedSpeaker(
                                    expandedSpeaker === speaker.id
                                      ? null
                                      : speaker.id,
                                  )
                                }
                                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-white/80 hover:text-white transition-colors duration-200 group"
                              >
                                <span className="underline underline-offset-4 decoration-white/40 group-hover:decoration-white">
                                  {expandedSpeaker === speaker.id
                                    ? "See Less"
                                    : "See More"}
                                </span>
                                <svg
                                  className={`w-4 h-4 transition-transform duration-300 ${
                                    expandedSpeaker === speaker.id
                                      ? "rotate-180"
                                      : ""
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                              </button>
                            )}
                          </div>
                        )}

                        {/* Sessions */}
                        {speaker.sessions && speaker.sessions.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-white/20">
                            <p className="text-xs text-left font-semibold text-white mb-2">
                              Presenting at:
                            </p>
                            <div className="space-y-2 text-left">
                              {speaker.sessions.map((session) => (
                                <div
                                  key={session.id}
                                  className="bg-white/10 rounded-lg p-2 border border-white/20"
                                >
                                  <p className="text-white text-xs font-medium">
                                    {session.title}
                                  </p>
                                  <div className="flex items-center justify-between gap-2 mt-1">
                                    {session.location && (
                                      <div className="flex items-center gap-1 text-xs text-white/70">
                                        <svg
                                          className="w-3 h-3 flex-shrink-0"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                          />
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                          />
                                        </svg>
                                        {session.location}
                                      </div>
                                    )}
                                    <div className="text-xs text-white/70 whitespace-nowrap">
                                      {new Date(
                                        session.start_time,
                                      ).toLocaleTimeString("en-US", {
                                        hour: "numeric",
                                        minute: "2-digit",
                                        hour12: true,
                                      })}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 sm:p-12 border border-white/20 shadow-2xl">
                  <div className="space-y-6">
                    <div className="inline-block p-4 bg-white/10 rounded-full mb-4">
                      <svg
                        className="w-16 h-16 sm:w-20 sm:h-20 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>

                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
                      Breakout Session Speaker Lineup Coming Soon
                    </h2>

                    <p className="text-base sm:text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl mx-auto">
                      We're excited to announce our distinguished speakers and
                      panelists who will share their insights on reclaiming
                      truth and social justice. Check back soon for updates.
                    </p>
                  </div>
                </div>
              )}

              {/* Event Info & CTA */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
                <div className="pt-6 text-center">
                  <p className="text-lg sm:text-xl font-semibold text-white">
                    Friday, February 27, 2026
                  </p>
                  <p className="text-sm sm:text-base text-white/70 mt-2">
                    Caldwell University's 5th Annual Social Justice Symposium
                  </p>
                </div>

                <div className="pt-8">
                  <SignedOut>
                    <SignUpButton mode="modal" forceRedirectUrl="/onboarding">
                      <button className="bg-white text-black hover:bg-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 text-base sm:text-lg shadow-lg hover:shadow-xl">
                        Register for Updates
                      </button>
                    </SignUpButton>
                  </SignedOut>
                  <SignedIn>
                    <button
                      onClick={() => router.push("/dashboard")}
                      className="bg-white text-black hover:bg-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 text-base sm:text-lg shadow-lg hover:shadow-xl"
                    >
                      Go to Dashboard
                    </button>
                  </SignedIn>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
