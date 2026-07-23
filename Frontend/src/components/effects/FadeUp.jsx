import { useEffect, useRef, useState } from 'react';

export function useFadeUp() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const style = {
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(30px)',
    transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
  };

  return { ref, style };
}

export function FadeUp({ children, style: extraStyle = {}, className = '', delay = 0, ...props }) {
  const { ref, style } = useFadeUp();

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        transitionDelay: `${delay}ms`,
        ...extraStyle,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
