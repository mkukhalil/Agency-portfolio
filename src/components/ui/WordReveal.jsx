import { motion } from 'framer-motion';

const WordReveal = ({ text, className = "", delayOffset = 0 }) => {
  const words = text.split(" ");

  const container = {
    hidden: { opacity: 0 },
    visible: () => ({
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 + delayOffset },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 30,
        stiffness: 120,
        mass: 0.8,
      },
    },
    hidden: {
      opacity: 0.1,
      y: 20,
      scale: 0.98,
    },
  };

  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      style={{ display: "flex", flexWrap: "wrap", gap: "0.25em" }}
    >
      {words.map((word, index) => {
        const isItalic = word.startsWith('_') && word.endsWith('_');
        const cleanWord = isItalic ? word.slice(1, -1) : word;
        
        return (
          <motion.span 
            variants={child} 
            key={index} 
            className={isItalic ? "italic-serif" : ""}
            style={{ display: "inline-block" }}
          >
            {cleanWord}
          </motion.span>
        );
      })}
    </motion.div>
  );
};

export default WordReveal;
