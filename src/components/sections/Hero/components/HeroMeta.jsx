import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { usePakistanTime } from '../../../../hooks/usePakistanTime';

const PAKISTAN_TIMEZONE = 'Asia/Karachi';
const NIGHT_START_HOUR = 22;
const NIGHT_END_HOUR = 5;

const getPakistanHour = () => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: PAKISTAN_TIMEZONE,
    hour: 'numeric',
    hour12: false,
  });

  return Number(formatter.format(new Date()));
};

const isNightInPakistan = () => {
  const hour = getPakistanHour();
  return hour >= NIGHT_START_HOUR || hour < NIGHT_END_HOUR;
};

const SunIcon = () => (
  <svg
    className="hero__sunIcon"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="4.2" fill="currentColor" />
    <path
      d="M12 1.75v3M12 19.25v3M22.25 12h-3M4.75 12h-3M19.25 4.75l-2.12 2.12M6.87 17.13l-2.12 2.12M19.25 19.25l-2.12-2.12M6.87 6.87L4.75 4.75"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

const AvailabilityIcon = ({ isNight }) => {
  if (isNight) {
    return (
      <span
        className="hero__statusIcon hero__statusIcon--night"
        aria-label="Away at night"
        title="Away at night"
      >
        <DotLottieReact
          src="/animations/sleep.lottie"
          loop
          autoplay
          className="hero__sleepIcon"
        />
      </span>
    );
  }

  return (
    <span
      className="hero__statusIcon hero__statusIcon--day"
      aria-label="Available during the day"
      title="Available during the day"
    >
      <SunIcon />
    </span>
  );
};

export const HeroMeta = () => {
  const pakistanTime = usePakistanTime();
  const [isNight, setIsNight] = useState(() => isNightInPakistan());

  useEffect(() => {
    const updateStatus = () => {
      setIsNight(isNightInPakistan());
    };

    updateStatus();

    const intervalId = window.setInterval(updateStatus, 60 * 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <motion.div
      className="hero__metaRow"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.1 }}
    >
      <span className="hero__tagline">Designer &amp; Full Stack Agency</span>

      <div className="hero__availability">
        <AvailabilityIcon isNight={isNight} />
        <span className="hero__time">{pakistanTime}</span>
        <span className="hero__location">Pakistan</span>
      </div>

      <motion.p
        className="hero__scroll"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.9 }}
      >
        Scroll to explore
      </motion.p>
    </motion.div>
  );
};