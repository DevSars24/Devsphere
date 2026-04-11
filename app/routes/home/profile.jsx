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
  { category: 'Others', skills: ['TypeScript', 'Python', 'C++'] },
];

const SOCIAL_TOOLS = [
  { id: 'vscode', label: 'VS Code' },
  { id: 'notion', label: 'Notion' },
  { id: 'chatgpt', label: 'ChatGPT' },
  { id: 'spotify', label: 'Spotify' },
  { id: 'github', label: 'GitHub' },
  { id: 'discord', label: 'Discord' },
];

export const Profile = ({ id, visible, sectionRef }) => {
  const [focused, setFocused] = useState(false);
  const [time, setTime] = useState('');
  const titleId = `${id}-title`;

  // 3D Tilt refs
  const tiltTech = useTilt({ maxTilt: 4, glare: true });
  const tiltBio = useTilt({ maxTilt: 3 });
  const tiltTools = useTilt({ maxTilt: 4 });
  const tiltLinks = useTilt({ maxTilt: 5, glare: true });
  const tiltMusic = useTilt({ maxTilt: 4 });
  const tiltGithub = useTilt({ maxTilt: 3 });

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

              {/* --- LEFT: TECH STACK --- */}
              <div className={styles.techStackCard} ref={tiltTech}>
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

              {/* --- CENTER --- */}
              <div className={styles.centerCol}>
                <div className={styles.bioBlock} ref={tiltBio}>
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
                    <p className={styles.tagline}>I build <span className={styles.accent}>scalable systems</span>.</p>
                    <p className={styles.introText}>
                      Passionate about <strong>DevOps + Kubernetes</strong>. Deeply interested in <strong>Agentic AI</strong> stuffs.
                    </p>
                  </div>
                  <div className={styles.bioFooter}>
                    <div className={styles.status}>
                      <span className={styles.statusDot} /> Open to opportunities
                    </div>
                    <div className={styles.timeMeta}>{time}</div>
                  </div>
                </div>

                <div className={styles.toolsRow}>
                  <div className={styles.iconTrack}>
                    {SOCIAL_TOOLS.map(tool => (
                      <div key={tool.id} className={styles.trackIconWrap} title={tool.label}>
                        <Icon icon={tool.id} className={styles.trackIcon} />
                      </div>
                    ))}
                  </div>
                  <div className={styles.toolDisplayCard} ref={tiltTools}>
                    <Link href="/resume.pdf" className={styles.resumeBtn}>
                      _RESUME.
                    </Link>
                    <Heading level={2} className={styles.toolTitle}>
                      DAILY<br />Tool<br /><span className={styles.accent}>STACK.</span>
                    </Heading>
                    <div className={styles.miniStats}>
                      <div className={styles.miniStatCard}>
                        <span className={styles.statLabel}>EXPERIENCE.</span>
                        <span className={styles.statMeta}>SIH 35th, Inter-IIIT 8th Rank | Web design & ML integration</span>
                      </div>
                      <div className={styles.miniStatCard}>
                        <span className={styles.statLabel}>ACHIEVEMENT.</span>
                        <span className={styles.statMeta}>Grand Finalist at IIIT Hyderabad for the ANRF AISEHack</span>
                      </div>
                      <div className={styles.miniStatCard}>
                        <span className={styles.statLabel}>LEETCODE.</span>
                        <span className={styles.statMeta}>1600+ Rating</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* --- RIGHT --- */}
              <div className={styles.rightCol}>
                <div className={styles.linksCard} ref={tiltLinks}>
                  <div data-tilt-glare className={styles.tiltGlare} />
                  <Heading level={3} className={styles.linksTitle}>LINKS.</Heading>
                  <div className={styles.linksGrid}>
                    <Link href={`https://github.com/${config.github}`} className={styles.linkTile}><Icon icon="github" /></Link>
                    <Link href={`https://x.com/${config.twitter}`} className={styles.linkTile}><Icon icon="x" /></Link>
                    <Link href={`mailto:${config.email}`} className={styles.linkTile}><Icon icon="email" /></Link>
                    <Link href={`https://linkedin.com/in/${config.linkedin}`} className={styles.linkTile}><Icon icon="linkedin" /></Link>
                  </div>
                </div>

                <div className={styles.musicCard} ref={tiltMusic}>
                  <div className={styles.spotifyWrap}>
                    {config.spotify.map((spotifyId, idx) => (
                      <iframe
                        key={spotifyId}
                        title={`Spotify track ${idx}`}
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

                <div className={styles.githubCard} ref={tiltGithub}>
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
