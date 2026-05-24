export interface SeoProps {
  title: string;
  description: string;
  path: string;
  image?: string;
}

const SITE_NAME = 'Pitot Logic';
const SITE_URL = 'https://pitotlogic.com';
const DEFAULT_IMAGE = '/og-default.png';

export function buildSeo(props: SeoProps) {
  const fullTitle = props.title.includes(SITE_NAME)
    ? props.title
    : `${props.title} — ${SITE_NAME}`;
  const canonical = `${SITE_URL}${props.path.startsWith('/') ? props.path : '/' + props.path}`;
  const image = props.image || `${SITE_URL}${DEFAULT_IMAGE}`;

  return {
    title: fullTitle,
    description: props.description,
    canonical,
    image,
    siteName: SITE_NAME,
  };
}
