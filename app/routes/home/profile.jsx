import { Heading } from '~/components/heading';
import { Link } from '~/components/link';
import { Section } from '~/components/section';
import { Transition } from '~/components/transition';
import { Icon } from '~/components/icon';
import { GitHubGraph } from '~/components/github-graph';
import { useTilt } from '~/hooks/useTilt';
import { useState, useEffect, useRef } from 'react';
import config from '~/config.json';
import styles from './profile.module.css';

const TECH_STACK = [
  { category: 'Frontend', skills: ['React', 'Next.js', 'Shadcn/ui', 'Tailwind CSS', 'Zustand', 'TanStack Query'] },
  { category: 'Backend', skills: ['Node.js', 'Express', 'FastAPI', 'Hono'] },
  { category: 'Infra & DB', skills: ['Docker', 'Kubernetes', 'Cloudflare Workers', 'PostgreSQL', 'Prisma', 'MongoDB', 'Redis'] },
  { category: 'AI & ML', skills: ['LangChain', 'Gemini API', 'Agentic Workflows', 'RAG'] },
  { category: 'Languages', skills: ['TypeScript', 'Python', 'C++'] },
];

const SOCIAL_TOOLS = [
  { id: 'vscode', label: 'VS Code' },
  { id: 'notion', label: 'Notion' },
  { id: 'chatgpt', label: 'ChatGPT' },
  { id: 'spotify', label: 'Spotify' },
  { id: 'github', label: 'GitHub' },
  { id: 'discord', label: 'Discord' },
];

/* Animated count-up hook */
function useCountUp(target, duration = 2000, startOnVisible = false) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    if (!startOnVisible || started.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const animate = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration, startOnVisible]);

  return [count, ref];
}

export const Profile = ({ id, visible, sectionRef }) => {
  const [focused, setFocused] = useState(false);
  const [time, setTime] = useState('');
  const titleId = `${id}-title`;

  // Tilt refs for each bento card
  const tiltTech = useTilt({ maxTilt: 4, glare: true });
  const tiltBio = useTilt({ maxTilt: 3 });
  const tiltTools = useTilt({ maxTilt: 4 });
  const tiltLinks = useTilt({ maxTilt: 5, glare: true });
  const tiltMusic = useTilt({ maxTilt: 4 });
  const tiltGithub = useTilt({ maxTilt: 3 });

  // Animated stats
  const [dsaCount, dsaRef] = useCountUp(650, 2000, true);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Section
      className={styles.profile}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      as="section"
      id={id}
      ref={sectionRef}
      aria-labelledby={titleId}
      tabIndex={-1}
    >
      <Transition in={visible || focused} timeout={0}>
        {({ visible, nodeRef }) => (
          <div className={styles.content} ref={nodeRef}>
            <div className={styles.somilGrid} data-visible={visible}>

              {/* --- LEFT COLUMN: TECH STACK --- */}
              <div className={styles.techStackCard} ref={tiltTech} data-delay="1">
                <div data-tilt-glare className={styles.tiltGlare} />
                <div className={styles.stackHeader}>
                  <Icon icon="copy" className={styles.stackIcon} />
                  <Heading level={3} className={styles.stackTitle}>TECH STACK</Heading>
                </div>
                {TECH_STACK.map(({ category, skills }) => (
                  <div key={category} className={styles.stackCategory}>
                    <span className={styles.categoryName}>{category}</span>
                    <div className={styles.skillPills}>
                      {skills.map(skill => (
                        <span key={skill} className={styles.skillPill}>{skill}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* --- CENTER COLUMN --- */}
              <div className={styles.centerCol}>
                {/* Bio Block */}
                <div className={styles.bioBlock} ref={tiltBio} data-delay="2">
                  <div className={styles.bioTop}>
                    <div className={styles.avatarWrap}>
                      <img src="/icon-256.png" alt="Saurabh" className={styles.avatar} />
                      <div className={styles.avatarGlow} />
                    </div>
                    <div className={styles.nameMeta}>
                      <span className={styles.name}>{config.name}</span>
                      <span className={styles.handle}>@{config.github}</span>
                    </div>
                  </div>
                  <div className={styles.bioBody}>
                    <p className={styles.tagline}>I build <span className={styles.accent}>scalable backend</span> systems.</p>
                    <p className={styles.introText}>
                      Passionate about <strong>DevOps + Kubernetes</strong> for clean, reliable
                      infrastructure. Deeply interested in <strong>Gen AI</strong> and
                      <strong> Agentic AI</strong> stuffs.
                    </p>
                  </div>
                  <div className={styles.bioFooter}>
                    <div className={styles.status}>
                      <span className={styles.statusDot} />
                      <span>Open to opportunities</span>
                    </div>
                    <div className={styles.timeMeta}>
                      {time}
                    </div>
                  </div>
                </div>

                {/* Daily Tools & Stats Section */}
                <div className={styles.toolsRow}>
                  <div className={styles.iconTrack}>
                    {SOCIAL_TOOLS.map(tool => (
                      <div key={tool.id} className={styles.trackIconWrap} title={tool.label}>
                        <Icon icon={tool.id} className={styles.trackIcon} />
                      </div>
                    ))}
                  </div>
                  <div className={styles.toolDisplayCard} ref={tiltTools} data-delay="3">
                    <div className={styles.toolHeader}>
                      <Link href="/resume.pdf" className={styles.resumeBtn}>
                        <Icon icon="copy" /> RESUME
                      </Link>
                    </div>
                    <Heading level={2} className={styles.toolTitle}>
                      DAILY<br />Tool<br /><span className={styles.accent}>STACK.</span>
                    </Heading>
                    <Link href={`https://hashnode.com/@${config.hashnode}`} className={styles.blogBtn}>
                      ブログ
                    </Link>

                    <div className={styles.miniStats}>
                      <div className={styles.miniStatCard}>
                        <span className={styles.statLabel}>EXPERIENCE.</span>
                        <span className={styles.statMeta}>SIH 35th, Inter-IIIT 8th Rank | Web design & ML model integration</span>
                      </div>
                      <div className={styles.miniStatCard}>
                        <span className={styles.statLabel}>ACHIEVEMENT.</span>
                        <span className={styles.statMeta}>Grand Finalist at IIIT Hyderabad for the Anusandhan National Research Foundation (ANRF) AISEHack</span>
                      </div>
                      <div className={styles.miniStatCard} ref={dsaRef}>
                        <span className={styles.statLabel}>DSA.</span>
                        <span className={styles.statMeta}>{dsaCount}+ Solved</span>
                      </div>
                      <div className={styles.miniStatCard}>
                        <span className={styles.statLabel}>LEETCODE.</span>
                        <span className={styles.statMeta}>1600+ Rating</span>
                      </div>
                      <div className={styles.miniStatCard}>
                        <span className={styles.statLabel}>GFG.</span>
                        <span className={styles.statMeta}>Top 160 College Rank</span>
                      </div>
                      <div className={styles.miniStatCard}>
                        <span className={styles.statLabel}>CGPA.</span>
                        <span className={styles.statMeta}>8.01</span>
                      </div>
                    </div>
                    <span className={styles.copyright}>© 2026 — crafted with obsession</span>
                  </div>
                </div>
              </div>

              {/* --- RIGHT COLUMN --- */}
              <div className={styles.rightCol}>
                {/* Links Card */}
                <div className={styles.linksCard} ref={tiltLinks} data-delay="4">
                  <div data-tilt-glare className={styles.tiltGlare} />
                  <Heading level={3} className={styles.linksTitle}>LINKS.</Heading>
                  <div className={styles.linksGrid}>
                    <Link href={`https://github.com/${config.github}`} className={styles.linkTile} aria-label="GitHub"><Icon icon="github" /></Link>
                    <Link href={`https://x.com/${config.twitter}`} className={styles.linkTile} aria-label="X / Twitter"><Icon icon="x" /></Link>
                    <Link href={`mailto:${config.email}`} className={styles.linkTile} aria-label="Email"><Icon icon="email" /></Link>
                    <Link href={`https://linkedin.com/in/${config.linkedin}`} className={styles.linkTile} aria-label="LinkedIn"><Icon icon="linkedin" /></Link>
                  </div>
                </div>

                {/* Spotify Card */}
                <div className={styles.musicCard} ref={tiltMusic} data-delay="5">
                  <div className={styles.spotifyWrap}>
                    {config.spotify.map((spotifyId, index) => (
                      <iframe
                        key={spotifyId}
                        title={`Spotify track ${index + 1}`}
                        src={`https://open.spotify.com/embed/track/${spotifyId}?utm_source=generator&theme=0`}
                        width="100%"
                        height="80"
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        className={styles.spotifyIframe}
                      />
                    ))}
                  </div>
                </div>

                {/* GitHub Contribution Graph Card */}
                <div className={styles.githubCard} ref={tiltGithub} data-delay="6">
                  <GitHubGraph username={config.github} />
                </div>
              </div>

            </div>
          </div>
        )}
      </Transition>
    </Section>
  );
};
