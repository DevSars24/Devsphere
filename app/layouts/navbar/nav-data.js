import config from '~/config.json';

export const navLinks = [
  {
    label: 'Projects',
    pathname: '/#project-1',
  },
  {
    label: 'About',
    pathname: '/#details',
  },
  {
    label: 'Articles',
    pathname: `https://hashnode.com/@${config.hashnode}`,
  },
];

export const socialLinks = [
  {
    label: 'LinkedIn',
    url: `https://www.linkedin.com/in/${config.linkedin}/`,
    icon: 'linkedin',
  },
  {
    label: 'Github',
    url: `https://github.com/${config.github}`,
    icon: 'github',
  },
  {
    label: 'Twitter',
    url: `https://x.com/${config.twitter}`,
    icon: 'twitter',
  },
  {
    label: 'Codolio',
    url: `https://codolio.com/profile/${config.codolio}`,
    icon: 'link',
  },
];
