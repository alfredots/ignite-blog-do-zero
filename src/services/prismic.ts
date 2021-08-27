import { DefaultClient } from '@prismicio/client/types/client';

import Prismic from '@prismicio/client';

export function getPrismicClient(req?: unknown): DefaultClient {
  const prismic = Prismic.client('https://igniteblog923487.prismic.io/api/v2', {
    req,
  });
  return prismic;
}
