import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Social proof data - fake live notifications
const socialProofData = [
  { name: "Marie D.", city: "Lyon", action: "vient de démarrer son essai", time: "il y a 2 min", type: "signup" },
  { name: "Pierre L.", city: "Paris", action: "a récupéré 12 500€", time: "il y a 5 min", type: "recovery" },
  { name: "Sophie M.", city: "Bordeaux", action: "vient de démarrer son essai", time: "il y a 8 min", type: "signup" },
  { name: "Jean-Marc R.", city: "Toulouse", action: "a récupéré 8 200€", time: "il y a 12 min", type: "recovery" },
  { name: "Claire B.", city: "Nantes", action: "vient de démarrer son essai", time: "il y a 15 min", type: "signup" },
  { name: "Thomas V.", city: "Marseille", action: "a récupéré 23 000€", time: "il y a 18 min", type: "recovery" },
  { name: "Émilie G.", city: "Lille", action: "vient de démarrer son essai", time: "il y a 22 min", type: "signup" },
  { name: "François D.", city: "Strasbourg", action: "a récupéré 5 800€", time: "il y a 25 min", type: "recovery" },
  { name: "Camille P.", city: "Nice", action: "vient de démarrer son essai", time: "il y a 28 min", type: "signup" },
  { name: "Antoine M.", city: "Montpellier", action: "a récupéré 15 300€", time: "il y a 32 min", type: "recovery" },
  { name: "Julie R.", city: "Rennes", action: "vient de démarrer son essai", time: "il y a 35 min", type: "signup" },
  { name: "David K.", city: "Grenoble", action: "a récupéré 9 700€", time: "il y a 40 min", type: "recovery" },
];

// Hook for mobile detection
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
};

const SocialProofToast = ({ isModalOpen = false }) => {
  const [currentNotification, setCurrentNotification] = useState(null);
  const [notificationIndex, setNotificationIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const isMobile = useIsMobile();

  // Show notification
  const showNotification = useCallback(() => {
    if (isModalOpen) return;

    const notification = socialProofData[notificationIndex % socialProofData.length];
    setCurrentNotification(notification);
    setIsVisible(true);

    // Hide after 4 seconds
    setTimeout(() => {
      setIsVisible(false);
    }, 4000);

    // Move to next notification
    setNotificationIndex(prev => prev + 1);
  }, [notificationIndex, isModalOpen]);

  // Initial delay and interval
  useEffect(() => {
    // Wait 5 seconds before first notification
    const initialTimeout = setTimeout(() => {
      showNotification();
    }, 5000);

    return () => clearTimeout(initialTimeout);
  }, []);

  // Set up recurring notifications
  useEffect(() => {
    if (notificationIndex === 0) return;

    // Random interval between 15-25 seconds
    const interval = 15000 + Math.random() * 10000;

    const timeout = setTimeout(() => {
      showNotification();
    }, interval);

    return () => clearTimeout(timeout);
  }, [notificationIndex, showNotification]);

  // Hide if modal is open
  useEffect(() => {
    if (isModalOpen) {
      setIsVisible(false);
    }
  }, [isModalOpen]);

  if (!currentNotification) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{
            opacity: 0,
            x: isMobile ? 0 : -50,
            y: isMobile ? 50 : 0,
            scale: 0.95
          }}
          animate={{
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1
          }}
          exit={{
            opacity: 0,
            x: isMobile ? 0 : -50,
            y: isMobile ? 50 : 0,
            scale: 0.95
          }}
          transition={{
            type: 'spring',
            damping: 25,
            stiffness: 300
          }}
          className={`fixed z-50 ${
            isMobile
              ? 'bottom-20 left-4 right-4'
              : 'bottom-4 left-4 max-w-sm'
          }`}
        >
          <div className="bg-[#0f172a]/95 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-2xl shadow-black/50">
            <div className="flex items-center gap-3">
              {/* Avatar with live indicator */}
              <div className="relative flex-shrink-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                  currentNotification.type === 'recovery'
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500'
                }`}>
                  {currentNotification.name.charAt(0)}
                </div>
                {/* Live pulse indicator */}
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0f172a]">
                  <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {currentNotification.name}
                  <span className="text-gray-400 font-normal"> ({currentNotification.city})</span>
                </p>
                <p className="text-gray-400 text-xs truncate">
                  {currentNotification.action}
                  <span className="text-gray-500"> • {currentNotification.time}</span>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SocialProofToast;
