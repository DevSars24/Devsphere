import { Heading } from '~/components/heading';
import { Link } from '~/components/link';
import { Section } from '~/components/section';
import { Text } from '~/components/text';
import { Transition } from '~/components/transition';
import { Icon } from '~/components/icon';
import { useState, useEffect } from 'react';
import config from '~/config.json';
import styles from './profile.module.css';

const TECH_STACK = [
  { category: 'Frontend', skills: ['React', 'Nextjs', 'Shadcn', 'Tailwindcss', 'Zustand', 'Tanstack Query'] },
  { category: 'Backend', skills: ['Nodejs', 'Express', 'FastAPI', 'NPM'] },
  { category: 'DB & Services', skills: ['Cloudflare Workers', 'Docker', 'Postman', 'Postgres', 'Prisma ORM', 'MongoDB', 'Redis'] },
  { category: 'Others', skills: ['C++', 'Python'] },
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
              <div className={styles.techStackCard}>
                <div className={styles.stackHeader}>
                  <Icon icon="copy" className={styles.stackIcon} />
                  <Heading level={3} className={styles.stackTitle}>TECH STACK</Heading>
                </div>
                {TECH_STACK.map(({ category, skills }) => (
                  <div key={category} className={styles.stackCategory}>
                    <span className={styles.categoryName}>{category}:</span>
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
                <div className={styles.bioBlock}>
                  <div className={styles.bioTop}>
                    <div className={styles.avatarWrap}>
                      <img src="/icon-256.png" alt="Sars" className={styles.avatar} />
                    </div>
                    <div className={styles.nameMeta}>
                      <span className={styles.name}>{config.name}</span>
                      <span className={styles.handle}>@{config.github}</span>
                    </div>
                    <div className={styles.themeBadge}>夜</div>
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
                      <span className={styles.statusDot} /> Available for work
                    </div>
                    <div className={styles.timeMeta}>
                      02/19/2026 {time}
                    </div>
                  </div>
                </div>

                {/* Daily Tools & Status Section */}
                <div className={styles.toolsRow}>
                  <div className={styles.iconTrack}>
                    {SOCIAL_TOOLS.map(tool => (
                      <div key={tool.id} className={styles.trackIconWrap}>
                        <Icon icon={tool.id} className={styles.trackIcon} />
                      </div>
                    ))}
                  </div>
                  <div className={styles.toolDisplayCard}>
                    <div className={styles.toolHeader}>
                      <Link href="/resume.pdf" className={styles.resumeBtn}>
                        <Icon icon="copy" /> _RESUME.
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
                        <span className={styles.statMeta}>SIH 35th, Inter-IIIT 8th Rank | Worked on making better web design and ml model integeration</span>
                      </div>
                      <div className={styles.miniStatCard}>
                        <span className={styles.statLabel}>ACHIEVEMENT.</span>
                        <span className={styles.statMeta}>Top 160 GFG college rank</span>
                      </div>
                      <div className={styles.miniStatCard}>
                        <span className={styles.statLabel}>DSA.</span>
                        <span className={styles.statMeta}>650+ Solved</span>
                      </div>
                      <div className={styles.miniStatCard}>
                        <span className={styles.statLabel}>CGPA.</span>
                        <span className={styles.statMeta}>8.01</span>
                      </div>
                    </div>
                    <span className={styles.copyright}>© 2026 onwards</span>
                  </div>
                </div>
              </div>

              {/* --- RIGHT COLUMN --- */}
              <div className={styles.rightCol}>
                {/* Links Card */}
                <div className={styles.linksCard}>
                  <Heading level={3} className={styles.linksTitle}>LINKS.</Heading>
                  <div className={styles.linksGrid}>
                    <Link href={`https://github.com/${config.github}`} className={styles.linkTile}><Icon icon="github" /></Link>
                    <Link href={`https://x.com/${config.twitter}`} className={styles.linkTile}><Icon icon="x" /></Link>
                    <Link href={`mailto:${config.email}`} className={styles.linkTile}><Icon icon="email" /></Link>
                    <Link href={`https://linkedin.com/in/${config.linkedin}`} className={styles.linkTile}><Icon icon="linkedin" /></Link>
                  </div>
                </div>

                {/* Spotify Card */}
                <div className={styles.musicCard}>
                  <div className={styles.spotifyWrap}>
                    {config.spotify.map((id, index) => (
                      <iframe
                        key={id}
                        title={`Spotify ${index}`}
                        src={`https://open.spotify.com/embed/track/${id}?utm_source=generator&theme=0`}
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


                {/* Highlight Card */}
                <div className={styles.highlightCard}>
                  <Heading level={3} className={styles.highlightTitle}>DevSars24</Heading>
                  <div className={styles.highlightArt}>
                    <span className={styles.artText}>S ars</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </Transition>
    </Section>
  );
};
