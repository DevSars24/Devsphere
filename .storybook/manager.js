import { themes } from '@storybook/theming';
import { addons } from '@storybook/addons';

addons.setConfig({
  theme: {
    ...themes.dark,
    brandImage: './icon.svg',
    brandTitle: 'Saurabh Singh Rajput Components',
    brandUrl: 'https://github.com/saura',
  },
});
