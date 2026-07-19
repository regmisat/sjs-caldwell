import { useEffect, useState } from "react";

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const targetDate = new Date("2026-02-27T09:00:00-05:00").getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
        setIsLoading(false);
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsLoading(false);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mt-6 sm:mt-8">
      {isLoading ? (
        <div className="flex justify- items-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 sm:p-8 text-center border border-white/20">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-white mx-auto mb-4"></div>
            <div className="text-white/80 text-base sm:text-lg">
              Loading countdown...
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-2xl">
          {[
            { label: "Days", value: timeLeft.days },
            { label: "Hours", value: timeLeft.hours },
            { label: "Minutes", value: timeLeft.minutes },
            { label: "Seconds", value: timeLeft.seconds },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 text-center border border-white/20"
            >
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1">
                {item.value.toString().padStart(2, "0")}
              </div>
              <div className="text-xs sm:text-sm md:text-base text-white/80 uppercase tracking-wider">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
