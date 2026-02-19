import krishiTexture from '~/assets/image.png';
import codeSaarthiTexture from '~/assets/codesaarthi.png';
import sarsaiTexture from '~/assets/sarsai.png';
import sliceTexturePlaceholder from '~/assets/slice-app-placeholder.jpg';
import sprTexturePlaceholder from '~/assets/spr-lesson-builder-dark-placeholder.jpg';
import gamestackTexturePlaceholder from '~/assets/gamestack-login-placeholder.jpg';
import { Footer } from '~/components/footer';
import { baseMeta } from '~/utils/meta';
import { Intro } from './intro';
import { Profile } from './profile';
import { Heading } from '~/components/heading';
import { Section } from '~/components/section';
import { ProjectSummary } from './project-summary';
import { useEffect, useRef, useState } from 'react';
import config from '~/config.json';
import styles from './home.module.css';

// Prefetch draco decoder wasm
export const links = () => {
  return [
    {
      rel: 'prefetch',
      href: '/draco/draco_wasm_wrapper.js',
      as: 'script',
      type: 'text/javascript',
      importance: 'low',
    },
    {
      rel: 'prefetch',
      href: '/draco/draco_decoder.wasm',
      as: 'fetch',
      type: 'application/wasm',
      importance: 'low',
    },
  ];
};

export const meta = () => {
  return baseMeta({
    title: 'Developer + Agentic AI Enthusiast',
    description: `Portfolio of ${config.name} — a CSE student at IIIT Bhagalpur building scalable backend systems, exploring DevOps + Kubernetes, and crafting Gen AI & Agentic AI stuffs.`,
  });
};

export const Home = () => {
  const [visibleSections, setVisibleSections] = useState([]);
  const [scrollIndicatorHidden, setScrollIndicatorHidden] = useState(false);
  const intro = useRef();
  const projectOne = useRef();
  const projectTwo = useRef();
  const projectThree = useRef();
  const details = useRef();

  useEffect(() => {
    const sections = [intro, projectOne, projectTwo, projectThree, details];

    const sectionObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const section = entry.target;
            observer.unobserve(section);
            if (visibleSections.includes(section)) return;
            setVisibleSections(prevSections => [...prevSections, section]);
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
    );

    const indicatorObserver = new IntersectionObserver(
      ([entry]) => {
        setScrollIndicatorHidden(!entry.isIntersecting);
      },
      { rootMargin: '-100% 0px 0px 0px' }
    );

    sections.forEach(section => {
      sectionObserver.observe(section.current);
    });

    indicatorObserver.observe(intro.current);

    return () => {
      sectionObserver.disconnect();
      indicatorObserver.disconnect();
    };
  }, [visibleSections]);

  return (
    <div className={styles.home}>
      <Intro
        id="intro"
        sectionRef={intro}
        scrollIndicatorHidden={scrollIndicatorHidden}
      />
      <Section id="projects-section" className={styles.projectSection}>
        <Heading level={2}>PROJECTS</Heading>
      </Section>
      <ProjectSummary
        id="project-1"
        sectionRef={projectOne}
        visible={visibleSections.includes(projectOne.current)}
        index={1}
        title="SarsAI — AI Career Coach"
        description="Intelligent interview preparation, resume building, real-time insights, and smart cover letter generation. Powered by Gemini 2.5 Flash, Next.js 15, Clerk & Neon PostgreSQL."
        buttonText="View live site"
        buttonLink="https://ai-career-coach-gray-nine.vercel.app"
        model={{
          type: 'laptop',
          alt: 'SarsAI career coach dashboard',
          textures: [
            {
              srcSet: `${sarsaiTexture} 1280w`,
              placeholder: sprTexturePlaceholder,
            },
          ],
        }}
      />
      <ProjectSummary
        id="project-2"
        alternate
        sectionRef={projectTwo}
        visible={visibleSections.includes(projectTwo.current)}
        index={2}
        title="Code Saarthi — Your Coding Companion"
        description="DSA contest platform with Monaco Editor, AI-powered code evaluation via Gemini, live WebRTC sessions with LiveKit, and a personalized Mission Logs dashboard."
        buttonText="View live site"
        buttonLink="https://codeify-blond.vercel.app"
        model={{
          type: 'laptop',
          alt: 'Code Saarthi DSA contest interface',
          textures: [
            {
              srcSet: `${codeSaarthiTexture} 1280w`,
              placeholder: gamestackTexturePlaceholder,
            },
          ],
        }}
      />
      <ProjectSummary
        id="project-3"
        sectionRef={projectThree}
        visible={visibleSections.includes(projectThree.current)}
        index={3}
        title="Krishi Mitra — Smart Agriculture Platform"
        description="Agentic AI chatbot for Indian farmers with multilingual support, crop disease diagnosis, market prices, government schemes, and a FastAPI + MongoDB backend."
        buttonText="View live site"
        buttonLink="https://sih-team-greensphere.vercel.app"
        model={{
          type: 'laptop',
          alt: 'Krishi Mitra agricultural platform',
          textures: [
            {
              srcSet: `${krishiTexture} 1280w`,
              placeholder: sliceTexturePlaceholder,
            },
          ],
        }}
      />
      <Profile
        sectionRef={details}
        visible={visibleSections.includes(details.current)}
        id="details"
      />
      <Footer />
    </div>
  );
};
